// Cálculo de recargos y descuentos de ventas.
// Compartido entre el frontend (VentaForm, ventas.service) y el servidor MCP (api/), por eso no usa alias `@/`.
// Única fuente de los porcentajes de recargo: si cambian, cambian en la web y en el asistente a la vez.

export type MetodoPagoVenta = 'Contado' | 'Débito' | 'Crédito';

/** Recargo por método de pago, en porcentaje sobre el subtotal */
export const PORCENTAJE_RECARGO: Record<MetodoPagoVenta, number> = {
  Contado: 0,
  Débito: 5,
  Crédito: 20,
};

/**
 * Calcular monto de descuento según tipo y valor
 * Exportada para uso en UI (mostrar descuento en tiempo real)
 */
export const calcularDescuento = (subtotal: number, tipo: '$' | '%', valor: number): number => {
  if (valor <= 0) return 0;
  if (tipo === '%') return Math.round(subtotal * (valor / 100));
  return Math.round(valor);
};

/**
 * Calcular recargo según método de pago
 * Exportada para uso en UI (mostrar recargo en tiempo real)
 */
export const calcularRecargo = (subtotal: number, metodoPago: MetodoPagoVenta): number =>
  Math.round(subtotal * ((PORCENTAJE_RECARGO[metodoPago] ?? 0) / 100));
