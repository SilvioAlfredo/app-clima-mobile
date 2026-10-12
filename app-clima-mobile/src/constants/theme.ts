/**
 * Sistema visual de la app en modo claro y oscuro.
 * Los componentes acceden a la paleta vigente con `useTheme()`.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
    accent: '#2563EB',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
    accent: '#60A5FA',
  },
} as const;

/** Nombres de color disponibles en ambas paletas (`text`, `accent`, …). */
export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/** Familias tipográficas por plataforma (iOS, resto y web). */
export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

/** Escala de espaciado en píxeles (`one` = 4, `two` = 8, …). */
export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

/** Separación inferior de la barra de pestañas según plataforma. */
export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
/** Ancho máximo del contenido en pantallas grandes (web/tablet). */
export const MaxContentWidth = 800;
