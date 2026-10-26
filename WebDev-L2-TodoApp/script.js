/**
 * TaskFlow Pro — Daily Planner & To-Do Application Logic
 * Oasis Infobyte SIP — Level 2 Task 3: To-Do Web App
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const taskForm = document.getElementById('taskForm');
  const taskTitleInput = document.getElementById('taskTitleInput');
  const prioritySelect = document.getElementById('prioritySelect');
  const categorySelect = document.getElementById('categorySelect');
  const dueDateInput = document.getElementById('dueDateInput');

  const searchInput = document.getElementById('searchInput');
  const filterButtons = document.querySelectorAll('.filter-btn');

  const pendingList = document.getElementById('pendingList');
  const completedList = document.getElementById('completedList');
  const pendingCountPill = document.getElementById('pendingCountPill');
  const completedCountPill = document.getElementById('completedCountPill');

  const summarySub = document.getElementById('summarySub');
  const progressPercentage = document.getElementById('progressPercentage');
  const progressBarFill = document.getElementById('progressBarFill');
  const clearAllCompletedBtn = document.getElementById('clearAllCompletedBtn');

  // State Management with LocalStorage
  let tasks = JSON.parse(localStorage.getItem('taskflow_tasks') || '[]');
  let activeFilter = 'all';
  let searchQuery = '';
  let editingTaskId = null;

  // Initialize with sample tasks if empty on first load
  if (tasks.length === 0) {
    tasks = [
      {
        id: 'task-1',
        title: 'Review Oasis Infobyte Web Development Task Cards',
        priority: 'high',
        category: 'work',
        dueDate: '',
        completed: false,
        createdAt: 'Today, 9:00 AM',
        completedAt: null
      },
      {
        id: 'task-2',
        title: 'Build high-performance responsive CSS layouts',
        priority: 'medium',
        category: 'study',
        dueDate: '',
        completed: true,
        createdAt: 'Yesterday',
        completedAt: 'Yesterday, 4:30 PM'
      }
    ];
    saveTasks();
  }

  // 1. Task Creation
  taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = taskTitleInput.value.trim();
    if (!title) return;

    const newTask = {
      id: 'task-' + Date.now(),
      title: title,
      priority: prioritySelect.value,
      category: categorySelect.value,
      dueDate: dueDateInput.value,
      completed: false,
      createdAt: formatCurrentTime(),
      completedAt: null
    };

    tasks.unshift(newTask);
    saveTasks();
    renderTasks();
    taskForm.reset();
    showToast('✓ New task added to Pending list!');
  });

  // 2. Clear All Completed Tasks
  clearAllCompletedBtn.addEventListener('click', () => {
    const completedCount = tasks.filter(t => t.completed).length;
    if (completedCount === 0) {
      showToast('No completed tasks to clear.');
      return;
    }

    tasks = tasks.filter(t => !t.completed);
    saveTasks();
    renderTasks();
    showToast(`Cleared ${completedCount} completed tasks.`);
  });

  // 3. Search & Filter Handlers
  searchInput.addEventListener('input', () => {
    searchQuery = searchInput.value.toLowerCase().trim();
    renderTasks();
  });

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      renderTasks();
    });
  });

  // 4. Render Tasks
  function renderTasks() {
    let filtered = tasks.filter(t => {
      const matchSearch = t.title.toLowerCase().includes(searchQuery);
      if (!matchSearch) return false;

      if (activeFilter === 'pending') return !t.completed;
      if (activeFilter === 'completed') return t.completed;
      if (activeFilter === 'high') return t.priority === 'high';
      return true;
    });

    const pending = filtered.filter(t => !t.completed);
    const completed = filtered.filter(t => t.completed);

    // Update Counts & Progress Bar
    const totalPending = tasks.filter(t => !t.completed).length;
    const totalCompleted = tasks.filter(t => t.completed).length;
    const totalTasks = tasks.length;
    const pct = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

    pendingCountPill.textContent = `${totalPending} pending`;
    completedCountPill.textContent = `${totalCompleted} completed`;
    summarySub.textContent = `You have ${totalPending} task${totalPending === 1 ? '' : 's'} pending today.`;
    progressPercentage.textContent = `${pct}%`;
    progressBarFill.style.width = `${pct}%`;

    // Render Pending List
    if (pending.length === 0) {
      pendingList.innerHTML = `
        <div class="empty-state">
          <span class="empty-icon">🎉</span>
          <p>No pending tasks found. You're completely caught up!</p>
        </div>
      `;
    } else {
      pendingList.innerHTML = pending.map(t => createTaskCardHTML(t)).join('');
    }

    // Render Completed List
    if (completed.length === 0) {
      completedList.innerHTML = `
        <div class="empty-state">
          <span class="empty-icon">📝</span>
          <p>No completed tasks yet. Finish a task to see it celebrated here!</p>
        </div>
      `;
    } else {
      completedList.innerHTML = completed.map(t => createTaskCardHTML(t)).join('');
    }

    attachCardEventListeners();
  }

  function createTaskCardHTML(task) {
    const isEditing = editingTaskId === task.id;

    if (isEditing) {
      return `
        <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
          <div class="edit-mode-wrap">
            <input type="text" class="edit-input" id="editInput-${task.id}" value="${escapeHtml(task.title)}" required>
            <button class="edit-save-btn" data-id="${task.id}">Save</button>
            <button class="edit-cancel-btn">Cancel</button>
          </div>
        </div>
      `;
    }

    const priorityLabel = task.priority.toUpperCase();
    const categoryIcon = getCategoryIcon(task.category);

    return `
      <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
        <div class="task-top">
          <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} aria-label="Toggle task completion">
          <span class="task-title">${escapeHtml(task.title)}</span>
          <div class="task-actions">
            <button class="act-btn edit-btn" title="Edit task title">✏️</button>
            <button class="act-btn del del-btn" title="Delete task">🗑️</button>
          </div>
        </div>
        <div class="task-meta">
          <span class="meta-pill p-${escapeHtml(task.priority)}">${escapeHtml(priorityLabel)}</span>
          <span class="meta-pill c-tag">${categoryIcon} ${escapeHtml(capitalize(task.category))}</span>
          ${task.dueDate ? `<span class="meta-pill c-tag">📅 Due ${escapeHtml(task.dueDate)}</span>` : ''}
          <span class="time-tag">${task.completed ? `✓ Done ${escapeHtml(task.completedAt || '')}` : `Added ${escapeHtml(task.createdAt)}`}</span>
        </div>
      </div>
    `;
  }

  function attachCardEventListeners() {
    // Checkbox Toggle Completion
    document.querySelectorAll('.task-checkbox').forEach(box => {
      box.addEventListener('change', (e) => {
        const id = e.target.closest('.task-item').dataset.id;
        const task = tasks.find(t => t.id === id);
        if (task) {
          task.completed = e.target.checked;
          task.completedAt = task.completed ? formatCurrentTime() : null;
          saveTasks();
          renderTasks();
          showToast(task.completed ? '🎉 Task completed!' : 'Moved task to Pending.');
        }
      });
    });

    // Delete Button
    document.querySelectorAll('.del-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.closest('.task-item').dataset.id;
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderTasks();
        showToast('Task removed permanently.');
      });
    });

    // Edit Button
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.closest('.task-item').dataset.id;
        editingTaskId = id;
        renderTasks();
        const input = document.getElementById(`editInput-${id}`);
        if (input) {
          input.focus();
          input.select();
        }
      });
    });

    // Save Edit
    document.querySelectorAll('.edit-save-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.dataset.id;
        const input = document.getElementById(`editInput-${id}`);
        if (input && input.value.trim()) {
          const task = tasks.find(t => t.id === id);
          if (task) {
            task.title = input.value.trim();
            editingTaskId = null;
            saveTasks();
            renderTasks();
            showToast('✓ Task updated.');
          }
        }
      });
    });

    // Cancel Edit
    document.querySelectorAll('.edit-cancel-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        editingTaskId = null;
        renderTasks();
      });
    });
  }

  // Helpers
  function saveTasks() {
    localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
  }

  function formatCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function getCategoryIcon(cat) {
    switch (cat) {
      case 'work': return '💼';
      case 'study': return '📚';
      case 'personal': return '🏠';
      case 'health': return '💪';
      default: return '📌';
    }
  }

  function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function escapeHtml(str) {
    return str.replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;");
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
    }, 2800);
  }

  // Initial Render
  renderTasks();
});
