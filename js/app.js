console.log('app.js connected');

/*-------------------------------- Constants --------------------------------*/
// Timer duration in seconds
const TIMER_DURATION = 60;

// Team constraints
const MIN_TEAMS = 2;
const MAX_TEAMS = 2; // MVP: locked at 2 teams

// Player constraints
const MIN_PLAYERS_PER_TEAM = 2;
const MAX_PLAYERS_PER_TEAM = 4;

// Word constraints
const MIN_WORDS_PER_PLAYER = 3;
const MAX_WORDS_PER_PLAYER = 5;

// Round definitions
const ROUNDS = [
    {
        number: 1,
        name: "Describe It",
        instructions: "Describe the word without saying it",
        icon: "💬"
    },
    {
        number: 2,
        name: "One Word",
        instructions: "Say only ONE keyword (not the word itself)",
        icon: "🔤"
    }
];

// Screen states
const SCREENS = {
    SETUP: 'setup',
    WORD_ENTRY: 'word-entry',
    GAMEPLAY: 'gameplay',
    ROUND_RESULTS: 'round-results',
    FINAL_RESULTS: 'final-results'
};

console.log('Constants loaded:', { TIMER_DURATION, ROUNDS, SCREENS });

/*---------------------------- Variables (state) ----------------------------*/
/*
STATE VARIABLES
These track the current state of the game at any moment
*/

// Screen management - which screen is currently showing
let currentScreen;

// Team data - array of team objects
let teams;
/*
Structure: [
  { 
    name: "Team 1", 
    players: ["Alex", "Blake"], 
    score: 0, 
    roundScores: [] 
  },
  { 
    name: "Team 2", 
    players: ["Casey", "Dana"], 
    score: 0, 
    roundScores: [] 
  }
]
*/

// Word management
let allWords; // Master array of ALL submitted words (never modified)
let availableWords; // Words still in play for current round (modified during gameplay)

// Current game state
let currentRound; // 1 or 2 (which round we're in)
let currentTeamIndex; // 0 or 1 (which team's turn)
let currentPlayerIndex; // 0-3 (which player within that team)
let currentWord; // The word currently being described
let currentWordIndex; // Index of current word in availableWords array

// Timer state
let timerInterval; // Reference to setInterval for the countdown timer
let timeRemaining; // Seconds left in current turn (starts at 60)
let timerRunning; // Boolean - is timer currently active?

// Word entry tracking (for setup phase)
let currentWordEntryPlayerIndex; // Which player is currently entering words (0 to total players - 1)
let allPlayersList; // Flat array of all players from both teams for word entry phase

// Turn tracking for round completion
let totalTurnsInRound; // Total number of turns per round (equal to total players)
let turnsCompletedInRound; // How many turns have been completed so far

console.log('State variables initialized');

/*------------------------ Cached Element References ------------------------*/
/*
CACHED ELEMENT REFERENCES
Store references to DOM elements so we can access them quickly
Instead of searching the DOM every time, we search once and save the result
*/

// Setup screen elements
const setupScreen = document.getElementById('setup-screen');
const team1NameInput = document.getElementById('team1-name');
const team2NameInput = document.getElementById('team2-name');
const playerNameInputs = document.querySelectorAll('.player-name');
const startGameBtn = document.getElementById('start-game-btn');
const setupError = document.getElementById('setup-error');

// Verify elements were found
console.log('Setup screen elements cached:', {
    setupScreen,
    team1NameInput,
    team2NameInput,
    playerNameInputs,
    startGameBtn,
    setupError
});

// Word entry screen elements
const wordEntryScreen = document.getElementById('word-entry-screen');
const currentPlayerPrompt = document.getElementById('current-player-prompt');
const wordInputs = document.querySelectorAll('.word-input');
const submitWordsBtn = document.getElementById('submit-words-btn');
const wordEntryError = document.getElementById('word-entry-error');
const wordEntryProgress = document.getElementById('word-entry-progress');

// Verify word entry elements were found
console.log('Word entry screen elements cached:', {
    wordEntryScreen,
    currentPlayerPrompt,
    wordInputs,
    submitWordsBtn,
    wordEntryError,
    wordEntryProgress
});

// Gameplay screen elements
const gameplayScreen = document.getElementById('gameplay-screen');
const roundDisplay = document.getElementById('round-display');
const roundInstructions = document.getElementById('round-instructions');
const team1ScoreDisplay = document.getElementById('team1-score');
const team2ScoreDisplay = document.getElementById('team2-score');
const team1NameDisplay = document.getElementById('team1-name-display');
const team2NameDisplay = document.getElementById('team2-name-display');
const turnInfo = document.getElementById('turn-info');
const currentTurnDisplay = document.getElementById('current-turn-display');
const startTurnBtn = document.getElementById('start-turn-btn');
const wordDisplayContainer = document.getElementById('word-display-container');
const timerDisplay = document.getElementById('timer');
const currentWordDisplay = document.getElementById('current-word');
const gotItBtn = document.getElementById('got-it-btn');
const skipBtn = document.getElementById('skip-btn');
const wordsRemainingDisplay = document.getElementById('words-remaining');
const timesUpMessage = document.getElementById('times-up-message');
const nextTurnBtn = document.getElementById('next-turn-btn');

// Verify gameplay elements were found
console.log('Gameplay screen elements cached:', {
    gameplayScreen,
    roundDisplay,
    startTurnBtn,
    gotItBtn,
    skipBtn
});

/*-------------------------------- Functions --------------------------------*/
/*
INIT FUNCTION
Initialize the game when page loads or when "Play Again" is clicked
Resets all state variables to starting values
Shows the setup screen
*/

function init() {
    console.log('Initializing game...');

    // Set initial screen
    currentScreen = SCREENS.SETUP;

    // Initialize empty game state
    teams = [];
    allWords = [];
    availableWords = [];

    // Reset game position
    currentRound = 1;
    currentTeamIndex = 0;
    currentPlayerIndex = 0;
    currentWord = '';
    currentWordIndex = -1;

    // Reset timer state
    timerInterval = null;
    timeRemaining = TIMER_DURATION;
    timerRunning = false;

    // Reset word entry tracking
    currentWordEntryPlayerIndex = 0;
    allPlayersList = [];

    // Clear any error messages
    setupError.textContent = '';

    // Clear setup form inputs
    team1NameInput.value = '';
    team2NameInput.value = '';
    playerNameInputs.forEach(input => input.value = '');

    // Show setup screen (we'll add render() function next)
    render();

    console.log('Game initialized. Current screen:', currentScreen);
}

/*
RENDER FUNCTION
Master render function that shows the correct screen
Hides all screens, then shows only the current one
*/

function render() {
    console.log('Rendering screen:', currentScreen);

    // Hide all screens first
    setupScreen.classList.add('hidden');
    wordEntryScreen.classList.add('hidden');
    gameplayScreen.classList.add('hidden');
    // We'll add more screens here later

    // Show the appropriate screen based on currentScreen
    if (currentScreen === SCREENS.SETUP) {
        setupScreen.classList.remove('hidden');
    }
    else if (currentScreen === SCREENS.WORD_ENTRY) {
        wordEntryScreen.classList.remove('hidden');
        renderWordEntry(); // Show word entry for current player
    }
    else if (currentScreen === SCREENS.GAMEPLAY) {
        gameplayScreen.classList.remove('hidden');
        renderGameplay();
    }
}

/*
RENDER WORD ENTRY FUNCTION
Updates the word entry screen to show current player's prompt
Clears previous inputs and updates progress
*/

function renderWordEntry() {
    console.log('Rendering word entry for player:', currentWordEntryPlayerIndex);

    // Get current player info
    const currentPlayerInfo = allPlayersList[currentWordEntryPlayerIndex];
    const playerName = currentPlayerInfo.playerName;
    const teamIndex = currentPlayerInfo.teamIndex;
    const teamName = teams[teamIndex].name;

    // Update prompt to show current player
    currentPlayerPrompt.textContent = `${playerName} (${teamName}), enter ${MIN_WORDS_PER_PLAYER}-${MAX_WORDS_PER_PLAYER} words:`;

    // Clear all word inputs from previous player
    wordInputs.forEach(input => input.value = '');

    // Clear any error message
    wordEntryError.textContent = '';

    // Update progress indicator
    const totalPlayers = allPlayersList.length;
    wordEntryProgress.textContent = `Player ${currentWordEntryPlayerIndex + 1} of ${totalPlayers}`;

    console.log('Word entry rendered for:', playerName, 'from', teamName);
}

/*
VALIDATE WORDS FUNCTION
Checks if current player entered 3-5 words
Returns true if valid, false if not
Displays error message if validation fails
*/

function validateWords() {
    console.log('Validating words...');

    // Clear any previous error
    wordEntryError.textContent = '';

    // Collect all non-empty words
    const enteredWords = [];

    wordInputs.forEach(input => {
        const word = input.value.trim();
        if (word) {
            enteredWords.push(word);
        }
    });

    console.log('Words entered:', enteredWords);

    // Check minimum words
    if (enteredWords.length < MIN_WORDS_PER_PLAYER) {
        wordEntryError.textContent = `Please enter at least ${MIN_WORDS_PER_PLAYER} words`;
        console.log('Validation failed: Not enough words');
        return false;
    }

    // Check maximum words
    if (enteredWords.length > MAX_WORDS_PER_PLAYER) {
        wordEntryError.textContent = `Please enter no more than ${MAX_WORDS_PER_PLAYER} words`;
        console.log('Validation failed: Too many words');
        return false;
    }

    // Check for duplicate words (case-insensitive)
    const lowercaseWords = enteredWords.map(word => word.toLowerCase());
    const uniqueWords = new Set(lowercaseWords);

    if (uniqueWords.size !== enteredWords.length) {
        wordEntryError.textContent = 'Please enter unique words (no duplicates)';
        console.log('Validation failed: Duplicate words');
        return false;
    }

    console.log('Validation passed for words:', enteredWords);
    return true;
}

/*
HANDLE WORD SUBMIT FUNCTION
Called when "Submit Words" button is clicked
Validates words, adds them to allWords array
Moves to next player or starts game if all players done
*/

function handleWordSubmit() {
    console.log('Words submitted by player:', currentWordEntryPlayerIndex);

    // Validate words first
    if (!validateWords()) {
        console.log('Word validation failed, stopping');
        return; // Stop if validation fails
    }

    // If validation passed, collect the words
    const enteredWords = [];

    wordInputs.forEach(input => {
        const word = input.value.trim();
        if (word) {
            enteredWords.push(word);
        }
    });

    // Add these words to the master allWords array
    allWords.push(...enteredWords);

    console.log('Words added. Total words now:', allWords.length);
    console.log('All words so far:', allWords);

    // Move to next player
    currentWordEntryPlayerIndex++;

    // Check if all players have entered words
    if (currentWordEntryPlayerIndex >= allPlayersList.length) {
        // All players done! Time to start the game
        console.log('All players have entered words!');
        console.log('Final word pool:', allWords);

        // Shuffle the word pool
        shuffleArray(allWords);
        console.log('Words shuffled:', allWords);

        // Copy all words to availableWords for first round
        availableWords = [...allWords];

        // Transition to gameplay
        currentScreen = SCREENS.GAMEPLAY;
        
        // Start the first round
        startRound();
        
        console.log('Transitioning to gameplay');
    } else {
        // More players need to enter words
        console.log('Moving to next player:', currentWordEntryPlayerIndex);
        renderWordEntry(); // Show word entry for next player
    }
}

/*
SHUFFLE ARRAY FUNCTION
Used to randomize the word pool
*/

function shuffleArray(array) {
    console.log('Shuffling array...');

    // Start from the end and swap with random earlier position
    for (let i = array.length - 1; i > 0; i--) {
        // Pick random index from 0 to i
        const randomIndex = Math.floor(Math.random() * (i + 1));

        // Swap elements at i and randomIndex
        [array[i], array[randomIndex]] = [array[randomIndex], array[i]];
    }

    console.log('Array shuffled');
    return array;
}

/*
START ROUND FUNCTION
Initializes a new round
Resets availableWords to full pool
Updates round display
Shows whose turn it is
*/

function startRound() {
    console.log('Starting round:', currentRound);

    // Reset availableWords to full word pool for this round
    availableWords = [...allWords];
    console.log('Available words for round:', availableWords.length);

    // Reset turn tracking to start of round
    currentTeamIndex = 0;
    currentPlayerIndex = 0;

    // Calculate total turns for this round (each player goes once)
    totalTurnsInRound = teams[0].players.length + teams[1].players.length;
    turnsCompletedInRound = 0;

    console.log('Total turns in round:', totalTurnsInRound);

    // Render the gameplay screen
    renderGameplay();

    console.log('Round started. First turn:', teams[currentTeamIndex].players[currentPlayerIndex]);
}

/*
RENDER GAMEPLAY FUNCTION
Updates the gameplay screen with current game state
Shows round info, scores, whose turn it is
*/

function renderGameplay() {
    console.log('Rendering gameplay screen');

    // Update round display
    const currentRoundInfo = ROUNDS[currentRound - 1]; // Arrays are 0-indexed
    roundDisplay.textContent = `Round ${currentRoundInfo.number}: ${currentRoundInfo.name} ${currentRoundInfo.icon}`;
    roundInstructions.textContent = currentRoundInfo.instructions;

    // Update team names and scores
    team1NameDisplay.textContent = teams[0].name;
    team2NameDisplay.textContent = teams[1].name;
    team1ScoreDisplay.textContent = teams[0].score;
    team2ScoreDisplay.textContent = teams[1].score;

    // Update whose turn it is
    const currentTeam = teams[currentTeamIndex];
    const currentPlayer = currentTeam.players[currentPlayerIndex];
    currentTurnDisplay.textContent = `${currentPlayer} (${currentTeam.name})'s turn`;

    // Show turn info, hide word display and time's up message
    turnInfo.classList.remove('hidden');
    wordDisplayContainer.classList.add('hidden');
    timesUpMessage.classList.add('hidden');

    console.log('Gameplay rendered. Current player:', currentPlayer);
}

/*
START TURN FUNCTION
Called when player clicks "Start Turn" button
Starts the 60-second timer
Shows the first word
Enables action buttons
*/

function startTurn() {
    console.log('Starting turn for:', teams[currentTeamIndex].players[currentPlayerIndex]);

    // Check if there are words available
    if (availableWords.length === 0) {
        console.log('No words left! Ending round...');
        // NOTE: We'll add endRound function later
        return;
    }

    // Reset timer
    timeRemaining = TIMER_DURATION;
    timerRunning = true;

    // Start countdown
    startTimer();

    // Show first word
    showRandomWord();

    // Hide turn info, show word display
    turnInfo.classList.add('hidden');
    wordDisplayContainer.classList.remove('hidden');
    timesUpMessage.classList.add('hidden');

    console.log('Turn started. Timer running.');
}

/*
START TIMER FUNCTION
Starts the countdown timer using setInterval
Updates display every second
Calls endTurn when time reaches 0
*/

function startTimer() {
    console.log('Timer started at', TIMER_DURATION, 'seconds');

    // Update display immediately
    updateTimerDisplay();

    // Set up interval to count down every second
    timerInterval = setInterval(() => {
        // Decrease time remaining
        timeRemaining--;

        // Update display
        updateTimerDisplay();

        // Check if time is up
        if (timeRemaining <= 0) {
            console.log('Time is up!');
            endTurn();
        }
    }, 1000); // Run every 1000ms = 1 second
}

/*
UPDATE TIMER DISPLAY FUNCTION
Formats time remaining as MM:SS and updates display
*/

function updateTimerDisplay() {
    // Convert seconds to MM:SS format
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;

    // Add leading zero to seconds if needed (e.g., 1:05 not 1:5)
    const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    timerDisplay.textContent = formattedTime;

    // Change color when time is running low
    if (timeRemaining <= 10) {
        timerDisplay.style.color = 'red';
    } else {
        timerDisplay.style.color = 'black';
    }
}

/*
STOP TIMER FUNCTION
Stops the countdown timer
*/

function stopTimer() {
    console.log('Timer stopped');

    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    timerRunning = false;
}

/*
SHOW RANDOM WORD FUNCTION
Picks a random word from availableWords
Displays it on screen
Updates words remaining count
*/

function showRandomWord() {
    console.log('Showing random word. Available words:', availableWords.length);

    // Check if any words left
    if (availableWords.length === 0) {
        console.log('No words left to show!');
        currentWordDisplay.textContent = 'NO MORE WORDS!';
        wordsRemainingDisplay.textContent = 'Words left: 0';
        // Could auto-end turn here
        return;
    }

    // Pick random index
    const randomIndex = Math.floor(Math.random() * availableWords.length);

    // Get the word at that index
    currentWord = availableWords[randomIndex];
    currentWordIndex = randomIndex;

    // Display the word (uppercase for emphasis)
    currentWordDisplay.textContent = currentWord.toUpperCase();

    // Update words remaining
    wordsRemainingDisplay.textContent = `Words left: ${availableWords.length}`;

    console.log('Showing word:', currentWord, 'at index:', randomIndex);
}

/*
END TURN FUNCTION
Called when timer reaches 0
Stops timer, shows "Time's Up" message
Prepares for next turn
*/

function endTurn() {
    console.log('Ending turn');

    // Stop the timer
    stopTimer();

    // Hide word display, show time's up message
    wordDisplayContainer.classList.add('hidden');
    timesUpMessage.classList.remove('hidden');

    console.log('Turn ended. Waiting for next turn button click.');
}

/*
HANDLE GOT IT FUNCTION
Called when "Got It!" button is clicked
Means the team guessed the word correctly
- Adds 1 point to current team's score
- Removes word from availableWords pool
- Shows next word
*/

function handleGotIt() {
    console.log('Got It! Word guessed:', currentWord);

    // Add point to current team
    teams[currentTeamIndex].score++;
    console.log(`${teams[currentTeamIndex].name} score is now:`, teams[currentTeamIndex].score);

    // Update score display
    updateScores();

    // Remove word from available pool
    availableWords.splice(currentWordIndex, 1);
    console.log('Word removed. Words remaining:', availableWords.length);

    // Check if any words left
    if (availableWords.length === 0) {
        console.log('No more words! Ending turn...');
        endTurn();
        return;
    }

    // Show next word
    showRandomWord();
}

/*
UPDATE SCORES FUNCTION
Updates the score displays for both teams
*/

function updateScores() {
    team1ScoreDisplay.textContent = teams[0].score;
    team2ScoreDisplay.textContent = teams[1].score;

    console.log('Scores updated:', teams[0].name, teams[0].score, 'vs', teams[1].name, teams[1].score);
}

/*
HANDLE SKIP FUNCTION
Called when "Skip" button is clicked
Means the team couldn't guess the word
- Word stays in availableWords pool (not removed)
- Shows next word
- No points awarded
*/

function handleSkip() {
    console.log('Skip! Word skipped:', currentWord);
    console.log('Word stays in pool for later');

    // Check if any words left to show
    if (availableWords.length === 0) {
        console.log('No more words! Ending turn...');
        endTurn();
        return;
    }

    // Just show next word (don't remove current word from pool)
    showRandomWord();
}

/*
MOVE TO NEXT PLAYER FUNCTION
Switches to the next player's turn
Alternates between teams
*/

function moveToNextPlayer() {
    console.log('Moving to next player...');
    console.log('Current:', teams[currentTeamIndex].name, teams[currentTeamIndex].players[currentPlayerIndex]);

    // Switch to other team
    if (currentTeamIndex === 0) {
        currentTeamIndex = 1;
    } else {
        currentTeamIndex = 0;
    }

    // Move to next player in that team
    currentPlayerIndex++;

    // Check if we've gone through all players in this team
    // If so, wrap back to first player
    if (currentPlayerIndex >= teams[currentTeamIndex].players.length) {
        currentPlayerIndex = 0;
    }

    console.log('Next player:', teams[currentTeamIndex].name, teams[currentTeamIndex].players[currentPlayerIndex]);
}

/*
HANDLE NEXT TURN FUNCTION
Called when "Next Turn" button is clicked after time's up
Moves to next player and checks if round is over
*/

function handleNextTurn() {
    console.log('Next turn button clicked');

    // Increment turns completed
    turnsCompletedInRound++;
    console.log('Turns completed:', turnsCompletedInRound, 'of', totalTurnsInRound);

    // Check if round is complete (all players have gone once)
    if (turnsCompletedInRound >= totalTurnsInRound) {
        console.log('Round complete! All players have gone.');
        endRound();
        return;
    }

    // Move to next player
    moveToNextPlayer();

    // Re-render gameplay for next player's turn
    renderGameplay();

    console.log('Ready for next turn');
}

/*
VALIDATE SETUP FUNCTION
Checks if setup form is filled out correctly
Returns true if valid, false if not
Displays error message if validation fails
*/

function validateSetup() {
    console.log('Validating setup...');

    // Clear any previous error message
    setupError.textContent = '';

    // Check team names
    const team1Name = team1NameInput.value.trim();
    const team2Name = team2NameInput.value.trim();

    if (!team1Name || !team2Name) {
        setupError.textContent = 'Please enter names for both teams';
        console.log('Validation failed: Missing team name(s)');
        return false;
    }

    // Collect player names for each team
    const team1Players = [];
    const team2Players = [];

    playerNameInputs.forEach(input => {
        const playerName = input.value.trim();
        const teamNum = input.getAttribute('data-team');

        // Only add non-empty player names
        if (playerName) {
            if (teamNum === '1') {
                team1Players.push(playerName);
            } else if (teamNum === '2') {
                team2Players.push(playerName);
            }
        }
    });

    // Check each team has minimum players (2)
    if (team1Players.length < MIN_PLAYERS_PER_TEAM) {
        setupError.textContent = `Team 1 needs at least ${MIN_PLAYERS_PER_TEAM} players`;
        console.log('Validation failed: Team 1 needs more players');
        return false;
    }

    if (team2Players.length < MIN_PLAYERS_PER_TEAM) {
        setupError.textContent = `Team 2 needs at least ${MIN_PLAYERS_PER_TEAM} players`;
        console.log('Validation failed: Team 2 needs more players');
        return false;
    }

    // Check teams have equal number of players
    if (team1Players.length !== team2Players.length) {
        setupError.textContent = 'Both teams must have the same number of players';
        console.log('Validation failed: Unequal team sizes');
        return false;
    }

    console.log('Validation passed', { team1Name, team2Name, team1Players, team2Players });

    // If we get here -> validation passed
    return true;
}

/*
HANDLE SETUP SUBMIT FUNCTION
Called when "Start Game" button is clicked
Validates form, creates team objects, transitions to word entry
*/

function handleSetupSubmit() {
    console.log('Setup submitted');

    // Validate form first
    if (!validateSetup()) {
        console.log('Setup validation failed, stopping');
        return; // Stop if validation fails
    }

    // If validation passed, collect the data
    const team1Name = team1NameInput.value.trim();
    const team2Name = team2NameInput.value.trim();

    // Collect player names for each team
    const team1Players = [];
    const team2Players = [];

    playerNameInputs.forEach(input => {
        const playerName = input.value.trim();
        const teamNum = input.getAttribute('data-team');

        if (playerName) {
            if (teamNum === '1') {
                team1Players.push(playerName);
            } else if (teamNum === '2') {
                team2Players.push(playerName);
            }
        }
    });

    // Create team objects
    teams = [
        {
            name: team1Name,
            players: team1Players,
            score: 0,
            roundScores: []
        },
        {
            name: team2Name,
            players: team2Players,
            score: 0,
            roundScores: []
        }
    ];

    console.log('Teams created:', teams);

    // Create flat list of all players for word entry phase
    // We'll alternate between teams when collecting words
    allPlayersList = [];
    const maxPlayers = Math.max(team1Players.length, team2Players.length);

    for (let i = 0; i < maxPlayers; i++) {
        if (i < teams[0].players.length) {
            allPlayersList.push({ teamIndex: 0, playerName: teams[0].players[i] });
        }
        if (i < teams[1].players.length) {
            allPlayersList.push({ teamIndex: 1, playerName: teams[1].players[i] });
        }
    }

    console.log('All players list for word entry:', allPlayersList);

    // Reset word entry tracking
    currentWordEntryPlayerIndex = 0;

    // Transition to word entry screen
    currentScreen = SCREENS.WORD_ENTRY;
    render();

    // NOTE: We'll add word entry screen and its functions next
    console.log('Transitioning to word entry screen');
}

// Call init when page loads
init();

/*----------------------------- Event Listeners -----------------------------*/
/*
SETUP SCREEN EVENT LISTENERS
*/

// Start Game button - validates and submits setup
startGameBtn.addEventListener('click', handleSetupSubmit);

console.log('Event listeners conected');

/*
WORD ENTRY SCREEN EVENT LISTENERS
*/

// Submit Words button - validates and submits words
submitWordsBtn.addEventListener('click', handleWordSubmit);

/*
GAMEPLAY SCREEN EVENT LISTENERS
*/

// Start Turn button - begins the timer and shows words
startTurnBtn.addEventListener('click', startTurn);

// Got It button - correct guess, add point and remove word
gotItBtn.addEventListener('click', handleGotIt);

// Skip button - word not guessed, show next word but keep in pool
skipBtn.addEventListener('click', handleSkip);

// Next Turn button - move to next player after time's up
nextTurnBtn.addEventListener('click', handleNextTurn);