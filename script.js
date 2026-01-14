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
    "🎯 Nice try. Straight into disaster.",

    "💀 That was painful to watch",
    "🤡 Congratulations, you played yourself",
    "🪦 Rest in pieces, brain cells",
    "😬 Even the mines are disappointed",
    "📉 Skill level: underground",
    "🧯 Call the fire department for that fail",
    "🥴 That wasn't even close",
    "🧠 Brain.exe has stopped working",
    "🎯 Missed everything except the mine",
    "😴 Try again when you're awake",
    "🗿 Legendary fail unlocked",
    "📚 Please read the tutorial (again)",
    "🪤 You walked straight into it",
    "😵 That was impressively bad",
    "🥇 First place in losing",
    "🚫 No thoughts, only mines",
    "🧊 Cold. Slow. Wrong.",
    "🧨 Boom. Obviously.",
    "🧹 Clean up that disaster",
    "🧠 Refund your brain"
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
    "🎯 Попытка засчитана. Но мимо.",

    "💀 Это было больно смотреть",
    "🤡 Поздравляю, ты сам себя переиграл",
    "🪦 Покойся с миром, мозг",
    "😬 Даже мины разочарованы",
    "📉 Уровень скилла: под землёй",
    "🧯 Вызови пожарных для этого фейла",
    "🥴 Это даже не было близко",
    "🧠 Brain.exe перестал работать",
    "🎯 Попал во всё, кроме правильного",
    "😴 Попробуй, когда проснёшься",
    "🗿 Легендарный провал открыт",
    "📚 Почитай обучение (ещё раз)",
    "🪤 Ты сам туда пошёл",
    "😵 Это было впечатляюще плохо",
    "🥇 Первое место по сливу",
    "🚫 Ни мыслей, ни шансов",
    "🧊 Холодно. Медленно. Мимо.",
    "🧨 Ну конечно, взрыв",
    "🧹 Убери за собой этот позор",
    "🧠 Верни мозг по гарантии"
  ]
};

let lang = localStorage.getItem("lang") || "en";

let rows, cols, minesCount;
let board = [], revealed = [], flags = [];
let gameOver = false;
let score = 0;
let remainingTime = 0;
let timerInterval = null;
let currentLevel = "hard";

let giveUpStep = 0;
let pressTimer = null;

const levels = {
  easy:   { rows: 12, cols: 12, mines: 15,  limit: 180 }, // 3:00
  hard:   { rows: 20, cols: 20, mines: 120, limit: 60  }, // 1:00
  insane: { rows: 24, cols: 24, mines: 220, limit: 120 }  // 2:00
};

/* audio helpers */
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

/* ✅ message instead of alert */
function showMessage(text, type) {
  const el = document.getElementById("message");
  if (!el) return;
  el.textContent = text;
  el.classList.remove("hidden", "win", "lose");
  if (type === "win") el.classList.add("win");
  if (type === "lose") el.classList.add("lose");
}

function hideMessage() {
  const el = document.getElementById("message");
  if (!el) return;
  el.textContent = "";
  el.classList.add("hidden");
  el.classList.remove("win", "lose");
}

/* language */
function applyLanguage() {
  document.documentElement.lang = lang;
  const t = i18n[lang];

  document.getElementById("title").textContent = t.title;
  document.getElementById("btnHard").textContent = t.hard;
  document.getElementById("btnInsane").textContent = t.insane;

  const langBtn = document.getElementById("langBtn");
  if (langBtn) langBtn.textContent = (lang === "en" ? "RU" : "EN");

  const giveUpBtn = document.getElementById("giveUpBtn");
  const map = [t.giveUp0, t.giveUp1, t.giveUp2, t.giveUp3];
  if (giveUpBtn) giveUpBtn.textContent = map[Math.min(giveUpStep, 3)];
}

function toggleLanguage() {
  lang = (lang === "en" ? "ru" : "en");
  localStorage.setItem("lang", lang);
  applyLanguage();
}

/* give up */
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

/* restart */
function restartLevel() {
  safePlay(document.getElementById("clickSound"));
  startGame(currentLevel);
}

/* start */
function startGame(level) {
  currentLevel = level;
  const cfg = levels[level];

  rows = cfg.rows;
  cols = cfg.cols;
  minesCount = cfg.mines;
  remainingTime = cfg.limit;

  // grid cols via CSS variable
  const boardDiv = document.getElementById("board");
  if (boardDiv) boardDiv.style.setProperty("--cols", cols);

  gameOver = false;
  score = 0;

  hideMessage();

  document.getElementById("score").textContent = String(score);
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

function updateTimeDisplay() {
  const m = Math.floor(remainingTime / 60);
  const s = remainingTime % 60;
  document.getElementById("time").textContent = `${m}:${s.toString().padStart(2, "0")}`;
}

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

function drawBoard() {
  const boardDiv = document.getElementById("board");
  boardDiv.innerHTML = "";
  boardDiv.style.setProperty("--cols", cols);

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

      // mobile: long-press flag
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

function updateFlagUI() {
  let count = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (flags[r][c]) count++;
    }
  }
  document.getElementById("flags").textContent = String(count);
  document.getElementById("minesLeft").textContent = String(Math.max(0, minesCount - count));
}

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
  document.getElementById("score").textContent = String(score);

  if (board[r][c] > 0) {
    cell.textContent = String(board[r][c]);
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
  cell.classList.toggle("flag", flags[r][c]);

  updateFlagUI();
}

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
    showMessage(t.win, "win");
  } else {
    const msg = timeUp
      ? t.timeUp
      : losePhrases[lang][Math.floor(Math.random() * losePhrases[lang].length)];
    showMessage(msg, "lose");
  }
}

/* records */
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

/* init */
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







