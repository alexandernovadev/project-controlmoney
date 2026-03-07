/**
 * Base typography for the app
 */

import { TextStyle } from 'react-native';
import { Colors } from './colors';

export const FontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
} as const;

export const FontWeights = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const Typography: Record<string, TextStyle> = {
  h1: {
    fontSize: FontSizes['3xl'],
    fontWeight: FontWeights.bold,
    lineHeight: 40,
    color: Colors.text,
  },
  h2: {
    fontSize: FontSizes['2xl'],
    fontWeight: FontWeights.bold,
    lineHeight: 32,
    color: Colors.text,
  },
  h3: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.semibold,
    lineHeight: 28,
    color: Colors.text,
  },
  body: {
    fontSize: FontSizes.base,
    lineHeight: 24,
    color: Colors.text,
  },
  bodySecondary: {
    fontSize: FontSizes.base,
    lineHeight: 24,
    color: Colors.textSecondary,
  },
  caption: {
    fontSize: FontSizes.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
    color: Colors.textSecondary,
  },
  link: {
    fontSize: FontSizes.base,
    lineHeight: 24,
    color: Colors.accent,
  },
};
