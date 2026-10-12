/**
 * Ubicación actual que se muestra en la pantalla de Inicio.
 *
 * Al abrir la app se restaura la última ubicación usada; si no hay ninguna
 * guardada, se detecta la ubicación del dispositivo (GPS) pidiendo permiso.
 * Toda la información se persiste con AsyncStorage.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { createPlace, isValidPlace, type Place } from '@/api/open-meteo';

const STORAGE_KEY = '@clima/ubicacion-actual';

export type CurrentPlaceStatus = 'cargando' | 'listo' | 'error';

/** Estado global de ubicación expuesto por `useCurrentPlace`. */
export type CurrentPlaceValue = {
  place: Place | null;
  status: CurrentPlaceStatus;
  error: string | null;
  /** `true` cuando la ubicación proviene del GPS del dispositivo. */
  isDeviceLocation: boolean;
  /** Selecciona una ciudad buscada y la guarda como ubicación actual. */
  selectPlace: (place: Place) => void;
  /** Vuelve a pedir la ubicación del dispositivo (botón "mi ubicación"). */
  refreshDeviceLocation: () => void;
};

const CurrentPlaceContext = createContext<CurrentPlaceValue | null>(null);

/** Convierte las coordenadas del GPS en un nombre de lugar legible. */
async function reverseGeocode(coords: { latitude: number; longitude: number }) {
  try {
    const [address] = await Location.reverseGeocodeAsync(coords);
    const name =
      address?.city ?? address?.district ?? address?.subregion ?? address?.region ?? null;
    const detail = [address?.region, address?.country].filter(Boolean).join(', ');
    return { name: name ?? 'Ubicación actual', detail };
  } catch {
    return { name: 'Ubicación actual', detail: '' };
  }
}

/** Pide permiso, lee el GPS y devuelve la ubicación como `Place`. */
async function detectDevicePlace(): Promise<Place> {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (!permission.granted) {
    throw new Error(
      'No diste permiso para usar tu ubicación. Buscá tu ciudad desde la pestaña "Buscar".',
    );
  }

  try {
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    const { name, detail } = await reverseGeocode(position.coords);
    return createPlace({
      name,
      detail,
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      source: 'gps',
    });
  } catch {
    throw new Error('No pudimos detectar tu ubicación. Revisá que la GPS esté activada.');
  }
}

export function CurrentPlaceProvider({ children }: { children: ReactNode }) {
  const [place, setPlace] = useState<Place | null>(null);
  const [status, setStatus] = useState<CurrentPlaceStatus>('cargando');
  const [error, setError] = useState<string | null>(null);
  const startedRef = useRef(false);

  const save = useCallback((next: Place) => {
    setPlace(next);
    setStatus('listo');
    setError(null);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {
      // Si no se pudo guardar, la ubicación sigue vigente durante la sesión.
    });
  }, []);

  const detectDeviceLocation = useCallback(async () => {
    setStatus('cargando');
    setError(null);
    try {
      save(await detectDevicePlace());
    } catch (cause) {
      setPlace(null);
      setStatus('error');
      setError(cause instanceof Error ? cause.message : 'Error al obtener la ubicación.');
    }
  }, [save]);

  // Al iniciar: se restaura la última ubicación o, si no existe, se detecta el GPS.
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    async function restore() {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        const parsed: unknown = stored ? JSON.parse(stored) : null;
        if (isValidPlace(parsed)) {
          setPlace(parsed);
          setStatus('listo');
          return;
        }
      } catch {
        // Sin almacenamiento disponible: igual intentamos detectar el GPS.
      }
      await detectDeviceLocation();
    }

    restore();
  }, [detectDeviceLocation]);

  const selectPlace = useCallback((next: Place) => save(next), [save]);

  const value = useMemo<CurrentPlaceValue>(
    () => ({
      place,
      status,
      error,
      isDeviceLocation: place?.source === 'gps',
      selectPlace,
      refreshDeviceLocation: detectDeviceLocation,
    }),
    [place, status, error, selectPlace, detectDeviceLocation],
  );

  return <CurrentPlaceContext.Provider value={value}>{children}</CurrentPlaceContext.Provider>;
}

export function useCurrentPlace(): CurrentPlaceValue {
  const context = useContext(CurrentPlaceContext);
  if (!context) {
    throw new Error('useCurrentPlace debe usarse dentro de <CurrentPlaceProvider>');
  }
  return context;
}
