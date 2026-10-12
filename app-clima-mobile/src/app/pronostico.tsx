import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { createPlace, type Place } from '@/api/open-meteo';
import { ForecastDayRow } from '@/components/forecast-day-row';
import { Screen } from '@/components/screen';
import { StateMessage } from '@/components/state-message';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { weatherIcon, weatherLabel } from '@/constants/weather';
import { useForecast } from '@/hooks/use-forecast';
import { useTheme } from '@/hooks/use-theme';
import { formatHour, formatTemperature } from '@/utils/format';

/** Parámetros de ruta que recibe la pantalla (`lat`, `lon`, `name`, `detail`). */
type ForecastParams = {
  lat?: string;
  lon?: string;
  name?: string;
  detail?: string;
};

/** Pantalla de pronóstico extendido: próximas 24 horas y 5 días. */
export default function ForecastScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<ForecastParams>();

  // La ubicación llega por parámetros de la ruta (latitud, longitud y nombre).
  const place = useMemo<Place | null>(() => {
    const latitude = Number(params.lat);
    const longitude = Number(params.lon);
    if (!params.lat || !params.lon || Number.isNaN(latitude) || Number.isNaN(longitude)) {
      return null;
    }
    return createPlace({
      name: params.name ?? 'Ubicación',
      detail: params.detail ?? '',
      latitude,
      longitude,
      source: 'search',
    });
  }, [params.lat, params.lon, params.name, params.detail]);

  const { forecast, error, loading, refresh } = useForecast(place, true);

  if (!place) {
    return (
      <Screen>
        <StateMessage
          icon="cloud-alert"
          title="No se recibió la ubicación"
          message="Volvé al inicio y volvé a intentar."
          actionLabel="Volver al inicio"
          onAction={() => router.back()}
        />
      </Screen>
    );
  }

  if (loading) {
    return (
      <Screen>
        <StateMessage loading icon="weather-cloudy" title="Cargando pronóstico…" />
      </Screen>
    );
  }

  if (error || !forecast) {
    return (
      <Screen>
        <StateMessage
          icon="cloud-alert"
          title="No se pudo cargar el pronóstico"
          message={error ?? undefined}
          actionLabel="Reintentar"
          onAction={refresh}
        />
      </Screen>
    );
  }

  const next24Hours = forecast.hourly.slice(0, 24);

  return (
    <Screen>
      <Stack.Screen options={{ title: place.name }} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.summary}>
          <MaterialCommunityIcons
            name={weatherIcon(forecast.current.weatherCode, forecast.current.isDay)}
            size={64}
            color="#F5A524"
          />
          <View style={styles.summaryText}>
            <ThemedText style={styles.summaryTemperature}>
              {formatTemperature(forecast.current.temperature)}
            </ThemedText>
            <ThemedText style={styles.summaryCondition}>
              {weatherLabel(forecast.current.weatherCode)}
            </ThemedText>
            {place.detail ? (
              <ThemedText type="small" style={styles.summaryDetail}>
                {place.detail}
              </ThemedText>
            ) : null}
          </View>
        </View>

        <ThemedText style={styles.sectionTitle}>Próximas 24 horas</ThemedText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hours}>
          {next24Hours.map((hour) => (
            <View
              key={hour.time}
              style={[styles.hourCard, { backgroundColor: theme.backgroundElement }]}>
              <ThemedText type="small" themeColor="textSecondary">
                {formatHour(hour.time)}
              </ThemedText>
              <MaterialCommunityIcons
                name={weatherIcon(hour.weatherCode, true)}
                size={28}
                color={theme.accent}
              />
              <ThemedText type="smallBold">{formatTemperature(hour.temperature)}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {hour.precipitationProbability ?? 0}%
              </ThemedText>
            </View>
          ))}
        </ScrollView>

        <ThemedText style={styles.sectionTitle}>
          Pronóstico de {forecast.daily.length} días
        </ThemedText>

        {forecast.daily.map((day) => (
          <ForecastDayRow key={day.date} day={day} showDetails />
        ))}

        <ThemedText type="small" themeColor="textSecondary" style={styles.footer}>
          Datos de Open-Meteo · Actualizado {formatHour(forecast.current.observedAt)}
        </ThemedText>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.three,
    paddingBottom: Spacing.five,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    backgroundColor: '#2563EB',
    borderRadius: Spacing.four,
    padding: Spacing.four,
  },
  summaryText: {
    flex: 1,
    gap: 2,
  },
  summaryTemperature: {
    color: '#ffffff',
    fontSize: 44,
    lineHeight: 48,
    fontWeight: '700',
  },
  summaryCondition: {
    color: '#ffffff',
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '600',
  },
  summaryDetail: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '600',
    marginTop: Spacing.one,
  },
  hours: {
    gap: Spacing.two,
    paddingVertical: Spacing.one,
    paddingRight: Spacing.two,
  },
  hourCard: {
    alignItems: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
    minWidth: 76,
  },
  footer: {
    textAlign: 'center',
    marginTop: Spacing.two,
  },
});
