/**
 * Typography hierarchy for the app
 *
 * Scale (largest → smallest):
 *   display  → Hero numbers, big stats (40px)
 *   h1       → Page titles (32px)
 *   h2       → Section titles (24px)
 *   h3       → Card titles, subtitles (20px)
 *   bodyLg   → Emphasized body (18px)
 *   body     → Default body (16px)
 *   bodySm   → Secondary body (14px)
 *   caption  → Labels, hints, metadata (12px)
 *   overline → Tiny labels (11px)
 */

import { TextStyle } from 'react-native';
import { Colors } from './colors';

export const FontSizes = {
  overline: 11,
  caption: 12,
  bodySm: 14,
  body: 16,
  bodyLg: 18,
  h3: 20,
  h2: 24,
  h1: 32,
  display: 40,
} as const;

export type FontSizeKey = keyof typeof FontSizes;

export const LineHeights = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.625,
} as const;

export const FontWeights = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const Typography: Record<string, TextStyle> = {
  display: {
    fontSize: FontSizes.display,
    fontWeight: FontWeights.bold,
    lineHeight: 48,
    color: Colors.text,
  },
  h1: {
    fontSize: FontSizes.h1,
    fontWeight: FontWeights.bold,
    lineHeight: 40,
    color: Colors.text,
  },
  h2: {
    fontSize: FontSizes.h2,
    fontWeight: FontWeights.bold,
    lineHeight: 32,
    color: Colors.text,
  },
  h3: {
    fontSize: FontSizes.h3,
    fontWeight: FontWeights.semibold,
    lineHeight: 28,
    color: Colors.text,
  },
  bodyLg: {
    fontSize: FontSizes.bodyLg,
    lineHeight: 28,
    color: Colors.text,
  },
  body: {
    fontSize: FontSizes.body,
    lineHeight: 24,
    color: Colors.text,
  },
  bodySm: {
    fontSize: FontSizes.bodySm,
    lineHeight: 20,
    color: Colors.text,
  },
  bodySecondary: {
    fontSize: FontSizes.body,
    lineHeight: 24,
    color: Colors.textSecondary,
  },
  caption: {
    fontSize: FontSizes.caption,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  label: {
    fontSize: FontSizes.bodySm,
    fontWeight: FontWeights.medium,
    color: Colors.textSecondary,
  },
  overline: {
    fontSize: FontSizes.overline,
    fontWeight: FontWeights.medium,
    lineHeight: 14,
    color: Colors.textMuted,
  },
  link: {
    fontSize: FontSizes.body,
    lineHeight: 24,
    color: Colors.accent,
  },
};
