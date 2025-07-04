const board = document.getElementById('board');
const minesLeftDisplay = document.getElementById('mines-left');
const timerDisplay = document.getElementById('timer');
const resetButton = document.getElementById('reset-button');
const guideButton = document.getElementById('guide-button');
const guideModal = document.getElementById('guide-modal');
const closeButton = document.querySelector('.close-button');

const DIFFICULTY = {
    BEGINNER: { ROWS: 9, COLS: 9, MINES: 10 },
    INTERMEDIATE: { ROWS: 16, COLS: 16, MINES: 40 },
    EXPERT: { ROWS: 16, COLS: 30, MINES: 99 }
};

let currentDifficulty = DIFFICULTY.BEGINNER;

const beginnerButton = document.getElementById('beginner-button');
const intermediateButton = document.getElementById('intermediate-button');
const expertButton = document.getElementById('expert-button');
const toggleTileStyleButton = document.getElementById('toggle-tile-style');

let cells = [];
let mines = [];
let revealedCount = 0;
let gameStarted = false;
let timerInterval;
let timeElapsed = 0;
let selectedCellIndex = -1; // -1 means no cell is selected initially

function initGame() {
    board.innerHTML = '';
    cells = [];
    mines = [];
    revealedCount = 0;
    gameStarted = false;
    timeElapsed = 0;
    clearInterval(timerInterval);
    minesLeftDisplay.textContent = `지뢰: ${currentDifficulty.MINES}`;
    timerDisplay.textContent = `시간: 0`;

    board.style.gridTemplateColumns = `repeat(${currentDifficulty.COLS}, 1fr)`;

    // Create cells
    for (let i = 0; i < currentDifficulty.ROWS * currentDifficulty.COLS; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.index = i;
        cell.addEventListener('click', handleClick);
        cell.addEventListener('contextmenu', handleRightClick);
        board.appendChild(cell);
        cells.push(cell);
    }

    placeMines();

    // Set initial selected cell
    selectedCellIndex = 0;
    updateSelectedCellVisual();
}

function updateSelectedCellVisual() {
    cells.forEach((cell, index) => {
        if (index === selectedCellIndex) {
            cell.classList.add('selected');
        } else {
            cell.classList.remove('selected');
        }
    });
}

function placeMines() {
    let minesPlaced = 0;
    while (minesPlaced < currentDifficulty.MINES) {
        const randomIndex = Math.floor(Math.random() * (currentDifficulty.ROWS * currentDifficulty.COLS));
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

    if (cell.classList.contains('flagged')) {
        return;
    }

    if (cell.classList.contains('revealed')) {
        // Chording logic
        const mineCount = parseInt(cell.textContent);
        if (isNaN(mineCount) || mineCount === 0) return; // Not a number cell or 0

        const neighbors = getNeighbors(index);
        let flaggedNeighborsCount = 0;
        neighbors.forEach(neighborIndex => {
            if (cells[neighborIndex].classList.contains('flagged')) {
                flaggedNeighborsCount++;
            }
        });

        if (flaggedNeighborsCount === mineCount) {
            neighbors.forEach(neighborIndex => {
                const neighborCell = cells[neighborIndex];
                if (!neighborCell.classList.contains('revealed') && !neighborCell.classList.contains('flagged')) {
                    if (mines.includes(neighborIndex)) {
                        revealMines();
                        neighborCell.classList.add('mine');
                        alert('게임 오버! 지뢰를 밟았습니다.');
                        clearInterval(timerInterval);
                        return;
                    }
                    revealCell(neighborIndex);
                }
            });
        }
        checkWin();
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
    const row = Math.floor(index / currentDifficulty.COLS);
    const col = index % currentDifficulty.COLS;

    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;

            const newRow = row + i;
            const newCol = col + j;
            const newIndex = newRow * currentDifficulty.COLS + newCol;

            if (newRow >= 0 && newRow < currentDifficulty.ROWS && newCol >= 0 && newCol < currentDifficulty.COLS) {
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
    if (revealedCount === (currentDifficulty.ROWS * currentDifficulty.COLS) - currentDifficulty.MINES) {
        alert('축하합니다! 지뢰를 모두 찾았습니다!');
        clearInterval(timerInterval);
    }
}

resetButton.addEventListener('click', initGame);

beginnerButton.addEventListener('click', () => {
    currentDifficulty = DIFFICULTY.BEGINNER;
    initGame();
});

intermediateButton.addEventListener('click', () => {
    currentDifficulty = DIFFICULTY.INTERMEDIATE;
    initGame();
});

expertButton.addEventListener('click', () => {
    currentDifficulty = DIFFICULTY.EXPERT;
    initGame();
});

guideButton.addEventListener('click', () => {
    guideModal.style.display = 'block';
});

closeButton.addEventListener('click', () => {
    guideModal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target == guideModal) {
        guideModal.style.display = 'none';
    }
});

initGame();

window.addEventListener('keydown', (event) => {
    const currentRows = currentDifficulty.ROWS;
    const currentCols = currentDifficulty.COLS;

    if (event.key === 'r' || event.key === 'R') {
        initGame();
    } else if (event.key === 'g' || event.key === 'G') {
        if (guideModal.style.display === 'block') {
            guideModal.style.display = 'none';
        } else {
            guideModal.style.display = 'block';
        }
    } else if (event.key === 'ArrowUp') {
        selectedCellIndex = Math.max(0, selectedCellIndex - currentCols);
        updateSelectedCellVisual();
    } else if (event.key === 'ArrowDown') {
        selectedCellIndex = Math.min(currentRows * currentCols - 1, selectedCellIndex + currentCols);
        updateSelectedCellVisual();
    } else if (event.key === 'ArrowLeft') {
        if (selectedCellIndex % currentCols !== 0) {
            selectedCellIndex = Math.max(0, selectedCellIndex - 1);
            updateSelectedCellVisual();
        }
    } else if (event.key === 'ArrowRight') {
        if ((selectedCellIndex + 1) % currentCols !== 0) {
            selectedCellIndex = Math.min(currentRows * currentCols - 1, selectedCellIndex + 1);
            updateSelectedCellVisual();
        }
    } else if (event.key === 'Enter') {
        if (selectedCellIndex !== -1) {
            handleClick({ target: cells[selectedCellIndex] });
        }
    } else if (event.key === ' ') { // Spacebar for right-click
        event.preventDefault(); // Prevent page scrolling
        if (selectedCellIndex !== -1) {
            handleRightClick({ target: cells[selectedCellIndex], preventDefault: () => {} });
        }
    }
});

toggleTileStyleButton.addEventListener('click', () => {
    cells.forEach(cell => {
        cell.classList.toggle('cell-alt');
    });
});