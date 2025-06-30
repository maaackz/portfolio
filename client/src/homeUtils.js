// src/homeUtils.js
export function setupReveal() {
  const reveals = document.querySelectorAll('.reveal');
  function revealOnScroll() {
    reveals.forEach(el => {
      if (el.getBoundingClientRect().top < window.innerHeight) {
        el.classList.add('active');
      } else el.classList.remove('active');
    });
  }
  window.addEventListener('scroll', revealOnScroll);
  revealOnScroll();
}

export function copyText() {
  navigator.clipboard.writeText('your-email@example.com');
  const btn = document.getElementById('copy');
  btn.textContent = 'copied.';
  setTimeout(() => btn.textContent = 'copy.', 5000);
}
