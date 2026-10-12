import { useCallback, useEffect, useRef, useState } from 'react';

import { fetchForecast, type Forecast, type Place } from '@/api/open-meteo';

type ForecastResult = {
  placeId: string;
  forecast: Forecast | null;
  error: string | null;
};

export type UseForecastResult = {
  /** Pronóstico de la ubicación actual (null mientras carga o si falló). */
  forecast: Forecast | null;
  error: string | null;
  /** `true` cuando todavía no hay datos ni error para la ubicación actual. */
  loading: boolean;
  /** `true` mientras se recarga con el gesto de actualizar. */
  refreshing: boolean;
  /** Vuelve a consultar la API (pull-to-refresh o botón "Reintentar"). */
  refresh: () => void;
};

/**
 * Consulta el pronóstico de una ubicación.
 *
 * Los datos se guardan junto con el id de la ciudad a la que pertenecen, de
 * este modo, al cambiar de ubicación se muestra el estado de carga sin
 * necesidad de forzar un setState dentro del effect.
 *
 * @param hourly `true` para pedir también el detalle hora por hora.
 */
export function useForecast(place: Place | null, hourly = false): UseForecastResult {
  const [result, setResult] = useState<ForecastResult | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!place) return;

    const requestId = ++requestIdRef.current;

    fetchForecast(place, { hourly })
      .then((forecast) => {
        if (requestId !== requestIdRef.current) return;
        setResult({ placeId: place.id, forecast, error: null });
      })
      .catch((cause: unknown) => {
        if (requestId !== requestIdRef.current) return;
        setResult({
          placeId: place.id,
          forecast: null,
          error: cause instanceof Error ? cause.message : 'Error al obtener el clima.',
        });
      })
      .finally(() => {
        if (requestId === requestIdRef.current) setRefreshing(false);
      });
  }, [place, hourly, reloadToken]);

  const refresh = useCallback(() => {
    // Se limpia el error anterior para que se vea el estado de carga.
    setResult((previous) => (previous ? { ...previous, error: null } : previous));
    setRefreshing(true);
    setReloadToken((token) => token + 1);
  }, []);

  const current = result && place && result.placeId === place.id ? result : null;

  return {
    forecast: current?.forecast ?? null,
    error: current?.error ?? null,
    loading: place !== null && (current === null || (current.forecast === null && !current.error)),
    refreshing,
    refresh,
  };
}
