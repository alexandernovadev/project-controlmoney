/**
 * Returns theme color. App is dark-mode only.
 */
import { Colors } from '@/lib/theme';

type ColorKey = keyof typeof Colors;

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: ColorKey
): string {
  return props.dark ?? Colors[colorName];
}
