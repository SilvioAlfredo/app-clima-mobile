/**
 * Traducción de los códigos de clima de Open-Meteo (estandar WMO)
 * a textos e iconos en español.
 * Referencia: https://open-meteo.com/en/docs/weather-codes
 */

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export type WeatherIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const LABELS: Record<number, string> = {
  0: 'Despejado',
  1: 'Mayormente despejado',
  2: 'Parcialmente nublado',
  3: 'Nublado',
  45: 'Niebla',
  48: 'Niebla con escarcha',
  51: 'Llovizna ligera',
  53: 'Llovizna',
  55: 'Llovizna intensa',
  56: 'Llovizna helada',
  57: 'Llovizna helada intensa',
  61: 'Lluvia ligera',
  63: 'Lluvia',
  65: 'Lluvia intensa',
  66: 'Lluvia helada',
  67: 'Lluvia helada intensa',
  71: 'Nieve ligera',
  73: 'Nieve',
  75: 'Nieve intensa',
  77: 'Granos de nieve',
  80: 'Chubascos ligeros',
  81: 'Chubascos',
  82: 'Chubascos fuertes',
  85: 'Chubascos de nieve',
  86: 'Chubascos de nieve intensos',
  95: 'Tormenta eléctrica',
  96: 'Tormenta con granizo',
  99: 'Tormenta con granizo intenso',
};

/** Devuelve la descripción en español de un código de clima. */
export function weatherLabel(code: number): string {
  return LABELS[code] ?? 'Sin datos';
}

/** Devuelve el icono (MaterialCommunityIcons) de un código de clima. */
export function weatherIcon(code: number, isDay = true): WeatherIconName {
  if (code === 0) return isDay ? 'weather-sunny' : 'weather-night';
  if (code === 1 || code === 2) {
    return isDay ? 'weather-partly-cloudy' : 'weather-night-partly-cloudy';
  }
  if (code === 3) return 'weather-cloudy';
  if (code === 45 || code === 48) return 'weather-fog';
  if (code >= 51 && code <= 57) return 'weather-rainy';
  if (code >= 61 && code <= 67) return code >= 65 ? 'weather-pouring' : 'weather-rainy';
  if (code >= 71 && code <= 77) return 'weather-snowy';
  if (code >= 80 && code <= 82) return code === 82 ? 'weather-pouring' : 'weather-rainy';
  if (code === 85 || code === 86) return 'weather-snowy';
  if (code >= 95) return 'weather-lightning';
  return isDay ? 'weather-sunny' : 'weather-night';
}
