/* ==========================================================================
   ATESTAKI ENGINEERING NIG LTD — SCRIPT
   --------------------------------------------------------------------------
   Everything here is plain vanilla JS, split into small labeled sections:
   1. Mobile hamburger menu
   2. Scroll fade-in animations (IntersectionObserver)
   3. Footer year
   4. Contact form -> WhatsApp message
   ========================================================================== */

/* --------------------------------------------------------------------------
   1. MOBILE HAMBURGER MENU
   Toggles the .is-open class on the nav (slides it down on mobile) and
   .is-active on the button (turns the 3 bars into an X). Also closes the
   menu automatically when a link inside it is tapped.
-------------------------------------------------------------------------- */
const hamburgerBtn = document.getElementById('hamburgerBtn');
const navMenu = document.getElementById('navMenu');

if (hamburgerBtn && navMenu) {
  hamburgerBtn.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('is-open');
    hamburgerBtn.classList.toggle('is-active', isOpen);
    hamburgerBtn.setAttribute('aria-expanded', String(isOpen));
  });

  // Close the mobile menu whenever a nav link is clicked
  navMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('is-open');
      hamburgerBtn.classList.remove('is-active');
      hamburgerBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

/* --------------------------------------------------------------------------
   2. SCROLL FADE-IN ANIMATIONS
   Every element with the `.fade-in` class starts hidden (see CSS) and gets
   the `.is-visible` class added the moment it scrolls into the viewport.
   IntersectionObserver is used instead of a scroll listener for performance.
-------------------------------------------------------------------------- */
const fadeElements = document.querySelectorAll('.fade-in');

if ('IntersectionObserver' in window && fadeElements.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); // animate once, then stop watching
        }
      });
    },
    {
      threshold: 0.15,       // trigger once 15% of the element is visible
      rootMargin: '0px 0px -40px 0px',
    }
  );

  fadeElements.forEach((el) => observer.observe(el));
} else {
  // Fallback for very old browsers without IntersectionObserver support
  fadeElements.forEach((el) => el.classList.add('is-visible'));
}

/* --------------------------------------------------------------------------
   3. FOOTER YEAR
   Keeps the copyright year in the footer always current.
-------------------------------------------------------------------------- */
const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

/* --------------------------------------------------------------------------
   4. CONTACT FORM -> WHATSAPP
   --------------------------------------------------------------------------
   HOW THIS WORKS RIGHT NOW:
   The business's WhatsApp number is set up behind a short link
   (https://wa.link/juec21) rather than a raw phone number. Short links like
   this generally do NOT reliably accept a "?text=" parameter to pre-fill a
   message, so instead of relying on that, we:
     1. Build a nicely formatted message from the form fields.
     2. Copy that message to the visitor's clipboard.
     3. Open the WhatsApp link in a new tab.
     4. Show an on-screen confirmation telling them to paste + send.

   HOW TO GET TRUE PRE-FILLED MESSAGES:
   If you switch to a real WhatsApp phone number, you can generate a link
   like:
       https://wa.me/2348012345678?text=YOUR%20ENCODED%20MESSAGE
   which DOES open WhatsApp with the message already typed in, ready to
   send. See the WHATSAPP_PHONE_NUMBER constant below — fill it in and flip
   USE_DIRECT_PREFILL to true to switch the form to that method. Full
   instructions are also in the deployment notes provided alongside this
   file.
-------------------------------------------------------------------------- */

// --- EDIT THESE TWO LINES to switch to guaranteed pre-filled messages ---
const USE_DIRECT_PREFILL = false;              // set to true once you add a real number below
const WHATSAPP_PHONE_NUMBER = '2340000000000'; // country code + number, digits only, no + or spaces
// --------------------------------------------------------------------------

const WHATSAPP_SHORT_LINK = 'https://wa.link/juec21';

const contactForm = document.getElementById('contactForm');
const formNote = document.getElementById('formNote');

if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault(); // stop normal form submission (no backend here)

    // Pull values straight out of the form fields
    const name = contactForm.name.value.trim();
    const location = contactForm.location.value.trim();
    const service = contactForm.service.value;
    const message = contactForm.message.value.trim();

    // Build a clean, readable message for WhatsApp
    const whatsappMessage =
      `Hello ATESTAKI ENGINEERING, my name is ${name}.\n` +
      `Location: ${location}\n` +
      `Service needed: ${service}\n` +
      `Details: ${message}`;

    if (USE_DIRECT_PREFILL) {
      // --- Guaranteed pre-fill path (requires a real phone number) ---
      const encoded = encodeURIComponent(whatsappMessage);
      const directUrl = `https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encoded}`;
      window.open(directUrl, '_blank', 'noopener');
      showFormNote('WhatsApp is opening with your message ready to send.', true);
    } else {
      // --- Short-link path: copy message, then open WhatsApp ---
      copyToClipboard(whatsappMessage);
      window.open(WHATSAPP_SHORT_LINK, '_blank', 'noopener');
      showFormNote('WhatsApp is opening. Your message was copied — just paste (long-press → Paste) and hit send.', true);
    }

    contactForm.reset();
  });
}

// Small helper to show a success message under the form
function showFormNote(text, success) {
  if (!formNote) return;
  formNote.textContent = text;
  formNote.classList.toggle('is-success', Boolean(success));
}

// Small helper to copy text to the clipboard, with an older-browser fallback
function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).catch(() => {
      /* silently ignore — WhatsApp still opens even if copy fails */
    });
  } else {
    // Fallback for browsers without the Clipboard API / non-HTTPS pages
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      document.execCommand('copy');
    } catch (err) {
      /* ignore */
    }
    document.body.removeChild(textarea);
  }
}
