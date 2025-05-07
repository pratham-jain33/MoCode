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
    cameraOptions: document.getElementById('camera-options'),
    takePhoto: document.getElementById('take-photo'),
    choosePhoto: document.getElementById('choose-photo'),
    imagePreviewContainer: document.getElementById('image-preview-container'),
    imagePreview: document.getElementById('image-preview'),
    cancelPreview: document.getElementById('cancel-preview'),
    notification: document.getElementById('notification'),
    openCamera: document.getElementById('open-camera'),
    imageUpload: document.getElementById('image-upload')
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
        elements.translate.disabled = true;
        return false;
    }
    
    elements.validation.classList.remove('show');
    elements.input.classList.remove('invalid');
    elements.translate.disabled = false;
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

// Notification Function
function showNotification(message, isError = false) {
    const notification = elements.notification;
    notification.textContent = message;
    notification.style.backgroundColor = isError ? '#ff4444' : '#4CAF50';
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Morse Sound Player
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

// Camera and Image Processing Functions
function setupCameraHandlers() {
    // Toggle camera options
    elements.openCamera.addEventListener('click', () => {
        elements.cameraOptions.classList.toggle('hidden');
    });

    // Take photo option
    elements.takePhoto.addEventListener('click', () => {
        elements.cameraOptions.classList.add('hidden');
        elements.imageUpload.setAttribute('capture', 'environment');
        elements.imageUpload.click();
    });

    // Choose photo option
    elements.choosePhoto.addEventListener('click', () => {
        elements.cameraOptions.classList.add('hidden');
        elements.imageUpload.removeAttribute('capture');
        elements.imageUpload.click();
    });

    // Cancel preview
    elements.cancelPreview.addEventListener('click', () => {
        elements.imagePreviewContainer.classList.add('hidden');
    });

    // Image upload handler
    elements.imageUpload.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Show image preview
        const reader = new FileReader();
        reader.onload = function(e) {
            elements.imagePreview.src = e.target.result;
            elements.imagePreviewContainer.classList.remove('hidden');
        };
        reader.readAsDataURL(file);

        // Show loading state
        const originalHTML = elements.openCamera.innerHTML;
        elements.openCamera.innerHTML = '<i class="fas fa-spinner fa-pulse"></i>';
        elements.openCamera.disabled = true;

        try {
            const { createWorker } = await import('https://cdn.jsdelivr.net/npm/tesseract.js@4/dist/tesseract.min.js');
            const worker = createWorker();
            await worker.load();
            await worker.loadLanguage('eng');
            await worker.initialize('eng');
            const { data: { text } } = await worker.recognize(file);
            
            elements.input.value = text.trim();
            showNotification('Text extracted successfully!');
            
        } catch (error) {
            console.error("OCR Error:", error);
            showNotification('Failed to read text from image', true);
        } finally {
            // Reset button
            elements.openCamera.innerHTML = originalHTML;
            elements.openCamera.disabled = false;
            e.target.value = ''; // Reset file input
            elements.imagePreviewContainer.classList.add('hidden');
        }
    });
}

// Event Listeners
function setupEventListeners() {
    validateInput();
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
        if (!elements.history.panel.classList.contains('hidden')) updateHistoryDisplay();
    });

    elements.history.clear.addEventListener('click', () => {
        translationHistory = [];
        localStorage.removeItem('morseHistory');
        updateHistoryDisplay();
    });
}

// Initialization
function init() {
    // Loader animation
    setTimeout(() => {
        document.querySelector('.loader').style.opacity = '0';
        setTimeout(() => document.querySelector('.loader').style.display = 'none', 500);
    }, 2500);
    
    // Setup all event listeners
    setupEventListeners();
    setupCameraHandlers();
    
    // Update history display
    updateHistoryDisplay();
}

window.addEventListener('load', init);

let clickCount = 0;
let lastClickTime = 0;
const logo = document.querySelector('h1');

logo.addEventListener('click', () => {
    const now = new Date().getTime();
    if (now - lastClickTime < 300) { // 300ms between clicks
        clickCount++;
        if (clickCount === 5) {
            toggleSecretTheme();
            clickCount = 0;
        }
    } else {
        clickCount = 1;
    }
    lastClickTime = now;
});

function toggleSecretTheme() {
    document.body.classList.toggle('secret-theme');
    if (document.body.classList.contains('secret-theme')) {
        showNotification('Secret theme activated!', false);
    } else {
        showNotification('Secret theme deactivated!', false);
    }
}

function showNotification(message, isError) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.padding = '10px 20px';
    notification.style.backgroundColor = isError ? '#ff4d4d' : '#00cc88';
    notification.style.color = '#fff';
    notification.style.borderRadius = '8px';
    notification.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';
    notification.style.zIndex = 1000;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}
