// app.js
const cells = document.querySelectorAll('.cell');
const startMessage = document.getElementById('start-message');
const questionContainer = document.getElementById('question-container');
const questionText = document.getElementById('question-text');
const options = document.getElementById('options');
const timerDisplay = document.getElementById('timer');
const resetButton = document.getElementById('reset');
const currentPlayerElement = document.getElementById('current-player');

// Sound effects
const timerSound = new Audio('sounds/30sec_countdown.mp3');
const wrongAnswerSound = new Audio('sounds/wrong_answer.mp3');
const correctAnswerSound = new Audio('sounds/correct_answer.mp3');
const startGameSound = new Audio('sounds/change_player.mp3');
const gameWinSound = new Audio('sounds/game_win.mp3');

let currentPlayer = '';
let gameActive = true;
let countdown;
let timeLeft = 30;
let currentCellIndex = null;
let questionActive = false;
let usedIndexes = new Set();
let questions = [];

const subject = sessionStorage.getItem('subject');
const concepts = JSON.parse(sessionStorage.getItem('concepts') || '[]');
document.title = `${subject} Quiz`;

let loaded = 0;
concepts.forEach(concept => {
  const path = `./questions/${subject}/${concept}.json`;
  fetch(path)
    .then(res => res.json())
    .then(data => {
      questions = questions.concat(data);
      loaded++;
      if (loaded === concepts.length) decideStartingTeam();
    })
    .catch(err => console.error(`Error loading ${path}`, err));
});

function decideStartingTeam() {
  currentPlayer = Math.random() < 0.5 ? 'X' : 'O';
  startMessage.textContent = `Team ${currentPlayer} starts the game!`;
  startGameSound.play();
}

function showQuestion(cellIndex) {
  console.log("q")
  console.log(questions)
  currentCellIndex = cellIndex;
  if (usedIndexes.size === questions.length) usedIndexes.clear();
  let randomIndex;
  do {
    randomIndex = Math.floor(Math.random() * questions.length);
  } while (usedIndexes.has(randomIndex));

  usedIndexes.add(randomIndex);
  const question = questions[randomIndex];
  questionText.textContent = question.question;
  questionContainer.classList.remove('hidden');
  timerDisplay.classList.remove('hidden');
  currentPlayerElement.classList.remove('hidden');
  currentPlayerElement.textContent = `Team ${currentPlayer}'s Turn`;
  startTimer();
  timerSound.play();

  if (question.type === 'TF') {
    options.innerHTML = `
      <button id="true">True</button>
      <button id="false">False</button>
    `;
    // Add this block:
    document.getElementById('true').addEventListener('click', () => {
      const correct = question.answer.trim().toLowerCase();
      handleAnswer('true' === correct);
    });

    document.getElementById('false').addEventListener('click', () => {
      const correct = question.answer.trim().toLowerCase();
      handleAnswer('false' === correct);
    });
  } else if (question.type === 'MCQ') {
    options.innerHTML = '';
    let buttonRow = null;
    question.options.forEach((option, index) => {
      const button = document.createElement('button');
      button.id = option;
      button.textContent = option;
      button.style.flex = '1';
      button.style.margin = '5px';

      button.addEventListener('click', () => {
        const selected = option.trim().toLowerCase();
        const correct = question.answer.trim().toLowerCase();
        handleAnswer(selected === correct);
      });

      if (index % 2 === 0) {
        buttonRow = document.createElement('div');
        buttonRow.style.display = 'flex';
        buttonRow.style.flexWrap = 'wrap';
        buttonRow.appendChild(button);
        options.appendChild(buttonRow);
      } else {
        buttonRow.appendChild(button);
      }
    });
  }
}

function startTimer() {
  timeLeft = 30;
  timerDisplay.textContent = `Time Left: ${timeLeft}`;
  clearInterval(countdown);
  countdown = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = `Time Left: ${timeLeft}`;
    if (timeLeft <= 0) {
      clearInterval(countdown);
      if (!questionContainer.classList.contains('hidden')) handleAnswer(false);
    }
  }, 1000);
}

function handleAnswer(isCorrect) {
  clearInterval(countdown);
  timerSound.pause();
  timerSound.currentTime = 0;
  questionContainer.classList.add('hidden');
  timerDisplay.classList.add('hidden');
  currentPlayerElement.classList.add('hidden');
  questionActive = false;

  if (isCorrect) {
    startMessage.textContent = 'Correct!';
    startMessage.classList.add('big-message', 'correct-message');
    cells[currentCellIndex].textContent = currentPlayer;
    startMessage.style.color = '#00ff00';
    startMessage.style.textShadow = '0 0 10px #00ff00';
    correctAnswerSound.play();
    checkWin();
  } else {
    startMessage.textContent = 'Wrong Answer!';
    startMessage.classList.add('big-message', 'wrong-message');
    startMessage.style.color = 'red';
    startMessage.style.textShadow = '0 0 10px #ff0000';
    wrongAnswerSound.play();
  }

  setTimeout(() => {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    currentPlayerElement.textContent = `${currentPlayer}'s turn`;
    questionActive = false;
  }, 500);
}

function checkWin() {
  const combos = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];

  for (const [a, b, c] of combos) {
    if (cells[a].textContent && cells[a].textContent === cells[b].textContent && cells[a].textContent === cells[c].textContent) {
      gameActive = false;
      startMessage.textContent = `${currentPlayer} wins!`;
      startMessage.classList.add('big-message', 'win-message');
      gameWinSound.play();
      return;
    }
  }

  if ([...cells].every(cell => cell.textContent)) {
    gameActive = false;
    startMessage.textContent = "It's a draw!";
    startMessage.classList.add('big-message', 'draw-message');
  }
}

resetButton.addEventListener('click', () => {
  questionActive = false;
  clearInterval(countdown);
  timerSound.pause();
  timerSound.currentTime = 0;
  cells.forEach(cell => cell.textContent = '');
  gameActive = true;
  usedIndexes.clear();
  decideStartingTeam();
  questionContainer.classList.add('hidden');
  timerDisplay.classList.add('hidden');
  currentPlayerElement.classList.add('hidden');
  startMessage.style.color = "#EB9B56";
  startMessage.style.textShadow = "0 0 10px #EB9B56";
  startMessage.textContent = `Team ${currentPlayer} starts the game!`;
  startMessage.classList.remove('big-message', 'correct-message', 'wrong-message', 'win-message', 'draw-message');
});

cells.forEach((cell, index) => {
  cell.addEventListener('click', () => {
    if (gameActive && !cell.textContent && !questionActive) {
      startMessage.textContent = "";
      questionActive = true;
      showQuestion(index);
    }
  });
});
