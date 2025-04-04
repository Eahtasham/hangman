const wordElement = document.getElementById("word");
const attemptsElement = document.getElementById("attempts");
const livesElement = document.getElementById("lives");
const statsElement = document.getElementById("stats");
const keyboardElement = document.querySelector(".keyboard");
const newGameButton = document.getElementById("newGame");
const gameOverElement = document.getElementById("gameOver");
const gameResultElement = document.getElementById("gameResult");
const revealedWordElement = document.getElementById("revealedWord");
const playAgainButton = document.getElementById("playAgain");

const hangmanParts = [
    "rope", "head", "body", "leftArm", "rightArm", 
    "leftLeg", "rightLeg", "leftEye", "rightEye", "mouth"
];

let words = []; 
let currentWord = "";
let displayWord = [];
let attempts = [];
let lives = 10;
let gamesPlayed = 0;
let totalScore = 0;

function createKeyboard() {
    keyboardElement.innerHTML = "";
    for (let i = 65; i <= 90; i++) {
        const letter = String.fromCharCode(i);
        const button = document.createElement("button");
        button.textContent = letter;
        button.className = "key";
        button.addEventListener("click", () => guessLetter(letter));
        keyboardElement.appendChild(button);
    }
}

// Fetch words from API
async function fetchWords(count) {
    try {
        const response = await fetch(`fetch.php?k=${count}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching words:', error);
        return [
            "JAVASCRIPT", "HANGMAN", "PROGRAMMING", "COMPUTER", "KEYBOARD",
            "DEVELOPER", "ALGORITHM", "APPLICATION", "FUNCTION", "VARIABLE"
        ];
    }
}

async function checkAndFetchWords() {
    if (words.length <= 1) {
        const needed = 5 - words.length;
        try {
            const newWords = await fetchWords(needed);
            words = words.concat(newWords);
        } catch (error) {
            console.error('Error fetching words:', error);
            if (words.length === 0) {
                words = [
                    "JAVASCRIPT", "HANGMAN", "PROGRAMMING", "COMPUTER", "KEYBOARD",
                    "DEVELOPER", "ALGORITHM", "APPLICATION", "FUNCTION", "VARIABLE"
                ];
            }
        }
    }
}

async function startNewGame() {
    await checkAndFetchWords();
    
    if (words.length > 0) {
        currentWord = words.pop().toUpperCase();
        
        displayWord = Array(currentWord.length).fill("-");
        wordElement.textContent = displayWord.join("");
        
        attempts = [];
        lives = 10;
        attemptsElement.textContent = "Attempted letters: ";
        livesElement.textContent = "Lives: " + lives;
        
        createKeyboard();
        
        hangmanParts.forEach(part => {
            document.getElementById(part).style.display = "none";
        });
        
        gameOverElement.classList.remove("show");
    } else {
        alert("Could not load words. Please try again.");
    }
}

function guessLetter(letter) {
    const buttons = keyboardElement.querySelectorAll(".key");
    const button = Array.from(buttons).find(btn => btn.textContent === letter);
    
    // Disable the button after first click
    button.disabled = true;
    
    if (attempts.includes(letter)) {
        return;
    }
    
    attempts.push(letter);
    attemptsElement.textContent = "Attempted letters: " + attempts.join(", ");
    
    if (currentWord.includes(letter)) {
        // Find all occurrences of the letter
        const indices = [];
        for (let i = 0; i < currentWord.length; i++) {
            if (currentWord[i] === letter) {
                indices.push(i);
            }
        }
        
        // Find the first hidden occurrence
        const hiddenIndex = indices.find(index => displayWord[index] === "-");
        
        if (hiddenIndex !== undefined) {
            // Reveal only the first hidden occurrence
            displayWord[hiddenIndex] = letter;
            wordElement.textContent = displayWord.join("");
            
            button.classList.add("correct");
            
            // Check if all letters have been guessed
            if (!displayWord.includes("-")) {
                endGame(true);
            }
        }
    } else {
        // Wrong guess
        lives--;
        livesElement.textContent = "Lives: " + lives;
        
        button.classList.add("incorrect");
        
        const partToShow = hangmanParts[10 - lives - 1];
        if (partToShow) {
            document.getElementById(partToShow).style.display = "block";
        }
        
        if (lives === 0) {
            endGame(false);
        }
    }
}

function endGame(isWin) {
    gamesPlayed++;
    totalScore += lives;
    const averageScore = (totalScore / gamesPlayed).toFixed(2);
    statsElement.textContent = `Games played: ${gamesPlayed} | Average score: ${averageScore}`;
    
    if (isWin) {
        gameResultElement.textContent = "You Win!";
        gameResultElement.style.color = "#27ae60";
    } else {
        gameResultElement.textContent = "Game Over";
        gameResultElement.style.color = "#e74c3c";
        
        for (let i = 0; i < currentWord.length; i++) {
            displayWord[i] = currentWord[i];
        }
        wordElement.textContent = displayWord.join("");
    }
    
    revealedWordElement.textContent = currentWord;
    gameOverElement.classList.add("show");
    
    const buttons = keyboardElement.querySelectorAll(".key");
    buttons.forEach(button => {
        button.disabled = true;
    });
}


newGameButton.addEventListener("click", startNewGame);
playAgainButton.addEventListener("click", startNewGame);


document.addEventListener("keydown", (e) => {
    const key = e.key.toUpperCase();
    if (/^[A-Z]$/.test(key) && lives > 0 && !gameOverElement.classList.contains("show")) {
        guessLetter(key);
    }
});


async function initGame() {
    createKeyboard();
    try {
        words = await fetchWords(5);
        startNewGame();
    } catch (error) {
        console.error('Initial word fetch failed, using fallback words:', error);
        words = [
            "JAVASCRIPT", "HANGMAN", "PROGRAMMING", "COMPUTER", "KEYBOARD",
            "DEVELOPER", "ALGORITHM", "APPLICATION", "FUNCTION", "VARIABLE"
        ];
        startNewGame();
    }
}

initGame();