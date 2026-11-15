// Address that enquiries are sent to. Change this to your real mailbox.
const CONTACT_EMAIL = 'info@gavionx.com';

document.documentElement.classList.add('js');

const params = new URLSearchParams(window.location.search);

// Mobile menu
const nav = document.getElementById('nav');
const toggle = document.querySelector('.nav-toggle');
toggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', open);
});

// Mark the current page in the header menu
const here = window.location.pathname.replace(/index\.html$/, '');
nav.querySelectorAll(':scope > a:not(.btn), .nav-parent').forEach((link) => {
  if (new URL(link.href).pathname === here) link.setAttribute('aria-current', 'page');
});

// Header shadow once the page is scrolled
const header = document.querySelector('.site-header');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Products page: filter by the tab buttons, or by ?type= in the address
const tabs = document.querySelectorAll('.tab');
const products = document.querySelectorAll('.product');
function setFilter(filter) {
  tabs.forEach((tab) => {
    const active = tab.dataset.filter === filter;
    tab.classList.toggle('is-active', active);
    tab.setAttribute('aria-pressed', active);
  });
  products.forEach((product) => {
    product.hidden = filter !== 'all' && product.dataset.cat !== filter;
  });
}
if (tabs.length) {
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const filter = tab.dataset.filter;
      setFilter(filter);
      history.replaceState(null, '', filter === 'all' ? './' : '?type=' + filter);
    });
  });
  const type = params.get('type');
  if (type && document.querySelector('.tab[data-filter="' + CSS.escape(type) + '"]')) setFilter(type);
}

// Counters count up the first time they scroll into view
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function countUp(el) {
  const target = Number(el.dataset.count);
  if (reduceMotion || !target) return;
  const start = performance.now();
  const duration = 900;
  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    el.textContent = Math.round(target * progress);
    if (progress < 1) requestAnimationFrame(tick);
  };
  el.textContent = '0';
  requestAnimationFrame(tick);
}

// Reveal blocks as they scroll into view
const revealTargets = document.querySelectorAll(
  '.section-head, .cap, .pillar, .card, .cat, .product, .row, .stat, .form, .contact-card'
);
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      const counter = entry.target.querySelector('[data-count]');
      if (counter) countUp(counter);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.15 });
  revealTargets.forEach((el) => {
    el.classList.add('reveal');
    observer.observe(el);
  });
}

// Contact page: details, ?product= preselects the subject, and the enquiry form
const form = document.getElementById('contact-form');
if (form) {
  const emailLink = document.getElementById('contact-email');
  emailLink.textContent = CONTACT_EMAIL;
  emailLink.href = 'mailto:' + CONTACT_EMAIL;

  const wanted = params.get('product');
  const option = wanted && form.querySelector('option[data-key="' + CSS.escape(wanted) + '"]');
  if (option) option.selected = true;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const line = (label, name) => (data.get(name) ? label + ': ' + data.get(name) + '\n' : '');
    const subject = 'Enquiry: ' + data.get('product');
    const body =
      line('Name', 'name') +
      line('Company', 'company') +
      line('Email', 'email') +
      line('Phone', 'phone') +
      line('City', 'city') +
      line('Number of vehicles', 'fleet') +
      line('Subject', 'product') +
      '\n' + (data.get('message') || '');
    window.location.href =
      'mailto:' + CONTACT_EMAIL +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(body);
  });
}

document.getElementById('year').textContent = new Date().getFullYear();
