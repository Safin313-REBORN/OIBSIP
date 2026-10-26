/**
 * NexusShield — Client-Side Authentication Engine
 * Oasis Infobyte SIP — Level 2 Task 4: Login Authentication System
 * Features SHA-256 Web Crypto Hashing, Duplicate Verification & Protected Routes.
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Tabs & Views
  const tabLoginBtn = document.getElementById('tabLoginBtn');
  const tabRegisterBtn = document.getElementById('tabRegisterBtn');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const authSection = document.getElementById('authSection');
  const dashboardSection = document.getElementById('dashboardSection');

  // Alert Banner
  const authAlert = document.getElementById('authAlert');
  const alertIcon = document.getElementById('alertIcon');
  const alertMsg = document.getElementById('alertMsg');

  // Login Form Elements
  const loginUser = document.getElementById('loginUser');
  const loginPassword = document.getElementById('loginPassword');
  const rememberMeCheckbox = document.getElementById('rememberMeCheckbox');
  const demoAccountBtn = document.getElementById('demoAccountBtn');

  // Register Form Elements
  const regFullName = document.getElementById('regFullName');
  const regUsername = document.getElementById('regUsername');
  const regEmail = document.getElementById('regEmail');
  const regPassword = document.getElementById('regPassword');
  const regConfirmPassword = document.getElementById('regConfirmPassword');
  const matchError = document.getElementById('matchError');

  // Password Strength Elements
  const strengthBarFill = document.getElementById('strengthBarFill');
  const strengthText = document.getElementById('strengthText');
  const ruleLength = document.getElementById('ruleLength');
  const ruleNumber = document.getElementById('ruleNumber');
  const ruleLetter = document.getElementById('ruleLetter');

  // Dashboard Elements
  const dashFullName = document.getElementById('dashFullName');
  const dashUsername = document.getElementById('dashUsername');
  const dashEmail = document.getElementById('dashEmail');
  const dashAvatar = document.getElementById('dashAvatar');
  const dashSessionId = document.getElementById('dashSessionId');
  const dashLoginTime = document.getElementById('dashLoginTime');
  const logoutBtn = document.getElementById('logoutBtn');
  const auditLogBody = document.getElementById('auditLogBody');

  // Brute Force Protection Tracking
  let failedAttempts = 0;
  let isLockedOut = false;
  let lockoutInterval = null;

  // 1. Password Hashing Utility (Salted SHA-256 via Web Crypto API)
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

  // 2. Persistent Lockout Cooldown Checker (Prevents Page Reload Bypass)
  function checkPersistentLockout() {
    const lockoutUntil = parseInt(localStorage.getItem('nexus_lockout_until') || '0', 10);
    const now = Date.now();
    if (now < lockoutUntil) {
      const remainingSec = Math.ceil((lockoutUntil - now) / 1000);
      isLockedOut = true;
      startLockoutCountdown(remainingSec);
      return true;
    } else {
      isLockedOut = false;
      localStorage.removeItem('nexus_lockout_until');
      return false;
    }
  }

  function startLockoutCountdown(seconds) {
    if (lockoutInterval) clearInterval(lockoutInterval);
    let countdown = seconds;
    const loginSubmitBtn = document.getElementById('loginSubmitBtn');
    if (loginSubmitBtn) loginSubmitBtn.disabled = true;
    showAlert(`⚠️ Too many failed attempts. Login locked for ${countdown}s.`, 'error');

    lockoutInterval = setInterval(() => {
      countdown--;
      if (countdown <= 0) {
        clearInterval(lockoutInterval);
        lockoutInterval = null;
        isLockedOut = false;
        failedAttempts = 0;
        if (loginSubmitBtn) loginSubmitBtn.disabled = false;
        localStorage.removeItem('nexus_lockout_until');
        clearAlert();
        showToast('Login unlocked. You may try again.');
      } else {
        showAlert(`⚠️ Too many failed attempts. Login locked for ${countdown}s.`, 'error');
      }
    }, 1000);
  }

  function lockoutUser() {
    isLockedOut = true;
    const cooldownMs = 30000;
    localStorage.setItem('nexus_lockout_until', String(Date.now() + cooldownMs));
    startLockoutCountdown(30);
  }

  // 3. Initialize Seed Accounts in LocalStorage if Empty
  let registeredUsers = JSON.parse(localStorage.getItem('nexus_registered_users') || '[]');
  if (registeredUsers.length === 0 || !registeredUsers[0].salt) {
    const defaultSalt = generateSalt();
    const defaultPasswordHash = await sha256('DemoPass123!', defaultSalt);
    registeredUsers = [{
      fullName: 'Alex Morgan',
      username: 'alex_dev',
      email: 'alex@company.com',
      salt: defaultSalt,
      passwordHash: defaultPasswordHash,
      registeredAt: new Date().toLocaleDateString()
    }];
    localStorage.setItem('nexus_registered_users', JSON.stringify(registeredUsers));
  }

  // 4. Check Active Session on Page Load (Protected Route) & Persistent Lockout
  checkPersistentLockout();
  checkSession();

  function checkSession() {
    const sessionToken = sessionStorage.getItem('nexus_auth_token') || localStorage.getItem('nexus_auth_token');
    if (sessionToken) {
      try {
        const sessionData = JSON.parse(sessionToken);
        const user = registeredUsers.find(u => u.username === sessionData.username || u.email === sessionData.username);
        if (user) {
          renderDashboard(user, sessionData);
          return;
        }
      } catch (e) {
        clearSession();
      }
    }
    // If not authenticated, ensure dashboard is hidden and auth is visible
    authSection.style.display = 'flex';
    dashboardSection.style.display = 'none';
  }

  // 4. Tab Switching (Sign In vs Register)
  tabLoginBtn.addEventListener('click', () => {
    tabLoginBtn.classList.add('active');
    tabLoginBtn.setAttribute('aria-selected', 'true');
    tabRegisterBtn.classList.remove('active');
    tabRegisterBtn.setAttribute('aria-selected', 'false');

    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
    clearAlert();
  });

  tabRegisterBtn.addEventListener('click', () => {
    tabRegisterBtn.classList.add('active');
    tabRegisterBtn.setAttribute('aria-selected', 'true');
    tabLoginBtn.classList.remove('active');
    tabLoginBtn.setAttribute('aria-selected', 'false');

    registerForm.style.display = 'block';
    loginForm.style.display = 'none';
    clearAlert();
  });

  // Password Peek Toggle Buttons
  document.querySelectorAll('.pwd-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetInput = document.getElementById(btn.dataset.target);
      if (targetInput) {
        const isPassword = targetInput.type === 'password';
        targetInput.type = isPassword ? 'text' : 'password';
        btn.textContent = isPassword ? '🙈' : '👁️';
      }
    });
  });

  // Quick Demo Account Button
  demoAccountBtn.addEventListener('click', () => {
    loginUser.value = 'alex_dev';
    loginPassword.value = 'DemoPass123!';
    showToast('Loaded demo credentials: alex_dev / DemoPass123!');
  });

  // 5. Password Strength & Rule Validation
  regPassword.addEventListener('input', () => {
    const pwd = regPassword.value;
    const hasMinLength = pwd.length >= 8;
    const hasNumber = /\d/.test(pwd);
    const hasLetters = /[a-z]/.test(pwd) && /[A-Z]/.test(pwd);

    // Rule Indicators
    ruleLength.classList.toggle('valid', hasMinLength);
    ruleLength.textContent = hasMinLength ? '✓ At least 8 characters' : '✕ At least 8 characters';

    ruleNumber.classList.toggle('valid', hasNumber);
    ruleNumber.textContent = hasNumber ? '✓ Contains at least 1 number (0–9)' : '✕ Contains at least 1 number (0–9)';

    ruleLetter.classList.toggle('valid', hasLetters);
    ruleLetter.textContent = hasLetters ? '✓ Contains uppercase & lowercase letters' : '✕ Contains uppercase & lowercase letters';

    // Calculate score
    let score = 0;
    if (hasMinLength) score++;
    if (hasNumber) score++;
    if (hasLetters) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;

    if (pwd.length === 0) {
      strengthBarFill.style.width = '0%';
      strengthBarFill.style.backgroundColor = 'transparent';
      strengthText.textContent = 'Password Strength: Empty';
    } else if (score <= 1) {
      strengthBarFill.style.width = '25%';
      strengthBarFill.style.backgroundColor = '#ef4444';
      strengthText.textContent = 'Password Strength: Weak (Must have 8+ chars & 1 number)';
    } else if (score === 2) {
      strengthBarFill.style.width = '55%';
      strengthBarFill.style.backgroundColor = '#f59e0b';
      strengthText.textContent = 'Password Strength: Medium';
    } else {
      strengthBarFill.style.width = '100%';
      strengthBarFill.style.backgroundColor = '#10b981';
      strengthText.textContent = 'Password Strength: Strong & Secure';
    }

    // Check confirm password match
    if (regConfirmPassword.value) {
      matchError.classList.toggle('active', regConfirmPassword.value !== pwd);
    }
  });

  regConfirmPassword.addEventListener('input', () => {
    matchError.classList.toggle('active', regConfirmPassword.value !== regPassword.value);
  });

  // 6. User Registration Handler
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAlert();

    const fullName = regFullName.value.trim();
    const username = regUsername.value.trim().toLowerCase();
    const email = regEmail.value.trim().toLowerCase();
    const password = regPassword.value;
    const confirmPassword = regConfirmPassword.value;

    // Requirement: Min 8 chars, at least 1 number
    if (password.length < 8 || !/\d/.test(password)) {
      showAlert('Password must contain at least 8 characters and at least 1 numeric digit.', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showAlert('Passwords do not match. Please re-enter carefully.', 'error');
      return;
    }

    // Duplicate Check
    registeredUsers = JSON.parse(localStorage.getItem('nexus_registered_users') || '[]');
    const usernameExists = registeredUsers.some(u => u.username === username);
    if (usernameExists) {
      showAlert(`Username "${username}" is already taken. Please choose another.`, 'error');
      return;
    }

    const emailExists = registeredUsers.some(u => u.email === email);
    if (emailExists) {
      showAlert(`An account registered with "${email}" already exists.`, 'error');
      return;
    }

    // Cryptographic Hash Password with Unique Salt
    const salt = generateSalt();
    const passwordHash = await sha256(password, salt);

    const newUser = {
      fullName,
      username,
      email,
      salt,
      passwordHash,
      registeredAt: new Date().toLocaleDateString()
    };

    registeredUsers.push(newUser);
    localStorage.setItem('nexus_registered_users', JSON.stringify(registeredUsers));

    // Success: auto transition to Login tab
    registerForm.reset();
    showAlert('Account created successfully! Please sign in with your credentials.', 'success');
    showToast('✓ Registration complete!');
    setTimeout(() => {
      tabLoginBtn.click();
      loginUser.value = username;
      loginPassword.focus();
    }, 1200);
  });

  // 7. User Login Handler
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAlert();

    if (checkPersistentLockout() || isLockedOut) {
      showAlert('Too many failed attempts. Account temporarily locked for security.', 'error');
      return;
    }

    const identifier = loginUser.value.trim().toLowerCase();
    const password = loginPassword.value;

    registeredUsers = JSON.parse(localStorage.getItem('nexus_registered_users') || '[]');
    const targetUser = registeredUsers.find(u => u.username === identifier || u.email === identifier);

    let matchedUser = null;
    if (targetUser) {
      const inputHash = await sha256(password, targetUser.salt || '');
      if (inputHash === targetUser.passwordHash) {
        matchedUser = targetUser;
      }
    }

    if (matchedUser) {
      failedAttempts = 0;
      localStorage.removeItem('nexus_lockout_until');

      // Create cryptographically secure session ID (CSPRNG)
      const sessionId = typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : 'sess_' + Array.from(crypto.getRandomValues(new Uint8Array(16)), b => b.toString(16).padStart(2, '0')).join('');

      // Create session payload
      const sessionToken = {
        username: matchedUser.username,
        sessionId: sessionId,
        loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toLocaleDateString()
      };

      if (rememberMeCheckbox.checked) {
        localStorage.setItem('nexus_auth_token', JSON.stringify(sessionToken));
      } else {
        sessionStorage.setItem('nexus_auth_token', JSON.stringify(sessionToken));
      }

      showToast(`Welcome back, ${matchedUser.fullName}!`);
      renderDashboard(matchedUser, sessionToken);
      loginForm.reset();
    } else {
      failedAttempts++;
      // Generic error message: do not reveal whether username or password was incorrect
      showAlert('Invalid username/email or password. Please verify and try again.', 'error');

      if (failedAttempts >= 5) {
        lockoutUser();
      }
    }
  });

  // 8. Render Protected Dashboard
  function renderDashboard(user, session) {
    authSection.style.display = 'none';
    dashboardSection.style.display = 'block';

    dashFullName.textContent = user.fullName;
    dashUsername.textContent = user.username;
    dashEmail.textContent = user.email;
    dashAvatar.textContent = user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    dashSessionId.textContent = session.sessionId;
    dashLoginTime.textContent = `${session.date} at ${session.loginTime}`;

    auditLogBody.innerHTML = `
      <tr>
        <td>User Authentication</td>
        <td><span class="status-ok">Success (200 OK)</span></td>
        <td><code>SHA-256 Verified</code></td>
        <td>${session.date}, ${session.loginTime}</td>
      </tr>
      <tr>
        <td>Session Token Granted</td>
        <td><span class="status-ok">Authorized</span></td>
        <td><code>Bearer ${session.sessionId}</code></td>
        <td>${session.date}, ${session.loginTime}</td>
      </tr>
    `;
  }

  // 9. Logout Handler
  logoutBtn.addEventListener('click', () => {
    clearSession();
    authSection.style.display = 'flex';
    dashboardSection.style.display = 'none';
    showAlert('You have been logged out securely.', 'success');
    showToast('Session ended. Logged out.');
  });

  function clearSession() {
    sessionStorage.removeItem('nexus_auth_token');
    localStorage.removeItem('nexus_auth_token');
  }

  // Helper Alerts
  function showAlert(msg, type = 'error') {
    alertMsg.textContent = msg;
    alertIcon.textContent = type === 'success' ? '✓' : '⚠️';
    authAlert.className = `auth-alert active ${type}`;
  }

  function clearAlert() {
    authAlert.className = 'auth-alert';
    alertMsg.textContent = '';
  }

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
});
