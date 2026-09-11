(() => {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(pointer: fine)');
  const root = document.documentElement;
  const toggle = document.querySelector('.motion-toggle');
  const hero = document.querySelector('.hero');
  const artwork = document.querySelector('.hero-art');
  let paused = reduced.matches;
  function updateMotion() {
    root.classList.toggle('motion-paused', paused);
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.textContent = paused ? 'Resume motion ▷' : 'Pause motion Ⅱ';
    if (reduced.matches) {
      toggle.textContent = 'Reduced motion on';
      toggle.disabled = true;
    } else toggle.disabled = false;
  }
  updateMotion();
  toggle.addEventListener('click', () => { paused = !paused; updateMotion(); });
  reduced.addEventListener('change', () => { paused = reduced.matches; updateMotion(); });
  if ('IntersectionObserver' in window) {
    root.classList.add('js-motion');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
  }
  hero.addEventListener('pointermove', event => {
    if (paused || !finePointer.matches) return;
    const bounds = hero.getBoundingClientRect();
    artwork.style.setProperty('--px', `${(event.clientX - bounds.left - bounds.width / 2) * .025}px`);
    artwork.style.setProperty('--py', `${(event.clientY - bounds.top - bounds.height / 2) * .025}px`);
  });
  hero.addEventListener('pointerleave', () => {
    artwork.style.setProperty('--px', '0px'); artwork.style.setProperty('--py', '0px');
  });
  const scene = document.querySelector('.box-scene');
  const box = document.querySelector('.box-model');
  let angle = -28, pitch = -20, pointer = null, previousX = 0, previousY = 0;
  function renderBox() { box.style.transform = `rotateX(${pitch}deg) rotateY(${angle}deg)`; }
  document.querySelectorAll('[data-rotate]').forEach(button => {
    button.addEventListener('click', () => { angle += Number(button.dataset.rotate); renderBox(); });
  });
  scene.addEventListener('pointerdown', event => {
    if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
    pointer = event.pointerId; previousX = event.clientX; previousY = event.clientY;
    scene.setPointerCapture(pointer);
  });
  scene.addEventListener('pointermove', event => {
    if (pointer !== event.pointerId) return;
    angle += (event.clientX - previousX) * .5;
    if (event.pointerType === 'mouse') pitch = Math.max(-50, Math.min(15, pitch - (event.clientY - previousY) * .25));
    previousX = event.clientX; previousY = event.clientY; renderBox();
  });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(name => scene.addEventListener(name, () => { pointer = null; }));
})();
