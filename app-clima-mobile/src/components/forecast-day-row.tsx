import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, View } from 'react-native';

import type { DailyForecast } from '@/api/open-meteo';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { weatherIcon, weatherLabel } from '@/constants/weather';
import { useTheme } from '@/hooks/use-theme';
import { formatDayShort, formatTemperature, formatWind } from '@/utils/format';

/** Props de `ForecastDayRow`: día a mostrar y detalle opcional. */
export type ForecastDayRowProps = {
  day: DailyForecast;
  /** Agrega el detalle de viento (pantalla de pronóstico extendido). */
  showDetails?: boolean;
};

/** Fila con el pronóstico de un día: condición, lluvia y mínima/máxima. */
export function ForecastDayRow({ day, showDetails }: ForecastDayRowProps) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      <View style={styles.dayBlock}>
        <ThemedText type="smallBold">{formatDayShort(day.date)}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
          {weatherLabel(day.weatherCode)}
        </ThemedText>
        {showDetails && day.windSpeed != null ? (
          <ThemedText type="small" themeColor="textSecondary">
            Viento {formatWind(day.windSpeed)}
          </ThemedText>
        ) : null}
      </View>

      <MaterialCommunityIcons
        name={weatherIcon(day.weatherCode, true)}
        size={30}
        color={theme.accent}
      />

      <View style={styles.rainBlock}>
        <MaterialCommunityIcons name="water" size={15} color={theme.accent} />
        <ThemedText type="small" themeColor="textSecondary">
          {day.precipitationProbability ?? 0}%
        </ThemedText>
      </View>

      <View style={styles.temps}>
        <ThemedText type="small" themeColor="textSecondary">
          {formatTemperature(day.tempMin)}
        </ThemedText>
        <ThemedText type="smallBold">{formatTemperature(day.tempMax)}</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128,128,128,0.35)',
  },
  dayBlock: {
    flex: 1,
    gap: 2,
  },
  rainBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.half,
    width: 56,
  },
  temps: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    width: 74,
    justifyContent: 'flex-end',
  },
});
