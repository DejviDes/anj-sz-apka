const i18n = {
  sk: {
    appTitle: "Vocabulary Sprint",
    appSubtitle: "Tréning pre žiakov aj wow efekt pre učiteľku",
    language: "Jazyk",
    settingsBtn: "⚙ Nastavenia",
    setupTitle: "Nastavenie tréningu",
    level: "Úroveň",
    directionLabel: "Smer prekladu",
    directionEnSk: "EN -> SK",
    directionSkEn: "SK -> EN",
    answerMode: "Typ odpovede",
    answerChoice: "Výber možností",
    answerText: "Textový vstup",
    modeLabel: "Režim",
    modeInfinite: "Nekonečný",
    modeTest: "Test",
    questionCount: "Počet otázok",
    start: "Štart",
    reset: "Reset",
    topics: "Vyber okruhy",
    selectAll: "Vybrať všetko",
    deselectAll: "Zrušiť všetko",
    correct: "Správne",
    wrong: "Nesprávne",
    accuracy: "Úspešnosť",
    streak: "Streak",
    points: "Body",
    time: "Čas",
    badge: "Odznak",
    badgeJourney: "Cesta odznakov",
    translatePrompt: "Prelož:",
    submit: "Potvrdiť",
    next: "Ďalšia otázka",
    finish: "Dokončiť test",
    retryWrong: "Zopakovať zlé odpovede",
    topicStats: "Štatistiky podľa okruhov",
    wrongAnswers: "Nesprávne odpovede",
    dictionary: "Slovník",
    settingsTitle: "Nastavenia",
    noRepeat: "Neopakovať slová",
    darkMode: "Tmavý režim",
    autoNext: "Auto ďalšia otázka",
    timedBadge: "Odznak na čas",
    autoNextDelay: "Oneskorenie (sekundy)",
    save: "Uložiť",
    searchPlaceholder: "Hľadať slovo alebo preklad...",
    textPlaceholder: "Napíš odpoveď",
    progressQuestion: "Otázka {a} / {b}",
    progressSeen: "Videné {a} / {b}",
    emptyByFilter: "Žiadne slová pre zvolené filtre.",
    emptyResult: "Žiadne výsledky.",
    allDone: "Všetky slová sú prejdené. Daj reset alebo zopakuj zlé.",
    correctMsg: "✅ Správne!",
    wrongMsg: "❌ Nesprávne. Správne je: {a}",
    finalSummary: "Hotovo. Úspešnosť: {a}%, body: {b}",
    explainPrefix: "Prečo:",
    explainTemplate:
      'Výraz "{a}" patrí do témy {topic} a najpresnejší preklad je "{b}".',
    noTopicStats: "Štatistiky sa zobrazia po prvej odpovedi.",
    badgeRookie: "Rookie",
    badgeBronze: "Bronze",
    badgeSilver: "Silver",
    badgeGold: "Gold",
    badgeMaster: "Master",
    badgeNextTemplate: "Ďalší: {name} ({remain})",
    badgeDone: "Všetky odznaky dosiahnuté",
    retryInfo: "Ideme len zlé odpovede z predchádzajúceho kola.",
    noAnswerTyped: "Najprv napíš odpoveď.",
    promptEnSk: "Prelož z angličtiny",
    promptSkEn: "Prelož zo slovenčiny",
  },
  en: {
    appTitle: "Vocabulary Sprint",
    appSubtitle: "Student-friendly trainer with a teacher wow effect",
    language: "Language",
    settingsBtn: "⚙ Settings",
    setupTitle: "Training Setup",
    level: "Level",
    directionLabel: "Translation Direction",
    directionEnSk: "EN -> SK",
    directionSkEn: "SK -> EN",
    answerMode: "Answer Mode",
    answerChoice: "Multiple choice",
    answerText: "Text input",
    modeLabel: "Mode",
    modeInfinite: "Infinite",
    modeTest: "Test",
    questionCount: "Question count",
    start: "Start",
    reset: "Reset",
    topics: "Choose topics",
    selectAll: "Select all",
    deselectAll: "Clear all",
    correct: "Correct",
    wrong: "Wrong",
    accuracy: "Accuracy",
    streak: "Streak",
    points: "Points",
    time: "Time",
    badge: "Badge",
    badgeJourney: "Badge Journey",
    translatePrompt: "Translate:",
    submit: "Submit",
    next: "Next question",
    finish: "Finish test",
    retryWrong: "Retry wrong answers",
    topicStats: "Stats by topics",
    wrongAnswers: "Wrong answers",
    dictionary: "Dictionary",
    settingsTitle: "Settings",
    noRepeat: "No repeated words",
    darkMode: "Dark mode",
    autoNext: "Auto next question",
    timedBadge: "Timed badge",
    autoNextDelay: "Delay (seconds)",
    save: "Save",
    searchPlaceholder: "Search word or translation...",
    textPlaceholder: "Type your answer",
    progressQuestion: "Question {a} / {b}",
    progressSeen: "Seen {a} / {b}",
    emptyByFilter: "No words for selected filters.",
    emptyResult: "No results.",
    allDone:
      "All words in this set are done. Use reset or retry wrong answers.",
    correctMsg: "✅ Correct!",
    wrongMsg: "❌ Not correct. Correct answer: {a}",
    finalSummary: "Finished. Accuracy: {a}%, points: {b}",
    explainPrefix: "Why:",
    explainTemplate:
      'The term "{a}" belongs to topic {topic} and the most precise translation is "{b}".',
    noTopicStats: "Topic stats will appear after your first answer.",
    badgeRookie: "Rookie",
    badgeBronze: "Bronze",
    badgeSilver: "Silver",
    badgeGold: "Gold",
    badgeMaster: "Master",
    badgeNextTemplate: "Next: {name} ({remain})",
    badgeDone: "All badges achieved",
    retryInfo:
      "Now practicing only the answers you got wrong in the previous round.",
    noAnswerTyped: "Please type an answer first.",
    promptEnSk: "Translate from English",
    promptSkEn: "Translate from Slovak",
  },
};

const state = {
  words: [],
  datasets: {
    "en-sk": null,
    "sk-en": null,
  },
  filteredWords: [],
  remainingWords: [],
  currentQuestion: null,
  customPool: null,
  quizActive: false,
  answeredCurrent: false,
  correctCount: 0,
  wrongCount: 0,
  questionIndex: 0,
  totalQuestions: 0,
  seenCount: 0,
  totalAvailable: 0,
  wrongEntries: [],
  topicStats: {},
  streak: 0,
  bestStreak: 0,
  points: 0,
  lastBadgeActivityAt: null,
  sessionStart: null,
  timerInterval: null,
  autoNextTimeout: null,
  uiLang: "sk",
  currentUser: null,
  guestMode: false,
  allowGuestDemo: false,
};

const levelB1 = document.getElementById("levelB1");
const levelB2 = document.getElementById("levelB2");
const modeSelect = document.getElementById("mode");
const directionSelect = document.getElementById("directionSelect");
const answerMode = document.getElementById("answerMode");
const languageToggle = document.getElementById("languageToggle");
const themeToggle = document.getElementById("themeToggle");
const loginThemeToggle = document.getElementById("loginThemeToggle");
const logoutBtn = document.getElementById("logoutBtn");
const questionCountInput = document.getElementById("questionCount");
const questionCountRow = document.getElementById("questionCountRow");
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");
const quizDiv = document.getElementById("quiz");
const wordText = document.getElementById("wordText");
const promptLabel = document.getElementById("promptLabel");
const optionsWrap = document.getElementById("options");
const optionButtons = document.querySelectorAll(".option-btn");
const textAnswerWrap = document.getElementById("textAnswerWrap");
const textAnswerInput = document.getElementById("textAnswerInput");
const submitTextAnswer = document.getElementById("submitTextAnswer");
const resultDiv = document.getElementById("result");
const nextBtn = document.getElementById("nextBtn");
const retryWrongBtn = document.getElementById("retryWrongBtn");
const setupPanel = document.getElementById("setupPanel");
const topicsPanel = document.getElementById("topicsPanel");
const dictionaryPanel = document.getElementById("dictionaryPanel");
const correctCountEl = document.getElementById("correctCount");
const wrongCountEl = document.getElementById("wrongCount");
const accuracyEl = document.getElementById("accuracy");
const streakCountEl = document.getElementById("streakCount");
const pointsCountEl = document.getElementById("pointsCount");
const timerText = document.getElementById("timerText");
const badgeText = document.getElementById("badgeText");
const badgeNextText = document.getElementById("badgeNextText");
const badgeProgressFill = document.getElementById("badgeProgressFill");
const badgeMilestones = document.getElementById("badgeMilestones");
const progressText = document.getElementById("progressText");
const progressBar = document.getElementById("progressBar");
const topicsList = document.getElementById("topicsList");
const selectAllBtn = document.getElementById("selectAll");
const deselectAllBtn = document.getElementById("deselectAll");
const wrongListDiv = document.getElementById("wrongList");
const wrongItems = document.getElementById("wrongItems");
const topicCounter = document.getElementById("topicCounter");
const topicStatsList = document.getElementById("topicStatsList");

const dictionarySearch = document.getElementById("dictionarySearch");
const dictionaryList = document.getElementById("dictionaryList");
const dictionaryCounter = document.getElementById("dictionaryCounter");

const darkModeToggle = document.getElementById("darkModeToggle");
const autoNextToggle = document.getElementById("autoNextToggle");
const timedBadgeToggle = document.getElementById("timedBadgeToggle");
const autoNextDelay = document.getElementById("autoNextDelay");
const autoNextDelayRow = document.getElementById("autoNextDelayRow");
const noRepeatToggle = document.getElementById("noRepeatToggle");

const authGate = document.getElementById("authGate");
const appRoot = document.getElementById("appRoot");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginBtn = document.getElementById("loginBtn");
const guestEnterBtn = document.getElementById("guestEnterBtn");
const authMessage = document.getElementById("authMessage");
const THEME_STORAGE_KEY = "quiz_theme_dark";

function getStoredThemeIsDark() {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === null) {
    return true;
  }
  return stored === "1";
}

function getDeviceId() {
  const key = "quiz_device_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    localStorage.setItem(key, id);
  }
  return id;
}

function setAuthMessage(message, type = "") {
  if (!authMessage) return;
  authMessage.textContent = message;
  authMessage.classList.remove("error", "success");
  if (type) {
    authMessage.classList.add(type);
  }
}

function setAuthenticatedUI(isAuthenticated) {
  if (authGate) {
    authGate.classList.toggle("hidden", isAuthenticated);
  }
  if (appRoot) {
    appRoot.classList.toggle("hidden", !isAuthenticated);
  }
}

async function authRequest(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  const response = await fetch(path, {
    ...options,
    credentials: "same-origin",
    headers,
  });

  let payload = {};
  try {
    payload = await response.json();
  } catch {
    payload = {};
  }

  if (!response.ok) {
    const error = new Error(payload.error || "Request failed");
    error.code = payload.code || "REQUEST_FAILED";
    throw error;
  }

  return payload;
}

function clearAuthState() {
  state.currentUser = null;
  state.guestMode = false;
  setAuthenticatedUI(false);
}

async function loadPublicConfig() {
  try {
    const response = await fetch("/api/public-config", {
      credentials: "same-origin",
    });
    if (!response.ok) {
      state.allowGuestDemo = false;
    } else {
      const data = await response.json();
      state.allowGuestDemo = Boolean(data.allowGuestDemo);
    }
  } catch {
    state.allowGuestDemo = false;
  }

  if (guestEnterBtn) {
    guestEnterBtn.classList.toggle("hidden", !state.allowGuestDemo);
  }
}

async function bootstrapAppAfterAuth() {
  await switchDirectionDataset(directionSelect.value);
  applyTranslations();
  updateScoreboard();
  updateProgress();
  renderTopicStats();
}

async function verifyExistingSession() {
  if (state.guestMode) {
    return;
  }

  try {
    const me = await authRequest("/api/auth/me");
    state.currentUser = me.user;
    state.guestMode = false;
    setAuthenticatedUI(true);
    await bootstrapAppAfterAuth();
  } catch {
    clearAuthState();
  }
}

async function loginUser() {
  const email = loginEmail?.value?.trim();
  const password = loginPassword?.value || "";

  if (!email || !password) {
    setAuthMessage("Vyplň email aj heslo.", "error");
    return;
  }

  try {
    loginBtn.disabled = true;
    setAuthMessage("Prihlasujem...", "");
    const data = await authRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
        deviceId: getDeviceId(),
      }),
    });

    state.currentUser = data.user;
    state.guestMode = false;

    setAuthMessage("Prihlásenie úspešné.", "success");
    setAuthenticatedUI(true);
    await bootstrapAppAfterAuth();
  } catch (error) {
    if (error.code === "DEVICE_LOCKED") {
      setAuthMessage(
        "Účet je viazaný na iné zariadenie. Kontaktuj admina pre reset.",
        "error",
      );
    } else {
      setAuthMessage(error.message || "Prihlásenie zlyhalo.", "error");
    }
  } finally {
    loginBtn.disabled = false;
  }
}

async function enterGuestMode() {
  if (!state.allowGuestDemo) {
    setAuthMessage("Demo režim je vypnutý na serveri.", "error");
    return;
  }

  try {
    setAuthMessage("Načítavam demo režim...", "");
    state.currentUser = null;
    state.guestMode = true;
    setAuthenticatedUI(true);
    await bootstrapAppAfterAuth();
    setAuthMessage("Demo režim je zapnutý.", "success");
  } catch {
    setAuthMessage("Demo režim sa nepodarilo načítať.", "error");
    clearAuthState();
  }
}

async function logoutUser() {
  try {
    await authRequest("/api/auth/logout", { method: "POST" });
  } catch {
    // Ignore logout errors and clear local session anyway.
  }
  clearAuthState();
  resetQuiz();
}

async function ensureDataset(direction) {
  if (state.datasets[direction]) {
    return state.datasets[direction];
  }

  const path = state.guestMode
    ? `/api/public-data/${direction}`
    : `/api/data/${direction}`;

  const response = await fetch(path, {
    credentials: "same-origin",
  });
  if (!response.ok) {
    if (response.status === 401) {
      clearAuthState();
    }
    throw new Error("Data loading failed");
  }

  const data = await response.json();
  state.datasets[direction] = data;
  return data;
}

function applyDataset(data) {
  state.words = data;
  buildTopics();
  updateTopicCounter();
  updateDictionary();
}

async function switchDirectionDataset(direction) {
  try {
    const data = await ensureDataset(direction);
    applyDataset(data);
    if (state.quizActive) {
      resetQuiz();
    }
    updatePromptLabel();
  } catch {
    resultDiv.textContent = "Data loading failed.";
  }
}

function t(key) {
  return i18n[state.uiLang][key] || key;
}

function format(template, params) {
  return Object.entries(params).reduce(
    (acc, [k, v]) => acc.replaceAll(`{${k}}`, v),
    template,
  );
}

function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (i18n[state.uiLang][key]) {
      el.textContent = i18n[state.uiLang][key];
    }
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (i18n[state.uiLang][key]) {
      el.setAttribute("placeholder", i18n[state.uiLang][key]);
    }
  });

  updatePromptLabel();
  updateLanguageToggleLabel();
  syncAnswerModeUI();
  updateDictionary();
  updateProgress();
  updateScoreboard();
  renderTopicStats();
}

function updateLanguageToggleLabel() {
  languageToggle.textContent = state.uiLang.toUpperCase();
}

function updateThemeToggleIcon() {
  const isDark = document.body.classList.contains("dark");
  if (themeToggle) {
    themeToggle.textContent = isDark ? "☾" : "☀︎";
  }
  if (loginThemeToggle) {
    loginThemeToggle.textContent = isDark ? "☾" : "☀︎";
  }
}

function setTheme(isDark) {
  document.body.classList.toggle("dark", isDark);
  document.documentElement.classList.toggle("dark", isDark);
  localStorage.setItem(THEME_STORAGE_KEY, isDark ? "1" : "0");
  if (darkModeToggle) {
    darkModeToggle.checked = isDark;
  }
  updateThemeToggleIcon();
}

function syncAnswerModeUI() {
  const isTextMode = answerMode.value === "text";

  optionsWrap.classList.toggle("hidden", isTextMode);
  textAnswerWrap.classList.toggle("hidden", !isTextMode);

  if (isTextMode) {
    textAnswerInput.value = "";
  }

  if (!state.quizActive || !state.currentQuestion) {
    return;
  }

  if (isTextMode) {
    textAnswerInput.disabled = state.answeredCurrent;
    submitTextAnswer.disabled = state.answeredCurrent;
    if (!state.answeredCurrent) {
      textAnswerInput.focus();
    }
  } else {
    optionButtons.forEach((btn, i) => {
      btn.textContent = state.currentQuestion.options[i] || "-";
    });
    optionButtons.forEach((btn) => {
      btn.disabled = state.answeredCurrent;
    });
  }
}

function normalizeText(value) {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function shuffleArray(arr) {
  return arr
    .map((v) => ({ v, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ v }) => v);
}

function getSelectedLevels() {
  const levels = [];
  if (levelB1.checked) levels.push("B1");
  if (levelB2.checked) levels.push("B2");
  return levels;
}

function getSelectedTopics() {
  return Array.from(topicsList.querySelectorAll("input:checked")).map(
    (c) => c.value,
  );
}

function getFilteredWords() {
  const selectedTopics = getSelectedTopics();
  const selectedLevels = getSelectedLevels();

  return state.words.filter((w) => {
    const levelMatches = selectedLevels.includes(w.level);
    const topicMatches =
      selectedTopics.length === 0 || selectedTopics.includes(w.okruh);
    return levelMatches && topicMatches;
  });
}

function buildTopics() {
  const uniqueTopics = [...new Set(state.words.map((w) => w.okruh))];
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
  updateDictionary();
}

function updateDictionary() {
  if (!dictionaryList) return;

  const baseList = getFilteredWords();
  const query = normalizeText(dictionarySearch.value);

  const results = baseList.filter((w) => {
    const hay = `${w.word} ${w.correct} ${w.okruh} ${w.level}`;
    return normalizeText(hay).includes(query);
  });

  dictionaryCounter.textContent = `(${results.length}/${baseList.length})`;
  dictionaryList.innerHTML = "";

  if (baseList.length === 0) {
    const li = document.createElement("li");
    li.className = "dictionary-empty";
    li.textContent = t("emptyByFilter");
    dictionaryList.appendChild(li);
    return;
  }

  if (results.length === 0) {
    const li = document.createElement("li");
    li.className = "dictionary-empty";
    li.textContent = t("emptyResult");
    dictionaryList.appendChild(li);
    return;
  }

  results.forEach((w) => {
    const li = document.createElement("li");
    li.className = "dictionary-item";

    const wordSpan = document.createElement("span");
    wordSpan.className = "dict-word";
    wordSpan.textContent = `${w.word} -> ${w.correct}`;

    const translationSpan = document.createElement("span");
    translationSpan.className = "dict-translation";
    translationSpan.textContent = `${w.correct} -> ${w.word}`;

    const metaSpan = document.createElement("span");
    metaSpan.className = "dict-meta";
    metaSpan.textContent = `${w.level} • ${w.okruh}`;

    li.appendChild(wordSpan);
    li.appendChild(translationSpan);
    li.appendChild(metaSpan);
    dictionaryList.appendChild(li);
  });
}

function refreshWordPool() {
  state.filteredWords = state.customPool || getFilteredWords();
  state.totalAvailable = state.filteredWords.length;
  if (noRepeatToggle.checked || state.customPool) {
    state.remainingWords = [...state.filteredWords];
  } else {
    state.remainingWords = [];
  }
}

function getNextWord() {
  if (state.totalAvailable === 0) return null;

  if (noRepeatToggle.checked || state.customPool) {
    if (state.remainingWords.length === 0) return null;
    const idx = Math.floor(Math.random() * state.remainingWords.length);
    return state.remainingWords.splice(idx, 1)[0];
  }

  const idx = Math.floor(Math.random() * state.filteredWords.length);
  return state.filteredWords[idx];
}

function buildQuestion(item) {
  const baseOptions = Array.isArray(item.options) ? item.options : [];
  const unique = [...new Set([item.correct, ...baseOptions])].slice(0, 4);
  while (unique.length < 4) {
    const fallback =
      state.filteredWords[
        Math.floor(Math.random() * state.filteredWords.length)
      ]?.correct;
    if (fallback && !unique.includes(fallback)) {
      unique.push(fallback);
    } else {
      break;
    }
  }

  return {
    item,
    topic: item.okruh,
    prompt: item.word,
    correctAnswer: item.correct,
    options: shuffleArray(unique),
    direction: directionSelect.value,
  };
}

function updatePromptLabel() {
  promptLabel.textContent =
    directionSelect.value === "sk-en" ? t("promptSkEn") : t("promptEnSk");
}

function renderQuestion() {
  const q = state.currentQuestion;
  if (!q) return;

  updatePromptLabel();
  wordText.textContent = q.prompt;
  resultDiv.textContent = "";
  nextBtn.textContent = t("next");
  nextBtn.disabled = true;

  optionButtons.forEach((btn) => {
    btn.classList.remove("correct", "wrong");
    btn.disabled = false;
  });

  if (answerMode.value === "text") {
    textAnswerInput.value = "";
    textAnswerInput.focus();
  } else {
    optionButtons.forEach((btn, i) => {
      btn.textContent = q.options[i] || "-";
      btn.disabled = !q.options[i];
    });
  }

  syncAnswerModeUI();
  updateProgress();
}

function formatTimer(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function startTimer() {
  clearInterval(state.timerInterval);
  state.sessionStart = Date.now();
  timerText.textContent = "00:00";
  state.timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - state.sessionStart) / 1000);
    timerText.textContent = formatTimer(elapsed);
    applyTimedBadgeDecay(Date.now());
  }, 1000);
}

function stopTimer() {
  clearInterval(state.timerInterval);
}

function applyTimedBadgeDecay(nowMs) {
  if (!state.quizActive || !timedBadgeToggle?.checked) return;
  if (state.streak <= 0) return;
  if (!state.lastBadgeActivityAt) {
    state.lastBadgeActivityAt = nowMs;
    return;
  }

  const DECAY_STEP_MS = 7000;
  const elapsed = nowMs - state.lastBadgeActivityAt;
  const decaySteps = Math.floor(elapsed / DECAY_STEP_MS);

  if (decaySteps <= 0) return;

  state.streak = Math.max(0, state.streak - decaySteps);
  state.lastBadgeActivityAt += decaySteps * DECAY_STEP_MS;
  updateScoreboard();
}

function getBadge() {
  if (state.streak >= 20) return t("badgeMaster");
  if (state.streak >= 12) return t("badgeGold");
  if (state.streak >= 7) return t("badgeSilver");
  if (state.streak >= 3) return t("badgeBronze");
  return t("badgeRookie");
}

function updateBadgeProgress() {
  const levels = [
    { key: "badgeRookie", min: 0 },
    { key: "badgeBronze", min: 3 },
    { key: "badgeSilver", min: 7 },
    { key: "badgeGold", min: 12 },
    { key: "badgeMaster", min: 20 },
  ];

  const streak = state.streak;
  const currentIndex = levels.reduce(
    (idx, lvl, i) => (streak >= lvl.min ? i : idx),
    0,
  );
  const nextLevel = levels[currentIndex + 1] || null;

  if (nextLevel) {
    const prevMin = levels[currentIndex].min;
    const segment = nextLevel.min - prevMin;
    const partial = Math.max(0, Math.min(segment, streak - prevMin));
    const percent = Math.round((partial / segment) * 100);
    badgeProgressFill.style.width = `${percent}%`;
    badgeNextText.textContent = format(t("badgeNextTemplate"), {
      name: t(nextLevel.key),
      remain: String(nextLevel.min - streak),
    });
  } else {
    badgeProgressFill.style.width = "100%";
    badgeNextText.textContent = t("badgeDone");
  }

  badgeMilestones.innerHTML = "";
  levels.forEach((lvl, i) => {
    const li = document.createElement("li");
    li.textContent = `${t(lvl.key)} (${lvl.min})`;
    if (i < currentIndex) {
      li.className = "achieved";
    } else if (i === currentIndex) {
      li.className = "current";
    }
    badgeMilestones.appendChild(li);
  });
}

function updateScoreboard() {
  correctCountEl.textContent = state.correctCount;
  wrongCountEl.textContent = state.wrongCount;
  streakCountEl.textContent = state.streak;
  pointsCountEl.textContent = state.points;
  badgeText.textContent = getBadge();
  updateBadgeProgress();

  const totalAnswered = state.correctCount + state.wrongCount;
  const accuracy =
    totalAnswered === 0
      ? 0
      : Math.round((state.correctCount / totalAnswered) * 100);
  accuracyEl.textContent = `${accuracy}%`;
}

function updateProgress() {
  let progress = 0;
  if (modeSelect.value === "test") {
    const total = Math.max(1, state.totalQuestions);
    progress = Math.round((state.questionIndex / total) * 100);
    progressText.textContent = format(t("progressQuestion"), {
      a: state.questionIndex,
      b: state.totalQuestions,
    });
  } else {
    const total = Math.max(1, state.totalAvailable);
    progress = Math.round((state.seenCount / total) * 100);
    progressText.textContent = format(t("progressSeen"), {
      a: state.seenCount,
      b: state.totalAvailable,
    });
  }
  progressBar.value = Math.max(0, Math.min(100, progress));
}

function buildExplanation(question) {
  const explicit =
    question.item[`explanation_${state.uiLang}`] || question.item.explanation;
  if (explicit) {
    return `${t("explainPrefix")} ${explicit}`;
  }

  return `${t("explainPrefix")} ${format(t("explainTemplate"), {
    a: question.item.word,
    b: question.item.correct,
    topic: question.item.okruh,
  })}`;
}

function registerTopicAnswer(topic, isCorrect) {
  if (!state.topicStats[topic]) {
    state.topicStats[topic] = { asked: 0, correct: 0 };
  }
  state.topicStats[topic].asked += 1;
  if (isCorrect) {
    state.topicStats[topic].correct += 1;
  }
}

function renderTopicStats() {
  topicStatsList.innerHTML = "";
  const topics = Object.keys(state.topicStats);

  if (topics.length === 0) {
    const li = document.createElement("li");
    li.textContent = t("noTopicStats");
    topicStatsList.appendChild(li);
    return;
  }

  topics.sort().forEach((topic) => {
    const data = state.topicStats[topic];
    const pct =
      data.asked === 0 ? 0 : Math.round((data.correct / data.asked) * 100);
    const li = document.createElement("li");
    li.textContent = `${topic}: ${data.correct}/${data.asked} (${pct}%)`;
    topicStatsList.appendChild(li);
  });
}

function disableInputsAfterAnswer() {
  optionButtons.forEach((btn) => {
    btn.disabled = true;
  });
  textAnswerInput.disabled = true;
  submitTextAnswer.disabled = true;
}

function handleAnswer(chosenValue, sourceButton) {
  if (!state.quizActive || state.answeredCurrent || !state.currentQuestion)
    return;

  const correctAnswer = state.currentQuestion.correctAnswer;
  const isCorrect = normalizeText(chosenValue) === normalizeText(correctAnswer);
  state.answeredCurrent = true;
  state.lastBadgeActivityAt = Date.now();

  if (isCorrect) {
    state.correctCount += 1;
    state.streak += 1;
    state.bestStreak = Math.max(state.bestStreak, state.streak);
    state.points += 1;
    resultDiv.textContent = t("correctMsg");
    if (sourceButton) sourceButton.classList.add("correct");
  } else {
    state.wrongCount += 1;
    state.streak = 0;
    state.points -= 1;
    resultDiv.textContent = format(t("wrongMsg"), { a: correctAnswer });
    state.wrongEntries.push(state.currentQuestion);

    if (sourceButton) {
      sourceButton.classList.add("wrong");
      optionButtons.forEach((btn) => {
        if (normalizeText(btn.textContent) === normalizeText(correctAnswer)) {
          btn.classList.add("correct");
        }
      });
    }
  }

  registerTopicAnswer(state.currentQuestion.topic, isCorrect);
  updateScoreboard();
  renderTopicStats();
  disableInputsAfterAnswer();

  if (
    modeSelect.value === "test" &&
    state.questionIndex >= state.totalQuestions
  ) {
    nextBtn.textContent = t("finish");
  }

  nextBtn.disabled = false;

  if (autoNextToggle.checked) {
    clearTimeout(state.autoNextTimeout);
    state.autoNextTimeout = setTimeout(
      () => {
        if (!state.quizActive || !state.answeredCurrent) return;
        nextBtn.click();
      },
      parseInt(autoNextDelay.value, 10) * 1000,
    );
  }
}

function loadNextQuestion() {
  if (!state.quizActive) return;

  if (
    modeSelect.value === "test" &&
    state.questionIndex >= state.totalQuestions
  ) {
    finishQuiz();
    return;
  }

  const item = getNextWord();
  if (!item) {
    wordText.textContent =
      state.totalAvailable === 0 ? t("emptyByFilter") : t("allDone");
    state.quizActive = false;
    nextBtn.disabled = true;
    return;
  }

  state.currentQuestion = buildQuestion(item);
  state.questionIndex += 1;
  if (modeSelect.value === "infinite") {
    state.seenCount += 1;
  }

  state.answeredCurrent = false;
  textAnswerInput.disabled = false;
  submitTextAnswer.disabled = false;
  renderQuestion();
}

function finishQuiz() {
  state.quizActive = false;
  nextBtn.disabled = true;
  stopTimer();

  const totalAnswered = state.correctCount + state.wrongCount;
  const accuracy =
    totalAnswered === 0
      ? 0
      : Math.round((state.correctCount / totalAnswered) * 100);
  resultDiv.textContent = format(t("finalSummary"), {
    a: accuracy,
    b: state.points,
  });

  wrongItems.innerHTML = "";
  if (state.wrongEntries.length > 0) {
    wrongListDiv.classList.remove("hidden");
    retryWrongBtn.classList.remove("hidden");
    state.wrongEntries.forEach((entry) => {
      const li = document.createElement("li");
      li.textContent = `${entry.prompt} -> ${entry.correctAnswer}`;
      wrongItems.appendChild(li);
    });
  } else {
    wrongListDiv.classList.add("hidden");
    retryWrongBtn.classList.add("hidden");
  }

  renderTopicStats();
}

function startQuiz(customPool = null) {
  clearTimeout(state.autoNextTimeout);
  state.customPool = customPool;
  state.quizActive = true;
  state.answeredCurrent = false;
  state.currentQuestion = null;
  state.correctCount = 0;
  state.wrongCount = 0;
  state.questionIndex = 0;
  state.seenCount = 0;
  state.wrongEntries = [];
  state.topicStats = {};
  state.streak = 0;
  state.bestStreak = 0;
  state.points = 0;
  state.lastBadgeActivityAt = Date.now();

  if (customPool) {
    modeSelect.value = "test";
    questionCountInput.value = String(customPool.length);
  }

  wrongListDiv.classList.add("hidden");
  retryWrongBtn.classList.add("hidden");
  wrongItems.innerHTML = "";

  refreshWordPool();
  if (modeSelect.value === "test") {
    const requested = parseInt(questionCountInput.value, 10) || 20;
    state.totalQuestions =
      noRepeatToggle.checked || customPool
        ? Math.min(requested, state.totalAvailable)
        : requested;
  } else {
    state.totalQuestions = 0;
  }

  quizDiv.classList.remove("hidden");
  updateScoreboard();
  updateProgress();
  renderTopicStats();
  startTimer();

  if (customPool) {
    resultDiv.textContent = t("retryInfo");
  }

  loadNextQuestion();
}

function resetQuiz() {
  clearTimeout(state.autoNextTimeout);
  stopTimer();
  state.quizActive = false;
  state.customPool = null;
  state.correctCount = 0;
  state.wrongCount = 0;
  state.questionIndex = 0;
  state.seenCount = 0;
  state.totalQuestions = 0;
  state.wrongEntries = [];
  state.topicStats = {};
  state.streak = 0;
  state.points = 0;
  state.lastBadgeActivityAt = null;

  updateScoreboard();
  updateProgress();
  renderTopicStats();

  wordText.textContent = "";
  resultDiv.textContent = "";
  wrongItems.innerHTML = "";
  wrongListDiv.classList.add("hidden");
  retryWrongBtn.classList.add("hidden");
  quizDiv.classList.add("hidden");
  timerText.textContent = "00:00";
}

function retryWrongAnswers() {
  if (state.wrongEntries.length === 0) return;
  const map = new Map();
  state.wrongEntries.forEach((entry) => {
    const key = `${entry.item.word}|${entry.item.okruh}`;
    if (!map.has(key)) map.set(key, entry.item);
  });
  const retryPool = [...map.values()];
  startQuiz(retryPool);
}

function toggleQuestionCount() {
  questionCountRow.style.display =
    modeSelect.value === "infinite" ? "none" : "grid";
}

function toggleAutoNextDelay() {
  autoNextDelayRow.style.display = autoNextToggle.checked ? "grid" : "none";
}

function collapseNonQuizPanels() {
  [setupPanel, topicsPanel, dictionaryPanel].forEach((panel) => {
    if (panel) {
      panel.open = false;
    }
  });
}

optionButtons.forEach((btn) => {
  btn.addEventListener("click", () => handleAnswer(btn.textContent, btn));
});

submitTextAnswer.addEventListener("click", () => {
  const val = textAnswerInput.value.trim();
  if (!val) {
    resultDiv.textContent = t("noAnswerTyped");
    return;
  }
  handleAnswer(val, null);
});

if (loginBtn) {
  loginBtn.addEventListener("click", loginUser);
}

if (guestEnterBtn) {
  guestEnterBtn.addEventListener("click", enterGuestMode);
}

if (loginPassword) {
  loginPassword.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      loginUser();
    }
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", logoutUser);
}

textAnswerInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    submitTextAnswer.click();
  }
});

dictionarySearch.addEventListener("input", updateDictionary);
levelB1.addEventListener("change", updateDictionary);
levelB2.addEventListener("change", updateDictionary);
directionSelect.addEventListener("change", async () => {
  await switchDirectionDataset(directionSelect.value);
});
answerMode.addEventListener("change", syncAnswerModeUI);

startBtn.addEventListener("click", () => startQuiz());
resetBtn.addEventListener("click", resetQuiz);

nextBtn.addEventListener("click", () => {
  if (!state.quizActive) return;
  if (!state.answeredCurrent) return;
  loadNextQuestion();
});

retryWrongBtn.addEventListener("click", retryWrongAnswers);

selectAllBtn.addEventListener("click", () => {
  topicsList.querySelectorAll("input").forEach((c) => {
    c.checked = true;
  });
  updateTopicCounter();
});

deselectAllBtn.addEventListener("click", () => {
  topicsList.querySelectorAll("input").forEach((c) => {
    c.checked = false;
  });
  updateTopicCounter();
});

modeSelect.addEventListener("change", toggleQuestionCount);
autoNextToggle.addEventListener("change", toggleAutoNextDelay);
if (timedBadgeToggle) {
  timedBadgeToggle.addEventListener("change", () => {
    if (timedBadgeToggle.checked) {
      state.lastBadgeActivityAt = Date.now();
    }
  });
}
if (darkModeToggle) {
  darkModeToggle.addEventListener("change", () => {
    setTheme(darkModeToggle.checked);
  });
}

languageToggle.addEventListener("click", () => {
  state.uiLang = state.uiLang === "sk" ? "en" : "sk";
  document.documentElement.lang = state.uiLang;
  applyTranslations();
});

startBtn.addEventListener("click", collapseNonQuizPanels);

themeToggle.addEventListener("click", () => {
  setTheme(!document.body.classList.contains("dark"));
});

if (loginThemeToggle) {
  loginThemeToggle.addEventListener("click", () => {
    setTheme(!document.body.classList.contains("dark"));
  });
}

toggleQuestionCount();
toggleAutoNextDelay();
syncAnswerModeUI();
updateLanguageToggleLabel();
setTheme(getStoredThemeIsDark());

async function initializeAuthFlow() {
  await loadPublicConfig();
  setAuthenticatedUI(false);
  verifyExistingSession();
}

initializeAuthFlow();
