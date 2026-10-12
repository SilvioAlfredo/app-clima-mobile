import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

/**
 * Versión web del esquema de color: devuelve `'light'` hasta hidratarse en el
 * cliente, para no provocar diferencias entre el HTML del servidor y el cliente
 * (necesario por el renderizado estático).
 */
export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    // Hidratación en web: se actualiza después del primer render para no
    // provocar diferencias entre el HTML del servidor y el cliente.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasHydrated(true);
  }, []);

  const colorScheme = useRNColorScheme();

  if (hasHydrated) {
    return colorScheme;
  }

  return 'light';
}
