import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { CurrentPlaceProvider } from '@/providers/current-place';
import { FavoritesProvider } from '@/providers/favorites';

// Evita que se muestre la pantalla de inicio mientras se carga el bundle.
SplashScreen.preventAutoHideAsync();

/**
 * Layout raíz: tema de navegación, providers globales (favoritos y ubicación),
 * pila `(tabs)` + `pronostico` y barra de estado.
 */
export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <FavoritesProvider>
        <CurrentPlaceProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="pronostico" options={{ title: 'Pronóstico extendido' }} />
          </Stack>
        </CurrentPlaceProvider>
      </FavoritesProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
