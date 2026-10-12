/**
 * Devuelve la paleta del tema actual (claro/oscuro) según el dispositivo.
 * Si el sistema no informa esquema, se usa el claro.
 * Más info: https://docs.expo.dev/guides/color-schemes/
 */
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

/** Paleta de colores (`text`, `background`, `accent`, …) del tema vigente. */
export function useTheme() {
  const scheme = useColorScheme();
  const theme = scheme === 'unspecified' ? 'light' : scheme;

  return Colors[theme];
}
