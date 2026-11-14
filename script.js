// Address that enquiries are sent to. Change this to your real mailbox.
const CONTACT_EMAIL = 'info@gavionx.com';

const nav = document.getElementById('nav');
const toggle = document.querySelector('.nav-toggle');
toggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', open);
});
nav.addEventListener('click', (e) => {
  if (e.target.tagName === 'A') {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }
});

// "Enquire about ..." links preselect the product in the form.
const productSelect = document.getElementById('product-select');
document.querySelectorAll('[data-product]').forEach((link) => {
  link.addEventListener('click', () => {
    productSelect.value = link.dataset.product;
  });
});

const emailLink = document.getElementById('contact-email');
emailLink.textContent = CONTACT_EMAIL;
emailLink.href = 'mailto:' + CONTACT_EMAIL;

document.getElementById('contact-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(e.target);
  const subject = 'Enquiry: ' + data.get('product');
  const body =
    'Name: ' + data.get('name') + '\n' +
    'Contact: ' + data.get('reach') + '\n' +
    'Product: ' + data.get('product') + '\n\n' +
    (data.get('message') || '');
  window.location.href =
    'mailto:' + CONTACT_EMAIL +
    '?subject=' + encodeURIComponent(subject) +
    '&body=' + encodeURIComponent(body);
});

document.getElementById('year').textContent = new Date().getFullYear();
