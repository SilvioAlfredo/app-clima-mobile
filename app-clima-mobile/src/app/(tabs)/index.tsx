import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { ForecastDayRow } from '@/components/forecast-day-row';import { Screen } from '@/components/screen';
import { StateMessage } from '@/components/state-message';
import { ThemedText } from '@/components/themed-text';
import { WeatherHero } from '@/components/weather-hero';
import { Spacing } from '@/constants/theme';
import { useForecast } from '@/hooks/use-forecast';
import { useTheme } from '@/hooks/use-theme';
import { useCurrentPlace } from '@/providers/current-place';
import { useFavorites } from '@/providers/favorites';
import { formatHour } from '@/utils/format';

/** Pantalla de inicio: clima actual de la ubicación detectada o seleccionada. */
export default function HomeScreen() {
  const theme = useTheme();
  const { place, status, error, isDeviceLocation, refreshDeviceLocation } = useCurrentPlace();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { forecast, error: forecastError, loading, refreshing, refresh } = useForecast(place);

  if (status === 'cargando') {
    return (
      <Screen>
        <StateMessage
          loading
          icon="crosshairs-gps"
          title="Detectando tu ubicación…"
          message="Estamos buscando el clima de tu zona."
        />
      </Screen>
    );
  }

  if (!place || status === 'error') {
    return (
      <Screen>
        <StateMessage
          icon="map-marker-radius-outline"
          title="No pudimos usar tu ubicación"
          message={error ?? undefined}
          actionLabel="Buscar una ciudad"
          onAction={() => router.push('/buscar')}
        />
      </Screen>
    );
  }

  const favorite = isFavorite(place.id);
  const openForecast = () =>
    router.push({
      pathname: '/pronostico',
      params: {
        lat: String(place.latitude),
        lon: String(place.longitude),
        name: place.name,
        detail: place.detail,
      },
    });

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={theme.accent}
            colors={[theme.accent]}
          />
        }>
        <View style={styles.locationRow}>
          <View style={styles.locationText}>
            <ThemedText style={styles.placeName} numberOfLines={1}>
              {place.name}
            </ThemedText>
            {place.detail ? (
              <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                {place.detail}
              </ThemedText>
            ) : null}
            <ThemedText type="small" themeColor="textSecondary">
              {isDeviceLocation ? 'Ubicación del dispositivo' : 'Ciudad seleccionada'}
            </ThemedText>
          </View>

          <View style={styles.locationActions}>
            <IconButton
              icon={favorite ? 'star' : 'star-outline'}
              color={favorite ? '#F5A524' : theme.textSecondary}
              label={favorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
              onPress={() => toggleFavorite(place)}
            />
            <IconButton
              icon="refresh"
              color={theme.accent}
              label="Usar mi ubicación"
              onPress={() => void refreshDeviceLocation()}
            />
          </View>
        </View>

        {forecastError && !loading ? (
          <StateMessage
            icon="cloud-alert"
            title="No se pudo cargar el clima"
            message={forecastError}
            actionLabel="Reintentar"
            onAction={refresh}
          />
        ) : forecast ? (
          <>
            <WeatherHero current={forecast.current} />

            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>Próximos días</ThemedText>
              <Pressable onPress={openForecast} hitSlop={8}>
                <ThemedText type="small" themeColor="textSecondary">
                  Ver todo
                </ThemedText>
              </Pressable>
            </View>

            {forecast.daily.slice(0, 3).map((day) => (
              <ForecastDayRow key={day.date} day={day} />
            ))}

            <Pressable
              onPress={openForecast}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}>
              <ThemedText style={styles.primaryButtonText}>Ver pronóstico de 5 días</ThemedText>
              <Ionicons name="arrow-forward" size={18} color="#ffffff" />
            </Pressable>

            <ThemedText type="small" themeColor="textSecondary" style={styles.footer}>
              Datos de Open-Meteo · Actualizado {formatHour(forecast.current.observedAt)}
            </ThemedText>
          </>
        ) : (
          <StateMessage loading icon="weather-cloudy" title="Cargando el clima…" />
        )}
      </ScrollView>
    </Screen>
  );
}

/** Botón circular con icono (favorito / mi ubicación). */
function IconButton({
  icon,
  color,
  label,
  onPress,
}: {
  icon: 'star' | 'star-outline' | 'refresh';
  color: string;
  label: string;
  onPress: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityLabel={label}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.iconButton,
        pressed && { backgroundColor: theme.backgroundSelected },
      ]}>
      <Ionicons name={icon} size={22} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.three,
    paddingBottom: Spacing.five,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  locationText: {
    flex: 1,
    gap: 2,
  },
  placeName: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
  },
  locationActions: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.one,
  },
  sectionTitle: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '600',
  },
  primaryButton: {
    marginTop: Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    backgroundColor: '#2563EB',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
  },
  primaryButtonPressed: {
    opacity: 0.85,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    textAlign: 'center',
    marginTop: Spacing.one,
  },
});
