const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const scoreEl = document.getElementById('score');
const bestScoreEl = document.getElementById('best-score');
const messageEl = document.getElementById('message');
const startButton = document.getElementById('startButton');

const gridSize = 20;
const tileCount = canvas.width / gridSize;
const baseSpeed = 120;

let snake = [];
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let food = { x: 0, y: 0 };
let score = 0;
let bestScore = Number(localStorage.getItem('snake-best-score')) || 0;
let gameStarted = false;
let gameOver = false;
let gameLoopTimer = null;

function updateHud() {
  scoreEl.textContent = String(score);
  bestScoreEl.textContent = String(bestScore);
}

function showMessage(text) {
  messageEl.textContent = text;
  messageEl.classList.add('visible');
}

function clearBoard() {
  ctx.fillStyle = '#020617';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawGrid() {
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.14)';
  ctx.lineWidth = 1;

  for (let i = 0; i <= tileCount; i += 1) {
    const pos = i * gridSize;
    ctx.beginPath();
    ctx.moveTo(pos, 0);
    ctx.lineTo(pos, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, pos);
    ctx.lineTo(canvas.width, pos);
    ctx.stroke();
  }
}

function drawFood() {
  ctx.fillStyle = '#fb7185';
  ctx.beginPath();
  ctx.arc(food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2, gridSize / 2.2, 0, Math.PI * 2);
  ctx.fill();
}

function drawSnake() {
  snake.forEach((segment, index) => {
    ctx.fillStyle = index === 0 ? '#34d399' : '#6ee7b7';
    ctx.fillRect(segment.x * gridSize + 1, segment.y * gridSize + 1, gridSize - 2, gridSize - 2);
  });
}

function drawGame() {
  clearBoard();
  drawGrid();
  drawFood();
  drawSnake();
}

function placeFood() {
  let newFood;

  do {
    newFood = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount),
    };
  } while (snake.some((segment) => segment.x === newFood.x && segment.y === newFood.y));

  food = newFood;
}

function resetGameState() {
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ];

  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  updateHud();
  placeFood();
  gameOver = false;
  gameStarted = true;
  showMessage('Game on!');

  if (gameLoopTimer) {
    clearInterval(gameLoopTimer);
  }

  gameLoopTimer = setInterval(gameLoop, baseSpeed);
}

function endGame() {
  gameStarted = false;
  gameOver = true;
  clearInterval(gameLoopTimer);
  showMessage(`Game over! Final score: ${score}. Press Space or Restart.`);
}

function handleDirectionInput(newDirection) {
  const isReverseMove = newDirection.x === -direction.x && newDirection.y === -direction.y;

  if (isReverseMove) {
    return;
  }

  if (!gameStarted || gameOver) {
    resetGameState();
  }

  nextDirection = newDirection;
}

function gameLoop() {
  direction = nextDirection;

  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y,
  };

  const hitWall =
    head.x < 0 ||
    head.y < 0 ||
    head.x >= tileCount ||
    head.y >= tileCount;

  const hitSelf = snake.some((segment) => segment.x === head.x && segment.y === head.y);

  if (hitWall || hitSelf) {
    endGame();
    drawGame();
    return;
  }

  snake.unshift(head);

  const ateFood = head.x === food.x && head.y === food.y;

  if (ateFood) {
    score += 1;

    if (score > bestScore) {
      bestScore = score;
      localStorage.setItem('snake-best-score', String(bestScore));
    }

    updateHud();
    placeFood();
  } else {
    snake.pop();
  }

  drawGame();
}

function handleKeydown(event) {
  const key = event.key.toLowerCase();

  if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd', ' '].includes(key)) {
    event.preventDefault();
  }

  if (key === ' ') {
    resetGameState();
    return;
  }

  switch (key) {
    case 'arrowup':
    case 'w':
      handleDirectionInput({ x: 0, y: -1 });
      break;
    case 'arrowdown':
    case 's':
      handleDirectionInput({ x: 0, y: 1 });
      break;
    case 'arrowleft':
    case 'a':
      handleDirectionInput({ x: -1, y: 0 });
      break;
    case 'arrowright':
    case 'd':
      handleDirectionInput({ x: 1, y: 0 });
      break;
    default:
      break;
  }
}

function initializeGame() {
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ];

  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  updateHud();
  placeFood();
  showMessage('Press any arrow key or Space to start');
  drawGame();
}

window.addEventListener('keydown', handleKeydown);
startButton.addEventListener('click', () => {
  resetGameState();
});

initializeGame();
