import { StyleSheet, Text, type TextProps } from 'react-native';

import { Colors, FontSizes } from '@/lib/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: FontSizes.body,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: FontSizes.body,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: FontSizes.h1,
    fontWeight: 'bold',
    lineHeight: 40,
  },
  subtitle: {
    fontSize: FontSizes.h3,
    fontWeight: 'bold',
  },
  link: {
    lineHeight: 24,
    fontSize: FontSizes.body,
    color: Colors.accent,
  },
});
