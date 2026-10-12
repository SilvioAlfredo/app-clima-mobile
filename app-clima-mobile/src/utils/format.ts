/** Funciones de formato en español (fechas, horas y temperaturas). */

const SHORT_DAYS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const LONG_DAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const LONG_MONTHS = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

/**
 * Parsea una fecha local "YYYY-MM-DD" sin depender de la zona horaria del
 * dispositivo (se usa UTC para calcular el día de la semana).
 */
function parseDateOnly(isoDate: string): { day: number; month: number; weekday: number } {
  const [year, month, day] = isoDate.split('-').map(Number);
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return { day, month, weekday };
}

/** "2026-10-06" -> "lun 6/10" */
export function formatDayShort(isoDate: string): string {
  const { day, month, weekday } = parseDateOnly(isoDate);
  return `${SHORT_DAYS[weekday]} ${day}/${month}`;
}

/** "2026-10-06" -> "lunes 6 de octubre" */
export function formatDayLong(isoDate: string): string {
  const { day, month, weekday } = parseDateOnly(isoDate);
  return `${LONG_DAYS[weekday]} ${day} de ${LONG_MONTHS[month - 1]}`;
}

/** "2026-10-06T14:30" -> "14:30" */
export function formatHour(isoDateTime: string): string {
  return isoDateTime.slice(11, 16);
}

/** 24.6841 -> "25°" */
export function formatTemperature(value: number): string {
  return `${Math.round(value)}°`;
}

/** 12.4 -> "12 km/h" */
export function formatWind(value: number): string {
  return `${Math.round(value)} km/h`;
}

/** Muestra un número con la cantidad de decimales indicada. */
export function formatNumber(value: number, digits = 0): string {
  return value.toFixed(digits);
}
