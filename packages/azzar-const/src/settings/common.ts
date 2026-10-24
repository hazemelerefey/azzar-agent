import type { UserGeneralConfig } from '@azzar/types';

export const DEFAULT_COST_ESTIMATE_WARNING_THRESHOLD = 0.5;

export const DEFAULT_COMMON_SETTINGS: UserGeneralConfig = {
  animationMode: 'agile',
  // contextMenuMode not set default value, use env to calc
  costEstimateWarningThreshold: DEFAULT_COST_ESTIMATE_WARNING_THRESHOLD,
  fontSize: 14,
  highlighterTheme: 'azzar-theme',
  isDevMode: false,
  isLiteMode: false,
  mermaidTheme: 'azzar-theme',
  telemetry: true,
  transitionMode: 'fadeIn',
};
