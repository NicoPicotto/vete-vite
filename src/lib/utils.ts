import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { differenceInYears, differenceInMonths, differenceInDays } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calcularEdad(fechaNacimiento: Date): string {
  const hoy = new Date()
  const anios = differenceInYears(hoy, fechaNacimiento)

  if (anios >= 1) {
    const meses = differenceInMonths(hoy, fechaNacimiento) % 12
    if (meses > 0) return `${anios} año${anios !== 1 ? 's' : ''} y ${meses} mes${meses !== 1 ? 'es' : ''}`
    return `${anios} año${anios !== 1 ? 's' : ''}`
  }

  const meses = differenceInMonths(hoy, fechaNacimiento)
  if (meses >= 1) return `${meses} mes${meses !== 1 ? 'es' : ''}`

  const dias = differenceInDays(hoy, fechaNacimiento)
  return `${dias} día${dias !== 1 ? 's' : ''}`
}

/**
 * Fecha → "YYYY-MM-DD" usando el día local (para inputs type="date" y columnas DATE).
 * No usar toISOString(): en Argentina (UTC-3) después de las 21:00 devuelve el día siguiente.
 */
export function fechaToInput(fecha: Date): string {
  const y = fecha.getFullYear()
  const m = String(fecha.getMonth() + 1).padStart(2, '0')
  const d = String(fecha.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * "YYYY-MM-DD" (columna DATE o input type="date") → Date al mediodía local.
 * No usar new Date("YYYY-MM-DD"): lo interpreta como medianoche UTC y en Argentina muestra el día anterior.
 */
export function parseFechaDB(fecha: string): Date {
  const [y, m, d] = fecha.slice(0, 10).split('-').map(Number)
  return new Date(y, m - 1, d, 12, 0, 0)
}
