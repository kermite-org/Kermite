export function windowKeyboardEventEffect(handler: (e: KeyboardEvent) => void) {
  window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
}
