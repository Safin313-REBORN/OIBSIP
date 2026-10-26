# Oasis Infobyte SIP — Web Development & Designing
## Level 1 · Task 3: Temperature Converter Website

**Project Name:** TempSphere Pro — Precision Thermal Converter & Thermodynamics Visualizer  
**Directory:** `OIBSIP/WebDev-L1-TemperatureConverter/`  
**Track:** Web Development & Designing  
**Tech Stack:** HTML5, CSS3, Vanilla JavaScript (ES6+), Web Audio API  

---

### 📌 Project Overview
TempSphere Pro is an interactive scientific calculation dashboard that converts temperature values between **Celsius (°C)**, **Fahrenheit (°F)**, **Kelvin (K)**, and **Rankine (°R)** with real-time numeric validation, automated multi-unit outputs, dynamic mercury thermometer fluid animations, and strict thermodynamic absolute zero constraints.

---

### ✨ Feature Checklist (As per Oasis Infobyte Specification)
- [x] **Numeric Input Field**: Large formatted input field for user entry with quick clear button and Enter key execution.
- [x] **Strict Input Validation**: Rejects non-numeric characters in real-time, displays an immediate explanatory error banner, and applies a visual shake state.
- [x] **Unit Selector**: Interactive unit toggle buttons for Celsius, Fahrenheit, Kelvin, and Rankine with ARIA radio accessibility.
- [x] **Simultaneous Multi-Unit Output**: Displays converted values across all four temperature units concurrently in dedicated interactive result tiles.
- [x] **Conversion Triggering**: Supports both instant **Auto-Convert** (as you type) and manual **Convert Button** execution.
- [x] **Edge Case Handling (Absolute Zero)**: Detects physics violations whenever temperatures drop below absolute zero ($0\text{ K} / -273.15\text{ °C} / -459.67\text{ °F}$). Displays an amber/red scientific warning explaining the laws of thermodynamics.
- [x] **Live Mercury Thermometer Tube**: Dynamic visual fluid column and bulb that rises/falls with temperature and morphs color according to thermal classification.
- [x] **Thermal State Classifier**: Categorizes the current temperature into distinct physical zones (*Absolute Zero Violation, Deep Cryogenic, Freezing, Cool, Room Temperature, Human Body, Boiling, Stellar Plasma*).
- [x] **Mathematical Derivation Card**: Displays the step-by-step mathematical conversion formulas applied.
- [x] **Quick Scientific Presets**: 1-click benchmarks for Absolute Zero, Water Freezing Point, Room Temperature, Human Body, and Water Boiling Point.
- [x] **Session Conversion History**: Log of past calculations with timestamps and 1-click reloading.
- [x] **Clipboard Copy & Audio Feedback**: 1-click copy on all output tiles and synthesized audio feedback via the Web Audio API.

---

### 🚀 Getting Started & Preview
To run and preview this project locally:
1. Open `index.html` in any modern web browser.
2. Or serve via terminal:
   ```bash
   npx serve /home/safin313/.gemini/antigravity-ide/scratch/OIBSIP/WebDev-L1-TemperatureConverter
   ```
