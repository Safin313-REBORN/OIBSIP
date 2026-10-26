# Oasis Infobyte SIP — Web Development & Designing
## Level 2 · Task 1: Calculator

**Project Name:** OmniCalc Studio — Precision Arithmetic & Scientific Calculator  
**Directory:** `OIBSIP/WebDev-L2-Calculator/`  
**Track:** Web Development & Designing  
**Tech Stack:** HTML5, CSS3 (CSS Grid, Glassmorphic Neumorphism), Vanilla JavaScript, Web Audio API  

---

### 📌 Project Overview
OmniCalc Studio is a browser-based calculator designed with an OLED dual-line digital screen, tactile button feedback, full keyboard integration, a slide-out calculation history drawer, and scientific operators. Engineered with a **safe custom Shunting-Yard tokenizer** that strictly avoids unsafe `eval()`.

---

### ✨ Feature Checklist (As per Oasis Infobyte Specification)
- [x] **Dual-Line Display Screen**: Displays the full running expression on top and large live input/evaluation result on the primary line.
- [x] **Numeric Keypad (0–9 & Decimal)**: Tactile responsive buttons with precision click animations.
- [x] **Operator Buttons**: Standard arithmetic operators ($+$, $-$, $\times$, $\div$), sign toggle ($\pm$), and percentage ($\%$).
- [x] **Scientific Functions**: Square root ($\sqrt{x}$), square ($x^2$), and parenthesis grouping (`(` and `)`).
- [x] **Equals (`=`) Evaluation**: Evaluates expressions using a safe reverse-polish notation (RPN) algorithm.
- [x] **Clear (`AC`) & Backspace (`⌫`)**: Reset screen and step-by-step character deletion.
- [x] **Zero Division Protection**: Intercepts division by zero and displays a user-friendly error message (`⚠️ Error: Cannot divide by zero`) without crashing.
- [x] **Operator Chaining**: Supports continuous sequential operations (e.g. $5 + 3 \times 2 = 11$) respecting operator precedence.
- [x] **CSS Grid Layout**: Strict button alignment with clean spacing and responsive sizing.
- [x] **Event Listeners**: Pure event delegation via `addEventListener` — zero inline `onclick` attributes.
- [x] **Hardware Keyboard Support**: Complete keyboard bindings for digits, operators, Enter, Backspace, and Escape.
- [x] **History Slide-Out Drawer**: Stores calculation history with 1-click recall into the calculator.

---

### 🚀 Getting Started & Preview
To run and preview this project locally:
1. Open `index.html` in any modern web browser.
2. Or serve via terminal:
   ```bash
   npx serve /home/safin313/.gemini/antigravity-ide/scratch/OIBSIP/WebDev-L2-Calculator
   ```
