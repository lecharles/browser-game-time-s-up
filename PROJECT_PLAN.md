# Time's Up! - Browser Game Project Plan

## 🎮 Game Choice

**Time's Up!** - A turn-based, team-based word-guessing party game for 2 teams.

Players take turns describing words to their teammates in 60 seconds. Teams earn points for correctly guessed words across multiple rounds with different describing rules.

---

## 💡 Why This Game?

### Personal Motivation
During the 2025 holidays, I played this game with friends and family. It was incredibly fun, engaging, and brought everyone together. However, the physical setup (writing words on paper, managing the "hat", timing with phones) was cumbersome. 

### Problem to Solve
**Current friction points:**
- Manual word collection (paper scraps get lost)
- Timing inconsistency (different phone timers)
- Score tracking is manual and error-prone
- No clear turn order management
- Round transitions are confusing

### Solution
A browser-based game that:
- ✅ Handles word collection digitally
- ✅ Manages consistent 60-second timer
- ✅ Tracks scores automatically
- ✅ Enforces turn order
- ✅ Clearly shows round rules
- ✅ Works on any device (phone, tablet, laptop)
- ✅ Single device - pass it around the room

### Learning Goals
- Complex state management (players, teams, words, rounds, turns, scores)
- Real-time timer integration
- Multi-screen flow (setup → gameplay → results)
- Array manipulation (word pool management)
- Turn-based game logic

---

## 🎯 Project Summary

**MVP Scope:**
- 2 teams (2-4 players each)
- 3-5 words per player
- 2 rounds (Round 1: Describe It, Round 2: One Word)
- 60-second timer per turn
- Real-time score tracking

**Stretch Goals:**
- Round 3 (acting/gestures)
- Sound effects
- Additional rounds (sound-only, drawing)

---

## 📖 How to Play

### Setup
1. Create 2 teams with 2-4 players each
2. Each player submits 3-5 words
3. All words go into a shared pool

### Gameplay
1. Teams alternate turns
2. Current player starts 60-second timer
3. Player picks a random word and describes it following round rules
4. Teammates guess the word
5. If correct: "Got It" → +1 point, word removed from pool
6. If not: "Skip" → word stays in pool for later
7. When timer ends, next team's turn
8. Round ends when all players have gone
9. Next round starts with all words back in the pool
10. Game ends after all rounds - highest score wins

### Round Rules
- **Round 1:** Describe the word without saying it
- **Round 2:** Say only ONE keyword (not the word itself)
- **Round 3 (Stretch):** Act it out silently

---

## 🏆 Game Objective & Winning

### Objective
**For each team:** Guess as many words as possible across all rounds to earn the most points.

### Scoring
- Each correctly guessed word = 1 point for that team
- Words not guessed stay in the pool for future turns
- No penalty for skipped words

### Winning
At the end of all rounds:
1. Tally total points per team
2. Team with most points wins
3. Display final scoreboard with round-by-round breakdown

### Tie Breaker (Stretch)
If teams are tied:
- Sudden death round (1 word, first to guess wins)
- OR declare co-champions

---

## 🧩 Pseudocode

### Overall Game Flow
```
// 1) Define required constants
   - TIMER_DURATION = 60 seconds
   - MIN/MAX teams, players, words per player
   - Round definitions (rules, instructions)
   - Screen states (setup, word-entry, gameplay, results)

// 2) Track game state with variables
   - currentScreen (which view is showing)
   - teams array (name, players, score, roundScores)
   - allWords array (master word pool)
   - availableWords array (words left in current round)
   - currentRound, currentTeamIndex, currentPlayerIndex
   - currentWord, currentWordIndex
   - timerInterval, timeRemaining, timerRunning
   - turnHistory

// 3) Cache element references
   - Setup: team/player name inputs, start button
   - Word entry: word input fields, submit button
   - Gameplay: score displays, timer, word display, action buttons
   - Results: score displays, next round/play again buttons

// 4) Initialize game on load
   - Set currentScreen = 'setup'
   - Reset all state variables
   - Call render() to show setup screen

// 5) Handle setup phase
   FUNCTION handleSetupSubmit():
     - Validate all team and player names filled
     - Create teams array with player names
     - Transition to word entry screen
   
   FUNCTION handleWordSubmit():
     - Collect words from each player (validate 3-5 words each)
     - Add all words to allWords array
     - Shuffle allWords
     - Set availableWords = copy of allWords
     - Transition to gameplay screen

// 6) Handle gameplay phase
   FUNCTION startRound():
     - Display current round rules
     - Reset availableWords to full pool
     - Show whose turn it is
     - Enable "Start Turn" button
   
   FUNCTION startTurn():
     - Start 60-second countdown timer
     - Pick random word from availableWords
     - Display word to current player
     - Enable "Got It" and "Skip" buttons
   
   FUNCTION handleGotIt():
     - Increment current team's score
     - Remove word from availableWords
     - Show next random word (if available)
     - If no words left, end turn
   
   FUNCTION handleSkip():
     - Keep word in availableWords
     - Show next random word (if available)
   
   FUNCTION endTurn():
     - Stop timer
     - Show "Time's Up!" message
     - Switch to next player (alternate teams)
     - Check if round is complete
     - If all players have gone → end round
     - Otherwise → show next player's turn
   
   FUNCTION endRound():
     - Save round scores for each team
     - If more rounds remain → start next round
     - Otherwise → end game
   
   FUNCTION endGame():
     - Calculate final scores
     - Determine winner (highest total score)
     - Display final results screen

// 7) Handle timer
   FUNCTION startTimer():
     - Set interval (every 1 second)
     - Decrement timeRemaining
     - Update timer display
     - When reaches 0 → call endTurn()
   
   FUNCTION stopTimer():
     - Clear timer interval
     - Set timerRunning = false

// 8) Handle scoring
   FUNCTION updateScores():
     - Update score displays for both teams
     - Track individual round scores

// 9) Handle rendering
   FUNCTION render():
     - Hide all screens
     - Show current screen based on currentScreen variable
     - Update all relevant displays
   
   FUNCTION renderGameplay():
     - Show team names, scores
     - Show current round info
     - Show whose turn it is
     - Show timer
     - Show current word (if turn active)
   
   FUNCTION renderResults():
     - Show final scores for both teams
     - Show round-by-round breakdown
     - Display winner

// 10) Event listeners
   - Setup submit button → handleSetupSubmit()
   - Word submit button → handleWordSubmit()
   - Start turn button → startTurn()
   - Got It button → handleGotIt()
   - Skip button → handleSkip()
   - Next round button → startRound()
   - Play again button → init()
```

---

## 🚧 Expected Challenges

### Challenge 1: Turn Management
**Problem:** Managing alternating turns between teams while tracking which player within each team should go next.

### Challenge 2: Word Pool Management
**Problem:** Same word pool needs to "reset" each round but individual words are removed during gameplay.

### Challenge 3: Timer State Management
**Problem:** Timer needs to run independently, update UI, and trigger end-turn actions while allowing user interactions.

### Challenge 4: Multi-Screen Flow
**Problem:** Game has 4+ different screens (setup, word entry, gameplay, results) that need to transition smoothly.

### Challenge 5: Random Word Selection Without Repeats
**Problem:** Need to show random words but never repeat until player manually skips or round ends.

---

## 📝 MVP Feature List

### Must-Have (Core Functionality)
- [ ] Setup screen: Input team names (2 teams)
- [ ] Setup screen: Input player names (2-4 per team)
- [ ] Word entry: Each player enters 3-5 words
- [ ] Gameplay: 60-second countdown timer
- [ ] Gameplay: Display random word from pool
- [ ] Gameplay: "Got It" button (+1 point, remove word)
- [ ] Gameplay: "Skip" button (keep word in pool)
- [ ] Gameplay: Automatic turn switching (alternate teams)
- [ ] Gameplay: Round 1 (describe without saying word)
- [ ] Gameplay: Round 2 (one keyword only)
- [ ] Results: Display final scores
- [ ] Results: Declare winner
- [ ] Basic CSS styling (readable, functional)

### Nice-to-Have (Stretch Goals)
- [ ] Round 3: Act it out (gestures only)
- [ ] Sound effects ("Time's Up!" audio)
- [ ] Pause/resume timer
- [ ] Animations for score changes
- [ ] LocalStorage to save game progress
- [ ] Mobile-responsive design
- [ ] Additional rounds (sound-only, drawing)

---

## ⚙️ Technical Decisions

- **No backend/database:** Pure vanilla JavaScript, HTML, CSS
- **No authentication:** Local game, no user accounts
- **Single device:** Pass device between players
- **Honor system:** Players self-report correct guesses

---

## 👥 Step-by-Step Example

### Example Game Setup
**Teams:** 2  
**Players per team:** 2  
**Words per player:** 3  
**Total word pool:** 12 words

**Team 1: "Word Wizards"**
- Player 1.1: Alex
- Player 1.2: Blake

**Team 2: "Guess Masters"**
- Player 2.1: Casey
- Player 2.2: Dana

**Word Submissions:**
- Alex: "Airplane", "Coffee", "Basketball"
- Blake: "Guitar", "Rainbow", "Chocolate"
- Casey: "Elephant", "Volcano", "Sushi"
- Dana: "Lighthouse", "Telescope", "Karate"

**Total Pool:** 12 words (shuffled randomly)

### Example Round 1 Gameplay

**Round 1 Rules:** Describe the word without saying it

#### Turn 1: Alex (Team 1)

**Before Turn:**
- Team 1 Score: 0
- Team 2 Score: 0
- Words remaining: 12

**Alex clicks "Start Turn" → Timer starts (60s)**

**0:00 - Word appears:** "Volcano"
- Alex: "It's a mountain that explodes with lava!"
- Blake: "Volcano!"
- **Alex marks "Got It"** → +1 point to Team 1
- Words remaining: 11

**0:15 - New word appears:** "Guitar"
- Alex: "Musical instrument with six strings!"
- Blake: "Guitar!"
- **Alex marks "Got It"** → +1 point to Team 1
- Words remaining: 10

**0:30 - New word appears:** "Sushi"
- Alex: "Japanese food, raw fish, rice..."
- Blake: "Sushi!"
- **Alex marks "Got It"** → +1 point to Team 1
- Words remaining: 9

**0:48 - New word appears:** "Telescope"
- Alex: "You look through this to see stars..."
- Blake: "Binoculars? Microscope?"
- **Timer runs out at 1:00**
- **"TIME'S UP!" message + audio**
- Alex marks "Skip" (word stays in pool)

**After Turn:**
- Team 1 Score: 3
- Team 2 Score: 0
- Words remaining: 10 (telescope back in pool)

#### Turn 2: Casey (Team 2)

**Casey clicks "Start Turn" → Timer starts (60s)**

**0:00 - Word appears:** "Rainbow"
- Casey: "Colorful arc in the sky after rain!"
- Dana: "Rainbow!"
- **Casey marks "Got It"** → +1 point to Team 2

**0:18 - Word appears:** "Lighthouse"
- Casey: "Tall building by the ocean with a light on top!"
- Dana: "Lighthouse!"
- **Casey marks "Got It"** → +1 point to Team 2

**0:40 - New word appears:** "Karate"
- Casey: "Martial art, you kick and chop..."
- Dana: "Karate!"
- **Casey marks "Got It"** → +1 point to Team 2

**0:58 - New word appears:** "Airplane"
- **Timer runs out at 1:00 before description starts**
- **"TIME'S UP!"**
- Word stays in pool

**After Turn:**
- Team 1 Score: 3
- Team 2 Score: 3
- Words remaining: 7

#### Turn 3: Blake (Team 1)
*[continues similar pattern]*

#### Turn 4: Dana (Team 2)
*[continues similar pattern]*

**End of Round 1:**
- Team 1 Score: 7
- Team 2 Score: 5
- Words remaining: 3

### Example Round 2 Gameplay

**Round 2 Rules:** Say only ONE keyword (not the word itself)

Remaining words: "Telescope", "Airplane", "Elephant"

#### Turn 1: Alex (Team 1)

**0:00 - Word:** "Telescope"
- Alex: "Stars!"
- Blake: "Telescope!"
- +1 point

**0:10 - Word:** "Airplane"
- Alex: "Flying!"
- Blake: "Airplane!"
- +1 point

**0:22 - Word:** "Elephant"
- Alex: "Trunk!"
- Blake: "Elephant!"
- +1 point

**All words guessed! Round 2 ends early.**

**Final Scores:**
- Team 1: 10 points
- Team 2: 5 points

**Winner: Team 1 - Word Wizards! 🎉**

---

*Project by: lecharles*  
*GA SEB - Browser-Based Game Project*