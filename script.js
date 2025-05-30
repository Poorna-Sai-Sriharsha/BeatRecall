// ----- GAME CONFIGURATION -----
// Define available drums and their corresponding keys
const drums = [
    { name: "kick", key: "K" },
    { name: "snare", key: "S" },
    { name: "hihat", key: "H" },
    { name: "tom", key: "T" },
    { name: "clap", key: "P" },
    { name: "cowbell", key: "B" }
];
// ----- GAME ELEMENTS -----
// Get references to important DOM elements
const drumContainer = document.querySelector(".drum-container");
const scoreDisplay = document.getElementById("score");
const roundDisplay = document.getElementById("round");
const startButton = document.getElementById("startBtn");
let sequence = [];
let playerIndex = 0;
let score = 0;
let round = 0;
let isPlaying = false;
let drumButtons = {};
// ----- DRUM PRE lOAD SOUNDS ----
function preloadSounds() {
    drums.forEach(drum => {
      const sound = new Audio(`BeatRecall_Assets/${drum.name}.mp3`);
      sound.preload = 'auto';
    });
  }
// ----- DRUM BUTTON CREATION ----- 
function createDrumButtons() {
    drumContainer.innerHTML = '';
    drums.forEach(drum => {
      const button = document.createElement("button");
      button.className = "btn";
      button.setAttribute("data-key", drum.key);
      button.style.backgroundImage = `url(BeatRecall_Assets/${drum.name}.png)`;
      // Create sound element
      const sound = new Audio(`BeatRecall_Assets/${drum.name}.mp3`);
      // Store button and sound references
      drumButtons[drum.name] = { button, sound };
      button.addEventListener("click", () => {
        playSound(sound, button);
        if (isPlaying) checkPlayerInput(drum.name);
      });
      // Add hover event listener
      button.addEventListener("mouseenter", () => {
        sound.volume = 0.3;
        playSound(sound, button, true);
      });
      button.addEventListener("mouseleave", () => {
        musicBars.classList.remove("hover");
      });
      drumContainer.appendChild(button);
    });
    // Add keyboard event listener
    window.addEventListener("keydown", (e) => {
      const drum = drums.find(d => e.key.toLowerCase() === d.key.toLowerCase());
      if (drum) {
        const { sound, button } = drumButtons[drum.name];
        playSound(sound, button);
        if (isPlaying) checkPlayerInput(drum.name);
      }
    });
}
// ----- SOUND AND ANIMATION FUNCTIONS -----  
function playSound(sound, button, isHover = false) {
    sound.currentTime = 0;
    sound.play();
     // Add active state animation if not hover
    if (!isHover) {
      button.classList.add("active");
      setTimeout(() => button.classList.remove("active"), 300);
    }
}
// ----- GAME LOGIC FUNCTIONS -----
// Get random drum different from the last one
function getRandomDrum(lastDrum = null) {
    const available = drums.filter(d => d.name !== lastDrum);
    return available[Math.floor(Math.random() * available.length)].name;
}
// Generate new sequence based on current round  
function generateSequence() {
    const newSequence = [];
    let lastDrum = null;
    for (let i = 0; i < round + 2; i++) {
      const nextDrum = getRandomDrum(lastDrum);
      newSequence.push(nextDrum);
      lastDrum = nextDrum;
    }
    return newSequence;
}
// Play the sequence for the player to follow
function playSequence(seq) {
    seq.forEach((drum, index) => {
      setTimeout(() => {
        const { sound, button } = drumButtons[drum];
        playSound(sound, button);
        button.classList.add("target");
        setTimeout(() => button.classList.remove("target"), 300);
      }, index * 800);
    });
}
// Start a new round  
function startRound() {
    round++;
    roundDisplay.textContent = round;
    sequence = generateSequence();
    playerIndex = 0;
    setTimeout(() => playSequence(sequence), 1000);
}
// Check player's input against sequence 
function checkPlayerInput(drum) {
    if (!isPlaying) return;
    if (drum === sequence[playerIndex]) {
      playerIndex++;
      if (playerIndex === sequence.length) {
        score++;
        scoreDisplay.textContent = score;
        setTimeout(startRound, 1500);
      }
    } else {
      alert(`Wrong beat! Your score: ${score}`);
      resetGame();
    }
}
// ----- MUSICAL BARS ANIMATION -----
const musicBars = document.querySelector(".music-bars");
const bars = document.querySelectorAll(".bar");
// Function to animate bars
function animateBars() {
  bars.forEach((bar, index) => {
    setTimeout(() => {
      bar.classList.add("active");
      setTimeout(() => bar.classList.remove("active"), 300);
    }, index * 50);
  });
}
// Toggle playing state for bars during sequence
function toggleBarsPlaying(isSequencePlaying) {
  if (isSequencePlaying) {
    musicBars.classList.add("playing");
  } else {
    musicBars.classList.remove("playing");
  }
}
// Enhance existing playSound to trigger bar animation
const originalPlaySound = playSound;
playSound = function(sound, button, isHover = false) {
  originalPlaySound(sound, button, isHover);
  if (!isHover) animateBars();
};
// Modify playSequence to toggle bars playing state
const originalPlaySequence = playSequence;
playSequence = function(seq) {
  toggleBarsPlaying(true);
  originalPlaySequence(seq);
  setTimeout(() => toggleBarsPlaying(false), seq.length * 800);
};
// Modify startRound to ensure bars reset
const originalStartRound = startRound;
startRound = function() {
  toggleBarsPlaying(false);
  originalStartRound();
};
// Modify resetGame to reset bars
const originalResetGame = resetGame;
resetGame = function() {
  originalResetGame();
  toggleBarsPlaying(false);
}; 
// Reset game state
function resetGame() {
    sequence = [];
    playerIndex = 0;
    score = 0;
    round = 0;
    isPlaying = false;
    scoreDisplay.textContent = 0;
    roundDisplay.textContent = 0;
}
// ----- EVENT LISTENERS -----
// Start game button click handler 
startButton.addEventListener("click", () => {
    if (isPlaying) return;
    resetGame();
    isPlaying = true;
    setTimeout(startRound, 1000);
});
// ----- INITIALIZE GAME -----
preloadSounds();
createDrumButtons();