main();

function main() {
    const startButton = document.getElementById('start-game-button');
    startButton.addEventListener('click', () => {
        const startState = document.getElementById('start-state');
        startState.classList.add('game-state--hidden');

        const playState = document.getElementById('play-state');
        playState.classList.remove('game-state--hidden');
    });

    const restartButton = document.getElementById('restart-game-button');
    restartButton.addEventListener('click', () => {
        const restartState = document.getElementById('end-state');
        restartState.classList.add('game-state--hidden');

        const playState = document.getElementById('play-state');
        playState.classList.remove('game-state--hidden');
    });
}