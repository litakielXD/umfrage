import { surveys } from "./data.js";
import {
  adminLogin,
  adminLogout,
  getResponsesBySurveyId,
  isAdminAuthenticated,
} from "./storage.js";

const selectEl = document.getElementById("admin-survey-select");
const resultsEl = document.getElementById("admin-results");
const countEl = document.getElementById("response-count");
const loginCardEl = document.getElementById("admin-login-card");
const loginFormEl = document.getElementById("admin-login-form");
const loginFeedbackEl = document.getElementById("admin-login-feedback");
const passwordEl = document.getElementById("admin-password");
const contentEl = document.getElementById("admin-content");
const logoutBtnEl = document.getElementById("admin-logout-btn");
const exportPdfBtnEl = document.getElementById("admin-export-pdf-btn");

const chartInstances = [];
let currentSurvey = null;
let currentResponses = [];

surveys.forEach((survey) => {
  const option = document.createElement("option");
  option.value = survey.id;
  option.textContent = survey.title;
  selectEl.appendChild(option);
});

selectEl.addEventListener("change", async () => {
  await renderResults(selectEl.value);
});

loginFormEl.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginFeedbackEl.textContent = "";

  try {
    await adminLogin(passwordEl.value);
    passwordEl.value = "";
    showAdminContent(true);
    if (surveys.length > 0) {
      await renderResults(surveys[0].id);
    }
  } catch (error) {
    loginFeedbackEl.textContent = `Login fehlgeschlagen: ${error.message}`;
    loginFeedbackEl.className = "feedback";
  }
});

logoutBtnEl.addEventListener("click", async () => {
  try {
    await adminLogout();
  } finally {
    showAdminContent(false);
    clearResults();
  }
});

exportPdfBtnEl.addEventListener("click", () => {
  exportCurrentResultsAsPdf();
});

init();

async function init() {
  const authenticated = await isAdminAuthenticatedSafe();
  showAdminContent(authenticated);

  if (authenticated && surveys.length > 0) {
    await renderResults(surveys[0].id);
  }
}

function showAdminContent(isVisible) {
  loginCardEl.classList.toggle("hidden", isVisible);
  contentEl.classList.toggle("hidden", !isVisible);
}

function clearResults() {
  chartInstances.forEach((chart) => chart.destroy());
  chartInstances.length = 0;
  resultsEl.innerHTML = "";
  countEl.textContent = "";
  currentSurvey = null;
  currentResponses = [];
}

async function renderResults(surveyId) {
  clearResults();

  const survey = surveys.find((item) => item.id === surveyId);
  if (!survey) return;
  currentSurvey = survey;

  let responses;
  try {
    responses = await getResponsesBySurveyId(surveyId);
  } catch (error) {
    if (error.status === 401) {
      showAdminContent(false);
      loginFeedbackEl.textContent = "Bitte erneut einloggen.";
      return;
    }

    resultsEl.innerHTML = `<div class="empty">Laden fehlgeschlagen: ${error.message}</div>`;
    return;
  }

  countEl.textContent = `Anzahl Antworten: ${responses.length}`;
  currentResponses = responses;

  if (responses.length === 0) {
    resultsEl.innerHTML = '<div class="empty">Noch keine Antworten für diese Umfrage vorhanden.</div>';
    return;
  }

  survey.questions.forEach((question) => {
    if (question.type === "matrix") {
      question.rows.forEach((row) => {
        renderChartResults(
          {
            id: row.id,
            label: row.label,
            options: question.options,
            type: "singleChoice",
          },
          responses
        );
      });
      return;
    }

    if (question.type === "text") {
      renderTextResults(question, responses);
      return;
    }

    renderChartResults(question, responses);
  });
}

function renderChartResults(question, responses) {
  const card = document.createElement("article");
  card.className = "chart-card";

  const title = document.createElement("h3");
  title.textContent = question.label;
  card.appendChild(title);

  const canvas = document.createElement("canvas");
  card.appendChild(canvas);
  resultsEl.appendChild(card);

  const values = responses
    .map((response) => response.answers[question.id])
    .filter((value) => value !== "" && value !== null && value !== undefined);

  const labels = question.type === "rating" ? question.scale.map(String) : question.options;
  const counts = labels.map((label) => values.filter((value) => String(value) === String(label)).length);

  const chart = new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Anzahl",
          data: counts,
          backgroundColor: "rgba(28, 126, 214, 0.7)",
          borderColor: "rgba(21, 101, 170, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
      },
    },
  });

  chartInstances.push(chart);
}

function renderTextResults(question, responses) {
  const card = document.createElement("article");
  card.className = "chart-card";

  const title = document.createElement("h3");
  title.textContent = question.label;
  card.appendChild(title);

  const comments = responses
    .map((response) => response.answers[question.id])
    .map((value) => (typeof value === "string" ? value.trim() : ""))
    .filter(Boolean);

  if (comments.length === 0) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = "Keine Freitextantworten vorhanden.";
    card.appendChild(empty);
  } else {
    const info = document.createElement("p");
    info.className = "muted";
    info.textContent = `Freitextantworten: ${comments.length}`;
    card.appendChild(info);

    const list = document.createElement("ul");
    list.className = "comment-list";
    comments.slice(-20).reverse().forEach((comment) => {
      const li = document.createElement("li");
      li.textContent = comment;
      list.appendChild(li);
    });
    card.appendChild(list);
  }

  resultsEl.appendChild(card);
}

async function isAdminAuthenticatedSafe() {
  try {
    return await isAdminAuthenticated();
  } catch {
    return false;
  }
}

function exportCurrentResultsAsPdf() {
  if (!currentSurvey) return;

  const { jsPDF } = window.jspdf || {};
  if (!jsPDF) {
    alert("PDF-Export ist nicht verfügbar.");
    return;
  }

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 44;
  const maxTextWidth = pageWidth - margin * 2;
  let y = margin;

  const ensureSpace = (needed = 22) => {
    const pageHeight = doc.internal.pageSize.getHeight();
    if (y + needed > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const writeWrapped = (text, size = 11, gap = 14) => {
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(String(text), maxTextWidth);
    lines.forEach((line) => {
      ensureSpace(gap);
      doc.text(line, margin, y);
      y += gap;
    });
  };

  doc.setFont("helvetica", "bold");
  writeWrapped("Umfragen@LEG - Auswertung", 16, 20);
  doc.setFont("helvetica", "normal");
  writeWrapped(currentSurvey.title, 12, 16);
  writeWrapped(`Anzahl Antworten: ${currentResponses.length}`, 11, 16);
  writeWrapped(`Exportdatum: ${new Date().toLocaleString("de-DE")}`, 10, 14);
  y += 6;

  currentSurvey.questions.forEach((question, index) => {
    if (question.type === "matrix") {
      question.rows.forEach((row, rowIndex) => {
        renderQuestionSummary(doc, {
          label: `${index + 1}.${rowIndex + 1} ${row.label}`,
          type: "singleChoice",
          options: question.options,
          id: row.id,
          responses: currentResponses,
          writeWrapped,
          ensureSpace,
        });
      });
      return;
    }

    renderQuestionSummary(doc, {
      label: `${index + 1}. ${question.label}`,
      type: question.type,
      options: question.options || question.scale?.map(String) || [],
      id: question.id,
      responses: currentResponses,
      writeWrapped,
      ensureSpace,
    });
  });

  const safeTitle = currentSurvey.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  doc.save(`auswertung-${safeTitle || "umfrage"}.pdf`);
}

function renderQuestionSummary(doc, payload) {
  const { label, type, options, id, responses, writeWrapped, ensureSpace } = payload;

  ensureSpace(24);
  doc.setFont("helvetica", "bold");
  writeWrapped(label, 11, 14);
  doc.setFont("helvetica", "normal");

  if (type === "text") {
    const comments = responses
      .map((response) => response.answers[id])
      .map((value) => (typeof value === "string" ? value.trim() : ""))
      .filter(Boolean);

    writeWrapped(`Freitextantworten: ${comments.length}`, 10, 13);
    comments.forEach((comment, idx) => {
      writeWrapped(`- ${idx + 1}. ${comment}`, 10, 13);
    });
    return;
  }

  const values = responses
    .map((response) => response.answers[id])
    .filter((value) => value !== "" && value !== null && value !== undefined);

  options.forEach((option) => {
    const count = values.filter((value) => String(value) === String(option)).length;
    writeWrapped(`${option}: ${count}`, 10, 13);
  });
}
