/**
 * Safin Ahmed — Portfolio Interactive Controller
 * Oasis Infobyte SIP — Level 1 Task 2: Personal Portfolio
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Dark / Light Theme Toggle with LocalStorage
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const currentTheme = localStorage.getItem('portfolio-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);

  themeToggleBtn.addEventListener('click', () => {
    const activeTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('portfolio-theme', newTheme);
    showToast(`Switched to ${newTheme} mode`);
  });

  // 2. Header Scroll Effect
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    updateNavScrollspy();
  }, { passive: true });

  // 3. Mobile Navigation Toggle
  const mobileToggle = document.getElementById('mobileToggle');
  const navContainer = document.getElementById('navContainer');

  mobileToggle.addEventListener('click', () => {
    const isOpen = navContainer.classList.toggle('open');
    mobileToggle.setAttribute('aria-expanded', String(isOpen));
  });

  document.querySelectorAll('.nav-item').forEach(link => {
    link.addEventListener('click', () => {
      navContainer.classList.remove('open');
      mobileToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // 4. ScrollSpy for Active Nav Link
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-item');

  function updateNavScrollspy() {
    const scrollPos = window.scrollY + 120;
    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      const id = sec.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navItems.forEach(item => {
          item.classList.remove('active');
          if (item.getAttribute('href') === `#${id}`) {
            item.classList.add('active');
          }
        });
      }
    });
  }

  // 5. Skills Category Filter
  const skillTabs = document.querySelectorAll('.skill-tab');
  const skillCards = document.querySelectorAll('.skill-card');

  skillTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      skillTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.dataset.filter;
      skillCards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.style.display = 'block';
          card.style.animation = 'fadeIn 0.3s ease';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // 6. Copy Email Card Interaction
  const copyEmailCard = document.getElementById('copyEmailCard');
  if (copyEmailCard) {
    copyEmailCard.addEventListener('click', async () => {
      const email = 'safin.dev@example.com';
      try {
        await navigator.clipboard.writeText(email);
        showToast('✓ Email copied to clipboard!');
      } catch (err) {
        showToast(`Email: ${email}`);
      }
    });
  }

  // 7. Interactive Contact Form Submission
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('userName').value.trim();
      const email = document.getElementById('userEmail').value.trim();
      const subject = document.getElementById('userSubject').value.trim();
      const message = document.getElementById('userMessage').value.trim();

      if (!name || !email || !subject || !message) {
        showToast('⚠️ Please fill out all required fields.');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showToast('⚠️ Please enter a valid email address format.');
        return;
      }

      // Simulated successful delivery
      showToast(`🎉 Thank you, ${name}! Your message has been received.`);
      contactForm.reset();
    });
  }

  // Toast System
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
    }, 3500);
  }
});
