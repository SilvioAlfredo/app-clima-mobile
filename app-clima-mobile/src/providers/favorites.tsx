/**
 * Guarda las ciudades favoritas en el dispositivo usando AsyncStorage,
 * de manera que persisten al cerrar y volver a abrir la app.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { isValidPlace, type Place } from '@/api/open-meteo';

const STORAGE_KEY = '@clima/favoritos';

/** Estado global de favoritos expuesto por `useFavorites`. */
export type FavoritesValue = {
  /** Ciudades guardadas por la persona usuaria. */
  favorites: Place[];
  /** `false` mientras se leen los favoritos del dispositivo. */
  ready: boolean;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (place: Place) => void;
  removeFavorite: (id: string) => void;
};

const FavoritesContext = createContext<FavoritesValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Place[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        const parsed: unknown = stored ? JSON.parse(stored) : [];
        if (!cancelled && Array.isArray(parsed)) {
          setFavorites(parsed.filter(isValidPlace));
        }
      } catch {
        // Si el almacenamiento falla, la app sigue funcionando sin favoritos.
      } finally {
        if (!cancelled) setReady(true);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback((next: Place[]) => {
    setFavorites(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {
      // No se pudo guardar: se mantiene el estado en memoria.
    });
  }, []);

  const isFavorite = useCallback(
    (id: string) => favorites.some((favorite) => favorite.id === id),
    [favorites],
  );

  const toggleFavorite = useCallback(
    (place: Place) => {
      const exists = favorites.some((favorite) => favorite.id === place.id);
      persist(exists ? favorites.filter((f) => f.id !== place.id) : [...favorites, place]);
    },
    [favorites, persist],
  );

  const removeFavorite = useCallback(
    (id: string) => persist(favorites.filter((favorite) => favorite.id !== id)),
    [favorites, persist],
  );

  const value = useMemo(
    () => ({ favorites, ready, isFavorite, toggleFavorite, removeFavorite }),
    [favorites, ready, isFavorite, toggleFavorite, removeFavorite],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): FavoritesValue {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites debe usarse dentro de <FavoritesProvider>');
  }
  return context;
}
