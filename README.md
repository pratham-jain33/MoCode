# MoCode
![License: CC0-1.0](https://img.shields.io/badge/License-CC0--1.0-yellow.svg)
MoCode is a simple web-based Morse Code Translator built with vanilla JavaScript.
## Motivation
Provide an easy-to-use tool for converting between plain text and Morse code directly in the browser.
## Tech stack
- HTML
- CSS
- JavaScript (ES6)
## Features
- Translate text to Morse code and vice‑versa
- Input validation with helpful messages
- Copy translation to clipboard
- Translation history persisted in localStorage with clear and view options
- Camera and image upload placeholders for future extensions
- Notification system for user feedback
## Installation
```sh
git clone https://github.com/pratham-jain33/MoCode.git
cd MoCode
# Open the application in a browser
open index.html  # macOS
# or
start index.html  # Windows
# or simply open index.html manually
```
## Usage
1. Open `index.html` in a web browser.
2. Enter text or Morse code in the input field.
3. Click **Translate** to convert, or **Reverse** to decode.
4. Use **Copy** to copy the result, view **History**, or clear it.
## Build status
No continuous integration configured. Verify the project by opening `index.html` in a browser and testing the translation features.
## Code style
- 4‑space indentation
- camelCase variable and function names
- `const`/`let` for variable declarations
- Double quotes for string literals, template literals for messages
- Semicolons at end of statements
## Code example
```js
// Example: get Morse code for a character
console.log(morseCode['S']); // "..."
```
## API reference
The library does not expose a public API; functionality is accessed through the web UI. Internal objects include `morseCode`, `reverseMorseCode`, and DOM‑related helpers.
## Tests
No automated tests are included in this repository.

---

*Created with [repo-doctor](https://prathamjain.com/projects/repo-doctor)*
