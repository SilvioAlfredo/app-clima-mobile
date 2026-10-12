import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { weatherIcon, weatherLabel } from '@/constants/weather';
import type { CurrentWeather } from '@/api/open-meteo';
import { formatTemperature, formatWind } from '@/utils/format';

/** Props de `WeatherHero`: clima actual a mostrar. */
export type WeatherHeroProps = {
  current: CurrentWeather;
};

/** Tarjeta con el clima actual: temperatura, condición y datos de detalle. */
export function WeatherHero({ current }: WeatherHeroProps) {
  return (
    <View style={styles.card}>
      <View style={styles.mainRow}>
        <MaterialCommunityIcons
          name={weatherIcon(current.weatherCode, current.isDay)}
          size={84}
          color="#F5A524"
        />
        <View style={styles.mainText}>
          <ThemedText style={styles.temperature}>
            {formatTemperature(current.temperature)}
          </ThemedText>
          <ThemedText style={styles.condition}>{weatherLabel(current.weatherCode)}</ThemedText>
          <ThemedText style={styles.feelsLike}>
            Sensación térmica {formatTemperature(current.feelsLike)}
          </ThemedText>
        </View>
      </View>

      <View style={styles.statsRow}>
        <Stat label="Humedad" value={`${Math.round(current.humidity)}%`} />
        <Stat label="Viento" value={formatWind(current.windSpeed)} />
        <Stat label="Lluvia" value={`${current.precipitation.toFixed(1)} mm`} />
      </View>
    </View>
  );
}

/** Dato con etiqueta de la fila inferior (humedad, viento, lluvia). */
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <ThemedText style={styles.statValue}>{value}</ThemedText>
      <ThemedText style={styles.statLabel}>{label}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#2563EB',
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.four,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  mainText: {
    flex: 1,
    gap: Spacing.half,
  },
  temperature: {
    color: '#ffffff',
    fontSize: 56,
    lineHeight: 60,
    fontWeight: '700',
  },
  condition: {
    color: '#ffffff',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
  },
  feelsLike: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    lineHeight: 20,
  },
  statValue: {
    color: '#ffffff',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.4)',
    paddingTop: Spacing.three,
  },
  stat: {
    alignItems: 'center',
    gap: 2,
  },
});
