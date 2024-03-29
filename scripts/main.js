const MAX_ROW_SIZE = 9;
const MAX_COLUMN_SIZE = 9;

const emojis = ['&#x1f575;', '&#x1F475;', '&#x1f468;', '&#x1f9d1;']
let _backgroundAudioLoop;
let _gameState = { };

main();

function main() {
    const startButton = document.getElementById('start-game-button');
    startButton.addEventListener('click', () => {
        const startState = document.getElementById('start-state');
        startState.classList.add('game-state--hidden');

        const playState = document.getElementById('play-state');
        playState.classList.remove('game-state--hidden');

        // Start background audio
        _backgroundAudioLoop = playSound('assets/sounds/background-loop.wav', 0.15, true);

        startGame();
    });

    const restartButton = document.getElementById('restart-game-button');
    restartButton.addEventListener('click', () => {
        const restartState = document.getElementById('end-state');
        restartState.classList.add('game-state--hidden');

        const playState = document.getElementById('play-state');
        playState.classList.remove('game-state--hidden');

        startGame();
    });

    document.addEventListener('keydown', onKeydown, true);

    // Add event listeners for game control buttons
    // Use same event listener handle as keydown events
    document.getElementById('left-button').addEventListener('click', () => { onKeydown({ key: 'ArrowLeft' })});
    document.getElementById('right-button').addEventListener('click', () => { onKeydown({ key: 'ArrowRight' })});   
    document.getElementById('up-button').addEventListener('click', () => { onKeydown({ key: 'ArrowUp' })});
    document.getElementById('down-button').addEventListener('click', () => { onKeydown({ key: 'ArrowDown' })});

}

function onKeydown(event) {
    if(_gameState.isGameOver) {
        return;
    }

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
        case "M":
        case "m":
            _gameState.isMuted = !_gameState.isMuted;
            _backgroundAudioLoop.muted = _gameState.isMuted;
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
        humans: [],
        matrix: createGameMatrix(MAX_ROW_SIZE, MAX_COLUMN_SIZE),
        isGameOver: false,
        isMuted: false
    }

    generateGameTable(MAX_ROW_SIZE, MAX_COLUMN_SIZE);

    // Initialize player starting position
    updatePlayerPosition(_gameState.playerRow, _gameState.playerColumn);

    // Spawn human
    const humanSpawnInterval = setInterval(() => {
        if (_gameState.isGameOver) {
            clearInterval(humanSpawnInterval);
            endGame();
            return;
        }
        const spawnInColumn = _gameState.humans.length % 2;
        const randomInt = getRandomInt(0, MAX_COLUMN_SIZE);
        const randomEmojiIndex = getRandomInt(0, emojis.length);
        let human;
        if (spawnInColumn) {
            human = {
                row: 0,
                column: randomInt,
                id: _gameState.humans.length + 1,
                travelsOnColumn: true,
                emoji: emojis[randomEmojiIndex]
            };
        } else {
            human = {
                row: randomInt,
                column: 0,
                id: _gameState.humans.length + 1,
                travelsOnColumn: false,
                emoji: emojis[randomEmojiIndex]
            };
        }

        updateHumanPosition(human);
        _gameState.humans.push(human);

        // update human counter
        const humanCounters = document.getElementsByClassName('human-counter');
        for(let counter of humanCounters) {
            counter.innerText = _gameState.humans.length;
        }

        // Human update interval
        const humanUpdateInterval = setInterval(() => {
            if(_gameState.isGameOver) {
                clearInterval(humanUpdateInterval);
                return;
            }

            removeHuman(human);
            if(human.travelsOnColumn) {
                if(human.row >= MAX_ROW_SIZE - 1) {
                    human.row = 0;
                } else {
                    human.row += 1
                }
            } else {
                if(human.column >= MAX_COLUMN_SIZE - 1) {
                    human.column = 0;
                } else {
                    human.column += 1
                }
            }

            updateHumanPosition(human);

        }, 250);
    }, 1000);
}

function endGame() {
    const playState = document.getElementById('play-state');
    playState.classList.add('game-state--hidden');

    const endState = document.getElementById('end-state');
    endState.classList.remove('game-state--hidden');
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

function removeHuman(human) {
   // clear previous human position
   _gameState.matrix[human.row][human.column] = null;
   let humanTd = document.getElementById(`${human.row}-${human.column}`);
   if(humanTd && humanTd.innerHTML && humanTd.classList) {
       humanTd.innerHTML = '';
       humanTd.classList.remove('human');
   } 
}

function updateHumanPosition(human) {
    // update to new human position
    let humanTd = document.getElementById(`${human.row}-${human.column}`);

    // if a human inside cell, splat the bug and end the game
    if(humanTd && humanTd.classList && humanTd.classList.contains('player')) {
        // Trigger end game state
        playSound('assets/sounds/splat.wav');
        _gameState.isGameOver = true;
    } 
        
    humanTd.innerHTML = human.emoji;
    humanTd.classList.add('human');
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
        playerTd.innerHTML = '';
        playerTd.classList.remove('player');
    }

    // update to new player position
    _gameState.playerRow = row;
    _gameState.playerColumn = col;
    playerTd = document.getElementById(`${_gameState.playerRow}-${_gameState.playerColumn}`);

    // if a human inside cell, splat the bug and end the game
    if(_gameState.matrix[_gameState.playerRow][_gameState.playerColumn]) {
        // Trigger end game state
        playSound('assets/sounds/splat.wav');
        _gameState.isGameOver = true;
    } 
        
    playerTd.innerHTML = '&#x1F41B;'
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

    return audio;
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