# Clima y Pronóstico 🌦️

Aplicación móvil construida con **React Native + Expo** (SDK 57) y **Expo Router**, pensada para
Android. Muestra el clima actual, el pronóstico de los próximos días, permite buscar ciudades y
guardar favoritas.

Los datos se consumen de la API pública y gratuita **[Open-Meteo](https://open-meteo.com/)**,
que **no requiere clave de API** ni registro.

---

## Pantallas

| Pantalla | Ruta | Descripción |
| --- | --- | --- |
| **Inicio** | `src/app/(tabs)/index.tsx` | Clima actual de la ubicación detectada por GPS (o de la última ciudad seleccionada): temperatura, sensación térmica, humedad, viento y lluvia, más una preview de los próximos 3 días. Permite actualizar con "pull to refresh", guardar en favoritos y volver a detectar la ubicación. |
| **Buscar** | `src/app/(tabs)/buscar.tsx` | Búsqueda de ciudades por nombre (con *debounce* de 450 ms). Al tocar un resultado se convierte en la ubicación actual; la estrella la guarda como favorita. |
| **Favoritos** | `src/app/(tabs)/favoritos.tsx` | Ciudades guardadas con su temperatura actual en vivo. Al tocar una ciudad se muestra en el inicio; la estrella la quita de la lista. |
| **Pronóstico extendido** | `src/app/pronostico.tsx` | Resumen actual, detalle **hora por hora de las próximas 24 h** y **pronóstico de 5 días** con mínima/máxima, probabilidad de lluvia y viento. |

Navegación: **Expo Router** con un `Stack` raíz (`src/app/_layout.tsx`) que contiene un grupo de
pestañas `(tabs)` y la pantalla `pronostico`, a la que se llega pasando `lat`, `lon`, `name` y
`detail` como parámetros de ruta.

---

## APIs utilizadas (gratuitas y sin clave)

- **Pronóstico y clima actual**: `https://api.open-meteo.com/v1/forecast`
- **Geocodificación (búsqueda de ciudades)**: `https://geocoding-api.open-meteo.com/v1/search`
- **Ubicación del dispositivo**: módulo nativo `expo-location` (incluido en Expo Go)
- **Geocodificación inversa** (GPS → nombre de ciudad): `Location.reverseGeocodeAsync`

Todo el cliente HTTP está centralizado en [`src/api/open-meteo.ts`](src/api/open-meteo.ts).

---

## Cómo ejecutarla

```bash
# 1. Instalar dependencias
npm install

# 2. Levantar el servidor de desarrollo
npx expo start
```

Escaneá el código QR con la app **Expo Go** (Android), o presioná `a` para abrirlo en un emulador
de Android Studio.

También están disponibles:

```bash
npm run android   # expo start --android
npm run web       # expo start --web
npx expo lint     # linter (ESLint)
npx tsc --noEmit  # chequeo de tipos
npx expo-doctor   # diagnóstico del proyecto
```

> **Permisos:** al primer arranque la app pide permiso de ubicación. Si se deniega, se muestra un
> mensaje con un atajo a la pestaña **Buscar**, de modo que la aplicación siempre es usable.

---

## Estructura del proyecto

```
src/
├── app/
│   ├── _layout.tsx          # Stack raíz + providers (ubicación y favoritos)
│   ├── pronostico.tsx       # Pantalla de pronóstico extendido (5 días / 24 h)
│   └── (tabs)/
│       ├── _layout.tsx      # Barra de pestañas: Inicio · Buscar · Favoritos
│       ├── index.tsx        # Inicio: clima actual
│       ├── buscar.tsx       # Búsqueda de ciudades
│       └── favoritos.tsx    # Ciudades guardadas
├── api/
│   └── open-meteo.ts        # Cliente de la API + tipos (Place, Forecast, …)
├── components/
│   ├── screen.tsx           # Contenedor base de las pantallas
│   ├── state-message.tsx    # Estados de carga / error / vacío
│   ├── weather-hero.tsx     # Tarjeta del clima actual
│   └── forecast-day-row.tsx # Fila con el pronóstico de un día
├── constants/
│   ├── theme.ts             # Colores, espaciados y tipografía (claro/oscuro)
│   └── weather.ts           # Códigos WMO → texto e icono en español
├── hooks/
│   └── use-forecast.ts      # Consulta del pronóstico con estados derivados
├── providers/
│   ├── current-place.tsx    # Ubicación actual (GPS o ciudad) persistida
│   └── favorites.tsx        # Ciudades favoritas persistidas
└── utils/
    └── format.ts            # Fechas, horas y temperaturas en español
```

### Persistencia

Se usa `@react-native-async-storage/async-storage` para guardar:

- `@clima/ubicacion-actual`: última ubicación usada (se restaura al abrir la app).
- `@clima/favoritos`: lista de ciudades favoritas.

### Modo oscuro

La app respeta el esquema de color del dispositivo: los colores se definen una sola vez en
`src/constants/theme.ts` (`Colors.light` / `Colors.dark`).

---

## Consigna

> Construir una pequeña aplicación con React Native (Expo, VS Code, Android) de 3 o 4 pantallas
> como mínimo, que consuma datos de una API pública gratuita.
> Tema: **Clima y Pronóstico del Tiempo** — inicio con clima actual (ubicación detectada),
> búsqueda de ciudad, pronóstico extendido y favoritos.

Se cumplen los 4 puntos de pantallas y el consumo de una API pública gratuita (Open-Meteo).
