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

/*----------------------------- Event Listeners -----------------------------*/

/*-------------------------------- Functions --------------------------------*/