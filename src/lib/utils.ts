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
