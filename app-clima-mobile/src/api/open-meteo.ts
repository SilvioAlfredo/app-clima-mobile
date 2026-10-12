/**
 * Cliente de la API pública Open-Meteo (https://open-meteo.com/).
 *
 * La API es gratuita para uso no comercial y **no requiere clave de API**:
 * solo basta con hacer requests HTTP con `fetch`.
 *
 * Endpoints que usa esta app:
 * - Geocodificación (búsqueda de ciudades): https://geocoding-api.open-meteo.com/v1/search
 * - Clima actual y pronóstico:              https://api.open-meteo.com/v1/forecast
 */

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';

/** Cantidad de días de pronóstico que pedimos a la API. */
const FORECAST_DAYS = 5;

/** Campos del clima "actual" que solicitamos. */
const CURRENT_FIELDS =
  'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m,precipitation';

/** Campos por día que solicitamos. */
const DAILY_FIELDS =
  'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max';

/** Campos por hora que solicitamos (solo en el pronóstico extendido). */
const HOURLY_FIELDS = 'temperature_2m,weather_code,precipitation_probability';

/** Indica de dónde proviene una ubicación. */
export type PlaceSource = 'gps' | 'search';

/** Una ubicación sobre la que se puede consultar el clima. */
export type Place = {
  /** Identificador estable generado a partir de las coordenadas. */
  id: string;
  name: string;
  /** Región y país, ej.: "Buenos Aires, Argentina". */
  detail: string;
  latitude: number;
  longitude: number;
  source: PlaceSource;
};

export type CurrentWeather = {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  weatherCode: number;
  isDay: boolean;
  /** Hora local de la observación, ej.: "2026-10-06T14:00". */
  observedAt: string;
};

export type DailyForecast = {
  /** Fecha local, ej.: "2026-10-06". */
  date: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  precipitationProbability: number | null;
  windSpeed: number | null;
};

export type HourlyForecast = {
  /** Fecha y hora local, ej.: "2026-10-06T15:00". */
  time: string;
  temperature: number;
  weatherCode: number;
  precipitationProbability: number | null;
};

export type Forecast = {
  current: CurrentWeather;
  daily: DailyForecast[];
  hourly: HourlyForecast[];
};

/** Crea la identificación de una ubicación a partir de sus coordenadas. */
export function placeId(latitude: number, longitude: number): string {
  return `${latitude.toFixed(3)},${longitude.toFixed(3)}`;
}

/** Crea un objeto `Place` normalizado (id derivado de las coordenadas). */
export function createPlace(input: {
  name: string;
  detail?: string;
  latitude: number;
  longitude: number;
  source: PlaceSource;
}): Place {
  return {
    id: placeId(input.latitude, input.longitude),
    name: input.name.trim() || 'Ubicación sin nombre',
    detail: input.detail ?? '',
    latitude: input.latitude,
    longitude: input.longitude,
    source: input.source,
  };
}

/** Devuelve `true` si el JSON almacenado tiene la forma de un `Place`. */
export function isValidPlace(value: unknown): value is Place {
  if (!value || typeof value !== 'object') return false;
  const place = value as Partial<Place>;
  return (
    typeof place.id === 'string' &&
    typeof place.name === 'string' &&
    typeof place.latitude === 'number' &&
    typeof place.longitude === 'number'
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Tipos                                    */
/* -------------------------------------------------------------------------- */

type GeocodingResult = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  country_code?: string;
  admin1?: string;
};

type GeocodingResponse = {
  results?: GeocodingResult[];
};

type ForecastResponse = {
  current?: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    is_day: number;
    weather_code: number;
    wind_speed_10m: number;
    precipitation: number;
  };
  daily?: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: (number | null)[];
    wind_speed_10m_max?: number[];
  };
  hourly?: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
    precipitation_probability: (number | null)[];
  };
};

/* -------------------------------------------------------------------------- */
/*                                 Utilidades                                 */
/* -------------------------------------------------------------------------- */

function buildQuery(params: Record<string, string | number | undefined>): string {
  return Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== '')
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
    .join('&');
}

async function requestJson<T>(url: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    throw new Error('No se pudo conectar con la API. Revisá tu conexión a internet.');
  }

  if (!response.ok) {
    throw new Error(`La API respondió con un error (código ${response.status}).`);
  }

  return (await response.json()) as T;
}

function mapCurrent(raw: NonNullable<ForecastResponse['current']>): CurrentWeather {
  return {
    temperature: raw.temperature_2m,
    feelsLike: raw.apparent_temperature,
    humidity: raw.relative_humidity_2m,
    windSpeed: raw.wind_speed_10m,
    precipitation: raw.precipitation,
    weatherCode: raw.weather_code,
    isDay: raw.is_day === 1,
    observedAt: raw.time,
  };
}

/* -------------------------------------------------------------------------- */
/*                                  Endpoints                                 */
/* -------------------------------------------------------------------------- */

/**
 * Busca ciudades por nombre (geocodificación).
 * @param query texto ingresado por la persona usuaria (mínimo 2 letras).
 */
export async function searchPlaces(query: string): Promise<Place[]> {
  const searchQuery = buildQuery({
    name: query.trim(),
    count: 10,
    language: 'es',
    format: 'json',
  });
  const data = await requestJson<GeocodingResponse>(`${GEOCODING_URL}?${searchQuery}`);

  return (data.results ?? []).map((result) =>
    createPlace({
      name: result.name,
      detail: [result.admin1, result.country].filter(Boolean).join(', '),
      latitude: result.latitude,
      longitude: result.longitude,
      source: 'search',
    }),
  );
}

/**
 * Consulta el clima actual de una ubicación.
 * Se usa en la pantalla de favoritos, que solo necesita la temperatura.
 */
export async function fetchCurrentWeather(place: Place): Promise<CurrentWeather> {
  const query = buildQuery({
    latitude: place.latitude,
    longitude: place.longitude,
    current: CURRENT_FIELDS,
    timezone: 'auto',
  });
  const data = await requestJson<ForecastResponse>(`${FORECAST_URL}?${query}`);

  if (!data.current) {
    throw new Error('La API no devolvió datos de clima para esa ubicación.');
  }

  return mapCurrent(data.current);
}

/**
 * Consulta el clima actual + el pronóstico de los próximos días.
 * @param options `hourly: true` agrega el detalle hora por hora (pantalla de pronóstico).
 */
export async function fetchForecast(
  place: Place,
  options: { hourly?: boolean } = {},
): Promise<Forecast> {
  const query = buildQuery({
    latitude: place.latitude,
    longitude: place.longitude,
    current: CURRENT_FIELDS,
    daily: DAILY_FIELDS,
    hourly: options.hourly ? HOURLY_FIELDS : undefined,
    forecast_days: FORECAST_DAYS,
    timezone: 'auto',
  });
  const data = await requestJson<ForecastResponse>(`${FORECAST_URL}?${query}`);

  if (!data.current || !data.daily) {
    throw new Error('La API no devolvió el pronóstico para esa ubicación.');
  }

  const daily: DailyForecast[] = data.daily.time.map((date, index) => ({
    date,
    weatherCode: data.daily!.weather_code[index],
    tempMax: data.daily!.temperature_2m_max[index],
    tempMin: data.daily!.temperature_2m_min[index],
    precipitationProbability: data.daily!.precipitation_probability_max[index] ?? null,
    windSpeed: data.daily!.wind_speed_10m_max?.[index] ?? null,
  }));

  const hourly: HourlyForecast[] = (data.hourly?.time ?? []).map((time, index) => ({
    time,
    temperature: data.hourly!.temperature_2m[index],
    weatherCode: data.hourly!.weather_code[index],
    precipitationProbability: data.hourly!.precipitation_probability[index] ?? null,
  }));

  return { current: mapCurrent(data.current), daily, hourly };
}
