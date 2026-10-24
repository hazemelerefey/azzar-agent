import './style.css';

import * as stylex from '@stylexjs/stylex';

import { cssVar } from '../styles/stylex/cssVar.stylex';

const reducedMotion = '@media (prefers-reduced-motion: reduce)';
const layoutAnimation = ':is([data-layout-animation])';
const instant = ':is([data-instant])';
const instantOrRepop = ':is([data-instant], [data-repop])';
const popupLayoutTiming =
  ':is([data-layout-animation]):not([data-repop], [data-ending-style], [data-instant])';
const popupLayoutProperty = ':is([data-layout-animation]):not([data-repop], [data-instant])';
const popupRepopTiming = ':is([data-repop]):not([data-ending-style], [data-instant])';
const popupEndingTiming = ':is([data-ending-style]):not([data-instant])';
const positionerLayout = ':is([data-layout-animation]):not([data-instant], [data-repop])';
const startingOrEnding = ':is([data-starting-style], [data-ending-style])';
const anchorHidden = ":is([data-anchor-hidden], [data-zero-origin='true'])";
const placementTop =
  ":is([data-placement='top'], [data-placement='topLeft'], [data-placement='topRight'])";
const placementLeft =
  ":is([data-placement='left'], [data-placement='leftTop'], [data-placement='leftBottom'])";
const placementRight =
  ":is([data-placement='right'], [data-placement='rightTop'], [data-placement='rightBottom'])";

export const styles = stylex.create({
  arrow: {
    '--azzar-tooltip-arrow-offset-block': '4px',
    '--azzar-tooltip-arrow-offset-inline': '6px',
    'transition':
      'inset-inline-start var(--azzar-tooltip-layout-duration) var(--azzar-tooltip-layout-ease), inset-block-start var(--azzar-tooltip-layout-duration) var(--azzar-tooltip-layout-ease)',
    'display': 'flex',
    'insetBlockEnd': {
      'default': null,
      ":is([data-side='top'])": 'calc(var(--azzar-tooltip-arrow-offset-block) * -1)',
    },
    'insetBlockStart': {
      'default': null,
      ":is([data-side='bottom'])": 'calc(var(--azzar-tooltip-arrow-offset-block) * -1)',
    },
    'insetInlineEnd': {
      'default': null,
      ":is([data-side='left'])": 'calc(var(--azzar-tooltip-arrow-offset-inline) * -1)',
    },
    'insetInlineStart': {
      'default': null,
      ":is([data-side='right'])": 'calc(var(--azzar-tooltip-arrow-offset-inline) * -1)',
    },
    'pointerEvents': 'none',
    'position': 'absolute',
    'transform': {
      'default': null,
      ":is([data-side='left'])": 'rotate(90deg)',
      ":is([data-side='right'])": 'rotate(-90deg)',
      ":is([data-side='top'])": 'rotate(180deg)',
    },
    'transformOrigin': 'center',
    'height': 4,
    'width': 8,
  },
  arrowStroke: {
    stroke: cssVar.colorBorderSecondary,
  },
  arrowSvg: {
    fill: cssVar.colorBgElevated,
    display: 'block',
    height: '100%',
    width: '100%',
  },

  popup: {
    borderRadius: cssVar.borderRadiusSM,
    backgroundColor: cssVar.colorBgElevated,
    boxShadow: `${cssVar.boxShadowTertiary}, var(--azzar-ring)`,
    boxSizing: 'border-box',
    color: cssVar.colorTextLabel,
    fontSize: cssVar.fontSizeSM,
    lineHeight: 1.2,
    opacity: { default: null, [startingOrEnding]: 0 },
    position: 'relative',
    transform: {
      default: null,
      [startingOrEnding]:
        'translate3d(var(--azzar-tooltip-translate-x), var(--azzar-tooltip-translate-y), 0) scale(var(--azzar-tooltip-animation-scale))',
    },
    transformOrigin: 'var(--transform-origin)',
    /* `transition: none` is spelled out as longhands because StyleX layers longhands above
       shorthands. StyleX does not keep condition order, so the old cascade
       (layout < repop < ending-style < instant) is encoded with :not() guards. */
    transitionDuration: {
      default: 'var(--azzar-tooltip-fade-duration), var(--azzar-tooltip-animation-duration)',
      [instant]: '0s',
      [popupEndingTiming]: 'var(--azzar-tooltip-animation-duration-exit)',
      [popupLayoutTiming]:
        'var(--azzar-tooltip-fade-duration), var(--azzar-tooltip-animation-duration), var(--azzar-tooltip-layout-duration), var(--azzar-tooltip-layout-duration)',
      [popupRepopTiming]: '0s',
    },
    transitionProperty: {
      default: 'opacity, transform',
      [instantOrRepop]: 'none',
      [popupLayoutProperty]: 'opacity, transform, width, height',
    },
    /* Opacity gets its own monotonic curve: running it on the overshooting spring makes the
       fade look finished at ~0.96, pause, then visibly step to 1 at the clamp point — reads
       as a dropped frame. The spring stays on transform only. */
    transitionTimingFunction: {
      default: 'var(--azzar-tooltip-fade-ease), var(--azzar-tooltip-animation-ease-out)',
      [instant]: 'ease',
      [popupEndingTiming]: 'var(--azzar-tooltip-animation-ease-in)',
      [popupLayoutTiming]:
        'var(--azzar-tooltip-fade-ease), var(--azzar-tooltip-animation-ease-out), var(--azzar-tooltip-layout-ease), var(--azzar-tooltip-layout-ease)',
      [popupRepopTiming]: 'ease',
    },
    userSelect: 'none',
    /* Keep the popup on its own compositor layer for its whole lifetime: when the opacity
       transition ends the browser otherwise drops the layer and re-rasterizes with pixel
       snapping — a visible one-frame shift when the measured width is fractional
       (single-line tooltips). */
    willChange: 'transform, opacity',
    height: { default: null, [layoutAnimation]: 'var(--popup-height, auto)' },
    /* The 320px cap lives on the viewport, not here: Base UI measures content with
       --available-width set to max-content, and min(320px, max-content) is invalid, which
       recorded unclamped sizes. A percentage cap is out too — it tracks the positioner, which
       snaps to the new size and would freeze the shrink half of the morph. */
    maxWidth: 'var(--available-width)',
    /* Base UI writes the old size into --popup-width/height on a trigger switch and the new size
       one frame later; the box only morphs if width/height actually read them. */
    width: { default: null, [layoutAnimation]: 'var(--popup-width, auto)' },
  },

  positioner: {
    /* motionSpringBouncy is a spring shape normalized to its settle time, so each duration
       here is that spring's settle time — change them together, not independently. */
    '--azzar-tooltip-animation-duration': { default: '280ms', [reducedMotion]: '0s' },
    '--azzar-tooltip-animation-duration-exit': { default: '100ms', [reducedMotion]: '0s' },
    '--azzar-tooltip-animation-ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
    '--azzar-tooltip-animation-ease-out': cssVar.motionSpringBouncy,
    '--azzar-tooltip-animation-scale': '0.97',
    '--azzar-tooltip-animation-translate': '3px',
    '--azzar-tooltip-fade-duration': { default: '160ms', [reducedMotion]: '0s' },
    '--azzar-tooltip-fade-ease': 'cubic-bezier(0.33, 1, 0.68, 1)',
    '--azzar-tooltip-layout-duration': { default: '380ms', [reducedMotion]: '0s' },
    '--azzar-tooltip-layout-ease': cssVar.motionSpringBouncy,
    '--azzar-tooltip-translate-x': {
      default: '0',
      [placementLeft]: 'var(--azzar-tooltip-animation-translate)',
      [placementRight]: 'calc(var(--azzar-tooltip-animation-translate) * -1)',
    },
    '--azzar-tooltip-translate-y': {
      default: 'calc(var(--azzar-tooltip-animation-translate) * -1)',
      [placementLeft]: '0',
      [placementRight]: '0',
      [placementTop]: 'var(--azzar-tooltip-animation-translate)',
    },
    /* Never show a tooltip when the anchor is hidden or the positioner falls back to (0,0). */
    'pointerEvents': { [anchorHidden]: 'none', default: null },
    'transitionDuration': {
      default: 'var(--azzar-tooltip-animation-duration)',
      [instantOrRepop]: '0s',
      [positionerLayout]: 'var(--azzar-tooltip-layout-duration)',
    },
    'transitionProperty': {
      default: 'none',
      [positionerLayout]:
        'inset-block-start, inset-inline-start, inset-inline-end, inset-block-end, transform',
    },
    'transitionTimingFunction': {
      default: 'var(--azzar-tooltip-animation-ease-out)',
      [instantOrRepop]: 'ease',
      [positionerLayout]: 'var(--azzar-tooltip-layout-ease)',
    },
    'visibility': { [anchorHidden]: 'hidden', default: null },
    'willChange': 'transform, opacity',
    'zIndex': 114_514,
    'height': 'var(--positioner-height)',
    'width': 'min(var(--positioner-width), 320px, var(--available-width))',
  },

  viewport: {
    '--azzar-tooltip-content-blur': '4px',
    '--azzar-tooltip-content-shift': '8px',
    '--azzar-tooltip-viewport-inline-padding': '8px',
    'overflow': 'clip',
    'paddingBlock': 4,
    'paddingInline': 'var(--azzar-tooltip-viewport-inline-padding)',
    'overflowWrap': 'break-word',
    'position': 'relative',
    'whiteSpace': 'normal',
    'maxWidth': 'calc(320px - 2px)',
  },
});
