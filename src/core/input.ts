const INPUT_ID = 'asgs-hidden-input';
let initialized = false;

function ensureElement(): HTMLInputElement | null {
  if (typeof document === 'undefined') return null;
  let element = document.getElementById(INPUT_ID) as HTMLInputElement | null;
  if (!element) {
    element = document.createElement('input');
    element.id = INPUT_ID;
    element.type = 'text';
    element.autocomplete = 'off';
    element.autocapitalize = 'none';
    element.style.position = 'fixed';
    element.style.opacity = '0';
    element.style.pointerEvents = 'none';
    element.style.left = '-9999px';
    document.body.appendChild(element);
  }
  return element;
}

export function ensureKeyboardFocus() {
  const element = ensureElement();
  if (!element) return;
  if (document.activeElement !== element) {
    element.focus({ preventScroll: true });
  }
}

export function initKeyboardFocus() {
  if (initialized || typeof document === 'undefined') return;
  const element = ensureElement();
  if (!element) return;
  const handler = () => ensureKeyboardFocus();
  document.addEventListener('touchstart', handler, { passive: true });
  document.addEventListener('pointerdown', handler, { passive: true });
  initialized = true;
  ensureKeyboardFocus();
}

export function teardownKeyboardFocus() {
  if (typeof document === 'undefined') return;
  const element = document.getElementById(INPUT_ID);
  if (element) {
    element.remove();
  }
  initialized = false;
}
