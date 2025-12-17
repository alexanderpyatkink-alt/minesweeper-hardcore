/* ==============================
   🌍 LANGUAGE PACKS
================================ */
const i18n = {
  en: {
    title: "💣 Minesweeper: Hardcore",
    hard: "🔴 HARD",
    insane: "☠️ INSANE",
    giveUp0: "I GIVE UP",
    giveUp1: "Sure?",
    giveUp2: "Did you think it through?",
    giveUp3: "WEAK.",
    win: "🎉 IMPOSSIBLE… but you won.",
    timeUp: "⏳ Time's up. Too slow."
  },
  ru: {
    title: "💣 Сапёр: Хардкор",
    hard: "🔴 СЛОЖНЫЙ",
    insane: "☠️ ОЧЕНЬ СЛОЖНЫЙ",
    giveUp0: "Я СДАЮСЬ",
    giveUp1: "Точно?",
    giveUp2: "Ты хорошо подумал?",
    giveUp3: "СЛАБАК.",
    win: "🎉 НЕВОЗМОЖНО… но ты выиграл.",
    timeUp: "⏳ Время вышло. Слишком медленно."
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
   ⚙️ GAME STATE
================================ */
let rows, cols, minesCount;
let board = [], revealed = [], flags = [];
let gameOver = false;
let score = 0;
let remainingTime = 0;
let timerInterval = null;
let currentLevel = "hard";

let giveUpStep = 0;
let pressTimer = null;
let flagCount = 0;

/* FIXED LEVELS (no adaptation) */
const levels = {
  easy:   { rows: 12, cols: 12, mines: 15,  limit: 180 }, // 3:00
  hard:   { rows: 20, cols: 20, mines: 120, limit: 60  }, // 1:00
  insane: { rows: 24, cols: 24, mines: 220, limit: 120 }  // 2:00
};

/* ==============================
   🔊 AUDIO HELPERS
================================ */
function safePlay(audioEl) {
  if (!audioEl) return;
  try {
    audioEl.currentTime = 0;
    audioEl.play().catch(()=>{});
  } catch (_) {}
}

function applyMusicVolumeFromSlider() {
  const music = document.getElementById("bgMusic");
  const slider = document.getElementById("musicVolume");
  if (!music || !slider) return;

  const v = Math.max(0, Math.min(100, Number(slider.value))) / 100;
  music.volume = v;
  localStorage.setItem("musicVolume", String(slider.value));
}

/* ==============================
   🌍 LANGUAGE UI
================================ */
function applyLanguage() {
  document.documentElement.lang = lang;
  const t = i18n[lang];

  const title = document.getElementById("title");
  const btnHard = document.getElementById("btnHard");
  const btnInsane = document.getElementById("btnInsane");
  const langBtn = document.getElementById("langBtn");
  const giveUpBtn = document.getElementById("giveUpBtn");

  if (title) title.textContent = t.title;
  if (btnHard) btnHard.textContent = t.hard;
  if (btnInsane) btnInsane.textContent = t.insane;

  if (langBtn) langBtn.textContent = (lang === "en" ? "RU" : "EN");

  if (giveUpBtn) {
    const map = [t.giveUp0, t.giveUp1, t.giveUp2, t.giveUp3];
    giveUpBtn.textContent = map[Math.min(giveUpStep, 3)];
  }
}

function toggleLanguage() {
  lang = (lang === "en" ? "ru" : "en");
  localStorage.setItem("lang", lang);
  applyLanguage();
}

/* ==============================
   🎵 MUSIC CONTROLS
================================ */
function playClickStart() {
  safePlay(document.getElementById("clickSound"));
  const music = document.getElementById("bgMusic");
  applyMusicVolumeFromSlider();
  safePlay(music);
}

function toggleMusic() {
  const music = document.getElementById("bgMusic");
  if (!music) return;
  if (music.paused) {
    applyMusicVolumeFromSlider();
    music.play().catch(()=>{});
  } else {
    music.pause();
  }
}

/* restart current level */
function restartLevel() {
  safePlay(document.getElementById("clickSound"));
  startGame(currentLevel);
}

/* ==============================
   🚩 FLAGS UI
================================ */
function updateFlagUI() {
  let count = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (flags[r][c]) count++;
    }
  }
  flagCount = count;

  const flagsEl = document.getElementById("flags");
  const minesLeftEl = document.getElementById("minesLeft");

  if (flagsEl) flagsEl.textContent = flagCount;
  if (minesLeftEl) minesLeftEl.textContent = Math.max(0, minesCount - flagCount);
}

/* ==============================
   😈 GIVE UP CHAIN
================================ */
function resetGiveUpButton() {
  giveUpStep = 0;
  const btn = document.getElementById("giveUpBtn");
  if (btn) btn.textContent = i18n[lang].giveUp0;
}

function giveUpClick() {
  const btn = document.getElementById("giveUpBtn");
  if (!btn) return;

  safePlay(document.getElementById("clickSound"));
  giveUpStep++;

  if (giveUpStep === 1) { btn.textContent = i18n[lang].giveUp1; return; }
  if (giveUpStep === 2) { btn.textContent = i18n[lang].giveUp2; return; }

  if (giveUpStep >= 3) {
    btn.textContent = i18n[lang].giveUp3;
    playClickStart();
    startGame("easy");
    setTimeout(resetGiveUpButton, 1200);
  }
}

/* ==============================
   ▶️ START GAME (fixed sizes)
================================ */
function startGame(level) {
  currentLevel = level;
  const cfg = levels[level];

  rows = cfg.rows;
  cols = cfg.cols;
  minesCount = cfg.mines;
  remainingTime = cfg.limit;

  gameOver = false;
  score = 0;

  document.getElementById("score").textContent = score;
  updateTimeDisplay();

  if (level === "easy") document.body.classList.add("pink-mode");
  else document.body.classList.remove("pink-mode");

  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    remainingTime--;
    updateTimeDisplay();
    if (remainingTime <= 0) endGame(false, true);
  }, 1000);

  board = Array.from({ length: rows }, () => Array(cols).fill(0));
  revealed = Array.from({ length: rows }, () => Array(cols).fill(false));
  flags = Array.from({ length: rows }, () => Array(cols).fill(false));

  updateFlagUI();

  placeMines();
  calculateNumbers();
  drawBoard();
  loadRecord();
}

/* ==============================
   ⏱ TIMER UI
================================ */
function updateTimeDisplay() {
  const m = Math.floor(remainingTime / 60);
  const s = remainingTime % 60;
  document.getElementById("time").textContent =
    `${m}:${s.toString().padStart(2, "0")}`;
}

/* ==============================
   💣 BOARD LOGIC
================================ */
function placeMines() {
  let placed = 0;
  while (placed < minesCount) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
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

  const cellSize = getComputedStyle(document.documentElement)
    .getPropertyValue("--cell-size")
    .trim() || "32px";

  boardDiv.style.gridTemplateColumns = `repeat(${cols}, ${cellSize})`;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.id = `cell-${r}-${c}`;

      // PC: right click flag
      cell.addEventListener("mousedown", (e) => {
        if (e.button === 2) {
          e.preventDefault();
          toggleFlag(r, c, cell);
        }
      });

      cell.addEventListener("click", () => openCell(r, c));
      cell.addEventListener("contextmenu", (e) => e.preventDefault());

      // Mobile: long press = flag, tap = open
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
   🎮 ACTIONS
================================ */
function openCell(r, c) {
  if (gameOver || revealed[r][c] || flags[r][c]) return;

  const cell = document.getElementById(`cell-${r}-${c}`);
  revealed[r][c] = true;
  cell.classList.add("open");

  safePlay(document.getElementById("clickSound"));

  if (board[r][c] === "M") {
    cell.textContent = "💣";
    cell.classList.add("explode");

    safePlay(document.getElementById("boomSound"));
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);

    const boardDiv = document.getElementById("board");
    boardDiv.classList.add("shake");
    setTimeout(() => boardDiv.classList.remove("shake"), 300);

    endGame(false, false);
    return;
  }

  score += 5;
  document.getElementById("score").textContent = score;

  if (board[r][c] > 0) {
    cell.textContent = board[r][c];
  } else {
    for (let dr=-1; dr<=1; dr++) {
      for (let dc=-1; dc<=1; dc++) {
        const nr = r + dr, nc = c + dc;
        if (nr>=0 && nr<rows && nc>=0 && nc<cols) openCell(nr, nc);
      }
    }
  }

  updateFlagUI();
  checkWin();
}

function toggleFlag(r, c, cell) {
  if (gameOver || revealed[r][c]) return;

  flags[r][c] = !flags[r][c];
  cell.textContent = flags[r][c] ? "🚩" : "";
  cell.classList.toggle("flag");

  updateFlagUI();
}

/* ==============================
   🏁 WIN / LOSE
================================ */
function checkWin() {
  let opened = 0;
  for (let r=0; r<rows; r++) for (let c=0; c<cols; c++) if (revealed[r][c]) opened++;
  if (opened === rows * cols - minesCount) endGame(true, false);
}

function endGame(win, timeUp) {
  gameOver = true;
  clearInterval(timerInterval);

  const t = i18n[lang];

  if (win) {
    safePlay(document.getElementById("winSound"));
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    saveRecord();
    setTimeout(() => alert(t.win), 200);
  } else {
    const msg = timeUp
      ? t.timeUp
      : losePhrases[lang][Math.floor(Math.random() * losePhrases[lang].length)];
    setTimeout(() => alert(msg), 200);
  }
}

/* ==============================
   🏆 RECORDS
================================ */
function saveRecord() {
  const key = "record_" + currentLevel;
  const best = Number(localStorage.getItem(key) || "0");
  if (score > best) localStorage.setItem(key, String(score));
  loadRecord();
}

function loadRecord() {
  const key = "record_" + currentLevel;
  document.getElementById("record").textContent = localStorage.getItem(key) || "0";
}

/* ==============================
   ✅ INIT
================================ */
(function init() {
  applyLanguage();

  const slider = document.getElementById("musicVolume");
  const savedVol = localStorage.getItem("musicVolume");

  if (slider) {
    slider.value = savedVol ?? "30";
    slider.addEventListener("input", applyMusicVolumeFromSlider);
  }
  applyMusicVolumeFromSlider();
})();


