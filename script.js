let rows, cols, mines;
let board = [], open = [], flags = [];
let timer, timeLeft, score;
let level = "hard";
let lang = localStorage.getItem("lang") || "en";

const text = {
  en: {
    title: "💣 Minesweeper: Hardcore",
    give0: "I GIVE UP",
    give1: "Sure?",
    give2: "Did you think?",
    give3: "WEAK"
  },
  ru: {
    title: "💣 Сапёр: Хардкор",
    give0: "Я СДАЮСЬ",
    give1: "Точно?",
    give2: "Подумал?",
    give3: "СЛАБАК"
  }
};

function toggleLanguage() {
  lang = lang === "en" ? "ru" : "en";
  localStorage.setItem("lang", lang);
  document.getElementById("title").innerText = text[lang].title;
  document.getElementById("giveUpBtn").innerText = text[lang].give0;
}

function startGame(lv) {
  level = lv;
  document.body.classList.toggle("easy", lv === "easy");

  if (lv === "hard") { rows=20; cols=20; mines=120; timeLeft=60; }
  if (lv === "insane") { rows=24; cols=24; mines=220; timeLeft=120; }
  if (lv === "easy") { rows=12; cols=12; mines=15; timeLeft=180; }

  board = Array(rows).fill().map(()=>Array(cols).fill(0));
  open = Array(rows).fill().map(()=>Array(cols).fill(false));
  flags = Array(rows).fill().map(()=>Array(cols).fill(false));
  score = 0;

  placeMines();
  calcNumbers();
  draw();

  clearInterval(timer);
  timer = setInterval(()=>{
    timeLeft--;
    updateInfo();
    if(timeLeft<=0) lose();
  },1000);

  updateInfo();
}

function placeMines() {
  let m=0;
  while(m<mines){
    let r=Math.floor(Math.random()*rows);
    let c=Math.floor(Math.random()*cols);
    if(board[r][c]!=="M"){ board[r][c]="M"; m++; }
  }
}

function calcNumbers() {
  for(let r=0;r<rows;r++)
    for(let c=0;c<cols;c++)
      if(board[r][c]!=="M"){
        let n=0;
        for(let dr=-1;dr<=1;dr++)
          for(let dc=-1;dc<=1;dc++){
            let nr=r+dr,nc=c+dc;
            if(board[nr]?.[nc]==="M") n++;
          }
        board[r][c]=n;
      }
}

function draw() {
  const b=document.getElementById("board");
  b.style.gridTemplateColumns=`repeat(${cols},30px)`;
  b.innerHTML="";
  for(let r=0;r<rows;r++)
    for(let c=0;c<cols;c++){
      let d=document.createElement("div");
      d.className="cell";
      d.onclick=()=>openCell(r,c,d);
      d.oncontextmenu=e=>{e.preventDefault();flag(r,c,d)};
      b.appendChild(d);
    }
}

function openCell(r,c,d){
  if(open[r][c]||flags[r][c])return;
  open[r][c]=true;
  d.classList.add("open");
  if(board[r][c]==="M"){ d.innerText="💣"; lose(); return; }
  if(board[r][c]>0)d.innerText=board[r][c];
  score+=5;
  updateInfo();
}

function flag(r,c,d){
  flags[r][c]=!flags[r][c];
  d.innerText=flags[r][c]?"🚩":"";
}

function updateInfo(){
  document.getElementById("time").innerText=Math.floor(timeLeft/60)+":"+String(timeLeft%60).padStart(2,"0");
  document.getElementById("score").innerText=score;
}

let give=0;
function giveUp(){
  give++;
  const g=document.getElementById("giveUpBtn");
  g.innerText=text[lang]["give"+Math.min(give,3)];
  if(give>=3){ startGame("easy"); give=0; }
}

function restart(){ startGame(level); }

function toggleMusic(){
  const bg=document.getElementById("bg");
  bg.paused?bg.play():bg.pause();
}


