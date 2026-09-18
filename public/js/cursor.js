/* ============================================================
   CURSOR EFFECT — js/cursor.js
   Tambahkan <link rel="stylesheet" href="css/cursor.css"> di <head>
   dan <script src="js/cursor.js"></script> sebelum </body>.
   ============================================================ */

(function () {
  const isTouch = window.matchMedia('(pointer: coarse)').matches;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isTouch || reduceMotion) return; // don't run on touch devices / reduced motion

  document.body.classList.add('has-custom-cursor');

  const dot = document.createElement('div');
  dot.className = 'cursor-dot';
  const ring = document.createElement('div');
  ring.className = 'cursor-ring';
  document.body.appendChild(dot);
  document.body.appendChild(ring);

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;
  const ease = 0.18; // lower = more trailing lag

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
    document.body.classList.remove('cursor-hidden');
  });

  function animateRing() {
    ringX += (mouseX - ringX) * ease;
    ringY += (mouseY - ringY) * ease;
    ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(animateRing);
  }
  requestAnimationFrame(animateRing);

  // Hover state on interactive elements
  const hoverSelector = 'a, button, input, textarea, select, [role="button"], .btn, .facility-card, .teacher-card, .news-item, .ekskul-card';

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(hoverSelector)) {
      document.body.classList.add('cursor-hover');
    }
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(hoverSelector)) {
      document.body.classList.remove('cursor-hover');
    }
  });

  // Click state
  document.addEventListener('mousedown', () => document.body.classList.add('cursor-active'));
  document.addEventListener('mouseup', () => document.body.classList.remove('cursor-active'));

  // Hide when the pointer leaves the browser window
  document.addEventListener('mouseleave', () => document.body.classList.add('cursor-hidden'));
  document.addEventListener('mouseenter', () => document.body.classList.remove('cursor-hidden'));
})();