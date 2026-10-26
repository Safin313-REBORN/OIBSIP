/**
 * OmniCalc Studio — Safe Arithmetic Engine & Calculator Controller
 * Oasis Infobyte SIP — Level 2 Task 1: Calculator
 * Built WITHOUT eval() using custom tokenizer and operator precedence parser.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Screen Elements
  const screenHistory = document.getElementById('screenHistory');
  const screenMain = document.getElementById('screenMain');
  const screenStatus = document.getElementById('screenStatus');

  // History Drawer Elements
  const historyDrawer = document.getElementById('historyDrawer');
  const historyToggleBtn = document.getElementById('historyToggleBtn');
  const drawerCloseBtn = document.getElementById('drawerCloseBtn');
  const drawerContent = document.getElementById('drawerContent');
  const historyBadge = document.getElementById('historyBadge');
  const clearAllHistoryBtn = document.getElementById('clearAllHistoryBtn');

  // Audio Feedback Toggle
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  const soundIcon = document.getElementById('soundIcon');

  let currentExpression = '';
  let justEvaluated = false;
  let historyLogs = [];
  let isSoundEnabled = true;

  // Web Audio Context for Tactile Click Sound
  let audioCtx = null;
  function playClick() {
    if (!isSoundEnabled) return;
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(450, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.04);
    } catch (e) {}
  }

  soundToggleBtn.addEventListener('click', () => {
    isSoundEnabled = !isSoundEnabled;
    soundIcon.textContent = isSoundEnabled ? '🔊' : '🔇';
    showToast(isSoundEnabled ? 'Sound feedback on' : 'Sound feedback muted');
  });

  // 1. History Drawer Toggles
  historyToggleBtn.addEventListener('click', () => {
    historyDrawer.classList.toggle('open');
    const isOpen = historyDrawer.classList.contains('open');
    historyDrawer.setAttribute('aria-hidden', String(!isOpen));
  });

  drawerCloseBtn.addEventListener('click', () => {
    historyDrawer.classList.remove('open');
    historyDrawer.setAttribute('aria-hidden', 'true');
  });

  clearAllHistoryBtn.addEventListener('click', () => {
    historyLogs = [];
    renderHistory();
    historyBadge.textContent = '0';
    showToast('Calculation history cleared.');
  });

  // 2. Button Event Delegation (No inline onclick in HTML)
  const buttonGrid = document.getElementById('buttonGrid');
  buttonGrid.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    playClick();
    const action = btn.dataset.action;

    switch (action) {
      case 'number':
        handleNumber(btn.dataset.num);
        break;
      case 'operator':
        handleOperator(btn.dataset.op);
        break;
      case 'decimal':
        handleDecimal();
        break;
      case 'equals':
        handleEquals();
        break;
      case 'all-clear':
        handleAllClear();
        break;
      case 'backspace':
        handleBackspace();
        break;
      case 'negate':
        handleNegate();
        break;
      case 'percent':
        handlePercent();
        break;
      case 'sqrt':
        handleSqrt();
        break;
      case 'square':
        handleSquare();
        break;
      case 'bracket-open':
        handleBracket('(');
        break;
      case 'bracket-close':
        handleBracket(')');
        break;
    }
  });

  // 3. Calculator State Handlers
  function handleNumber(num) {
    clearStatus();
    if (justEvaluated) {
      currentExpression = '';
      justEvaluated = false;
    }

    if (currentExpression === '0') {
      currentExpression = num;
    } else {
      currentExpression += num;
    }
    updateDisplay();
  }

  function handleOperator(op) {
    clearStatus();
    if (justEvaluated) {
      justEvaluated = false;
    }

    if (currentExpression === '') {
      if (op === '−') {
        currentExpression = '-';
        updateDisplay();
        return;
      }
      return;
    }

    const lastChar = currentExpression.slice(-1);
    const ops = ['+', '−', '×', '÷'];

    if (ops.includes(lastChar)) {
      // Replace last operator
      currentExpression = currentExpression.slice(0, -1) + op;
    } else {
      currentExpression += op;
    }
    updateDisplay();
  }

  function handleDecimal() {
    clearStatus();
    if (justEvaluated) {
      currentExpression = '0';
      justEvaluated = false;
    }

    // Split expression into tokens to check if last number already has a decimal
    const tokens = currentExpression.split(/[\+\−\×\÷\(\)]/);
    const currentNum = tokens[tokens.length - 1];

    if (!currentNum.includes('.')) {
      if (currentNum === '' || currentExpression === '') {
        currentExpression += '0.';
      } else {
        currentExpression += '.';
      }
      updateDisplay();
    }
  }

  function handleBracket(bracket) {
    clearStatus();
    if (justEvaluated) {
      currentExpression = '';
      justEvaluated = false;
    }
    currentExpression += bracket;
    updateDisplay();
  }

  function handleAllClear() {
    currentExpression = '';
    screenHistory.textContent = '';
    screenMain.textContent = '0';
    clearStatus();
    justEvaluated = false;
  }

  function handleBackspace() {
    clearStatus();
    if (justEvaluated) {
      currentExpression = '';
      justEvaluated = false;
      updateDisplay();
      return;
    }

    if (currentExpression.length > 0) {
      currentExpression = currentExpression.slice(0, -1);
      updateDisplay();
    }
  }

  function handleNegate() {
    clearStatus();
    if (!currentExpression || currentExpression === '0') return;

    // Evaluate current number or negate expression
    try {
      const val = safeCalculate(currentExpression);
      currentExpression = String(-val);
      updateDisplay();
    } catch (e) {
      setStatus('Cannot negate complex expression');
    }
  }

  function handlePercent() {
    clearStatus();
    if (!currentExpression) return;
    try {
      const val = safeCalculate(currentExpression);
      const res = val / 100;
      logToHistory(`${currentExpression} %`, res);
      currentExpression = String(res);
      justEvaluated = true;
      updateDisplay();
    } catch (e) {
      setStatus('Invalid percentage operation');
    }
  }

  function handleSqrt() {
    clearStatus();
    if (!currentExpression) return;
    try {
      const val = safeCalculate(currentExpression);
      if (val < 0) {
        setStatus('⚠️ Error: Negative square root');
        return;
      }
      const res = Math.sqrt(val);
      logToHistory(`√(${currentExpression})`, res);
      currentExpression = String(res);
      justEvaluated = true;
      updateDisplay();
    } catch (e) {
      setStatus('Invalid square root operation');
    }
  }

  function handleSquare() {
    clearStatus();
    if (!currentExpression) return;
    try {
      const val = safeCalculate(currentExpression);
      const res = Math.pow(val, 2);
      logToHistory(`(${currentExpression})²`, res);
      currentExpression = String(res);
      justEvaluated = true;
      updateDisplay();
    } catch (e) {
      setStatus('Invalid square operation');
    }
  }

  function handleEquals() {
    if (!currentExpression) return;

    try {
      const expressionToEval = currentExpression;
      const result = safeCalculate(expressionToEval);

      if (!isFinite(result) || isNaN(result)) {
        setStatus('⚠️ Error: Cannot divide by zero');
        screenMain.textContent = 'Error';
        return;
      }

      screenHistory.textContent = `${expressionToEval} =`;
      currentExpression = formatResult(result);
      screenMain.textContent = currentExpression;
      justEvaluated = true;

      logToHistory(expressionToEval, currentExpression);
    } catch (err) {
      setStatus(err.message || '⚠️ Syntax Error');
      screenMain.textContent = 'Error';
    }
  }

  function updateDisplay() {
    screenMain.textContent = currentExpression === '' ? '0' : currentExpression;
  }

  function setStatus(msg) {
    screenStatus.textContent = msg;
  }

  function clearStatus() {
    screenStatus.textContent = '';
  }

  function formatResult(num) {
    if (Math.abs(num) >= 1e12 || (Math.abs(num) < 1e-6 && num !== 0)) {
      return num.toPrecision(8);
    }
    // Round floating point inaccuracies (e.g. 0.1 + 0.2 = 0.3)
    return String(Math.round((num + Number.EPSILON) * 1e10) / 1e10);
  }

  // 4. Safe Custom Math Evaluator (NO eval)
  // Tokenizes expression into numbers & operators, then uses Shunting-Yard algorithm
  function safeCalculate(rawExpr) {
    // Normalize operator symbols
    let expr = rawExpr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-');

    // Tokenize
    const tokens = [];
    let currentToken = '';

    for (let i = 0; i < expr.length; i++) {
      const char = expr[i];

      if ('0123456789.'.includes(char)) {
        currentToken += char;
      } else if ('+-*/()'.includes(char)) {
        // Handle negative unary numbers (e.g., at start or after an operator)
        if (char === '-' && (i === 0 || '+-*/('.includes(expr[i - 1]))) {
          currentToken += '-';
          continue;
        }

        if (currentToken !== '') {
          tokens.push(parseFloat(currentToken));
          currentToken = '';
        }
        tokens.push(char);
      }
    }
    if (currentToken !== '') {
      tokens.push(parseFloat(currentToken));
    }

    if (tokens.length === 0) return 0;

    // Shunting-Yard Algorithm to convert Infix to RPN (Reverse Polish Notation)
    const outputQueue = [];
    const operatorStack = [];
    const precedence = { '+': 1, '-': 1, '*': 2, '/': 2 };

    for (const token of tokens) {
      if (typeof token === 'number') {
        outputQueue.push(token);
      } else if ('+-*/'.includes(token)) {
        while (
          operatorStack.length > 0 &&
          '+-*/'.includes(operatorStack[operatorStack.length - 1]) &&
          precedence[operatorStack[operatorStack.length - 1]] >= precedence[token]
        ) {
          outputQueue.push(operatorStack.pop());
        }
        operatorStack.push(token);
      } else if (token === '(') {
        operatorStack.push(token);
      } else if (token === ')') {
        while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] !== '(') {
          outputQueue.push(operatorStack.pop());
        }
        if (operatorStack.length === 0) {
          throw new Error('⚠️ Mismatched parentheses');
        }
        operatorStack.pop(); // discard '('
      }
    }

    while (operatorStack.length > 0) {
      const op = operatorStack.pop();
      if (op === '(' || op === ')') {
        throw new Error('⚠️ Mismatched parentheses');
      }
      outputQueue.push(op);
    }

    // Evaluate RPN
    const evalStack = [];
    for (const token of outputQueue) {
      if (typeof token === 'number') {
        evalStack.push(token);
      } else {
        const b = evalStack.pop();
        const a = evalStack.pop();
        if (a === undefined || b === undefined) {
          throw new Error('⚠️ Incomplete expression');
        }

        let res = 0;
        switch (token) {
          case '+': res = a + b; break;
          case '-': res = a - b; break;
          case '*': res = a * b; break;
          case '/':
            if (b === 0) {
              throw new Error('⚠️ Cannot divide by zero');
            }
            res = a / b;
            break;
        }
        evalStack.push(res);
      }
    }

    if (evalStack.length !== 1) {
      throw new Error('⚠️ Invalid calculation syntax');
    }

    return evalStack[0];
  }

  // 5. History Logger
  function logToHistory(expr, result) {
    historyLogs.unshift({ expr, result });
    if (historyLogs.length > 20) historyLogs.pop();
    renderHistory();
    historyBadge.textContent = String(historyLogs.length);
  }

  function renderHistory() {
    if (historyLogs.length === 0) {
      drawerContent.innerHTML = '<div class="drawer-empty">No calculations recorded yet.</div>';
      return;
    }

    drawerContent.innerHTML = historyLogs.map((item, idx) => `
      <div class="history-card-item" data-idx="${idx}">
        <div class="history-expr">${item.expr} =</div>
        <div class="history-res">${item.result}</div>
      </div>
    `).join('');

    // Click item in history to recall into calculator
    document.querySelectorAll('.history-card-item').forEach(card => {
      card.addEventListener('click', () => {
        const idx = card.dataset.idx;
        const selected = historyLogs[idx];
        if (selected) {
          currentExpression = String(selected.result);
          screenHistory.textContent = `Recall: ${selected.expr}`;
          updateDisplay();
          clearStatus();
          playClick();
          showToast('Recalled value from history.');
        }
      });
    });
  }

  // 6. Keyboard Support
  window.addEventListener('keydown', (e) => {
    if (e.key >= '0' && e.key <= '9') {
      playClick();
      handleNumber(e.key);
    } else if (e.key === '.') {
      playClick();
      handleDecimal();
    } else if (e.key === '+') {
      playClick();
      handleOperator('+');
    } else if (e.key === '-') {
      playClick();
      handleOperator('−');
    } else if (e.key === '*') {
      playClick();
      handleOperator('×');
    } else if (e.key === '/') {
      e.preventDefault(); // avoid browser quick find
      playClick();
      handleOperator('÷');
    } else if (e.key === 'Enter' || e.key === '=') {
      e.preventDefault();
      playClick();
      handleEquals();
    } else if (e.key === 'Backspace') {
      playClick();
      handleBackspace();
    } else if (e.key === 'Escape') {
      playClick();
      handleAllClear();
    } else if (e.key === '(' || e.key === ')') {
      playClick();
      handleBracket(e.key);
    }
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
    }, 2800);
  }
});
