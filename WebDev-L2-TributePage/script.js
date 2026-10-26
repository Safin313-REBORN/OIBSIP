/**
 * Tribute to Dr. A.P.J. Abdul Kalam — Interactive Features
 * Oasis Infobyte SIP — Level 2 Task 2: Tribute Page
 */

document.addEventListener('DOMContentLoaded', () => {
  // Notable Quotes Collection
  const quotes = [
    "You cannot change your future, but you can change your habits, and surely your habits will change your future.",
    "If you want to shine like a sun, first burn like a sun.",
    "To succeed in your mission, you must have single-minded devotion to your goal.",
    "Man needs difficulties in life because they are necessary to enjoy success.",
    "Look at the sky. We are not alone. The whole universe is friendly to us and conspires only to give the best to those who dream and work.",
    "Don't take rest after your first victory because if you fail in the second, more lips are waiting to say that your first victory was just luck."
  ];

  let currentQuoteIndex = 0;
  const activeQuoteText = document.getElementById('activeQuoteText');
  const prevQuoteBtn = document.getElementById('prevQuoteBtn');
  const nextQuoteBtn = document.getElementById('nextQuoteBtn');
  const quoteDots = document.getElementById('quoteDots');

  // Render navigation dots
  quoteDots.innerHTML = quotes.map((_, i) => `<span class="dot ${i === 0 ? 'active' : ''}" data-index="${i}"></span>`).join('');
  const dots = document.querySelectorAll('.dot');

  function updateQuote(index) {
    activeQuoteText.style.opacity = '0';
    activeQuoteText.style.transform = 'translateY(8px)';
    activeQuoteText.style.transition = 'all 0.25s ease';

    setTimeout(() => {
      activeQuoteText.textContent = quotes[index];
      activeQuoteText.style.opacity = '1';
      activeQuoteText.style.transform = 'translateY(0)';

      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });
    }, 250);
  }

  let autoRotateTimer = null;
  function restartAutoRotate() {
    if (autoRotateTimer) clearInterval(autoRotateTimer);
    autoRotateTimer = setInterval(() => {
      currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length;
      updateQuote(currentQuoteIndex);
    }, 8000);
  }

  nextQuoteBtn.addEventListener('click', () => {
    currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length;
    updateQuote(currentQuoteIndex);
    restartAutoRotate();
  });

  prevQuoteBtn.addEventListener('click', () => {
    currentQuoteIndex = (currentQuoteIndex - 1 + quotes.length) % quotes.length;
    updateQuote(currentQuoteIndex);
    restartAutoRotate();
  });

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      currentQuoteIndex = parseInt(dot.dataset.index, 10);
      updateQuote(currentQuoteIndex);
      restartAutoRotate();
    });
  });

  // Start initial rotation
  restartAutoRotate();
});
