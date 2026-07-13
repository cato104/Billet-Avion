// FUN56 — interactions partagées
const nav = document.getElementById('nav');
const burger = document.getElementById('burger');
const links = document.getElementById('navLinks');

if (nav && !nav.classList.contains('solid')) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

if (burger && links) {
  burger.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
  });
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    links.classList.remove('open');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  }));
}

const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

// Apparition douce au scroll
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal, .card, .strip-item, .price-row, .formule').forEach(el => {
  el.classList.add('reveal');
  observer.observe(el);
});

// Formulaire de contact → ouvre la messagerie du visiteur
const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const nom = form.nom.value.trim();
    const email = form.email.value.trim();
    const objet = form.objet.value.trim() || 'Demande via fun56.bzh';
    const message = form.message.value.trim();
    const body = message + "\n\n— " + nom + " (" + email + ")";
    location.href = 'mailto:contact.fun56@gmail.com?subject=' +
      encodeURIComponent(objet) + '&body=' + encodeURIComponent(body);
  });
}
