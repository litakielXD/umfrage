import hashlib
import json
import os
import secrets
import sqlite3
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from fastapi import Cookie, FastAPI, HTTPException, Query, Response, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)
DB_PATH = Path(os.getenv("UMFRAGE_DB_PATH", str(DATA_DIR / "umfrage.db")))
SESSION_COOKIE_NAME = "umfrage_admin_session"
SESSION_DURATION_SECONDS = int(os.getenv("UMFRAGE_SESSION_DURATION", "43200"))
COOKIE_SECURE = os.getenv("UMFRAGE_COOKIE_SECURE", "1") == "1"

ADMIN_PASSWORD = os.getenv("UMFRAGE_ADMIN_PASSWORD", "")
if not ADMIN_PASSWORD:
    print("[WARN] UMFRAGE_ADMIN_PASSWORD ist nicht gesetzt. Admin-Login ist unsicher und deaktiviert.")

app = FastAPI(title="Umfragen API", version="1.0.0")

DEFAULT_CORS_ORIGINS = ",".join(
    [
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]
)
CORS_ALLOW_ORIGINS = [
    origin.strip()
    for origin in os.getenv("UMFRAGE_CORS_ALLOW_ORIGINS", DEFAULT_CORS_ORIGINS).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ALLOW_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ResponseIn(BaseModel):
    surveyId: str = Field(min_length=1)
    submittedAt: str | None = None
    answers: dict[str, Any]


class AdminLoginIn(BaseModel):
    password: str = Field(min_length=1)


class StoredResponse(BaseModel):
    id: int
    surveyId: str
    submittedAt: str
    answers: dict[str, Any]


def get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    conn = get_conn()
    try:
        conn.execute("PRAGMA journal_mode=WAL;")
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS responses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                survey_id TEXT NOT NULL,
                submitted_at TEXT NOT NULL,
                answers_json TEXT NOT NULL
            );
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS admin_sessions (
                token_hash TEXT PRIMARY KEY,
                expires_at INTEGER NOT NULL,
                created_at INTEGER NOT NULL
            );
            """
        )
        conn.commit()
    finally:
        conn.close()


@app.on_event("startup")
def on_startup() -> None:
    init_db()


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def token_hash(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def create_session() -> tuple[str, int]:
    token = secrets.token_urlsafe(32)
    expires_at = int(time.time()) + SESSION_DURATION_SECONDS

    conn = get_conn()
    try:
        conn.execute(
            "INSERT INTO admin_sessions (token_hash, expires_at, created_at) VALUES (?, ?, ?)",
            (token_hash(token), expires_at, int(time.time())),
        )
        conn.commit()
    finally:
        conn.close()

    return token, expires_at


def delete_session(token: str) -> None:
    conn = get_conn()
    try:
        conn.execute("DELETE FROM admin_sessions WHERE token_hash = ?", (token_hash(token),))
        conn.commit()
    finally:
        conn.close()


def is_session_valid(token: str | None) -> bool:
    if not token:
        return False

    now_ts = int(time.time())
    conn = get_conn()
    try:
        conn.execute("DELETE FROM admin_sessions WHERE expires_at < ?", (now_ts,))
        row = conn.execute(
            "SELECT token_hash FROM admin_sessions WHERE token_hash = ? AND expires_at >= ?",
            (token_hash(token), now_ts),
        ).fetchone()
        conn.commit()
        return row is not None
    finally:
        conn.close()


def require_admin(token: str | None) -> None:
    if not is_session_valid(token):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Nicht eingeloggt")


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/responses", status_code=status.HTTP_201_CREATED)
def save_response(payload: ResponseIn) -> dict[str, str]:
    submitted_at = payload.submittedAt or now_iso()

    conn = get_conn()
    try:
        conn.execute(
            "INSERT INTO responses (survey_id, submitted_at, answers_json) VALUES (?, ?, ?)",
            (payload.surveyId, submitted_at, json.dumps(payload.answers, ensure_ascii=False)),
        )
        conn.commit()
    finally:
        conn.close()

    return {"status": "saved"}


@app.post("/api/admin/login")
def admin_login(payload: AdminLoginIn, response: Response) -> dict[str, str]:
    if not ADMIN_PASSWORD:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Admin-Login ist nicht konfiguriert (UMFRAGE_ADMIN_PASSWORD fehlt)",
        )

    if payload.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Falsches Passwort")

    token, expires_at = create_session()
    max_age = max(1, expires_at - int(time.time()))
    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=token,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite="lax",
        max_age=max_age,
        path="/",
    )
    return {"status": "ok"}


@app.get("/api/admin/session")
def admin_session(
    session_token: str | None = Cookie(default=None, alias=SESSION_COOKIE_NAME),
) -> dict[str, bool]:
    return {"authenticated": is_session_valid(session_token)}


@app.post("/api/admin/logout")
def admin_logout(
    response: Response,
    session_token: str | None = Cookie(default=None, alias=SESSION_COOKIE_NAME),
) -> dict[str, str]:
    if session_token:
        delete_session(session_token)
    response.delete_cookie(key=SESSION_COOKIE_NAME, path="/")
    return {"status": "ok"}


@app.get("/api/admin/responses", response_model=list[StoredResponse])
def admin_responses(
    survey_id: str = Query(..., alias="surveyId", min_length=1),
    session_token: str | None = Cookie(default=None, alias=SESSION_COOKIE_NAME),
) -> list[StoredResponse]:
    require_admin(session_token)

    conn = get_conn()
    try:
        rows = conn.execute(
            "SELECT id, survey_id, submitted_at, answers_json FROM responses WHERE survey_id = ? ORDER BY id ASC",
            (survey_id,),
        ).fetchall()
    finally:
        conn.close()

    result: list[StoredResponse] = []
    for row in rows:
        try:
            answers = json.loads(row["answers_json"])
        except json.JSONDecodeError:
            answers = {}
        result.append(
            StoredResponse(
                id=row["id"],
                surveyId=row["survey_id"],
                submittedAt=row["submitted_at"],
                answers=answers if isinstance(answers, dict) else {},
            )
        )
    return result
