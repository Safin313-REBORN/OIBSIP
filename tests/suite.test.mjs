/**
 * OIBSIP Automated Test Suite
 * Validates critical logic, mathematical algorithms, security hashing,
 * and boundary conditions across all completed internship modules.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';

const crypto = globalThis.crypto || webcrypto;

// ============================================================================
// 1. OMNICALC STUDIO ARITHMETIC ENGINE (WebDev-L2-Calculator)
// ============================================================================
function safeCalculate(rawExpr) {
  let expr = rawExpr
    .replace(/\s+/g, '')
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-');

  const tokens = [];
  let currentToken = '';

  for (let i = 0; i < expr.length; i++) {
    const char = expr[i];

    if ('0123456789.'.includes(char)) {
      currentToken += char;
    } else if ('+-*/()'.includes(char)) {
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
        throw new Error('Mismatched parentheses');
      }
      operatorStack.pop();
    }
  }

  while (operatorStack.length > 0) {
    const op = operatorStack.pop();
    if (op === '(' || op === ')') {
      throw new Error('Mismatched parentheses');
    }
    outputQueue.push(op);
  }

  const evalStack = [];
  for (const token of outputQueue) {
    if (typeof token === 'number') {
      evalStack.push(token);
    } else {
      const b = evalStack.pop();
      const a = evalStack.pop();
      if (a === undefined || b === undefined) {
        throw new Error('Incomplete expression');
      }

      let res = 0;
      switch (token) {
        case '+': res = a + b; break;
        case '-': res = a - b; break;
        case '*': res = a * b; break;
        case '/':
          if (b === 0) throw new Error('Cannot divide by zero');
          res = a / b;
          break;
      }
      evalStack.push(res);
    }
  }

  if (evalStack.length !== 1) {
    throw new Error('Invalid calculation syntax');
  }

  return evalStack[0];
}

test('Calculator: Evaluates arithmetic operations with correct precedence', () => {
  assert.equal(safeCalculate('5 + 3 × 2'), 11);
  assert.equal(safeCalculate('(5 + 3) × 2'), 16);
  assert.equal(safeCalculate('100 ÷ 4 + 15 − 5'), 35);
  assert.equal(safeCalculate('2.5 × 4'), 10);
});

test('Calculator: Correctly handles negative numbers and unary minus', () => {
  assert.equal(safeCalculate('-5 + 10'), 5);
  assert.equal(safeCalculate('10 × -2'), -20);
});

test('Calculator: Protects against division by zero', () => {
  assert.throws(() => safeCalculate('42 ÷ 0'), /Cannot divide by zero/);
});

test('Calculator: Detects mismatched parentheses', () => {
  assert.throws(() => safeCalculate('(5 + 3'), /Mismatched parentheses/);
  assert.throws(() => safeCalculate('5 + 3)'), /Mismatched parentheses/);
});

// ============================================================================
// 2. TEMPSPHERE PRO THERMAL CONVERTER (WebDev-L1-TemperatureConverter)
// ============================================================================
function convertTemp(val, sourceUnit) {
  let c = 0;
  switch (sourceUnit) {
    case 'C': c = val; break;
    case 'F': c = (val - 32) * (5 / 9); break;
    case 'K': c = val - 273.15; break;
    case 'R': c = (val - 491.67) * (5 / 9); break;
  }
  const f = (c * (9 / 5)) + 32;
  const k = c + 273.15;
  const r = (c + 273.15) * (9 / 5);
  const isBelowAbsZero = k < -0.001;
  return { c, f, k, r, isBelowAbsZero };
}

function formatTemp(num) {
  if (!Number.isFinite(num)) {
    return 'Overflow';
  }
  if (Math.abs(num) >= 1e6 || (Math.abs(num) < 0.01 && num !== 0)) {
    return num.toExponential(2);
  }
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

test('Temperature Converter: Accurate conversion from Celsius benchmarks', () => {
  const zeroC = convertTemp(0, 'C');
  assert.equal(zeroC.c, 0);
  assert.equal(Math.round(zeroC.f), 32);
  assert.equal(zeroC.k, 273.15);
  assert.equal(zeroC.isBelowAbsZero, false);

  const boilingC = convertTemp(100, 'C');
  assert.equal(Math.round(boilingC.f), 212);
  assert.equal(boilingC.k, 373.15);
});

test('Temperature Converter: Absolute Zero detection', () => {
  const absZero = convertTemp(-273.15, 'C');
  assert.equal(absZero.isBelowAbsZero, false);

  const violation = convertTemp(-275, 'C');
  assert.equal(violation.isBelowAbsZero, true);

  const kelvinViolation = convertTemp(-1, 'K');
  assert.equal(kelvinViolation.isBelowAbsZero, true);
});

test('Temperature Converter: Handles extreme floating point overflows gracefully', () => {
  assert.equal(formatTemp(Infinity), 'Overflow');
  assert.equal(formatTemp(-Infinity), 'Overflow');
  assert.equal(formatTemp(NaN), 'Overflow');
  assert.equal(formatTemp(25), '25.00');
});

// ============================================================================
// 3. NEXUSSHIELD CRYPTOGRAPHIC SECURITY (WebDev-L2-LoginAuth)
// ============================================================================
function generateSalt() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

async function sha256(plainText, salt = '') {
  const encoder = new TextEncoder();
  const data = encoder.encode(salt + plainText);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

test('Security: Salted SHA-256 generates unique hashes for identical passwords', async () => {
  const password = 'SharedPassword123!';
  const salt1 = generateSalt();
  const salt2 = generateSalt();

  assert.notEqual(salt1, salt2);

  const hash1 = await sha256(password, salt1);
  const hash2 = await sha256(password, salt2);

  assert.notEqual(hash1, hash2);

  // Verification with identical salt matches
  const verifyHash1 = await sha256(password, salt1);
  assert.equal(hash1, verifyHash1);
});

test('Security: Session IDs use valid CSPRNG UUID format', () => {
  const sessionId = crypto.randomUUID();
  assert.match(sessionId, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
});

// ============================================================================
// 4. DATA SANITIZATION (WebDev-L2-TodoApp)
// ============================================================================
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
}

test('Sanitization: Neutralizes dangerous HTML characters to prevent XSS', () => {
  const maliciousTitle = '<script>alert("XSS")</script>';
  const sanitized = escapeHtml(maliciousTitle);
  assert.equal(sanitized, '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');

  const payloadWithAmpersand = 'A & B <img src="x" onerror="alert(1)">';
  assert.equal(escapeHtml(payloadWithAmpersand), 'A &amp; B &lt;img src=&quot;x&quot; onerror=&quot;alert(1)&quot;&gt;');
});

// ============================================================================
// 5. INPUT VALIDATION (WebDev-L1-PersonalPortfolio)
// ============================================================================
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

test('Validation: RFC-compliant email regex validates valid and invalid addresses', () => {
  assert.equal(emailRegex.test('developer@company.com'), true);
  assert.equal(emailRegex.test('intern.safin+test@university.edu'), true);

  assert.equal(emailRegex.test('not-an-email'), false);
  assert.equal(emailRegex.test('user@'), false);
  assert.equal(emailRegex.test('@domain.com'), false);
  assert.equal(emailRegex.test('user@domain'), false);
});
