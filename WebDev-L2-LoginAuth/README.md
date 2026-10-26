# Oasis Infobyte SIP — Web Development & Designing
## Level 2 · Task 4: Login Authentication System

**Project Name:** NexusShield — Secure Authentication & Protected Member Portal  
**Directory:** `OIBSIP/WebDev-L2-LoginAuth/`  
**Track:** Web Development & Designing  
**Tech Stack:** HTML5, CSS3, Vanilla JavaScript (ES6+), Web Crypto API (Native SHA-256)  

---

### 📌 Project Overview
NexusShield is a client-side authentication and session management portal featuring user registration, cryptographic password hashing via the browser's native **SHA-256 Web Crypto API**, password strength verification, duplicate username/email checks, anti-enumeration security, and route protection for an authenticated member dashboard.

---

### ✨ Feature Checklist (As per Oasis Infobyte Specification)
- [x] **Registration Page / Tab**: Full Name, Username, Email, Password, and Confirm Password fields with validation.
- [x] **Password Validation Rules**: Enforces a strict minimum of 8 characters and at least 1 numeric digit, with a live visual meter and dynamic checklist feedback.
- [x] **Duplicate Account Prevention**: Queries existing registered accounts to reject duplicate usernames and emails before registration.
- [x] **Login Page / Tab**: Username/Email and Password inputs, password visibility toggle ("peek eye"), and a "Remember Me" session persistence toggle.
- [x] **Anti-Enumeration Error Handling**: Displays a clear, unified error message (*"Invalid username/email or password"*) without leaking whether the username or password specifically was incorrect.
- [x] **Brute Force Rate Limiting**: Triggers a 30-second security cooldown timer after 5 consecutive failed login attempts.
- [x] **Cryptographic Password Hashing**: Passwords are **never stored in plain text**. Uses irreversible **SHA-256** digests generated with `crypto.subtle.digest('SHA-256', ...)`.
- [x] **Protected Dashboard Route**: Only accessible with an active authenticated session token. Direct unauthenticated attempts are blocked and redirected to the login view.
- [x] **Logout Capability**: Dedicated logout button that flushes session tokens and returns the user to the login screen with confirmation.
- [x] **Demo Account Quick-Fill**: Includes pre-seeded credentials for instant evaluator testing (`alex_dev` / `DemoPass123!`).

---

### 🚀 Getting Started & Preview
To run and preview this project locally:
1. Open `index.html` in any modern web browser.
2. Or serve via terminal:
   ```bash
   npx serve /home/safin313/.gemini/antigravity-ide/scratch/OIBSIP/WebDev-L2-LoginAuth
   ```
