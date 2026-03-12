import { surveys } from "./data.js";

const listEl = document.getElementById("survey-list");

if (listEl) {
  listEl.innerHTML = "";

  surveys.forEach((survey) => {
    const article = document.createElement("article");
    article.className = "survey-card";
    article.innerHTML = `
      <h3>${survey.title}</h3>
      <p class="muted">${survey.description}</p>
      <a class="btn btn-primary" href="survey.html?surveyId=${encodeURIComponent(survey.id)}">Umfrage starten</a>
    `;
    listEl.appendChild(article);
  });
}
