import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import type { WeatherIconName } from '@/constants/weather';
import { useTheme } from '@/hooks/use-theme';

/** Props de `StateMessage`: icono, textos y acción opcional. */
export type StateMessageProps = {
  icon: WeatherIconName;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  /** Muestra un indicador de carga en lugar del icono. */
  loading?: boolean;
};

/** Mensaje centrado para estados de carga, error o vacíos. */
export function StateMessage({
  icon,
  title,
  message,
  actionLabel,
  onAction,
  loading,
}: StateMessageProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color={theme.accent} />
      ) : (
        <MaterialCommunityIcons name={icon} size={52} color={theme.textSecondary} />
      )}

      <ThemedText style={styles.title}>{title}</ThemedText>

      {message ? (
        <ThemedText type="small" themeColor="textSecondary" style={styles.message}>
          {message}
        </ThemedText>
      ) : null}

      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}>
          <ThemedText type="smallBold" style={styles.actionText}>
            {actionLabel}
          </ThemedText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.six,
    paddingHorizontal: Spacing.three,
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
  },
  action: {
    marginTop: Spacing.one,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
    backgroundColor: '#2563EB',
  },
  actionPressed: {
    opacity: 0.8,
  },
  actionText: {
    color: '#ffffff',
  },
});
