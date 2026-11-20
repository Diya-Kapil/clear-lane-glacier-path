/** Visual + haptic alerts. Clear Lane never relies on sound. */
export function vibrate(pattern: number[] = [200, 100, 200, 100, 400]) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try { navigator.vibrate(pattern); } catch { /* unsupported */ }
  }
}

export function flashScreen() {
  if (typeof document === "undefined") return;
  const el = document.createElement("div");
  el.setAttribute("aria-hidden", "true");
  el.className = "screen-flash pointer-events-none fixed inset-0 z-[90] bg-primary-glow";
  el.style.opacity = "0";
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1600);
}
