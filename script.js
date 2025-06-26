const board = document.getElementById("board");
const statusText = document.getElementById("status");
const moveCountEl = document.getElementById("moveCount");
const timerEl = document.getElementById("timer");
const undoBtn = document.getElementById("undoBtn");
const restartBtn = document.getElementById("restartBtn");
const moveSound = document.getElementById("moveSound");
const winSound = document.getElementById("winSound");
const failSound = document.getElementById("failSound");

const boardSize = 8;
let knightPos = [7, 0];
let moveCount = 1;
let visited;
let moveHistory = [];
let timer = null;
let seconds = 0;

function formatTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function startTimer() {
  if (!timer) {
    timer = setInterval(() => {
      seconds++;
      timerEl.textContent = formatTime(seconds);
    }, 1000);
  }
}

function stopTimer() {
  clearInterval(timer);
  timer = null;
}

function initVisited() {
  visited = Array.from({ length: boardSize }, () => Array(boardSize).fill(false));
}

function createBoard() {
  board.innerHTML = "";
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      const cell = document.createElement("div");
      cell.classList.add("cell", (row + col) % 2 === 0 ? "white" : "black");
      cell.dataset.row = row;
      cell.dataset.col = col;
      board.appendChild(cell);
    }
  }
}

function getCell(row, col) {
  return document.querySelector(`.cell[data-row='${row}'][data-col='${col}']`);
}

function getKnightMoves(row, col) {
  const deltas = [
    [-2, -1], [-2, +1], [-1, -2], [-1, +2],
    [+1, -2], [+1, +2], [+2, -1], [+2, +1],
  ];
  return deltas
    .map(([dr, dc]) => [row + dr, col + dc])
    .filter(([r, c]) => r >= 0 && r < boardSize && c >= 0 && c < boardSize && !visited[r][c]);
}

function getBestHint(row, col) {
  const options = getKnightMoves(row, col);
  if (options.length === 0) return [];
  options.sort((a, b) => getKnightMoves(...a).length - getKnightMoves(...b).length);
  return [options[0]];
}

function updateBoard() {
  document.querySelectorAll(".cell").forEach(cell => {
    cell.classList.remove("knight", "visited", "hint", "best-hint");
    cell.textContent = "";
    const r = parseInt(cell.dataset.row);
    const c = parseInt(cell.dataset.col);
    if (visited[r][c]) cell.classList.add("visited");
  });

  const [kr, kc] = knightPos;
  const knightCell = getCell(kr, kc);
  knightCell.classList.add("knight");
  knightCell.textContent = "♞";

  const allHints = getKnightMoves(kr, kc);
  const bestHint = getBestHint(kr, kc)[0];

  allHints.forEach(([r, c]) => {
    const cell = getCell(r, c);
    if (bestHint && bestHint[0] === r && bestHint[1] === c) {
      cell.classList.add("best-hint");
    } else {
      cell.classList.add("hint");
    }
  });
}

function setupClickHandlers() {
  document.querySelectorAll(".cell").forEach(cell => {
    cell.onclick = () => {
      const r = parseInt(cell.dataset.row);
      const c = parseInt(cell.dataset.col);
      const legalMoves = getKnightMoves(...knightPos);
      const isLegal = legalMoves.some(([mr, mc]) => mr === r && mc === c);

      if (isLegal) {
        startTimer();
        moveSound.play();
        moveHistory.push([...knightPos]);
        knightPos = [r, c];
        visited[r][c] = true;
        moveCount++;
        moveCountEl.textContent = moveCount;
        updateBoard();

        const nextMoves = getKnightMoves(r, c);
        if (moveCount === 64) {
          statusText.textContent = "🎉 You completed the tour!";
          winSound.play();
          stopTimer();
        } else if (nextMoves.length === 0) {
          statusText.textContent = "❌ No more valid moves. Game Over!";
          failSound.play();
          stopTimer();
        }
      }
    };
  });
}

undoBtn.onclick = () => {
  if (moveHistory.length > 0) {
    const [r, c] = knightPos;
    visited[r][c] = false;
    knightPos = moveHistory.pop();
    moveCount--;
    moveCountEl.textContent = moveCount;
    statusText.textContent = "↩️ Undo successful.";
    updateBoard();
  }
};

restartBtn.onclick = () => {
  knightPos = [7, 0];
  moveCount = 1;
  moveHistory = [];
  seconds = 0;
  stopTimer();
  timerEl.textContent = "00:00";
  initVisited();
  visited[7][0] = true;
  moveCountEl.textContent = moveCount;
  statusText.textContent = "♞ Start from A1 and cover all 64 squares.";
  createBoard();
  updateBoard();
  setupClickHandlers();
};

// Initial setup
initVisited();
createBoard();
visited[7][0] = true;
updateBoard();
setupClickHandlers();

