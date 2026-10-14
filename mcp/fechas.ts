// Helpers de fecha para el servidor MCP.
// El servidor corre en UTC, así que NO se pueden usar .getHours()/.getDate() como en el frontend:
// todo se calcula explícitamente en hora de Argentina (UTC-3 fijo, sin horario de verano).

export const TIMEZONE = 'America/Argentina/Buenos_Aires';
const OFFSET = '-03:00';

export const REGEX_FECHA = /^\d{4}-\d{2}-\d{2}$/;
export const REGEX_HORA = /^\d{2}:\d{2}$/;

const formatoISO = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  timeZone: TIMEZONE,
});

const formatoHora = new Intl.DateTimeFormat('es-AR', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: TIMEZONE,
});

const formatoFechaLarga = new Intl.DateTimeFormat('es-AR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: TIMEZONE,
});

/** Fecha de un instante en Argentina, como YYYY-MM-DD */
export const fechaAR = (date: Date = new Date()): string => formatoISO.format(date);

/** Hora de un instante en Argentina, como HH:MM */
export const horaAR = (date: Date): string => formatoHora.format(date);

/** "martes, 14 de octubre de 2026" */
export const fechaLargaAR = (date: Date): string => formatoFechaLarga.format(date);

/** Suma días a una fecha YYYY-MM-DD */
export const sumarDias = (fecha: string, dias: number): string => {
  const [y, m, d] = fecha.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + dias)).toISOString().slice(0, 10);
};

/** Instante (ISO UTC) de una fecha + hora de Argentina */
export const instanteAR = (fecha: string, hora = '00:00'): string =>
  new Date(`${fecha}T${hora}:00${OFFSET}`).toISOString();

/**
 * Fechas "solo día" (recordatorios) se guardan a las 12:00 UTC, igual que los formularios del frontend
 * (convención timezone-safe del proyecto).
 */
export const mediodiaUTC = (fecha: string): string => `${fecha}T12:00:00.000Z`;

/** Formatea columnas DATE ('YYYY-MM-DD') sin pasar por Date para evitar corrimientos de día */
export const formatearFechaDB = (fecha: string): string => {
  if (REGEX_FECHA.test(fecha)) {
    const [y, m, d] = fecha.split('-');
    return `${d}/${m}/${y}`;
  }
  const [y, m, d] = fechaAR(new Date(fecha)).split('-');
  return `${d}/${m}/${y}`;
};

/** Valida que una fecha YYYY-MM-DD exista realmente (ej. rechaza 2026-02-30) */
export const esFechaValida = (fecha: string): boolean => {
  if (!REGEX_FECHA.test(fecha)) return false;
  return sumarDias(fecha, 0) === fecha;
};
