let words = [];
let currentWord = null;
let correctCount = 0;
let wrongCount = 0;
let questionIndex = 0;
let totalQuestions = 0;
let wrongAnswers = [];
let quizActive = false;
let autoNextTimeout = null;

let seenCount = 0;
let filteredWords = [];
let remainingWords = [];
let totalAvailable = 0;

const levelB1 = document.getElementById("levelB1");
const levelB2 = document.getElementById("levelB2");
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

const dictionarySearch = document.getElementById("dictionarySearch");
const dictionaryList = document.getElementById("dictionaryList");
const dictionaryCounter = document.getElementById("dictionaryCounter");

const settingsBtn = document.getElementById("settingsBtn");
const settingsModal = document.getElementById("settingsModal");
const closeSettings = document.getElementById("closeSettings");
const saveSettings = document.getElementById("saveSettings");
const darkModeToggle = document.getElementById("darkModeToggle");
const autoNextToggle = document.getElementById("autoNextToggle");
const autoNextDelay = document.getElementById("autoNextDelay");
const autoNextDelayRow = document.getElementById("autoNextDelayRow");
const noRepeatToggle = document.getElementById("noRepeatToggle");

fetch("vocabulary.json")
  .then(res => res.json())
  .then(data => {
    words = data;
    buildTopics();
    updateTopicCounter();
    updateDictionary();
  });

function getSelectedLevels() {
  const levels = [];
  if (levelB1.checked) levels.push("B1");
  if (levelB2.checked) levels.push("B2");
  return levels;
}

function buildTopics() {
  const uniqueTopics = [...new Set(words.map(w => w.okruh))];
  topicsList.innerHTML = "";
  uniqueTopics.forEach(topic => {
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
  updateDictionary();
}

function getSelectedTopics() {
  return Array.from(topicsList.querySelectorAll("input:checked")).map(c => c.value);
}

function shuffleArray(arr) {
  return arr.map(v => ({ v, sort: Math.random() }))
    .sort((a,b) => a.sort - b.sort)
    .map(({v}) => v);
}

function getFilteredWords() {
  const selectedTopics = getSelectedTopics();
  const selectedLevels = getSelectedLevels();

  return words.filter(w =>
    selectedLevels.includes(w.level) &&
    (selectedTopics.length === 0 || selectedTopics.includes(w.okruh))
  );
}

function refreshWordPool() {
  filteredWords = getFilteredWords();
  totalAvailable = filteredWords.length;

  if (noRepeatToggle.checked) {
    remainingWords = [...filteredWords];
  } else {
    remainingWords = [];
  }
}

function getNextWord() {
  if (totalAvailable === 0) return null;

  if (noRepeatToggle.checked) {
    if (remainingWords.length === 0) return null;
    const idx = Math.floor(Math.random() * remainingWords.length);
    return remainingWords.splice(idx, 1)[0];
  }

  const idx = Math.floor(Math.random() * filteredWords.length);
  return filteredWords[idx];
}

function updateDictionary() {
  if (!dictionaryList) return;

  const baseList = getFilteredWords();
  const query = dictionarySearch.value.trim().toLowerCase();
  const results = baseList.filter(w =>
    w.word.toLowerCase().includes(query) ||
    String(w.correct).toLowerCase().includes(query)
  );

  dictionaryCounter.textContent = `(${results.length}/${baseList.length})`;
  dictionaryList.innerHTML = "";

  if (baseList.length === 0) {
    const li = document.createElement("li");
    li.className = "dictionary-empty";
    li.textContent = "Žiadne slová pre zvolené filtre.";
    dictionaryList.appendChild(li);
    return;
  }

  if (results.length === 0) {
    const li = document.createElement("li");
    li.className = "dictionary-empty";
    li.textContent = "Žiadne výsledky.";
    dictionaryList.appendChild(li);
    return;
  }

  results.forEach(w => {
    const li = document.createElement("li");
    li.className = "dictionary-item";

    const wordSpan = document.createElement("span");
    wordSpan.className = "dict-word";
    wordSpan.textContent = w.word;

    const translationSpan = document.createElement("span");
    translationSpan.className = "dict-translation";
    translationSpan.textContent = w.correct;

    const metaSpan = document.createElement("span");
    metaSpan.className = "dict-meta";
    metaSpan.textContent = `${w.level} • ${w.okruh}`;

    li.appendChild(wordSpan);
    li.appendChild(translationSpan);
    li.appendChild(metaSpan);
    dictionaryList.appendChild(li);
  });
}

function updateScoreboard() {
  correctCountEl.textContent = correctCount;
  wrongCountEl.textContent = wrongCount;
  const totalAnswered = correctCount + wrongCount;
  const accuracy = totalAnswered === 0 ? 0 : Math.round((correctCount / totalAnswered) * 100);
  accuracyEl.textContent = `${accuracy}%`;
}

function updateProgress() {
  if (modeSelect.value === "test") {
    progressText.textContent = `Otázka ${questionIndex} / ${totalQuestions}`;
  } else {
    progressText.textContent = `Videné ${seenCount} / ${totalAvailable}`;
  }
}

function showWord() {
  currentWord = getNextWord();

  if (!currentWord) {
    if (totalAvailable === 0) {
      wordText.textContent = "Žiadne slová pre zvolené filtre.";
    } else {
      wordText.textContent = "Všetky slová sú prejdené. Daj Reset.";
    }
    resultDiv.textContent = "";
    optionButtons.forEach(btn => {
      btn.textContent = "-";
      btn.disabled = true;
      btn.classList.remove("correct", "wrong");
    });
    quizActive = false;
    nextBtn.disabled = true;
    return;
  }

  if (modeSelect.value === "infinite") {
    seenCount++;
  }

  wordText.textContent = currentWord.word;
  resultDiv.textContent = "";
  const shuffledOptions = shuffleArray([...currentWord.options]);
  optionButtons.forEach((btn, i) => {
    btn.textContent = shuffledOptions[i];
    btn.classList.remove("correct", "wrong");
    btn.disabled = false;
  });

  updateProgress();
}

function handleAnswer(btn) {
  if (!quizActive) return;
  optionButtons.forEach(b => b.disabled = true);
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
    autoNextTimeout = setTimeout(() => {
      nextBtn.click();
    }, parseInt(autoNextDelay.value, 10) * 1000);
  }
}

function finishTest() {
  quizActive = false;
  nextBtn.disabled = true;

  if (modeSelect.value === "test" && wrongAnswers.length > 0) {
    wrongListDiv.classList.remove("hidden");
    wrongItems.innerHTML = "";
    wrongAnswers.forEach(w => {
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
  seenCount = 0;
  wrongAnswers = [];
  wrongListDiv.classList.add("hidden");
  wrongItems.innerHTML = "";
  nextBtn.disabled = false;

  refreshWordPool();

  if (modeSelect.value === "test") {
    const requested = parseInt(questionCountInput.value, 10) || 20;
    totalQuestions = noRepeatToggle.checked
      ? Math.min(requested, totalAvailable)
      : requested;
  } else {
    totalQuestions = 0;
  }

  quizActive = true;
  updateScoreboard();
  updateProgress();
  showWord();
}

optionButtons.forEach(btn => btn.addEventListener("click", () => handleAnswer(btn)));
dictionarySearch.addEventListener("input", updateDictionary);
levelB1.addEventListener("change", updateDictionary);
levelB2.addEventListener("change", updateDictionary);

startBtn.addEventListener("click", startQuiz);

nextBtn.addEventListener("click", () => {
  if (!quizActive) return;
  if (modeSelect.value === "test") {
    if (questionIndex >= totalQuestions) {
      finishTest();
      return;
    }
    questionIndex++;
  }
  showWord();
});

resetBtn.addEventListener("click", () => {
  quizActive = false;
  correctCount = 0;
  wrongCount = 0;
  questionIndex = 0;
  seenCount = 0;
  wrongAnswers = [];
  wrongItems.innerHTML = "";
  wrongListDiv.classList.add("hidden");
  updateScoreboard();
  progressText.textContent = "Otázka 0 / 0";
  quizDiv.classList.add("hidden");
});

selectAllBtn.addEventListener("click", () => {
  topicsList.querySelectorAll("input").forEach(c => c.checked = true);
  updateTopicCounter();
});

deselectAllBtn.addEventListener("click", () => {
  topicsList.querySelectorAll("input").forEach(c => c.checked = false);
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
  questionCountRow.style.display = modeSelect.value === "infinite" ? "none" : "flex";
}

function toggleAutoNextDelay() {
  autoNextDelayRow.style.display = autoNextToggle.checked ? "flex" : "none";
}