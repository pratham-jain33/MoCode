// Morse Code Dictionary
const morseCode = {
    "A": ".-", "B": "-...", "C": "-.-.", "D": "-..", "E": ".", "F": "..-.", 
    "G": "--.", "H": "....", "I": "..", "J": ".---", "K": "-.-", "L": ".-..", 
    "M": "--", "N": "-.", "O": "---", "P": ".--.", "Q": "--.-", "R": ".-.", 
    "S": "...", "T": "-", "U": "..-", "V": "...-", "W": ".--", "X": "-..-", 
    "Y": "-.--", "Z": "--..", "0": "-----", "1": ".----", "2": "..---", 
    "3": "...--", "4": "....-", "5": ".....", "6": "-....", "7": "--...", 
    "8": "---..", "9": "----.", "!": "-.-.--", "(": "-.--.", ")": "-.--.-", 
    "&": ".-...", ":": "---...", ",": "--..--", "=": "-...-", "-": "-....-", 
    "+": ".-.-.", "?": "..--..", "/": "-..-."
};

// Create reverse dictionary
const reverseMorseCode = {};
Object.entries(morseCode).forEach(([key, value]) => reverseMorseCode[value] = key);

// DOM Elements
const elements = {
    input: document.getElementById("input"),
    output: document.getElementById("output"),
    validation: document.getElementById("validation-message"),
    translate: document.getElementById("translate"),
    copy: document.getElementById("copy"),
    test: document.getElementById("test"),
    reverse: document.getElementById("reverse"),
    history: {
        panel: document.getElementById("history-panel"),
        list: document.getElementById("history-list"),
        show: document.getElementById("show-history"),
        clear: document.getElementById("clear-history")
    },
    
};

// State
let translationHistory = JSON.parse(localStorage.getItem('morseHistory')) || [];


// Input Validation
function validateInput() {
    const text = elements.input.value;
    const invalidChars = [];
    
    if (text.includes('.') || text.includes('-')) {
        // Morse code validation
        text.split('').forEach(c => {
            if (![' ', '/', '.', '-'].includes(c) && !reverseMorseCode[c]) {
                invalidChars.push(c);
            }
        });
    } else {
        // Text validation
        text.toUpperCase().split('').forEach(c => {
            if (c !== ' ' && c !== '/' && !morseCode[c] && c !== '\n') {
                invalidChars.push(c);
            }
        });
    }

    if (invalidChars.length > 0) {
        elements.validation.textContent = `Invalid characters: ${[...new Set(invalidChars)].join(', ')}`;
        elements.validation.classList.add('show');
        elements.input.classList.add('invalid');
        return false;
    }
    
    elements.validation.classList.remove('show');
    elements.input.classList.remove('invalid');
    return true;
}

// Translation Functions
function translateText() {
    if (!validateInput()) return;
    
    const text = elements.input.value.trim();
    if (!text) {
        elements.output.value = "Enter Text or Morse Code";
        return;
    }

    elements.output.value = text.includes(".") || text.includes("-") 
        ? morseToText(text) 
        : textToMorse(text);
    
    addToHistory(text, elements.output.value);
}

function morseToText(morse) {
    return morse.split("/").map(word => 
        word.trim().split(" ")
           .map(symbol => reverseMorseCode[symbol] || symbol)
           .join("")
    ).join(" ");
}

function textToMorse(text) {
    return text.toUpperCase().split(" ").map(word => 
        word.split("").map(char => morseCode[char] || char).join(" ")
    ).join("/");
}

// History Functions
function addToHistory(input, output) {
    if (!translationHistory.some(item => item.input === input && item.output === output)) {
        translationHistory.unshift({ input, output, timestamp: new Date().toLocaleString() });
        translationHistory = translationHistory.slice(0, 10);
        localStorage.setItem('morseHistory', JSON.stringify(translationHistory));
        updateHistoryDisplay();
    }
}

function updateHistoryDisplay() {
    elements.history.list.innerHTML = translationHistory.map(item => `
        <div class="history-item">
            <div>${item.input}</div>
            <div>→ ${item.output}</div>
            <small>${item.timestamp}</small>
        </div>
    `).join('') || '<div class="history-item">No history yet</div>';
}



// Event Listeners
elements.input.addEventListener('input', validateInput);
elements.translate.addEventListener("click", translateText);

elements.copy.addEventListener("click", () => {
    elements.output.select();
    document.execCommand("copy");
    elements.copy.innerHTML = '<i class="fas fa-check"></i>';
    setTimeout(() => elements.copy.innerHTML = '<i class="far fa-copy"></i>', 2000);
});

elements.test.addEventListener("click", () => {
    if (elements.output.value) {
        elements.test.classList.add('playing');
        playMorseSound(elements.output.value);
        setTimeout(() => elements.test.classList.remove('playing'), 2000);
    }
});

elements.reverse.addEventListener("click", () => {
    if (elements.output.value) {
        [elements.input.value, elements.output.value] = [elements.output.value, elements.input.value];
        elements.reverse.classList.add('active');
        setTimeout(() => elements.reverse.classList.remove('active'), 1000);
        if (elements.input.value.trim()) translateText();
    }
});

elements.history.show.addEventListener('click', () => {
    elements.history.panel.classList.toggle('hidden');
    if (!elements.history.panel.classList.contains('hsory')) updateHistoryDisplay();
});

elements.history.clear.addEventListener('click', () => {
    translationHistory = [];
    localStorage.removeItem('morseHistory');
    updateHistoryDisplay();
});


// Initialization
window.addEventListener('load', () => {
    setTimeout(() => {
        document.querySelector('.loader').style.opacity = '0';
        setTimeout(() => document.querySelector('.loader').style.display = 'none', 500);
    }, 2500);
    updateHistoryDisplay();
});

// Morse Sound Player (unchanged)
function playMorseSound(code) {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain).connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.value = 600;
    
    let time = ctx.currentTime;
    const timing = { '.': 0.1, '-': 0.3, ' ': 0.3, '/': 0.7 };
    
    code.split('').forEach(char => {
        if (char === '.' || char === '-') {
            gain.gain.setValueAtTime(1, time);
            time += timing[char];
            gain.gain.setValueAtTime(0, time);
            time += 0.1;
        } else if (timing[char]) {
            time += timing[char] - 0.1;
        }
    });
    
    osc.start();
    osc.stop(time);
}
