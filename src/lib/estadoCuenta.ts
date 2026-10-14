// Genera el texto del estado de cuenta para WhatsApp.
// Compartido entre PagosView (frontend) y el servidor MCP (api/), por eso no usa alias `@/`
// y formatea con zona horaria explícita: en el servidor la hora "local" es UTC.

const TIMEZONE = 'America/Argentina/Buenos_Aires';

const formatoFechaLarga = new Intl.DateTimeFormat('es-AR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: TIMEZONE,
});

const formatoFechaCorta = new Intl.DateTimeFormat('es-AR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: TIMEZONE,
});

const formatearMonto = (monto: number) => Math.round(monto).toLocaleString('es-AR');

export interface ItemEstadoCuenta {
  descripcion: string;
  fecha: Date;
  monto: number;
  montoPagado: number;
}

export interface ClienteEstadoCuenta {
  nombre: string;
  apellido: string;
  saldoPendiente: number;
}

export const generarTextoEstadoCuenta = (
  cliente: ClienteEstadoCuenta,
  itemsPendientes: ItemEstadoCuenta[],
  hoy: Date = new Date()
): string => {
  const lineasItems = itemsPendientes
    .map((item) => {
      const pendiente = item.monto - item.montoPagado;
      const fecha = formatoFechaCorta.format(item.fecha);
      const pagado = item.montoPagado > 0 ? `\n   ✅ Pagado: $${formatearMonto(item.montoPagado)}` : '';
      return `• ${item.descripcion}\n   📅 Fecha: ${fecha} | Total: $${formatearMonto(item.monto)}${pagado}\n   ⏳ Pendiente: $${formatearMonto(pendiente)}`;
    })
    .join('\n\n');

  return `*Estado de Cuenta — ${cliente.nombre} ${cliente.apellido}*\n📅 ${formatoFechaLarga.format(hoy)}\n\n${lineasItems}\n\n━━━━━━━━━━━━━━━\n💰 *TOTAL ADEUDADO: $${formatearMonto(cliente.saldoPendiente)}*\n\nSi quisieras transferir te facilito el alias: clinicaparamascotas2 a nombre de Florencia Ciravegna (Naranja X)`;
};
