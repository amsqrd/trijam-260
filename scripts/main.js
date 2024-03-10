const MAX_ROW_SIZE = 9;
const MAX_COLUMN_SIZE = 9;
let _gameState = { };

main();

function main() {
    const startButton = document.getElementById('start-game-button');
    startButton.addEventListener('click', () => {
        const startState = document.getElementById('start-state');
        startState.classList.add('game-state--hidden');

        const playState = document.getElementById('play-state');
        playState.classList.remove('game-state--hidden');

        startGame();
    });

    const restartButton = document.getElementById('restart-game-button');
    restartButton.addEventListener('click', () => {
        const restartState = document.getElementById('end-state');
        restartState.classList.add('game-state--hidden');

        const playState = document.getElementById('play-state');
        playState.classList.remove('game-state--hidden');
    });

    document.addEventListener('keydown', onKeydown, true);
}

function onKeydown(event) {
    switch(event.key) {
        case "ArrowDown":
        case "s":
        case "S":
            if (_gameState.playerRow + 1 < MAX_ROW_SIZE) {
                updatePlayerPosition(_gameState.playerRow + 1, _gameState.playerColumn);
            } else {
                playSound('assets/sounds/bump.wav');
            }
            break;
        case "ArrowUp":
        case "w":
        case "W":
            if (_gameState.playerRow - 1 >= 0) {
                updatePlayerPosition(_gameState.playerRow - 1, _gameState.playerColumn);
            } else {
                playSound('assets/sounds/bump.wav');
            }
            break;
        case "ArrowLeft":
        case "a":
        case "A":
            if (_gameState.playerColumn - 1 >= 0) {
                updatePlayerPosition(_gameState.playerRow, _gameState.playerColumn - 1);
            } else {
                playSound('assets/sounds/bump.wav');
            }
            break;
        case "ArrowRight":
        case "d":
        case "D":
            if (_gameState.playerColumn + 1 < MAX_COLUMN_SIZE) {
                updatePlayerPosition(_gameState.playerRow, _gameState.playerColumn + 1);
            } else {
                playSound('assets/sounds/bump.wav');
            }
            break;
        default:
            return;
    };
}

/**
 * Start a new game state
 */
function startGame() {
    _gameState = {
        playerRow: Math.floor(MAX_ROW_SIZE / 2),
        playerColumn: Math.floor(MAX_COLUMN_SIZE / 2),
        humanCount: 0,
        matrix: createGameMatrix(MAX_ROW_SIZE, MAX_COLUMN_SIZE)
    }

    generateGameTable(MAX_ROW_SIZE, MAX_COLUMN_SIZE);

    // Initialize player starting position
    updatePlayerPosition(_gameState.playerRow, _gameState.playerColumn);

    // Spawn human
    spawnHuman();
}

/**
 * Generate game table
 * @param {*} rowSize 
 * @param {*} columnSize 
 */
function generateGameTable(rowSize, columnSize) {
    const gameTable = document.getElementById('game-table');
    gameTable.innerHTML = '';

    for(let row = 0; row < rowSize; row++) {
        const tr = document.createElement('tr');
        for(let col = 0; col < columnSize; col++) {
            const td = document.createElement('td');
            td.id = `td-${row}-${col}`;

            const div = document.createElement('div');
            div.id = `${row}-${col}`;
            div.classList.add('game-cell');

            td.appendChild(div);
            tr.appendChild(td);
        }

        gameTable.appendChild(tr);
    } 
}

function spawnHuman() {

}

/**
 * Generate game matrix for tracking player and human positions
 * @param {number} rowCount 
 * @param {number} columnCount 
 * @returns 
 */
function createGameMatrix(rowCount, columnCount) {
    let matrix = new Array(rowCount);

    for(let row = 0; row < rowCount; row++) {
        matrix[row] = new Array(columnCount);
    }

    return matrix;
}

function updatePlayerPosition(row, col) {
    // clear previous player position
    _gameState.matrix[_gameState.playerRow][_gameState.playerColumn] = null;
    let playerTd = document.getElementById(`${_gameState.playerRow}-${_gameState.playerColumn}`);
    if(playerTd) {
        playerTd.classList.remove('player');
    }

    // update to new player position
    _gameState.playerRow = row;
    _gameState.playerColumn = col;
    playerTd = document.getElementById(`${_gameState.playerRow}-${_gameState.playerColumn}`);

    // if a human inside cell, splat the bug and end the game
    if(_gameState.matrix[_gameState.playerRow][_gameState.playerColumn]) {
        // Trigger end game state
        //playSound('assets/sounds/eat.wav');
    } 
        
    playerTd.classList.add('player');

    // update player position in matrix
    _gameState.matrix[_gameState.playerRow][_gameState.playerColumn] =  { row: _gameState.playerRow, col: _gameState.playerColumn };
}

/**
 * Play the sound file at the specified location
 * @param {string} url 
 * @param {boolean} loop 
 */
function playSound(url, volume = 1, loop = false) {
    const audio = new Audio();
    audio.src = url;
    audio.volume = volume;
    audio.loop = loop;
    audio.play();
}

/**
 * Gets a random number between min (inclusive) and max (exclusive)
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random#getting_a_random_integer_between_two_values
 * @param {number} min Minimum number
 * @param {number} max Maximum number
 * @returns A random number between min and max
 */
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}