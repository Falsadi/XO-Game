const cells = document.querySelectorAll('.cell');
const startMessage = document.getElementById('start-message');
const questionContainer = document.getElementById('question-container');
const questionText = document.getElementById('question-text');
const options = document.getElementById('options');
const timerDisplay = document.getElementById('timer');
const resetButton = document.getElementById('reset');
const currentPlayerElement = document.getElementById('current-player');

// Sound effects
const timerSound = new Audio('sounds/15sec_countdown.mp3');
const wrongAnswerSound = new Audio('sounds/wrong_answer.mp3');
const correctAnswerSound = new Audio('sounds/correct_answer.mp3');
const startGameSound = new Audio('sounds/change_player.mp3');
const gameWinSound = new Audio('sounds/game_win.mp3')

let currentPlayer = '';
let gameActive = true;
let countdown;
let timeLeft = 15;
let currentCellIndex = null; // Track the cell being played
let usedQuestions = []; // Track used questions to avoid repetition
let questionActive = false; // Prevent selecting multiple cells in one turn
let questions = []; // To store the loaded questions

const loc = sessionStorage.getItem('location');
const lesson = sessionStorage.getItem('lesson');

// Convert location to folder name
const folder = loc

// Extract lesson number (e.g., 'Lesson 3' → '3')
const lessonNumber = lesson ? lesson.match(/\d+/)[0] : '1';

// Construct the path to the lesson file
const lessonPath = `./questions/${folder}/lesson${lessonNumber}.json`;

// Load questions from correct file
fetch(lessonPath)
    .then(response => response.json())
    .then(data => {
      questions = data;
      decideStartingTeam(); // Initialize the game
    })
    .catch(error => {
      console.error('Error loading questions:', error);
      alert('Failed to load questions. Please try again.');
    });


// Randomly decide starting team
function decideStartingTeam() {
  currentPlayer = Math.random() < 0.5 ? 'X' : 'O';
  startMessage.textContent = `Team ${currentPlayer} starts the game!`;
  startGameSound.play(); // Play sound when game starts
}

// Display a random question (TF or MCQ)
let usedIndexes = new Set(); // Track used question indexes

function showQuestion(cellIndex) {
  currentCellIndex = cellIndex; // Store the cell index

  // Reset usedIndexes if all questions have been used
  if (usedIndexes.size === questions.length) {
    usedIndexes.clear(); // Clear the set to restart the cycle
  }

  let randomIndex;
  do {
    randomIndex = Math.floor(Math.random() * questions.length);
  } while (usedIndexes.has(randomIndex));

  usedIndexes.add(randomIndex); // Mark this question as used
  let randomQuestion = questions[randomIndex];

  questionText.textContent = randomQuestion.question;
  questionContainer.classList.remove('hidden');
  timerDisplay.classList.remove('hidden');
  currentPlayerElement.classList.remove('hidden');
  currentPlayerElement.textContent = `Team ${currentPlayer}'s Turn`
  startTimer();
  timerSound.play();

  // Show options based on question type
  if (randomQuestion.type === "TF") {
    options.innerHTML = `
      <button id="true">True</button>
      <button id="false">False</button>
    `;
  } else if (randomQuestion.type === "MCQ") {
    options.innerHTML = ''; // Clear previous buttons

    let buttonRow = null;
    randomQuestion.options.forEach((option, index) => {
      const button = document.createElement('button');
      button.id = option;
      button.textContent = option;
      button.style.flex = '1';
      button.style.margin = '5px';

      button.addEventListener('click', () => {
        const selectedOption = option.trim().toLowerCase();
        const correctAnswer = randomQuestion.answer.trim().toLowerCase();
        let isCorrect = selectedOption === correctAnswer;
        console.log(`isCorrect= : ${isCorrect}`);
        //handleAnswer(isCorrect);
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

// function showQuestion(cellIndex) {
//   currentCellIndex = cellIndex; // Store the cell index
//
//   // Reset usedQuestions if all questions have been used
//   if (usedQuestions.length === questions.length) {
//     usedQuestions = [];
//   }
//
//   // Get a random question that hasn't been used yet
//   let randomQuestion;
//   do {
//     randomQuestion = questions[Math.floor(Math.random() * questions.length)];
//   } while (usedQuestions.includes(randomQuestion.question));
//
//   usedQuestions.push(randomQuestion.question); // Mark question as used
//   questionText.textContent = randomQuestion.question;
//   questionContainer.classList.remove('hidden');
//   timerDisplay.classList.remove('hidden');
//   currentPlayerElement.classList.remove('hidden');
//   currentPlayerElement.textContent = `Team ${currentPlayer}'s Turn`
//   startTimer();
//   timerSound.play();
//
//   // Show options based on question type
//   if (randomQuestion.type === "TF") {
//     options.innerHTML = `
//       <button id="true">True</button>
//       <button id="false">False</button>
//     `;
//   } else if (randomQuestion.type === "MCQ") {
//     // Clear previous buttons
//     options.innerHTML = '';
//
// // Create a button row container
//     let buttonRow = null;
//
// // Loop through the options and add them in rows
//     randomQuestion.options.forEach((option, index) => {
//       // Create a new button for each option
//       const button = document.createElement('button');
//       button.id = option; // Assign the option (answer) as the button's ID
//       button.textContent = option;
//
//       // Style the buttons to have equal size
//       button.style.flex = '1'; // Ensure buttons share equal width in a row
//       button.style.margin = '5px'; // Optional margin between buttons
//
//       // Add click event listener for handling answers
//       button.addEventListener('click', () => {
//         const selectedOption = option.trim().toLowerCase();
//         const correctAnswer = randomQuestion.answer.trim().toLowerCase();
//         let isCorrect = selectedOption === correctAnswer;
//         console.log(`isCorrect= : ${isCorrect}`);
//         //handleAnswer(isCorrect); // Handle the answer
//       });
//
//       // Every 2nd button, create a new row
//       if (index % 2 === 0) {
//         // Create a new button row
//         buttonRow = document.createElement('div');
//         buttonRow.style.display = 'flex'; // Align buttons in a row
//         buttonRow.style.flexWrap = 'wrap'; // Allow buttons to wrap into new rows
//
//         // Append the button to this new row
//         buttonRow.appendChild(button);
//
//         // Append the row to the options container when it's ready
//         options.appendChild(buttonRow);
//       } else {
//         // Append the button to the current row if it's not the first button
//         buttonRow.appendChild(button);
//       }
//     });
//
//   }
// }

// Continue with the rest of your game logic...


// Start 15-second timer
function startTimer() {
  timeLeft = 15;
  timerDisplay.textContent = `Time Left: ${timeLeft}`;
  clearInterval(countdown); // Ensure no previous timers are running
  countdown = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = `Time Left: ${timeLeft}`;
    if (timeLeft <= 0) {
      clearInterval(countdown);
      if (questionContainer.classList.contains('hidden')) return; // Prevent double execution
      handleAnswer(false);
    }
  }, 1000);
}

// Handle answer
function handleAnswer(isCorrect) {
  clearInterval(countdown);
  timerSound.pause();        // Pause the sound
  timerSound.currentTime = 0; // Reset the time to the beginning
  questionContainer.classList.add('hidden');
  timerDisplay.classList.add('hidden');
  currentPlayerElement.classList.add('hidden');
  questionActive = false; // Allow next player to select a cell

  if (isCorrect) {
    startMessage.textContent = "Correct!";
    startMessage.classList.add('big-message', 'correct-message');
    cells[currentCellIndex].textContent = currentPlayer;
    startMessage.style.color = "#00ff00";
    startMessage.style.textShadow = "0 0 10px #00ff00"; // Red glow effect
    correctAnswerSound.play();
    checkWin();
  } else {
    startMessage.textContent = "Wrong Answer!";
    startMessage.classList.add('big-message', 'wrong-message');
    startMessage.style.color = "red"; // Set text color to red
    startMessage.style.textShadow = "0 0 10px #ff0000"; // Red glow effect
    wrongAnswerSound.play();
  }

  // Switch turn after the mark is placed
  setTimeout(() => {  // Delay turn switch to give time for the mark placement
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    console.log(currentPlayer);
    currentPlayerElement.textContent = `${currentPlayer}'s turn`;
    questionActive = false; // Reset the question active state
  }, 500);
}

// Check for win or draw
function checkWin() {
  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
  ];

  for (const combo of winningCombinations) {
    const [a, b, c] = combo;
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

// Reset game
resetButton.addEventListener('click', () => {
  questionActive = false; // Allow next player to select a cell
  clearInterval(countdown); // Stop the timer
  timerSound.pause();        // Pause the sound
  timerSound.currentTime = 0; // Reset the time to the beginning
  cells.forEach(cell => cell.textContent = '');
  gameActive = true;
  usedQuestions = []; // Reset used questions
  decideStartingTeam();
  questionContainer.classList.add('hidden');
  timerDisplay.classList.add('hidden');
  currentPlayerElement.classList.add('hidden');
  startMessage.style.color = "#EB9B56"; // Reset color
  startMessage.style.textShadow = "0 0 10px #EB9B56"; // Reset text shadow
  startMessage.textContent = `Team ${currentPlayer} starts the game!`;
  startMessage.classList.remove('big-message', 'correct-message', 'wrong-message', 'win-message', 'draw-message');
});

// Cell click event
cells.forEach((cell, index) => {
  cell.addEventListener('click', () => {
    if (gameActive && !cell.textContent && !questionActive) {
      startMessage.textContent = ""; // Clear start message when the game starts
      questionActive = true; // Block other selections during the current question
      showQuestion(index); // Pass the cell index

      // Function to handle answer click
      const handleAnswerClick = (button) => {
        console.log(`Button ID: "${button.id}"`);

        const isCorrect = button.id === questions.find(q => q.question === questionText.textContent).answer;
        console.log(`kk ${isCorrect}`)
        handleAnswer(isCorrect); // Handle answer and mark the cell
      };

      // Remove previous click event listeners from all buttons
      options.querySelectorAll('button').forEach(button => {
        // Remove the previously attached event listener if exists
        button.removeEventListener('click', button.handleAnswerClick);
      });

      // Add new click event listeners to buttons
      options.querySelectorAll('button').forEach(button => {
        // Attach a named function as an event listener for each button
        button.handleAnswerClick = () => handleAnswerClick(button);
        button.addEventListener('click', button.handleAnswerClick);
      });
    }
  });
});

// Initialize game
decideStartingTeam();


/////

