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

/*------------------------ Cached Element References ------------------------*/

/*----------------------------- Event Listeners -----------------------------*/

/*-------------------------------- Functions --------------------------------*/