document.addEventListener('DOMContentLoaded', () => {
  // Existing lotto script (if any, ensure it's not overwritten or conflicts)
  let history = [];
  const themeToggle = document.getElementById('themeToggle');
  const root = document.documentElement;

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    const isDark = theme === 'dark';
    themeToggle.textContent = isDark ? '☀️ 라이트' : '🌙 다크';
    themeToggle.setAttribute('aria-pressed', String(isDark));
    localStorage.setItem('theme', theme);
  }

  function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      applyTheme(savedTheme);
      return;
    }
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark ? 'dark' : 'light');
  }

  themeToggle.addEventListener('click', () => {
    const currentTheme = root.getAttribute('data-theme') || 'light';
    applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
  });

  initTheme();

  function getBallColor(num) {
    if (num <= 10) return 'yellow';
    if (num <= 20) return 'blue';
    if (num <= 30) return 'red';
    if (num <= 40) return 'gray';
    return 'green';
  }

  window.generateLotto = function() { // Make it global if called from onclick
    const numbers = [];
    while (numbers.length < 6) {
      const num = Math.floor(Math.random() * 45) + 1;
      if (!numbers.includes(num)) {
        numbers.push(num);
      }
    }
    numbers.sort((a, b) => a - b);

    displayNumbers(numbers);
    addToHistory(numbers);
  }

  function displayNumbers(numbers) {
    const container = document.getElementById('lottoNumbers');
    container.innerHTML = '';

    numbers.forEach((num, index) => {
      setTimeout(() => {
        const ball = document.createElement('div');
        ball.className = `ball ${getBallColor(num)}`;
        ball.textContent = num;
        container.appendChild(ball);
      }, index * 100);
    });
  }

  function addToHistory(numbers) {
    history.unshift(numbers);
    if (history.length > 5) history.pop();

    const historySection = document.getElementById('historySection');
    const historyList = document.getElementById('historyList');

    historySection.style.display = 'block';
    historyList.innerHTML = '';

    history.forEach(nums => {
      const item = document.createElement('div');
      item.className = 'history-item';
      nums.forEach(num => {
        const ball = document.createElement('div');
        ball.className = `mini-ball ${getBallColor(num)}`;
        ball.textContent = num;
        item.appendChild(ball);
      });
      historyList.appendChild(item);
    });
  }

  // Formspree Contact Form Logic
  const contactForm = document.getElementById('contactForm');
  const formStatusMessage = document.getElementById('formStatusMessage');

  if (contactForm) {
    contactForm.addEventListener('submit', async (event) => {
      event.preventDefault(); // Prevent default form submission

      const formData = new FormData(contactForm);
      const object = {};
      formData.forEach((value, key) => {
        object[key] = value;
      });
      const json = JSON.stringify(object);

      try {
        const response = await fetch(contactForm.action, {
          method: contactForm.method,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: json
        });

        if (response.ok) {
          formStatusMessage.textContent = '메시지가 성공적으로 전송되었습니다!';
          formStatusMessage.className = 'success';
          contactForm.reset(); // Clear the form
        } else {
          const data = await response.json();
          if (data.errors) {
            formStatusMessage.textContent = data.errors.map(error => error.message).join(', ');
          } else {
            formStatusMessage.textContent = '메시지 전송에 실패했습니다. 다시 시도해주세요.';
          }
          formStatusMessage.className = 'error';
        }
      } catch (error) {
        formStatusMessage.textContent = '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        formStatusMessage.className = 'error';
        console.error('Form submission error:', error);
      } finally {
        formStatusMessage.style.display = 'block'; // Show the message
        // Hide the message after a few seconds
        setTimeout(() => {
          formStatusMessage.style.display = 'none';
        }, 5000);
      }
    });
  }
});
