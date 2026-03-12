import { surveys } from "./data.js";
import { saveResponse } from "./storage.js";

const titleEl = document.getElementById("survey-title");
const descriptionEl = document.getElementById("survey-description");
const formEl = document.getElementById("survey-form");
const feedbackEl = document.getElementById("form-feedback");

const params = new URLSearchParams(window.location.search);
const surveyId = params.get("surveyId");
const survey = surveys.find((entry) => entry.id === surveyId);

if (!survey) {
  titleEl.textContent = "Umfrage nicht gefunden";
  descriptionEl.textContent = "Bitte über die Startseite eine gültige Umfrage auswählen.";
} else {
  titleEl.textContent = survey.title;
  descriptionEl.textContent = survey.description;
  renderForm(survey);
}

function renderForm(activeSurvey) {
  const fragment = document.createDocumentFragment();

  activeSurvey.questions.forEach((question, index) => {
    const wrapper = document.createElement("fieldset");
    wrapper.className = "field";

    const legend = document.createElement("legend");
    legend.textContent = `${index + 1}. ${question.label || question.title}`;
    if (!question.required) {
      const optionalHint = document.createElement("span");
      optionalHint.className = "optional-hint";
      optionalHint.textContent = " (freiwillig)";
      legend.appendChild(optionalHint);
    }
    wrapper.appendChild(legend);

    if (question.type === "rating") {
      const ratingWrap = document.createElement("div");
      ratingWrap.className = "rating-wrap";

      const ratingLabels = document.createElement("div");
      ratingLabels.className = "rating-labels";
      ratingLabels.innerHTML = `
        <span>gar nicht gut</span>
        <span>sehr gut</span>
      `;
      ratingWrap.appendChild(ratingLabels);

      const container = document.createElement("div");
      container.className = "likert rating-scale";
      question.scale.forEach((value) => {
        const label = document.createElement("label");
        label.innerHTML = `<input type="radio" name="${question.id}" value="${value}" ${
          question.required ? "required" : ""
        } /> ${value}`;
        container.appendChild(label);
      });
      ratingWrap.appendChild(container);
      wrapper.appendChild(ratingWrap);
    }

    if (question.type === "singleChoice") {
      const container = document.createElement("div");
      container.className = "likert";
      question.options.forEach((option) => {
        const optionLabel = document.createElement("label");
        optionLabel.innerHTML = `<input type="radio" name="${question.id}" value="${option}" ${
          question.required ? "required" : ""
        } /> ${option}`;
        container.appendChild(optionLabel);
      });
      wrapper.appendChild(container);

      if (question.allowOther) {
        const otherField = document.createElement("div");
        otherField.className = "field";
        otherField.innerHTML = `
          <label for="${question.id}_other">Sonstiges:</label>
          <input id="${question.id}_other" name="${question.id}_other" type="text" placeholder="Optionaler Hinweis" />
        `;
        wrapper.appendChild(otherField);
      }
    }

    if (question.type === "matrix") {
      const tableWrap = document.createElement("div");
      tableWrap.className = "matrix-wrap";

      const table = document.createElement("table");
      table.className = "matrix-table";

      const thead = document.createElement("thead");
      const headRow = document.createElement("tr");
      headRow.innerHTML = '<th scope="col">Aussage</th>';
      question.options.forEach((option) => {
        const th = document.createElement("th");
        th.scope = "col";
        th.textContent = option;
        headRow.appendChild(th);
      });
      thead.appendChild(headRow);
      table.appendChild(thead);

      const tbody = document.createElement("tbody");
      question.rows.forEach((row) => {
        const tr = document.createElement("tr");
        const rowTitle = document.createElement("th");
        rowTitle.scope = "row";
        rowTitle.textContent = row.label;
        tr.appendChild(rowTitle);

        question.options.forEach((option, optionIndex) => {
          const td = document.createElement("td");
          const label = document.createElement("label");
          label.className = "matrix-radio";
          label.innerHTML = `
            <input
              type="radio"
              name="${row.id}"
              value="${option}"
              ${question.required && optionIndex === 0 ? "required" : ""}
              aria-label="${row.label}: ${option}"
            />
          `;
          td.appendChild(label);
          tr.appendChild(td);
        });

        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      tableWrap.appendChild(table);
      wrapper.appendChild(tableWrap);
    }

    if (question.type === "text") {
      if (question.input === "short") {
        const input = document.createElement("input");
        input.type = "text";
        input.name = question.id;
        input.className = "short-input";
        input.inputMode = "numeric";
        input.placeholder = "Alter";
        if (question.required) input.required = true;
        wrapper.appendChild(input);
      } else {
        const textarea = document.createElement("textarea");
        textarea.name = question.id;
        textarea.rows = 4;
        textarea.placeholder = "Antwort eingeben";
        if (question.required) textarea.required = true;
        wrapper.appendChild(textarea);
      }
    }

    fragment.appendChild(wrapper);
  });

  const submit = document.createElement("button");
  submit.type = "submit";
  submit.className = "btn btn-primary";
  submit.textContent = "Antworten absenden";

  formEl.appendChild(fragment);
  formEl.appendChild(submit);

  formEl.addEventListener("submit", async (event) => {
    event.preventDefault();
    feedbackEl.textContent = "";

    const formData = new FormData(formEl);
    const answers = {};

    activeSurvey.questions.forEach((question) => {
      if (question.type === "matrix") {
        question.rows.forEach((row) => {
          answers[row.id] = formData.get(row.id) || "";
        });
        return;
      }

      answers[question.id] = formData.get(question.id) || "";
      if (question.allowOther) {
        answers[`${question.id}_other`] = formData.get(`${question.id}_other`) || "";
      }
    });

    try {
      await saveResponse({
        surveyId: activeSurvey.id,
        submittedAt: new Date().toISOString(),
        answers,
      });

      formEl.reset();
      feedbackEl.textContent = "Vielen Dank. Deine Antwort wurde gespeichert.";
      feedbackEl.className = "feedback success";
    } catch (error) {
      feedbackEl.textContent = `Speichern fehlgeschlagen: ${error.message}`;
      feedbackEl.className = "feedback";
    }
  });
}
