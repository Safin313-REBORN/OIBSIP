# Oasis Infobyte SIP — Web Development & Designing
## Level 2 · Task 3: To-Do Web App

**Project Name:** TaskFlow Pro — Daily Planner & Productivity Suite  
**Directory:** `OIBSIP/WebDev-L2-TodoApp/`  
**Track:** Web Development & Designing  
**Tech Stack:** HTML5, CSS3, Vanilla JavaScript (ES6+), LocalStorage API  

---

### 📌 Project Overview
TaskFlow Pro is an interactive task and project management application structured into **Pending** and **Completed** lists. Features inline editing, priority filtering, category tags, creation/completion timestamps, live productivity progress bars, and full persistence across page refreshes via `localStorage`.

---

### ✨ Feature Checklist (As per Oasis Infobyte Specification)
- [x] **Input Field & Add Task Button**: Instant task creation with priority levels (High, Medium, Low), category classification (Work, Study, Personal, Health), and optional due dates.
- [x] **Pending Tasks List**: Newly added items appear immediately in the pending column with priority indicators and creation timestamps.
- [x] **Mark Complete Toggle**: Checkbox toggle that transitions tasks into the completed section with dynamic strikethrough and completion timestamp recording.
- [x] **Inline Task Editing**: An edit button that switches the task card into an in-place input with Save and Cancel buttons.
- [x] **Permanent Deletion**: Delete button on every task with instant list removal and state synchronization.
- [x] **Task Count & Progress Indicators**: Displays live counts (*X pending*, *Y completed*) alongside an animated visual progress percentage bar.
- [x] **Timestamps**: Explicit time tracking displaying when each task was created and completed.
- [x] **LocalStorage Persistence**: Full automatic state retention across browser sessions and reloads.
- [x] **Empty State Messaging**: Encouraging empty state graphics and messages for both pending and completed columns.
- [x] **Search & Category Filters**: Real-time keyword search and category pills (*All, Pending, Completed, High Priority*).

---

### 🚀 Getting Started & Preview
To run and preview this project locally:
1. Open `index.html` in any modern web browser.
2. Or serve via terminal:
   ```bash
   npx serve /home/safin313/.gemini/antigravity-ide/scratch/OIBSIP/WebDev-L2-TodoApp
   ```
