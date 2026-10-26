/**
 * TempSphere Pro — Interactive Thermal Calculations & Visualization
 * Oasis Infobyte SIP — Level 1 Task 3: Temperature Converter
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const tempInput = document.getElementById('tempInput');
  const inputClearBtn = document.getElementById('inputClearBtn');
  const inputError = document.getElementById('inputError');
  const unitButtons = document.querySelectorAll('.unit-btn');
  const convertBtn = document.getElementById('convertBtn');
  const resetBtn = document.getElementById('resetBtn');
  const liveModeCheckbox = document.getElementById('liveModeCheckbox');

  const absZeroAlert = document.getElementById('absZeroAlert');
  const absZeroLimitText = document.getElementById('absZeroLimitText');
  const formulaBox = document.getElementById('formulaBox');
  const formulaDesc = document.getElementById('formulaDesc');

  const stateEmoji = document.getElementById('stateEmoji');
  const stateTitle = document.getElementById('stateTitle');
  const stateDesc = document.getElementById('stateDesc');

  const valC = document.getElementById('valC');
  const valF = document.getElementById('valF');
  const valK = document.getElementById('valK');
  const valR = document.getElementById('valR');

  const mercuryFill = document.getElementById('mercuryFill');
  const historyList = document.getElementById('historyList');
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  const soundIcon = document.getElementById('soundIcon');

  let currentSourceUnit = 'C';
  let isSoundEnabled = true;
  let sessionHistory = [];

  // Audio Context for Tactile Feedback
  let audioCtx = null;
  function playClickSound() {
    if (!isSoundEnabled) return;
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.05);
    } catch (e) {
      // Audio not permitted or supported
    }
  }

  // 1. Sound Toggle
  soundToggleBtn.addEventListener('click', () => {
    isSoundEnabled = !isSoundEnabled;
    soundIcon.textContent = isSoundEnabled ? '🔊' : '🔇';
    showToast(isSoundEnabled ? 'Audio feedback enabled' : 'Audio feedback muted');
  });

  // 2. Unit Button Selection
  unitButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      unitButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-checked', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-checked', 'true');
      currentSourceUnit = btn.dataset.unit;
      playClickSound();
      performConversion();
    });
  });

  // 3. Clear Input Button
  inputClearBtn.addEventListener('click', () => {
    tempInput.value = '';
    tempInput.focus();
    inputError.classList.remove('active');
    tempInput.classList.remove('invalid');
  });

  // 4. Input Events with Real-Time Validation
  tempInput.addEventListener('input', () => {
    const rawVal = tempInput.value.trim();

    // Check if input is valid number or empty or negative sign
    if (rawVal === '' || rawVal === '-') {
      inputError.classList.remove('active');
      tempInput.classList.remove('invalid');
      return;
    }

    if (isNaN(Number(rawVal))) {
      inputError.textContent = '⚠️ Invalid entry: Please input a valid numeric value only.';
      inputError.classList.add('active');
      tempInput.classList.add('invalid');
      return;
    } else {
      inputError.classList.remove('active');
      tempInput.classList.remove('invalid');
    }

    if (liveModeCheckbox.checked) {
      performConversion(false);
    }
  });

  // Convert on Enter key
  tempInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      performConversion(true);
    }
  });

  // 5. Convert & Reset Buttons
  convertBtn.addEventListener('click', () => {
    playClickSound();
    performConversion(true);
  });

  resetBtn.addEventListener('click', () => {
    tempInput.value = '25';
    currentSourceUnit = 'C';
    unitButtons.forEach(b => {
      b.classList.toggle('active', b.dataset.unit === 'C');
      b.setAttribute('aria-checked', b.dataset.unit === 'C' ? 'true' : 'false');
    });
    inputError.classList.remove('active');
    tempInput.classList.remove('invalid');
    playClickSound();
    performConversion(false);
    showToast('Reset to default values (25°C).');
  });

  // 6. Scientific Presets
  document.querySelectorAll('.preset-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      tempInput.value = pill.dataset.val;
      currentSourceUnit = pill.dataset.unit;
      unitButtons.forEach(b => {
        b.classList.toggle('active', b.dataset.unit === currentSourceUnit);
        b.setAttribute('aria-checked', b.dataset.unit === currentSourceUnit ? 'true' : 'false');
      });
      playClickSound();
      performConversion(true);
    });
  });

  // 7. Core Conversion Mathematics & Logic
  function performConversion(logHistory = false) {
    const rawVal = tempInput.value.trim();
    if (rawVal === '' || isNaN(Number(rawVal))) return;

    const inputNumber = parseFloat(rawVal);
    let celsiusVal = 0;

    // Step A: Convert input unit to Base Celsius
    switch (currentSourceUnit) {
      case 'C':
        celsiusVal = inputNumber;
        break;
      case 'F':
        celsiusVal = (inputNumber - 32) * (5 / 9);
        break;
      case 'K':
        celsiusVal = inputNumber - 273.15;
        break;
      case 'R':
        celsiusVal = (inputNumber - 491.67) * (5 / 9);
        break;
    }

    // Step B: Calculate all other units from Base Celsius
    const c = celsiusVal;
    const f = (c * (9 / 5)) + 32;
    const k = c + 273.15;
    const r = (c + 273.15) * (9 / 5);

    // Format results to 2 decimal places
    valC.textContent = formatTemp(c);
    valF.textContent = formatTemp(f);
    valK.textContent = formatTemp(k);
    valR.textContent = formatTemp(r);

    // Step C: Absolute Zero Violation Check
    // Absolute Zero is 0 Kelvin or -273.15 °C
    const isBelowAbsZero = k < -0.001; // small float epsilon
    if (isBelowAbsZero) {
      absZeroAlert.classList.add('active');
      let limitStr = '-273.15 °C';
      if (currentSourceUnit === 'F') limitStr = '-459.67 °F';
      if (currentSourceUnit === 'K') limitStr = '0.00 K';
      if (currentSourceUnit === 'R') limitStr = '0.00 °R';
      absZeroLimitText.textContent = limitStr;
    } else {
      absZeroAlert.classList.remove('active');
    }

    // Step D: Formula & Derivation Generator
    generateFormulaDisplay(inputNumber, currentSourceUnit, c, f, k, r);

    // Step E: Thermal Classification & Theme Color Adaptation
    updateThermalState(c, isBelowAbsZero);

    // Step F: Animate Mercury Stem Height
    updateMercuryLevel(c);

    // Step G: Add to Session History
    if (logHistory) {
      addHistoryItem(inputNumber, currentSourceUnit, c, f, k);
    }
  }

  function formatTemp(num) {
    if (Math.abs(num) >= 1e6 || (Math.abs(num) < 0.01 && num !== 0)) {
      return num.toExponential(2);
    }
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function generateFormulaDisplay(val, unit, c, f, k, r) {
    let mathStr = '';
    let explanation = '';

    if (unit === 'C') {
      mathStr = `(${val}°C × 9/5) + 32 = ${formatTemp(f)}°F  |  ${val}°C + 273.15 = ${formatTemp(k)}K`;
      explanation = 'Formula: Multiply by 9/5 and add 32 for Fahrenheit; add 273.15 for Kelvin.';
    } else if (unit === 'F') {
      mathStr = `(${val}°F − 32) × 5/9 = ${formatTemp(c)}°C  |  (${val}°F + 459.67) × 5/9 = ${formatTemp(k)}K`;
      explanation = 'Formula: Subtract 32 and multiply by 5/9 for Celsius.';
    } else if (unit === 'K') {
      mathStr = `${val}K − 273.15 = ${formatTemp(c)}°C  |  (${val}K × 9/5) − 459.67 = ${formatTemp(f)}°F`;
      explanation = 'Formula: Subtract 273.15 for Celsius; multiply by 1.8 and subtract 459.67 for Fahrenheit.';
    } else {
      mathStr = `(${val}°R − 491.67) × 5/9 = ${formatTemp(c)}°C  |  ${val}°R × 5/9 = ${formatTemp(k)}K`;
      explanation = 'Formula: Subtract 491.67 and multiply by 5/9 for Celsius.';
    }

    formulaBox.innerHTML = `<code>${mathStr}</code>`;
    formulaDesc.textContent = explanation;
  }

  function updateThermalState(c, isBelowAbsZero) {
    const root = document.documentElement;

    if (isBelowAbsZero) {
      stateEmoji.textContent = '⚠️';
      stateTitle.textContent = 'Absolute Zero Violation';
      stateDesc.textContent = 'Below 0 Kelvin. Physical temperature floor exceeded.';
      setThemeColor('#ef4444', 'rgba(239, 68, 68, 0.4)');
      return;
    }

    if (c <= -150) {
      stateEmoji.textContent = '🌌';
      stateTitle.textContent = 'Deep Cryogenic';
      stateDesc.textContent = 'Liquid nitrogen / interstellar space temperature range.';
      setThemeColor('#38bdf8', 'rgba(56, 189, 248, 0.4)');
    } else if (c <= 0) {
      stateEmoji.textContent = '❄️';
      stateTitle.textContent = 'Freezing / Sub-Zero';
      stateDesc.textContent = 'Water is frozen solid into ice (≤ 0°C / 32°F).';
      setThemeColor('#06b6d4', 'rgba(6, 182, 212, 0.4)');
    } else if (c > 0 && c <= 15) {
      stateEmoji.textContent = '🧣';
      stateTitle.textContent = 'Cool Weather';
      stateDesc.textContent = 'Brisk autumn ambient temperature.';
      setThemeColor('#2dd4bf', 'rgba(45, 212, 191, 0.4)');
    } else if (c > 15 && c <= 26) {
      stateEmoji.textContent = '🛋️';
      stateTitle.textContent = 'Room Temperature';
      stateDesc.textContent = 'Optimal human indoor thermal comfort zone (18°C – 25°C).';
      setThemeColor('#10b981', 'rgba(16, 185, 129, 0.4)');
    } else if (c > 26 && c <= 38) {
      stateEmoji.textContent = '❤️';
      stateTitle.textContent = 'Human Body / Warm';
      stateDesc.textContent = 'Standard human core body temperature (~37°C / 98.6°F).';
      setThemeColor('#f59e0b', 'rgba(245, 158, 11, 0.4)');
    } else if (c > 38 && c < 100) {
      stateEmoji.textContent = '♨️';
      stateTitle.textContent = 'Hot / Scalding';
      stateDesc.textContent = 'High thermal energy. Hot bath or desert heatwave.';
      setThemeColor('#f97316', 'rgba(249, 115, 22, 0.4)');
    } else if (c >= 100 && c < 500) {
      stateEmoji.textContent = '🔥';
      stateTitle.textContent = 'Water Boiling Point';
      stateDesc.textContent = 'Water vaporizes into steam at 1 atm pressure (≥ 100°C / 212°F).';
      setThemeColor('#ef4444', 'rgba(239, 68, 68, 0.4)');
    } else {
      stateEmoji.textContent = '⚡';
      stateTitle.textContent = 'Plasma / Stellar Heat';
      stateDesc.textContent = 'Extreme thermodynamic energy states.';
      setThemeColor('#ec4899', 'rgba(236, 72, 153, 0.4)');
    }
  }

  function setThemeColor(hex, glow) {
    document.documentElement.style.setProperty('--thermal-color', hex);
    document.documentElement.style.setProperty('--thermal-glow', glow);
  }

  function updateMercuryLevel(c) {
    // Map -50°C to 100°C to a percentage between 8% and 94%
    const minC = -50;
    const maxC = 100;
    const clampedC = Math.max(minC, Math.min(maxC, c));
    const pct = ((clampedC - minC) / (maxC - minC)) * 86 + 8;
    mercuryFill.style.height = `${pct}%`;
  }

  // 8. Clipboard Copy Buttons
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const targetId = btn.dataset.copy;
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        const text = targetEl.textContent;
        try {
          await navigator.clipboard.writeText(text);
          showToast(`✓ Copied ${text} to clipboard!`);
          playClickSound();
        } catch (e) {
          showToast(`Value: ${text}`);
        }
      }
    });
  });

  // 9. Session History Management
  function addHistoryItem(val, unit, c, f, k) {
    const item = {
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      entry: `${val} °${unit}`,
      result: `${formatTemp(c)}°C / ${formatTemp(f)}°F / ${formatTemp(k)}K`,
      rawVal: val,
      rawUnit: unit
    };

    sessionHistory.unshift(item);
    if (sessionHistory.length > 8) sessionHistory.pop();
    renderHistory();
  }

  function renderHistory() {
    if (sessionHistory.length === 0) {
      historyList.innerHTML = '<div class="history-empty">No conversions logged yet.</div>';
      return;
    }

    historyList.innerHTML = sessionHistory.map(h => `
      <div class="history-item" data-val="${h.rawVal}" data-unit="${h.rawUnit}">
        <div>
          <strong>${h.entry}</strong>
          <span style="color: var(--text-muted); margin-left: 8px;">→ ${h.result}</span>
        </div>
        <small style="color: var(--text-dim);">${h.timestamp}</small>
      </div>
    `).join('');

    // Click history item to reload
    document.querySelectorAll('.history-item').forEach(item => {
      item.addEventListener('click', () => {
        tempInput.value = item.dataset.val;
        currentSourceUnit = item.dataset.unit;
        unitButtons.forEach(b => {
          b.classList.toggle('active', b.dataset.unit === currentSourceUnit);
          b.setAttribute('aria-checked', b.dataset.unit === currentSourceUnit ? 'true' : 'false');
        });
        playClickSound();
        performConversion(false);
      });
    });
  }

  clearHistoryBtn.addEventListener('click', () => {
    sessionHistory = [];
    renderHistory();
    showToast('Session history cleared.');
  });

  // Toast Function
  function showToast(msg) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // Initial Calculation on Load
  performConversion(false);
});
