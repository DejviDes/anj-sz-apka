let words = [];
let currentWord = null;
let correctCount = 0;
let wrongCount = 0;
let questionIndex = 0;
let totalQuestions = 0;
let wrongAnswers = [];
let quizActive = false;
let autoNextTimeout = null;

const levelSelect = document.getElementById("level");
const modeSelect = document.getElementById("mode");
const questionCountInput = document.getElementById("questionCount");
const questionCountRow = document.getElementById("questionCountRow");
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");
const quizDiv = document.getElementById("quiz");
const wordText = document.getElementById("wordText");
const optionButtons = document.querySelectorAll(".option-btn");
const resultDiv = document.getElementById("result");
const nextBtn = document.getElementById("nextBtn");
const correctCountEl = document.getElementById("correctCount");
const wrongCountEl = document.getElementById("wrongCount");
const accuracyEl = document.getElementById("accuracy");
const progressText = document.getElementById("progressText");
const topicsList = document.getElementById("topicsList");
const selectAllBtn = document.getElementById("selectAll");
const deselectAllBtn = document.getElementById("deselectAll");
const wrongListDiv = document.getElementById("wrongList");
const wrongItems = document.getElementById("wrongItems");
const topicCounter = document.getElementById("topicCounter");

const settingsBtn = document.getElementById("settingsBtn");
const settingsModal = document.getElementById("settingsModal");
const closeSettings = document.getElementById("closeSettings");
const saveSettings = document.getElementById("saveSettings");
const darkModeToggle = document.getElementById("darkModeToggle");
const autoNextToggle = document.getElementById("autoNextToggle");
const autoNextDelay = document.getElementById("autoNextDelay");
const autoNextDelayRow = document.getElementById("autoNextDelayRow");

document.body.classList.add("dark");
darkModeToggle.checked = true;

fetch("vocabulary.json")
  .then((res) => res.json())
  .then((data) => {
    words = data;
    buildTopics();
    updateTopicCounter();
  });

function buildTopics() {
  const uniqueTopics = [...new Set(words.map((w) => w.okruh))];
  topicsList.innerHTML = "";
  uniqueTopics.forEach((topic) => {
    const label = document.createElement("label");
    label.className = "topic-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = topic;
    checkbox.checked = true;

    checkbox.addEventListener("change", updateTopicCounter);

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(topic));
    topicsList.appendChild(label);
  });
}

function updateTopicCounter() {
  const all = topicsList.querySelectorAll("input").length;
  const selected = topicsList.querySelectorAll("input:checked").length;
  topicCounter.textContent = `(${selected}/${all})`;
}

function getSelectedTopics() {
  return Array.from(topicsList.querySelectorAll("input:checked")).map(
    (c) => c.value,
  );
}

function shuffleArray(arr) {
  return arr
    .map((v) => ({ v, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ v }) => v);
}

function getRandomWord(level) {
  const selectedTopics = getSelectedTopics();
  const filtered = words.filter(
    (w) =>
      w.level === level &&
      (selectedTopics.length === 0 || selectedTopics.includes(w.okruh)),
  );
  if (filtered.length === 0) return null;
  return filtered[Math.floor(Math.random() * filtered.length)];
}

function updateScoreboard() {
  correctCountEl.textContent = correctCount;
  wrongCountEl.textContent = wrongCount;
  const totalAnswered = correctCount + wrongCount;
  const accuracy =
    totalAnswered === 0 ? 0 : Math.round((correctCount / totalAnswered) * 100);
  accuracyEl.textContent = `${accuracy}%`;
}

function updateProgress() {
  progressText.textContent =
    modeSelect.value === "test"
      ? `Otázka ${questionIndex} / ${totalQuestions}`
      : `Otázka ${questionIndex}`;
}

function showWord() {
  const level = levelSelect.value;
  currentWord = getRandomWord(level);
  if (!currentWord) {
    wordText.textContent = "Žiadne slová pre zvolené filtre.";
    resultDiv.textContent = "";
    optionButtons.forEach((btn) => {
      btn.textContent = "-";
      btn.disabled = true;
      btn.classList.remove("correct", "wrong");
    });
    return;
  }
  wordText.textContent = currentWord.word;
  resultDiv.textContent = "";
  const shuffledOptions = shuffleArray([...currentWord.options]);
  optionButtons.forEach((btn, i) => {
    btn.textContent = shuffledOptions[i];
    btn.classList.remove("correct", "wrong");
    btn.disabled = false;
  });
}

function handleAnswer(btn) {
  if (!quizActive) return;
  optionButtons.forEach((b) => (b.disabled = true));
  const chosen = btn.textContent;

  if (chosen === currentWord.correct) {
    btn.classList.add("correct");
    resultDiv.textContent = "✅ Správne!";
    correctCount++;
  } else {
    btn.classList.add("wrong");
    resultDiv.textContent = `❌ Nesprávne. Správne je: ${currentWord.correct}`;
    wrongCount++;
    wrongAnswers.push(`${currentWord.word} → ${currentWord.correct}`);
  }

  updateScoreboard();

  if (modeSelect.value === "test" && questionIndex >= totalQuestions) {
    finishTest();
    return;
  }

  if (autoNextToggle.checked) {
    clearTimeout(autoNextTimeout);
    autoNextTimeout = setTimeout(
      () => {
        nextBtn.click();
      },
      parseInt(autoNextDelay.value, 10) * 1000,
    );
  }
}

function finishTest() {
  quizActive = false;
  nextBtn.disabled = true;

  if (modeSelect.value === "test" && wrongAnswers.length > 0) {
    wrongListDiv.classList.remove("hidden");
    wrongItems.innerHTML = "";
    wrongAnswers.forEach((w) => {
      const li = document.createElement("li");
      li.textContent = w;
      wrongItems.appendChild(li);
    });
  }
}

function startQuiz() {
  quizDiv.classList.remove("hidden");
  correctCount = 0;
  wrongCount = 0;
  questionIndex = 1;
  wrongAnswers = [];
  wrongListDiv.classList.add("hidden");
  wrongItems.innerHTML = "";
  nextBtn.disabled = false;

  totalQuestions =
    modeSelect.value === "test"
      ? parseInt(questionCountInput.value, 10) || 20
      : 0;

  quizActive = true;
  updateScoreboard();
  updateProgress();
  showWord();
}

optionButtons.forEach((btn) =>
  btn.addEventListener("click", () => handleAnswer(btn)),
);

startBtn.addEventListener("click", startQuiz);

nextBtn.addEventListener("click", () => {
  if (!quizActive) return;
  if (modeSelect.value === "test" && questionIndex >= totalQuestions) {
    finishTest();
    return;
  }
  questionIndex++;
  updateProgress();
  showWord();
});

resetBtn.addEventListener("click", () => {
  quizActive = false;
  correctCount = 0;
  wrongCount = 0;
  questionIndex = 0;
  wrongAnswers = [];
  wrongItems.innerHTML = "";
  wrongListDiv.classList.add("hidden");
  updateScoreboard();
  progressText.textContent = "Otázka 0 / 0";
  quizDiv.classList.add("hidden");
});

selectAllBtn.addEventListener("click", () => {
  topicsList.querySelectorAll("input").forEach((c) => (c.checked = true));
  updateTopicCounter();
});

deselectAllBtn.addEventListener("click", () => {
  topicsList.querySelectorAll("input").forEach((c) => (c.checked = false));
  updateTopicCounter();
});

settingsBtn.addEventListener("click", () => {
  settingsModal.classList.remove("hidden");
  toggleQuestionCount();
  toggleAutoNextDelay();
});

closeSettings.addEventListener("click", () => {
  settingsModal.classList.add("hidden");
});

saveSettings.addEventListener("click", () => {
  settingsModal.classList.add("hidden");
  document.body.classList.toggle("dark", darkModeToggle.checked);
});

modeSelect.addEventListener("change", toggleQuestionCount);
autoNextToggle.addEventListener("change", toggleAutoNextDelay);

function toggleQuestionCount() {
  questionCountRow.style.display =
    modeSelect.value === "infinite" ? "none" : "flex";
}

function toggleAutoNextDelay() {
  autoNextDelayRow.style.display = autoNextToggle.checked ? "flex" : "none";
}
