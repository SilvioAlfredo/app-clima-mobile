import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { fetchCurrentWeather, type Place } from '@/api/open-meteo';
import { Screen } from '@/components/screen';
import { StateMessage } from '@/components/state-message';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { weatherIcon } from '@/constants/weather';
import { useTheme } from '@/hooks/use-theme';
import { useCurrentPlace } from '@/providers/current-place';
import { useFavorites } from '@/providers/favorites';
import { formatTemperature } from '@/utils/format';

/** Clima resumido de una favorita (lo que muestra su fila). */
type FavoriteWeather = {
  temperature: number;
  weatherCode: number;
  isDay: boolean;
};

/** Pantalla con las ciudades guardadas y su clima actual. */
export default function FavoritesScreen() {
  const theme = useTheme();
  const { selectPlace } = useCurrentPlace();
  const { favorites, ready, removeFavorite } = useFavorites();
  const [weather, setWeather] = useState<Record<string, FavoriteWeather | null>>({});

  // Consulta la temperatura actual de cada ciudad guardada.
  useEffect(() => {
    let cancelled = false;

    async function load() {
      const entries = await Promise.all(
        favorites.map(async (favorite): Promise<[string, FavoriteWeather | null]> => {
          try {
            const current = await fetchCurrentWeather(favorite);
            return [
              favorite.id,
              {
                temperature: current.temperature,
                weatherCode: current.weatherCode,
                isDay: current.isDay,
              },
            ];
          } catch {
            return [favorite.id, null];
          }
        }),
      );

      if (!cancelled) {
        setWeather(Object.fromEntries(entries));
      }
    }

    if (favorites.length > 0) {
      void load();
    }

    return () => {
      cancelled = true;
    };
  }, [favorites]);

  if (!ready) {
    return (
      <Screen>
        <StateMessage loading icon="star" title="Cargando favoritos…" />
      </Screen>
    );
  }

  if (favorites.length === 0) {
    return (
      <Screen>
        <StateMessage
          icon="star-outline"
          title="Todavía no guardaste ciudades"
          message="Buscá una ciudad y tocá la estrella para guardarla acá."
          actionLabel="Buscar ciudades"
          onAction={() => router.push('/buscar')}
        />
      </Screen>
    );
  }

  const handleSelect = (place: Place) => {
    selectPlace(place);
    router.push('/');
  };

  return (
    <Screen>
      <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
        Tocá una ciudad para ver su clima en el inicio.
      </ThemedText>

      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const current = weather[item.id];
          return (
            <Pressable
              onPress={() => handleSelect(item)}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.row,
                { backgroundColor: theme.backgroundElement },
                pressed && { backgroundColor: theme.backgroundSelected },
              ]}>
              {current ? (
                <MaterialCommunityIcons
                  name={weatherIcon(current.weatherCode, current.isDay)}
                  size={30}
                  color={theme.accent}
                />
              ) : (
                <MaterialCommunityIcons
                  name="map-marker-outline"
                  size={30}
                  color={theme.textSecondary}
                />
              )}

              <View style={styles.rowText}>
                <ThemedText type="smallBold" numberOfLines={1}>
                  {item.name}
                </ThemedText>
                {item.detail ? (
                  <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                    {item.detail}
                  </ThemedText>
                ) : null}
              </View>

              <ThemedText style={styles.temperature}>
                {current ? formatTemperature(current.temperature) : '—'}
              </ThemedText>

              <Pressable
                onPress={() => removeFavorite(item.id)}
                hitSlop={12}
                accessibilityLabel={`Quitar ${item.name} de favoritos`}>
                <Ionicons name="star" size={22} color="#F5A524" />
              </Pressable>
            </Pressable>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hint: {
    marginBottom: Spacing.one,
  },
  list: {
    gap: Spacing.two,
    paddingBottom: Spacing.five,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  temperature: {
    fontSize: 20,
    fontWeight: '700',
  },
});
