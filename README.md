# Aplicación Clima 🌦️

App móvil de clima y pronóstico (React Native + Expo SDK 57, Expo Router), pensada para
Android. Muestra el clima actual por GPS, pronóstico extendido de 5 días / 24 h, búsqueda de
ciudades y favoritos. Consume la API pública y gratuita **Open-Meteo** (sin clave).

## Estructura

```
aplicacion_clima/
├── app-clima-mobile/   # La app (código, assets, config Expo)
│   ├── src/            # Pantallas (app/), api/, components/, hooks/, providers/, utils/
│   ├── assets/         # Iconos e imágenes
│   └── README.md       # Documentación completa: pantallas, APIs, estructura
└── README.md           # Este archivo
```

## Cómo ejecutarla

```bash
cd app-clima-mobile
npm install
npx expo start
```

Escaneá el QR con **Expo Go** (Android) o presioná `a` para el emulador. Detalle de
pantallas, endpoints usados y persistencia: ver [`app-clima-mobile/README.md`](app-clima-mobile/README.md).

## Comandos útiles

```bash
npx expo lint     # linter
npx tsc --noEmit  # chequeo de tipos
npx expo-doctor   # diagnóstico del proyecto
```
