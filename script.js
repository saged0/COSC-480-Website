const root = document.documentElement;
const storedTheme = localStorage.getItem('theme');
if (storedTheme === 'light') root.classList.add('light');

const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    root.classList.toggle('light');
    localStorage.setItem('theme', root.classList.contains('light') ? 'light' : 'dark');
  });
}

const menuToggle = document.getElementById('menu-toggle');
const nav = document.getElementById('main-nav');
if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => nav.classList.toggle('show'));
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.15 });

document.querySelectorAll('.card').forEach((card) => {
  card.style.opacity = '0';
  card.style.transform = 'translateY(14px)';
  card.style.transition = 'all .45s ease';
  observer.observe(card);
});

document.querySelectorAll('.card').forEach((card) => {
  card.addEventListener('transitionend', () => {
    if (card.classList.contains('visible')) {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }
  });
});

const style = document.createElement('style');
style.textContent = '.card.visible{opacity:1 !important; transform:translateY(0) !important;}';
document.head.appendChild(style);
