import { StyleSheet, type ViewProps } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

/** Contenedor base de las pantallas: fondo del tema + espaciado uniforme. */
export function Screen({ style, ...rest }: ViewProps) {
  return <ThemedView style={[styles.screen, style]} {...rest} />;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
  },
});
