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

    // For now, just show setup screen
    // We'll expand this as we add more screens

    // Show setup screen (other screens will be added later)
    if (currentScreen === SCREENS.SETUP) {
        setupScreen.classList.remove('hidden');
    }
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

