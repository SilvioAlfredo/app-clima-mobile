import { View, type ViewProps } from 'react-native';

import { ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedViewProps = ViewProps & {
  /** Colores explícitos que pisan al tema (raro: preferir `type`). */
  lightColor?: string;
  darkColor?: string;
  /** Color del tema como fondo; por defecto `'background'`. */
  type?: ThemeColor;
};

/** Vista con el color de fondo del tema actual (claro/oscuro). */
export function ThemedView({ style, lightColor, darkColor, type, ...otherProps }: ThemedViewProps) {
  const theme = useTheme();

  return <View style={[{ backgroundColor: theme[type ?? 'background'] }, style]} {...otherProps} />;
}
