export const focusRingColor = (color: string) => `color-mix(in srgb, ${color} 90%, transparent)`;

export const globalFocusRingCSS = `
[data-azzar-global-focus-ring] {
  all: initial;
  position: fixed;
  position-anchor: --azzar-global-focus;
  top: anchor(top);
  right: anchor(right);
  bottom: anchor(bottom);
  left: anchor(left);
  position-visibility: anchors-visible;
  pointer-events: none;
  border-radius: inherit;
  outline: 2px solid ${focusRingColor('var(--azzar-focus-ring-color)')};
  outline-offset: 2px;
  animation: azzar-global-focus-in 200ms cubic-bezier(0.22, 1, 0.36, 1);
}
[data-azzar-global-focus-ring]:not(:popover-open) { display: none; }
[data-azzar-global-focus-ring]::backdrop { background: transparent; pointer-events: none; }
@keyframes azzar-global-focus-in {
  from { opacity: 0.25; outline-offset: 5px; }
  to { opacity: 1; outline-offset: 2px; }
}
@media (prefers-reduced-motion: reduce) {
  [data-azzar-global-focus-ring] { animation: none; }
}
@media (forced-colors: active) {
  [data-azzar-global-focus-ring] { outline-color: CanvasText; animation: none; }
}
`;
