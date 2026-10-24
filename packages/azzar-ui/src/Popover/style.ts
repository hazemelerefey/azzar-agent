import './style.css';

import * as stylex from '@stylexjs/stylex';

import { cssVar } from '../styles/stylex/cssVar.stylex';

const reducedMotion = '@media (prefers-reduced-motion: reduce)';
const layoutAnimation = ':is([data-layout-animation])';
const instantOrRepop = ':is([data-instant], [data-repop])';
const instant = ':is([data-instant])';
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
    '--azzar-popover-arrow-offset-block': '5px',
    '--azzar-popover-arrow-offset-inline': '8px',
    'transition':
      'inset-inline-start var(--azzar-popover-layout-duration) var(--azzar-popover-layout-ease), inset-block-start var(--azzar-popover-layout-duration) var(--azzar-popover-layout-ease)',
    'display': 'flex',
    'insetBlockEnd': {
      'default': null,
      ":is([data-side='top'])": 'calc(var(--azzar-popover-arrow-offset-block) * -1)',
    },
    'insetBlockStart': {
      'default': null,
      ":is([data-side='bottom'])": 'calc(var(--azzar-popover-arrow-offset-block) * -1)',
    },
    'insetInlineEnd': {
      'default': null,
      ":is([data-side='left'])": 'calc(var(--azzar-popover-arrow-offset-inline) * -1)',
    },
    'insetInlineStart': {
      'default': null,
      ":is([data-side='right'])": 'calc(var(--azzar-popover-arrow-offset-inline) * -1)',
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
    'height': 6,
    'width': 12,
  },
  arrowFill: {
    fill: cssVar.colorBgElevated,
  },
  arrowStroke: {
    fill: 'none',
    stroke: cssVar.colorBorder,
    strokeWidth: '1px',
  },
  arrowSvg: {
    display: 'block',
    height: '100%',
    width: '100%',
  },

  popup: {
    borderRadius: cssVar.borderRadius,
    outline: 'none',
    backgroundColor: cssVar.colorBgElevated,
    boxShadow: `${cssVar.boxShadowSecondary}, var(--azzar-ring)`,
    boxSizing: 'border-box',
    color: cssVar.colorText,
    opacity: { default: null, [startingOrEnding]: 0 },
    position: 'relative',
    transform: {
      default: null,
      [startingOrEnding]:
        'translate3d(var(--azzar-popover-translate-x), var(--azzar-popover-translate-y), 0) scale(var(--azzar-popover-animation-scale))',
    },
    transformOrigin: 'var(--transform-origin)',
    transitionDuration: {
      default: 'var(--azzar-popover-animation-duration)',
      [instant]: '0s',
      [popupEndingTiming]: 'var(--azzar-popover-animation-duration-exit)',
      [popupLayoutTiming]:
        'var(--azzar-popover-animation-duration), var(--azzar-popover-animation-duration), var(--azzar-popover-layout-duration), var(--azzar-popover-layout-duration)',
      [popupRepopTiming]: '0s',
    },
    transitionProperty: {
      default: 'opacity, transform',
      [instantOrRepop]: 'none',
      [popupLayoutProperty]: 'opacity, transform, width, height',
    },
    transitionTimingFunction: {
      default: 'var(--azzar-popover-animation-ease-out)',
      [instant]: 'ease',
      [popupEndingTiming]: 'var(--azzar-popover-animation-ease-in)',
      [popupLayoutTiming]:
        'var(--azzar-popover-animation-ease-out), var(--azzar-popover-animation-ease-out), var(--azzar-popover-layout-ease), var(--azzar-popover-layout-ease)',
      [popupRepopTiming]: 'ease',
    },
    height: { default: null, [layoutAnimation]: 'var(--popup-height, auto)' },
    maxWidth: 'var(--available-width)',
    minWidth: 120,
    width: { default: null, [layoutAnimation]: 'var(--popup-width, auto)' },
  },

  positioner: {
    '--azzar-popover-animation-duration': '150ms',
    '--azzar-popover-animation-duration-exit': '75ms',
    '--azzar-popover-animation-ease-in': 'ease-in',
    '--azzar-popover-animation-ease-out': cssVar.motionEaseOut,
    '--azzar-popover-animation-scale': '0.96',
    '--azzar-popover-animation-translate': '6px',
    '--azzar-popover-layout-duration': { default: '380ms', [reducedMotion]: '0s' },
    '--azzar-popover-layout-ease': cssVar.motionSpringBouncy,
    '--azzar-popover-translate-x': {
      default: '0',
      [placementLeft]: 'var(--azzar-popover-animation-translate)',
      [placementRight]: 'calc(var(--azzar-popover-animation-translate) * -1)',
    },
    '--azzar-popover-translate-y': {
      default: 'calc(var(--azzar-popover-animation-translate) * -1)',
      [placementLeft]: '0',
      [placementRight]: '0',
      [placementTop]: 'var(--azzar-popover-animation-translate)',
    },
    'pointerEvents': { [anchorHidden]: 'none', default: null },
    'transitionDuration': {
      default: 'var(--azzar-popover-animation-duration)',
      [instantOrRepop]: '0s',
      [positionerLayout]: 'var(--azzar-popover-layout-duration)',
    },
    'transitionProperty': {
      default: 'none',
      [positionerLayout]:
        'inset-block-start, inset-inline-start, inset-inline-end, inset-block-end, transform',
    },
    'transitionTimingFunction': {
      default: 'var(--azzar-popover-animation-ease-out)',
      [instantOrRepop]: 'ease',
      [positionerLayout]: 'var(--azzar-popover-layout-ease)',
    },
    'visibility': { [anchorHidden]: 'hidden', default: null },
    'zIndex': 1100,
    'height': 'var(--positioner-height)',
    'width': 'min(var(--positioner-width), var(--available-width))',
  },

  viewport: {
    '--azzar-popover-content-blur': '4px',
    '--azzar-popover-content-shift': '8px',
    '--azzar-popover-viewport-inline-padding': '12px',
    'overflow': 'clip',
    'paddingBlock': 12,
    'paddingInline': 'var(--azzar-popover-viewport-inline-padding)',
    'position': 'relative',
  },
});
