// js/modal-util.js
// Shared accessible-dialog helpers used by the case detail and the event card:
// make the rest of the page inert while a modal is open, trap Tab within the
// dialog, and (in the modal modules) restore focus to the opener on close.

const BG_IDS = ['hero', 'primer', 'controls', 'scroller', 'disclaimer'];
const FOCUSABLE = 'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])';

// Hide the page behind the dialog from AT and pointer/keyboard interaction.
export function setBackgroundInert(on) {
  BG_IDS.forEach(id => {
    const elx = document.getElementById(id);
    if (!elx) return;
    if (on) { elx.setAttribute('inert', ''); elx.setAttribute('aria-hidden', 'true'); }
    else { elx.removeAttribute('inert'); elx.removeAttribute('aria-hidden'); }
  });
}

// Wrap-around Tab handling so focus can't leave the dialog. Call from the card's
// keydown handler. Returns true if it handled the event.
export function trapTab(card, e) {
  if (e.key !== 'Tab') return false;
  const items = [...card.querySelectorAll(FOCUSABLE)].filter(elx => !elx.closest('[hidden]'));
  if (!items.length) { e.preventDefault(); card.focus(); return true; }
  const first = items[0], last = items[items.length - 1];
  const active = document.activeElement;
  if (e.shiftKey && (active === first || active === card)) { e.preventDefault(); last.focus(); return true; }
  if (!e.shiftKey && active === last) { e.preventDefault(); first.focus(); return true; }
  return false;
}
