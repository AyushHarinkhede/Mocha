let score = 0;
let targetNumber = 0;
let gamepage = document.querySelector(".gamepage");
let timer = document.querySelector("#timer");
let hit = document.querySelector("#hits");
let scores = document.querySelector("#scores");

let time = 60;
let intervalId = null;

function getRandomNumber() {
    return Math.floor(Math.random() * 10); // 0–9
}

function generateCircles() {
    let html = "";
    for (let i = 0; i < 186; i++) {
        html += `<div class="circle">${getRandomNumber()}</div>`;
    }
    gamepage.innerHTML = html;
}

function updateTargetNumber() {
    targetNumber = getRandomNumber();
    hit.textContent = targetNumber;
}

function updateScore() {
    score += 10;
    scores.textContent = score;
}

function startTimer() {
    clearInterval(intervalId); // clear old interval if any
    time = 6;
    timer.textContent = time;

    intervalId = setInterval(() => {
        time--;
        if (time >= 0) {
            timer.textContent = time;
        } else {
            clearInterval(intervalId);
            gamepage.innerHTML = `<h1>Game Over</h1>`;
        }
    }, 1000);
}

function initGame() {
    generateCircles();
    updateTargetNumber();
    startTimer();
}

gamepage.addEventListener("click", (e) => {
    let clickedNumber = Number(e.target.textContent);

    if (e.target.classList.contains("circle") && clickedNumber === targetNumber) {
        updateScore();
        initGame(); // restart round
    }
});

initGame(); // Start the game
