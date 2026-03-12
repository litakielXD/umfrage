# Umfrageplattform

Web-App mit:
- Startseite (`index.html`)
- Umfrageseite (`survey.html`)
- Admin-Auswertung (`admin.html`)
- Backend-API (`backend/app.py`)
- zentrale Speicherung in SQLite (`data/umfrage.db`)

## Lokal testen

1. Frontend starten:
```bash
python3 -m http.server 8000
```

2. Backend starten (zweites Terminal):
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
UMFRAGE_ADMIN_PASSWORD=testpasswort uvicorn backend.app:app --reload --port 8012
```
Wenn du Admin-Login lokal unter `http://` testest:
```bash
UMFRAGE_ADMIN_PASSWORD=testpasswort UMFRAGE_COOKIE_SECURE=0 uvicorn backend.app:app --reload --port 8012
```

3. API lokal verfügbar unter:
- `http://127.0.0.1:8012/api/health`

Hinweis: Für lokale Tests ohne Reverse Proxy laufen Frontend und Backend auf unterschiedlichen Ports.
Die Frontend-API wird lokal automatisch auf `http://127.0.0.1:8012/api` aufgelöst.

Optional kann die API-Basis im Frontend explizit gesetzt werden (vor den Modul-Skripten):
```html
<script>window.UMFRAGE_API_BASE = "https://mondschule.de/umfrage/api";</script>
```

## Deployment auf mondschule.de

Dateien hochladen:

```bash
./deploy_umfrage.sh
```

Optional mit Bereinigung entfernter Dateien:

```bash
./deploy_umfrage.sh --delete
```

## Server-Einrichtung (einmalig)

1. SSH auf Server:
```bash
ssh lita@mondschule.de
```

2. In Projektordner wechseln:
```bash
cd /var/www/mondschule.de/public_html/umfrage
```

3. Python-Umgebung anlegen:
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -U pip
pip install -r requirements.txt
```

4. `.env` anlegen:
```bash
cp .env.example .env
nano .env
```
Pflichtwert setzen:
- `UMFRAGE_ADMIN_PASSWORD=...`

5. Schreibrechte für Datenordner sicherstellen:
```bash
mkdir -p data
sudo chown -R www-data:www-data data
sudo chmod -R u+rwX,g+rwX,o= data
```

6. Systemd-Service installieren:
```bash
sudo cp umfrage.service /etc/systemd/system/umfrage.service
sudo systemctl daemon-reload
sudo systemctl enable --now umfrage
sudo systemctl status umfrage --no-pager
```

7. Nginx-Proxy für API aktivieren:
- Inhalt aus `nginx-umfrage-api.conf.example` in den passenden `server {}`-Block von `mondschule.de` übernehmen.
- Danach:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Betriebschecks

- API-Health:
```bash
curl -i https://mondschule.de/umfrage/api/health
```

## Rechte-Fix (www-data + lita)

Bei Problemen mit Schreibrechten:
```bash
sudo ./fix_perms_umfrage.sh /var/www/mondschule.de/public_html/umfrage
```

- Website:
- `https://mondschule.de/umfrage/`
- `https://mondschule.de/umfrage/admin.html`

## Wichtige Hinweise

- Alle Antworten werden zentral in `data/umfrage.db` gespeichert.
- Admin-Auswertung ist per Passwort (Session-Cookie) geschützt.
- Nach Änderungen: erst `./deploy_umfrage.sh`, dann auf Server ggf. `pip install -r requirements.txt` und `sudo systemctl restart umfrage`.
