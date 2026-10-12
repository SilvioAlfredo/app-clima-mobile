import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { searchPlaces, type Place } from '@/api/open-meteo';
import { Screen } from '@/components/screen';
import { StateMessage } from '@/components/state-message';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCurrentPlace } from '@/providers/current-place';
import { useFavorites } from '@/providers/favorites';

/** Letras mínimas necesarias para lanzar la búsqueda. */
const MIN_QUERY_LENGTH = 2;
/** Espera (ms) después de dejar de escribir antes de consultar la API. */
const DEBOUNCE_MS = 450;

type SearchState = {
  /** Texto con el que se obtuvieron estos resultados. */
  query: string;
  results: Place[];
  error: string | null;
};

/** Pantalla de búsqueda de ciudades por nombre. */
export default function SearchScreen() {
  const theme = useTheme();
  const { selectPlace } = useCurrentPlace();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [query, setQuery] = useState('');
  const [search, setSearch] = useState<SearchState | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  // Debounce: espera a que la persona deje de escribir antes de consultar.
  useEffect(() => {
    const text = query.trim();
    if (text.length < MIN_QUERY_LENGTH) return;

    let cancelled = false;
    const timer = setTimeout(() => {
      searchPlaces(text)
        .then((places) => {
          if (!cancelled) setSearch({ query: text, results: places, error: null });
        })
        .catch((cause: unknown) => {
          if (!cancelled) {
            setSearch({
              query: text,
              results: [],
              error: cause instanceof Error ? cause.message : 'Error al buscar ciudades.',
            });
          }
        });
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, retryToken]);

  const handleSelect = (place: Place) => {
    selectPlace(place);
    router.push('/');
  };

  const handleRetry = () => {
    setSearch(null);
    setRetryToken((token) => token + 1);
  };

  const text = query.trim();
  const hasQuery = text.length >= MIN_QUERY_LENGTH;
  // El estado de carga se deriva: hay búsqueda en curso si los resultados
  // guardados corresponden a otra consulta (o todavía no hay ninguno).
  const matchesCurrentQuery = search !== null && search.query === text;
  const loading = hasQuery && !matchesCurrentQuery;
  const error = matchesCurrentQuery ? search?.error ?? null : null;
  const results = matchesCurrentQuery ? search?.results ?? [] : [];

  return (
    <Screen>
      <View style={[styles.searchBox, { backgroundColor: theme.backgroundElement }]}>
        <Ionicons name="search" size={20} color={theme.textSecondary} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Ej.: Buenos Aires, Madrid, Tokio…"
          placeholderTextColor={theme.textSecondary}
          style={[styles.input, { color: theme.text }]}
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="search"
          accessibilityLabel="Buscar ciudad"
        />
        {loading ? <ActivityIndicator size="small" color={theme.accent} /> : null}
      </View>

      {!hasQuery ? (
        <StateMessage
          icon="city-variant-outline"
          title="Buscá una ciudad"
          message={`Escribí al menos ${MIN_QUERY_LENGTH} letras para buscar ciudades de todo el mundo.`}
        />
      ) : loading ? (
        <StateMessage loading icon="magnify" title="Buscando ciudades…" />
      ) : error ? (
        <StateMessage
          icon="cloud-alert"
          title="No se pudo buscar"
          message={error}
          actionLabel="Reintentar"
          onAction={handleRetry}
        />
      ) : results.length === 0 ? (
        <StateMessage
          icon="magnify-close"
          title="Sin resultados"
          message={`No encontramos ciudades para “${query.trim()}”.`}
        />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const favorite = isFavorite(item.id);
            return (
              <Pressable
                onPress={() => handleSelect(item)}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.result,
                  pressed && { backgroundColor: theme.backgroundSelected },
                ]}>
                <MaterialCommunityIcons
                  name="map-marker-outline"
                  size={24}
                  color={theme.accent}
                />
                <View style={styles.resultText}>
                  <ThemedText type="smallBold" numberOfLines={1}>
                    {item.name}
                  </ThemedText>
                  {item.detail ? (
                    <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                      {item.detail}
                    </ThemedText>
                  ) : null}
                </View>
                <Pressable
                  onPress={() => toggleFavorite(item)}
                  hitSlop={12}
                  accessibilityLabel={favorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}>
                  <Ionicons
                    name={favorite ? 'star' : 'star-outline'}
                    size={22}
                    color={favorite ? '#F5A524' : theme.textSecondary}
                  />
                </Pressable>
              </Pressable>
            );
          }}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: Spacing.one,
  },
  list: {
    gap: Spacing.one,
    paddingBottom: Spacing.five,
  },
  result: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
    borderRadius: Spacing.two,
  },
  resultText: {
    flex: 1,
    gap: 2,
  },
});
