/* ==============================
   🌍 LANGUAGE PACKS
================================ */
const i18n = {
  en: {
    title: "💣 Minesweeper: Hardcore",
    hard: "🔴 HARD",
    insane: "☠️ INSANE",
    daily: "📅 DAILY",
    giveUp0: "I GIVE UP",
    giveUp1: "Sure?",
    giveUp2: "Did you think it through?",
    giveUp3: "WEAK.",
    winTitle: "You won.",
    loseTitle: "You lost.",
    dailySub: "Same board for everyone today.",
    hardSub: "One mistake = boom.",
    insaneSub: "Almost impossible.",
    score: "Score",
    time: "Time",
    streak: "Streak",
    retry: "Retry",
    menu: "Menu",
    timeUp: "⏳ Time's up. Too slow.",
    settings: "Settings",
    musicVol: "Music volume",
    sfxVol: "SFX volume",
    vibrate: "Vibration",
    snark: "Snarky phrases",
    history: "Last games",
    resetStats: "Reset stats",
    resetDone: "Stats were reset."
  },
  ru: {
    title: "💣 Сапёр: Хардкор",
    hard: "🔴 СЛОЖНЫЙ",
    insane: "☠️ ОЧЕНЬ СЛОЖНЫЙ",
    daily: "📅 ДНЕВНОЙ",
    giveUp0: "Я СДАЮСЬ",
    giveUp1: "Точно?",
    giveUp2: "Ты хорошо подумал?",
    giveUp3: "СЛАБАК.",
    winTitle: "Победа.",
    loseTitle: "Поражение.",
    dailySub: "Одинаковое поле для всех сегодня.",
    hardSub: "Одна ошибка = бум.",
    insaneSub: "Почти невозможно.",
    score: "Очки",
    time: "Время",
    streak: "Серия",
    retry: "Ещё раз",
    menu: "Меню",
    timeUp: "⏳ Время вышло. Слишком медленно.",
    settings: "Настройки",
    musicVol: "Громкость музыки",
    sfxVol: "Громкость эффектов",
    vibrate: "Вибрация",
    snark: "Надменные фразы",
    history: "Последние игры",
    resetStats: "Сбросить статистику",
    resetDone: "Статистика сброшена."
  }
};

const losePhrases = {
  en: [
    "💀 You really thought you'd win?",
    "😏 Minesweeper: 1 — You: 0",
    "🤡 Brilliant move. Truly.",
    "🪦 Here lies your logic",
    "🧠 Try turning your brain on. Next time.",
    "📉 IQ temporarily unavailable",
    "😎 The game didn't even try",
    "🙃 Maybe try tic-tac-toe?",
    "💣 That mine was obvious. Almost.",
    "⚰️ Bold. Dumb. Fast.",
    "🫣 Seriously? That was your plan?",
    "🥱 Even the mines are bored",
    "🦥 Slow and steady to defeat",
    "🫠 lol… just lol",
    "🐢 Hurry up, everyone already walked past it",
    "🪁 Your brain flew away with the flags",
    "💤 Again? Really?",
    "🐒 A monkey might do better",
    "🧨 BOOM! Classic.",
    "🎯 Nice try. Straight into disaster."
  ],
  ru: [
    "💀 Ты правда думал, что справишься?",
    "😏 Сапёр: 1 — Ты: 0",
    "🤡 Отличный ход. Очень.",
    "🪦 Здесь покоится твоя логика",
    "🧠 Попробуй включить мозг. В следующий раз.",
    "📉 IQ временно недоступен",
    "😎 Игра даже не напрягалась",
    "🙃 Может, попробуешь крестики-нолики?",
    "💣 Мина была очевидной. Почти.",
    "⚰️ Смело. Глупо. Быстро.",
    "🫣 Серьёзно? Ты думал это сработает?",
    "🥱 Даже мины зевают от твоей игры",
    "🦥 Медленно, но уверенно к поражению",
    "🫠 Ахах… просто ахах",
    "🐢 Ускорься, мимо мины уже прошли все",
    "🪁 Мозг улетел вместе с флагами",
    "💤 Опять? Серьёзно?",
    "🐒 Даже обезьяна сыграла бы лучше",
    "🧨 БУМ! Классика жанра",
    "🎯 Попытка засчитана. Но мимо."
  ]
};

let lang = localStorage.getItem("lang") || "en";

/* ==============================
   ⚙️ SETTINGS (persist)
================================ */
const settings = {
  musicVolume: Number(localStorage.getItem("musicVolume") ?? "30"),
  sfxVolume: Number(localStorage.getItem("sfxVolume") ?? "60"),
  vibrate: (localStorage.getItem("vibrate") ?? "1") === "1",
  snark: (localStorage.getItem("snark") ?? "1") === "1"
};

function saveSettings() {
  localStorage.setItem("musicVolume", String(settings.musicVolume));
  localStorage.setItem("sfxVolume", String(settings.sfxVolume));
  localStorage.setItem("vibrate", settings.vibrate ? "1" : "0");
  localStorage.setItem("snark", settings.snark ? "1" : "0");
}

/* ==============================
   ⚙️ GAME STATE
================================ */
let rows, cols, minesCount;
let board = [], revealed = [], flags = [];
let gameOver = false;

let score = 0;
let remainingTime = 0;
let timerInterval = null;
let currentMode = "hard";

let giveUpStep = 0;
let pressTimer = null;

let firstClickDone = false;
let secondsElapsed = 0;

const statsKey = "ms_stats_v1";
const recordsKey = "ms_records_v1";

const levels = {
  easy:   { rows: 12, cols: 12, mines: 15,  limit: 180 },
  hard:   { rows: 20, cols: 20, mines: 120, limit: 60  },
  insane: { rows: 24, cols: 24, mines: 220, limit: 120 },
  daily:  { rows: 20, cols: 20, mines: 120, limit: 90  } // daily = отдельный режим
};

/* ==============================
   🔢 RNG (seeded for Daily)
================================ */
function mulberry32(seed) {
  let t = seed >>> 0;
  return function() {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function dailySeed() {
  // YYYYMMDD -> number
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,"0");
  const day = String(d.getDate()).padStart(2,"0");
  return Number(`${y}${m}${day}`);
}

/* ==============================
   🔊 AUDIO
================================ */
function setAudioVolumes() {
  const music = document.getElementById("bgMusic");
  const click = document.getElementById("clickSound");
  const boom = document.getElementById("boomSound");
  const win = document.getElementById("winSound");

  if (music) music.volume = Math.max(0, Math.min(1, settings.musicVolume / 100));
  const sfx = Math.max(0, Math.min(1, settings.sfxVolume / 100));
  if (click) click.volume = sfx;
  if (boom) boom.volume = sfx;
  if (win) win.volume = sfx;
}

function safePlay(audioEl) {
  if (!audioEl) return;
  try {
    audioEl.currentTime = 0;
    audioEl.play().catch(()=>{});
  } catch (_) {}
}

function playClickStart() {
  setAudioVolumes();
  safePlay(document.getElementById("clickSound"));

  const music = document.getElementById("bgMusic");
  safePlay(music);
}

function toggleMusic() {
  const music = document.getElementById("bgMusic");
  if (!music) return;
  if (music.paused) {
    setAudioVolumes();
    music.play().catch(()=>{});
  } else {
    music.pause();
  }
}

/* ==============================
   🧠 UI - language
================================ */
function applyLanguage() {
  document.documentElement.lang = lang;
  const t = i18n[lang];

  document.getElementById("title").textContent = t.title;
  document.getElementById("btnHard").textContent = t.hard;
  document.getElementById("btnInsane").textContent = t.insane;
  document.getElementById("btnDaily").textContent = t.daily;

  const langBtn = document.getElementById("langBtn");
  if (langBtn) langBtn.textContent = (lang === "en" ? "RU" : "EN");

  const giveUpBtn = document.getElementById("giveUpBtn");
  const map = [t.giveUp0, t.giveUp1, t.giveUp2, t.giveUp3];
  if (giveUpBtn) giveUpBtn.textContent = map[Math.min(giveUpStep, 3)];

  // settings texts
  document.getElementById("settingsTitle").textContent = t.settings;
  document.getElementById("lblMusicVol").textContent = t.musicVol;
  document.getElementById("lblSfxVol").textContent = t.sfxVol;
  document.getElementById("lblVibrate").textContent = t.vibrate;
  document.getElementById("lblSnark").textContent = t.snark;
  document.getElementById("historyTitle").textContent = t.history;
  document.getElementById("resetStatsBtn").textContent = t.resetStats;

  // modal labels
  document.getElementById("mScoreLabel").textContent = t.score;
  document.getElementById("mTimeLabel").textContent = t.time;
  document.getElementById("mStreakLabel").textContent = t.streak;
  document.getElementById("modalRetry").textContent = t.retry;
  document.getElementById("modalMenu").textContent = t.menu;

  renderHistory();
}

function toggleLanguage() {
  lang = (lang === "en" ? "ru" : "en");
  localStorage.setItem("lang", lang);
  applyLanguage();
}

/* ==============================
   📊 STATS/RECORDS
================================ */
function loadStats() {
  const raw = localStorage.getItem(statsKey);
  if (!raw) return { streak: 0, history: [] };
  try {
    const obj = JSON.parse(raw);
    return {
      streak: Number(obj.streak || 0),
      history: Array.isArray(obj.history) ? obj.history : []
    };
  } catch {
    return { streak: 0, history: [] };
  }
}

function saveStats(st) {
  localStorage.setItem(statsKey, JSON.stringify(st));
}

function loadRecords() {
  const raw = localStorage.getItem(recordsKey);
  if (!raw) return {};
  try { return JSON.parse(raw) || {}; } catch { return {}; }
}

function saveRecords(r) {
  localStorage.setItem(recordsKey, JSON.stringify(r));
}

function updateStreakUI() {
  const st = loadStats();
  document.getElementById("streak").textContent = String(st.streak || 0);
}

function formatTimeSec(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2,"0")}`;
}

function renderHistory() {
  const t = i18n[lang];
  const st = loadStats();
  const list = document.getElementById("historyList");
  if (!list) return;

  list.innerHTML = "";
  const items = (st.history || []).slice(0, 10);

  if (items.length === 0) {
    const div = document.createElement("div");
    div.className = "histItem";
    div.innerHTML = `<div class="small">${lang === "ru" ? "Пока пусто." : "Empty for now."}</div>`;
    list.appendChild(div);
    return;
  }

  for (const it of items) {
    const div = document.createElement("div");
    div.className = "histItem";
    const modeLabel = it.mode?.toUpperCase?.() || it.mode || "";
    div.innerHTML = `
      <div class="top">
        <div><b>${modeLabel}</b> • ${it.result}</div>
        <div>${it.date}</div>
      </div>
      <div class="small">${t.score}: ${it.score} • ${t.time}: ${it.time} • 🚩${it.flags}</div>
    `;
    list.appendChild(div);
  }
}

function resetStatsAndRecords() {
  localStorage.removeItem(statsKey);
  localStorage.removeItem(recordsKey);
  updateStreakUI();
  document.getElementById("record").textContent = "0";
  renderHistory();
  showToast(i18n[lang].resetDone);
}

/* tiny toast via modal subtitle flash */
function showToast(msg) {
  const subtitle = document.getElementById("modalSubtitle");
  if (!subtitle) return;
  const prev = subtitle.textContent;
  subtitle.textContent = msg;
  setTimeout(()=>{ subtitle.textContent = prev; }, 1200);
}

/* ==============================
   ⚙️ SETTINGS UI
================================ */
function openSettings() {
  document.getElementById("settingsOverlay").classList.remove("hidden");
  document.getElementById("settingsPanel").classList.remove("hidden");
}
function closeSettings() {
  document.getElementById("settingsOverlay").classList.add("hidden");
  document.getElementById("settingsPanel").classList.add("hidden");
}

/* ==============================
   😈 GIVE UP CHAIN
================================ */
function resetGiveUpButton() {
  giveUpStep = 0;
  document.getElementById("giveUpBtn").textContent = i18n[lang].giveUp0;
}

function giveUpClick() {
  safePlay(document.getElementById("clickSound"));
  giveUpStep++;

  const btn = document.getElementById("giveUpBtn");
  const t = i18n[lang];

  if (giveUpStep === 1) { btn.textContent = t.giveUp1; return; }
  if (giveUpStep === 2) { btn.textContent = t.giveUp2; return; }

  if (giveUpStep >= 3) {
    btn.textContent = t.giveUp3;
    playClickStart();
    startGame("easy");
    setTimeout(resetGiveUpButton, 1200);
  }
}

/* ==============================
   ▶️ START / RESTART
================================ */
function restartLevel() {
  safePlay(document.getElementById("clickSound"));
  startGame(currentMode);
}

function startGame(mode) {
  currentMode = mode;
  const cfg = levels[mode] || levels.hard;

  rows = cfg.rows;
  cols = cfg.cols;
  minesCount = cfg.mines;
  remainingTime = cfg.limit;

  // grid columns via CSS variable
  const boardDiv = document.getElementById("board");
  boardDiv.style.setProperty("--cols", cols);

  // state
  gameOver = false;
  score = 0;
  secondsElapsed = 0;
  firstClickDone = false;

  document.getElementById("score").textContent = "0";
  updateTimeDisplay();
  document.getElementById("record").textContent = getRecordForMode(mode).bestScore.toString();
  updateStreakUI();

  // only background changes for easy
  if (mode === "easy") document.body.classList.add("pink-mode");
  else document.body.classList.remove("pink-mode");

  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    remainingTime--;
    secondsElapsed++;
    updateTimeDisplay();
    if (remainingTime <= 0) endGame(false, true);
  }, 1000);

  // build arrays
  board = Array.from({ length: rows }, () => Array(cols).fill(0));
  revealed = Array.from({ length: rows }, () => Array(cols).fill(false));
  flags = Array.from({ length: rows }, () => Array(cols).fill(false));

  updateFlagUI();
  drawBoard();

  // NOTE: mines placed after first click (quality improvement, not “controls”)
}

/* ==============================
   ⏱ TIMER UI
================================ */
function updateTimeDisplay() {
  document.getElementById("time").textContent = formatTimeSec(Math.max(0, remainingTime));
}

/* ==============================
   💣 BOARD GENERATION
================================ */
function placeMinesAvoiding(firstR, firstC) {
  const total = rows * cols;
  const forbidden = new Set();
  for (let dr=-1; dr<=1; dr++) {
    for (let dc=-1; dc<=1; dc++) {
      const nr = firstR + dr, nc = firstC + dc;
      if (nr>=0 && nr<rows && nc>=0 && nc<cols) forbidden.add(nr*cols + nc);
    }
  }

  const rng = (currentMode === "daily") ? mulberry32(dailySeed()) : Math.random;

  let placed = 0;
  while (placed < minesCount) {
    const idx = Math.floor(rng() * total);
    if (forbidden.has(idx)) continue;

    const r = Math.floor(idx / cols);
    const c = idx % cols;

    if (board[r][c] !== "M") {
      board[r][c] = "M";
      placed++;
    }
  }
}

function calculateNumbers() {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c] === "M") continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr, nc = c + dc;
          if (nr>=0 && nr<rows && nc>=0 && nc<cols && board[nr][nc] === "M") count++;
        }
      }
      board[r][c] = count;
    }
  }
}

/* ==============================
   🧩 RENDER
================================ */
function drawBoard() {
  const boardDiv = document.getElementById("board");
  boardDiv.innerHTML = "";
  boardDiv.style.setProperty("--cols", cols);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.id = `cell-${r}-${c}`;

      // PC right click flag
      cell.addEventListener("mousedown", (e) => {
        if (e.button === 2) {
          e.preventDefault();
          toggleFlag(r, c, cell);
        }
      });

      // left click open
      cell.addEventListener("click", () => openCell(r, c));
      cell.addEventListener("contextmenu", (e) => e.preventDefault());

      // mobile: long press flag, tap open (unchanged controls)
      cell.addEventListener("touchstart", (e) => {
        e.preventDefault();
        pressTimer = setTimeout(() => {
          toggleFlag(r, c, cell);
          pressTimer = null;
        }, 350);
      }, { passive: false });

      cell.addEventListener("touchend", () => {
        if (pressTimer) {
          clearTimeout(pressTimer);
          pressTimer = null;
          openCell(r, c);
        }
      });

      boardDiv.appendChild(cell);
    }
  }
}

/* ==============================
   🚩 FLAGS UI
================================ */
function countFlags() {
  let count = 0;
  for (let r=0; r<rows; r++) for (let c=0; c<cols; c++) if (flags[r][c]) count++;
  return count;
}

function updateFlagUI() {
  const f = countFlags();
  document.getElementById("flags").textContent = String(f);
  document.getElementById("minesLeft").textContent = String(Math.max(0, minesCount - f));
}

/* ==============================
   🎮 ACTIONS
================================ */
function openCell(r, c) {
  if (gameOver || revealed[r][c] || flags[r][c]) return;

  setAudioVolumes();
  safePlay(document.getElementById("clickSound"));

  // first click: place mines safely
  if (!firstClickDone) {
    firstClickDone = true;
    placeMinesAvoiding(r, c);
    calculateNumbers();
  }

  const cell = document.getElementById(`cell-${r}-${c}`);
  revealed[r][c] = true;
  cell.classList.add("open");

  if (board[r][c] === "M") {
    cell.textContent = "💣";
    cell.classList.add("explode");

    safePlay(document.getElementById("boomSound"));

    if (settings.vibrate && navigator.vibrate) navigator.vibrate([200, 100, 200]);

    const boardDiv = document.getElementById("board");
    boardDiv.classList.add("shake");
    setTimeout(() => boardDiv.classList.remove("shake"), 300);

    endGame(false, false);
    return;
  }

  // scoring
  score += 5;
  document.getElementById("score").textContent = String(score);

  if (board[r][c] > 0) {
    cell.textContent = String(board[r][c]);
    cell.classList.add("n" + board[r][c]);
  } else {
    // flood open
    for (let dr=-1; dr<=1; dr++) {
      for (let dc=-1; dc<=1; dc++) {
        const nr = r + dr, nc = c + dc;
        if (nr>=0 && nr<rows && nc>=0 && nc<cols) {
          if (!revealed[nr][nc] && !flags[nr][nc]) openCell(nr, nc);
        }
      }
    }
  }

  updateFlagUI();
  checkWin();
}

function toggleFlag(r, c, cell) {
  if (gameOver || revealed[r][c]) return;

  setAudioVolumes();
  safePlay(document.getElementById("clickSound"));

  flags[r][c] = !flags[r][c];
  cell.textContent = flags[r][c] ? "🚩" : "";
  cell.classList.toggle("flag", flags[r][c]);

  updateFlagUI();
}

/* ==============================
   🏁 WIN / LOSE (modal)
================================ */
function checkWin() {
  let opened = 0;
  for (let r=0; r<rows; r++) for (let c=0; c<cols; c++) if (revealed[r][c]) opened++;
  if (opened === rows * cols - minesCount) endGame(true, false);
}

function modeSubtitle(mode) {
  const t = i18n[lang];
  if (mode === "daily") return t.dailySub;
  if (mode === "insane") return t.insaneSub;
  return t.hardSub;
}

function showModal({ win, phrase, timeUp }) {
  const t = i18n[lang];

  const overlay = document.getElementById("modalOverlay");
  const modal = document.getElementById("resultModal");

  document.getElementById("modalTitle").textContent = win ? t.winTitle : t.loseTitle;
  document.getElementById("modalSubtitle").textContent = modeSubtitle(currentMode);

  const phraseEl = document.getElementById("modalPhrase");
  if (win) {
    phraseEl.textContent = lang === "ru" ? "🔥 Нереально… но ты справился." : "🔥 Unreal… but you did it.";
  } else if (timeUp) {
    phraseEl.textContent = t.timeUp;
  } else {
    phraseEl.textContent = phrase || "";
  }

  document.getElementById("mScore").textContent = String(score);
  document.getElementById("mTime").textContent = formatTimeSec(secondsElapsed);
  document.getElementById("mStreak").textContent = String(loadStats().streak || 0);

  overlay.classList.remove("hidden");
  modal.classList.remove("hidden");
}

function hideModal() {
  document.getElementById("modalOverlay").classList.add("hidden");
  document.getElementById("resultModal").classList.add("hidden");
}

function endGame(win, timeUp) {
  gameOver = true;
  clearInterval(timerInterval);

  setAudioVolumes();

  // streak + history
  const st = loadStats();
  if (win) st.streak = (st.streak || 0) + 1;
  else st.streak = 0;

  const hist = st.history || [];
  const now = new Date();
  const dd = String(now.getDate()).padStart(2,"0");
  const mm = String(now.getMonth()+1).padStart(2,"0");
  const yy = String(now.getFullYear());
  const dateStr = `${dd}.${mm}.${yy}`;

  hist.unshift({
    date: dateStr,
    mode: currentMode,
    result: win ? (lang === "ru" ? "победа" : "win") : (lang === "ru" ? "поражение" : "lose"),
    score,
    time: formatTimeSec(secondsElapsed),
    flags: countFlags()
  });

  st.history = hist.slice(0, 10);
  saveStats(st);
  updateStreakUI();
  renderHistory();

  // record updates
  updateRecordsAfterGame(win);

  // sounds + effects
  if (win) {
    safePlay(document.getElementById("winSound"));
    if (settings.vibrate && navigator.vibrate) navigator.vibrate([100, 50, 100]);
    launchConfetti();
  } else {
    safePlay(document.getElementById("boomSound"));
    if (settings.vibrate && navigator.vibrate) navigator.vibrate([200, 100, 200]);
  }

  const phrase = (!win && settings.snark && !timeUp)
    ? losePhrases[lang][Math.floor(Math.random() * losePhrases[lang].length)]
    : "";

  showModal({ win, phrase, timeUp });
}

/* ==============================
   🏆 RECORDS
================================ */
function getRecordForMode(mode) {
  const all = loadRecords();
  return all[mode] || { bestScore: 0, bestTimeSec: null };
}

function updateRecordsAfterGame(win) {
  const all = loadRecords();
  const rec = all[currentMode] || { bestScore: 0, bestTimeSec: null };

  if (win) {
    if (score > (rec.bestScore || 0)) rec.bestScore = score;
    if (rec.bestTimeSec == null || secondsElapsed < rec.bestTimeSec) rec.bestTimeSec = secondsElapsed;
  }

  all[currentMode] = rec;
  saveRecords(all);

  document.getElementById("record").textContent = String(rec.bestScore || 0);
}

/* ==============================
   🎉 CONFETTI
================================ */
function launchConfetti() {
  const layer = document.getElementById("confettiLayer");
  if (!layer) return;

  // clear old
  layer.innerHTML = "";

  const count = 80;
  for (let i=0; i<count; i++) {
    const el = document.createElement("div");
    el.className = "confetti";
    el.style.left = Math.floor(Math.random() * 100) + "vw";
    el.style.top = (-10 - Math.random()*20) + "px";
    el.style.animationDelay = (Math.random() * 200) + "ms";
    el.style.transform = `rotate(${Math.random()*360}deg)`;

    // random bright colors (no hardcoded palette? but this is UI-only; ok)
    const hue = Math.floor(Math.random()*360);
    el.style.background = `hsl(${hue} 95% 60%)`;

    layer.appendChild(el);
  }

  setTimeout(() => { layer.innerHTML = ""; }, 1200);
}

/* ==============================
   ✅ INIT / EVENTS
================================ */
function wireUI() {
  // settings open/close
  document.getElementById("settingsBtn").addEventListener("click", openSettings);
  document.getElementById("settingsClose").addEventListener("click", closeSettings);
  document.getElementById("settingsOverlay").addEventListener("click", closeSettings);

  // modal buttons
  document.getElementById("modalOverlay").addEventListener("click", hideModal);
  document.getElementById("modalRetry").addEventListener("click", () => {
    hideModal();
    startGame(currentMode);
  });
  document.getElementById("modalMenu").addEventListener("click", () => {
    hideModal();
    // menu = just stop timer and keep current screen; (you can add real menu later)
    clearInterval(timerInterval);
  });

  // volumes
  const music1 = document.getElementById("musicVolume");
  const music2 = document.getElementById("musicVolume2");
  const sfx = document.getElementById("sfxVolume");

  music1.value = String(settings.musicVolume);
  music2.value = String(settings.musicVolume);
  sfx.value = String(settings.sfxVolume);

  function setMusic(v) {
    settings.musicVolume = Number(v);
    music1.value = String(settings.musicVolume);
    music2.value = String(settings.musicVolume);
    saveSettings();
    setAudioVolumes();
  }
  music1.addEventListener("input", e => setMusic(e.target.value));
  music2.addEventListener("input", e => setMusic(e.target.value));

  sfx.addEventListener("input", e => {
    settings.sfxVolume = Number(e.target.value);
    saveSettings();
    setAudioVolumes();
  });

  // toggles
  const vib = document.getElementById("toggleVibrate");
  const sn = document.getElementById("toggleSnark");
  vib.checked = settings.vibrate;
  sn.checked = settings.snark;

  vib.addEventListener("change", e => {
    settings.vibrate = !!e.target.checked;
    saveSettings();
  });
  sn.addEventListener("change", e => {
    settings.snark = !!e.target.checked;
    saveSettings();
  });

  // reset stats
  document.getElementById("resetStatsBtn").addEventListener("click", resetStatsAndRecords);
}

(function init() {
  applyLanguage();
  wireUI();
  setAudioVolumes();
  updateStreakUI();
  renderHistory();

  // start on hard by default
  startGame("hard");
})();

