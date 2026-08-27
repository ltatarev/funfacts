/** True when the key event comes from a field the user types into. */
export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

/** True while a modal owns the keyboard. */
export function isDialogOpen(): boolean {
  return document.querySelector('[role="dialog"]') !== null;
}
