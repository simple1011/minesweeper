const board = document.getElementById('board');
const minesLeftDisplay = document.getElementById('mines-left');
const timerDisplay = document.getElementById('timer');
const resetButton = document.getElementById('reset-button');

const ROWS = 10;
const COLS = 10;
const NUM_MINES = 15;

let cells = [];
let mines = [];
let revealedCount = 0;
let gameStarted = false;
let timerInterval;
let timeElapsed = 0;

function initGame() {
    board.innerHTML = '';
    cells = [];
    mines = [];
    revealedCount = 0;
    gameStarted = false;
    timeElapsed = 0;
    clearInterval(timerInterval);
    minesLeftDisplay.textContent = `지뢰: ${NUM_MINES}`;
    timerDisplay.textContent = `시간: 0`;

    board.style.gridTemplateColumns = `repeat(${COLS}, 1fr)`;

    // Create cells
    for (let i = 0; i < ROWS * COLS; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.index = i;
        cell.addEventListener('click', handleClick);
        cell.addEventListener('contextmenu', handleRightClick);
        board.appendChild(cell);
        cells.push(cell);
    }

    placeMines();
}

function placeMines() {
    let minesPlaced = 0;
    while (minesPlaced < NUM_MINES) {
        const randomIndex = Math.floor(Math.random() * (ROWS * COLS));
        if (!mines.includes(randomIndex)) {
            mines.push(randomIndex);
            minesPlaced++;
        }
    }
}

function startGame() {
    if (!gameStarted) {
        gameStarted = true;
        timerInterval = setInterval(() => {
            timeElapsed++;
            timerDisplay.textContent = `시간: ${timeElapsed}`;
        }, 1000);
    }
}

function handleClick(event) {
    startGame();

    const cell = event.target;
    const index = parseInt(cell.dataset.index);

    if (cell.classList.contains('revealed') || cell.classList.contains('flagged')) {
        return;
    }

    if (mines.includes(index)) {
        revealMines();
        cell.classList.add('mine');
        alert('게임 오버! 지뢰를 밟았습니다.');
        clearInterval(timerInterval);
        return;
    }

    revealCell(index);
    checkWin();
}

function handleRightClick(event) {
    event.preventDefault();
    startGame();

    const cell = event.target;
    if (cell.classList.contains('revealed')) {
        return;
    }

    if (cell.classList.contains('flagged')) {
        cell.classList.remove('flagged');
        minesLeftDisplay.textContent = `지뢰: ${parseInt(minesLeftDisplay.textContent.split(': ')[1]) + 1}`;
    } else {
        if (parseInt(minesLeftDisplay.textContent.split(': ')[1]) > 0) {
            cell.classList.add('flagged');
            minesLeftDisplay.textContent = `지뢰: ${parseInt(minesLeftDisplay.textContent.split(': ')[1]) - 1}`;
        }
    }
}

function revealCell(index) {
    const cell = cells[index];
    if (cell.classList.contains('revealed') || cell.classList.contains('flagged')) {
        return;
    }

    cell.classList.add('revealed');
    revealedCount++;

    const mineCount = countAdjacentMines(index);
    if (mineCount > 0) {
        cell.textContent = mineCount;
        cell.dataset.mines = mineCount;
    } else {
        // Reveal adjacent cells if no mines around
        const neighbors = getNeighbors(index);
        neighbors.forEach(neighborIndex => {
            revealCell(neighborIndex);
        });
    }
}

function countAdjacentMines(index) {
    let count = 0;
    const neighbors = getNeighbors(index);
    neighbors.forEach(neighborIndex => {
        if (mines.includes(neighborIndex)) {
            count++;
        }
    });
    return count;
}

function getNeighbors(index) {
    const neighbors = [];
    const row = Math.floor(index / COLS);
    const col = index % COLS;

    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;

            const newRow = row + i;
            const newCol = col + j;
            const newIndex = newRow * COLS + newCol;

            if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS) {
                neighbors.push(newIndex);
            }
        }
    }
    return neighbors;
}

function revealMines() {
    mines.forEach(mineIndex => {
        cells[mineIndex].classList.add('revealed', 'mine');
    });
}

function checkWin() {
    if (revealedCount === (ROWS * COLS) - NUM_MINES) {
        alert('축하합니다! 지뢰를 모두 찾았습니다!');
        clearInterval(timerInterval);
    }
}

resetButton.addEventListener('click', initGame);

initGame();
