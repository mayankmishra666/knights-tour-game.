const board = document.getElementById("board");
const statusText = document.getElementById("status");
const moveCountEl = document.getElementById("moveCount");
const restartBtn = document.getElementById("restartBtn");

const boardSize = 8;
let knightPos = [7, 0]; // A1 (row 7, col 0)
let moveCount = 1;
let visited;

function initVisited() {
  visited = Array.from({ length: boardSize }, () =>
    Array(boardSize).fill(false)
  );
}

function createBoard() {
  board.innerHTML = "";
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      if ((row + col) % 2 === 0) {
        cell.classList.add("white");
      } else {
        cell.classList.add("black");
      }
      cell.dataset.row = row;
      cell.dataset.col = col;
      board.appendChild(cell);
    }
  }
}

function getCell(row, col) {
  return document.querySelector(
    `.cell[data-row='${row}'][data-col='${col}']`
  );
}

function getKnightMoves(row, col) {
  const moves = [
    [row - 2, col - 1], [row - 2, col + 1],
    [row - 1, col - 2], [row - 1, col + 2],
    [row + 1, col - 2], [row + 1, col + 2],
    [row + 2, col - 1], [row + 2, col + 1],
  ];

  return moves.filter(([r, c]) =>
    r >= 0 && r < boardSize && c >= 0 && c < boardSize && !visited[r][c]
  );
}

function updateBoard() {
  document.querySelectorAll(".cell").forEach(cell => {
    cell.classList.remove("knight", "visited", "hint");
    cell.textContent = "";
    const r = parseInt(cell.dataset.row);
    const c = parseInt(cell.dataset.col);
    if (visited[r][c]) {
      cell.classList.add("visited");
    }
  });

  const [kr, kc] = knightPos;
  const knightCell = getCell(kr, kc);
  knightCell.classList.add("knight");
  knightCell.textContent = "♞";

  const hints = getKnightMoves(kr, kc);
  hints.forEach(([r, c]) => getCell(r, c).classList.add("hint"));
}

function setupClickHandlers() {
  document.querySelectorAll(".cell").forEach(cell => {
    cell.onclick = () => {
      const r = parseInt(cell.dataset.row);
      const c = parseInt(cell.dataset.col);
      const legalMoves = getKnightMoves(...knightPos);
      const isLegal = legalMoves.some(([mr, mc]) => mr === r && mc === c);

      if (isLegal) {
        knightPos = [r, c];
        visited[r][c] = true;
        moveCount++;
        moveCountEl.textContent = moveCount;
        updateBoard();

        const nextMoves = getKnightMoves(r, c);
        if (moveCount === 64) {
          statusText.textContent = "🎉 Congratulations! You completed the tour!";
        } else if (nextMoves.length === 0) {
          statusText.textContent = "❌ No more valid moves. Game Over!";
        }
      }
    };
  });
}

function restartGame() {
  knightPos = [7, 0];
  moveCount = 1;
  initVisited();
  visited[7][0] = true;
  moveCountEl.textContent = moveCount;
  statusText.textContent = "♞ Start from A1 and cover all 64 squares without repeating.";
  createBoard();
  updateBoard();
  setupClickHandlers();
}

// Start game
initVisited();
createBoard();
visited[7][0] = true;
updateBoard();
setupClickHandlers();

// Restart button
restartBtn.onclick = restartGame;
