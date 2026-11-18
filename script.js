// Address that enquiries are sent to. Change this to your real mailbox.
const CONTACT_EMAIL = 'admin@gavionx.com';

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

  // Enquiries are sent through Web3Forms, which emails them to the address
  // registered with this access key. The key is public by design.
  const WEB3FORMS_KEY = '81916cf8-f25b-4b6b-9fd2-a0c8cc1d2c9e';
  const button = form.querySelector('button[type="submit"]');
  const status = document.getElementById('form-status');
  const showStatus = (text, ok) => {
    status.textContent = text;
    status.className = 'form-status ' + (ok ? 'is-ok' : 'is-error');
    status.hidden = false;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    if (data.get('botcheck')) return; // hidden field only bots fill in

    const payload = {
      access_key: WEB3FORMS_KEY,
      subject: 'Website enquiry: ' + data.get('product'),
      from_name: 'GavionX website',
      replyto: data.get('email'),
      'Name': data.get('name'),
      'Company': data.get('company'),
      'Email': data.get('email'),
      'Phone': data.get('phone'),
      'City': data.get('city'),
      'Number of vehicles': data.get('fleet'),
      'Subject': data.get('product'),
      'Message': data.get('message'),
    };
    Object.keys(payload).forEach((k) => { if (payload[k] === '' || payload[k] === null) delete payload[k]; });

    button.disabled = true;
    button.textContent = 'Sending…';
    status.hidden = true;
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok || result.success === false) throw new Error(result.message || 'Request failed');
      form.reset();
      showStatus("Thank you — your enquiry has been sent. We'll get back to you shortly.", true);
    } catch (err) {
      showStatus('Sorry, your message could not be sent. Please try again, or call us on +91 78931 23431.', false);
    } finally {
      button.disabled = false;
      button.textContent = 'Send message';
    }
  });
}

document.getElementById('year').textContent = new Date().getFullYear();
