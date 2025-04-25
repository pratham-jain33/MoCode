const morseCode = {
    "A": ".-",
    "B": "-...",
    "C": "-.-.",
    "D": "-..",
    "E": ".",
    "F": "..-.",
    "G": "--.",
    "H": "....",
    "I": "..",
    "J": ".---",
    "K": "-.-",
    "L": ".-..",
    "M": "--",
    "N": "-.",
    "O": "---",
    "P": ".--.",
    "Q": "--.-",
    "R": ".-.",
    "S": "...",
    "T": "-",
    "U": "..-",
    "V": "...-",
    "W": ".--",
    "X": "-..-",
    "Y": "-.--",
    "Z": "--..",
    "0": "-----",
    "1": ".----",
    "2": "..---",
    "3": "...--",
    "4": "....-",
    "5": ".....",
    "6": "-....",
    "7": "--...",
    "8": "---..",
    "9": "----.",
    "!": "-.-.--",
    "(": "-.--.",
    ")": "-.--.-",
    "&": ".-...",
    ":": "---...",
    ",": "--..--",
    "=": "-...-",
    ".": ".-.-.-",
    "-": "-....-",
    "+": ".-.-.",
    "\"": ".-..-.",
    "?": "..--..",
    "/": "-..-."
};

const reverseMorseCode = {};
for (const key in morseCode) {
    if (morseCode.hasOwnProperty(key)) {
        const value = morseCode[key];
        reverseMorseCode[value] = key;
    }
}

const inputField = document.getElementById("input");
const translateButton = document.getElementById("translate");
const outputField = document.getElementById("output");
const copyButton = document.getElementById("copy");

translateButton.addEventListener("click", () => {
    const inputText = inputField.value.trim().toUpperCase();
    if (inputText === "") {
        outputField.value = "Enter Text or Morse Code";
        return;
    }

    if (inputText.includes(".")) {
        const morseWords = inputText.split("/");
        const translatedWords = morseWords.map(morseWord => {
            const morseChars = morseWord.split(" ");
            return morseChars
                .map((morseChar) => reverseMorseCode[morseChar] || morseChar)
                .join("");
        });
        outputField.value = translatedWords.join(" ");
    } else {
        const words = inputText.split(" ");
        const translatedWords = words.map(word => {
            const chars = word.split("");
            const morseChars = chars.map((char) => morseCode[char] || char);
            return morseChars.join(" ");
        });
        outputField.value = translatedWords.join("/");
    }
});
copyButton.addEventListener("click", () => {
    outputField.select();
    document.execCommand("copy");
})
