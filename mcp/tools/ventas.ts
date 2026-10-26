import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { calcularDescuento, calcularRecargo, PORCENTAJE_RECARGO, type MetodoPagoVenta } from '../../src/lib/ventas.js';
import { getSupabase } from '../supabase.js';
import { esFechaValida, fechaAR, formatearFechaDB, instanteAR } from '../fechas.js';
import { ANOTACION_CARGA, ANOTACION_LECTURA, fallo, ok, seguro } from '../respuestas.js';

// Ventas desde el asistente. Replica createVenta (src/services/ventas.service.ts):
// venta → venta_items (el trigger descuenta stock) → items_pago (si hay cliente) → vincular, con rollback manual.
// Flujo en dos pasos: cotizar_venta (resumen, sin guardar) y registrar_venta (exige el total cotizado).

const METODOS_PAGO = ['Contado', 'Débito', 'Crédito'] as const;
const VENTANA_DUPLICADO_MIN = 10;

const formatoPesos = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });
const pesos = (monto: number) => `$${formatoPesos.format(monto)}`;
const formatoCantidad = (cantidad: number) => formatoPesos.format(cantidad);

const itemSchema = z.object({
  productoId: z.string().uuid().optional().describe('ID del producto del inventario (obtenelo con buscar_producto)'),
  nombre: z.string().min(1).optional().describe('Solo para ítems que NO están en el inventario: nombre del ítem'),
  precioUnitario: z
    .number()
    .int()
    .positive()
    .optional()
    .describe('Solo para ítems que NO están en el inventario: precio unitario en pesos enteros. Para productos del inventario NO se pasa'),
  cantidad: z.number().positive().describe('Cantidad (admite decimales, ej: 0.5)'),
});

const entradaVenta = {
  clienteId: z.string().uuid().optional().describe('ID del cliente (obtenelo con buscar_cliente). Omitir solo en ventas al paso'),
  ventaAlPaso: z.boolean().optional().describe('true solo si el usuario confirmó que la venta es sin cliente (al paso)'),
  items: z.array(itemSchema).min(1).describe('Productos o ítems de la venta'),
  metodoPago: z
    .enum(METODOS_PAGO)
    .describe('Método de pago: Contado (sin recargo), Débito (+5%) o Crédito (+20%). Nunca lo asumas: preguntalo'),
  pagoCompleto: z
    .boolean()
    .describe('true si el cliente pagó el total en el momento; false si queda como deuda. Nunca lo asumas: preguntalo'),
  descuento: z
    .object({
      tipo: z.enum(['$', '%']).describe('"%" porcentaje sobre el subtotal, "$" monto fijo'),
      valor: z.number().positive().describe('Porcentaje (ej: 10) o monto en pesos (ej: 5000)'),
    })
    .optional()
    .describe('Descuento opcional, solo si el usuario lo pidió'),
  fecha: z.string().optional().describe('Fecha YYYY-MM-DD. Si se omite, se usa hoy (hora Argentina)'),
  notas: z.string().max(1000).optional().describe('Notas opcionales de la venta'),
};

type EntradaVenta = {
  clienteId?: string;
  ventaAlPaso?: boolean;
  items: z.infer<typeof itemSchema>[];
  metodoPago: MetodoPagoVenta;
  pagoCompleto: boolean;
  descuento?: { tipo: '$' | '%'; valor: number };
  fecha?: string;
  notas?: string;
};

interface LineaVenta {
  productoId: string | null;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

interface VentaArmada {
  cliente: { id: string; nombre: string } | null;
  fecha: string; // YYYY-MM-DD
  lineas: LineaVenta[];
  subtotal: number;
  recargo: number;
  descuento: number;
  total: number;
  entrada: EntradaVenta;
}

/** Valida todo y calcula montos con los precios actuales del inventario. Devuelve un mensaje de error o la venta armada */
const armarVenta = async (entrada: EntradaVenta): Promise<string | VentaArmada> => {
  const { clienteId, ventaAlPaso, items, metodoPago, pagoCompleto, descuento } = entrada;
  const supabase = getSupabase();

  // Cliente o venta al paso (exactamente uno)
  if (clienteId && ventaAlPaso) return 'Indicá un cliente o venta al paso, no las dos cosas.';
  if (!clienteId && !ventaAlPaso) {
    return 'Falta el cliente. Preguntá a quién se le hace la venta, o si es una venta al paso (sin cliente).';
  }
  if (ventaAlPaso && !pagoCompleto) {
    return 'Una venta al paso tiene que estar pagada en el momento. Si no pagó, preguntá a qué cliente cargarle la deuda.';
  }

  let cliente: VentaArmada['cliente'] = null;
  if (clienteId) {
    const { data, error } = await supabase.from('clientes').select('id, nombre, apellido').eq('id', clienteId).maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return 'No existe un cliente con ese ID.';
    cliente = { id: data.id, nombre: `${data.nombre} ${data.apellido}` };
  }

  const fecha = entrada.fecha ?? fechaAR();
  if (!esFechaValida(fecha)) return 'Fecha inválida. Usá el formato YYYY-MM-DD.';
  if (fecha > fechaAR()) return 'No se pueden registrar ventas con fecha futura.';

  // Validar forma de cada ítem
  for (const [i, item] of items.entries()) {
    const n = i + 1;
    if (item.productoId && (item.nombre || item.precioUnitario !== undefined)) {
      return `Ítem ${n}: para productos del inventario pasá solo productoId y cantidad (el precio sale del sistema).`;
    }
    if (!item.productoId && (!item.nombre || item.precioUnitario === undefined)) {
      return `Ítem ${n}: falta productoId, o bien nombre y precioUnitario si no está en el inventario.`;
    }
    if (Math.abs(Math.round(item.cantidad * 1000) - item.cantidad * 1000) > 1e-6) return `Ítem ${n}: la cantidad admite hasta 3 decimales.`;
  }

  // Productos del inventario: precio y stock actuales
  const ids = [...new Set(items.filter((i) => i.productoId).map((i) => i.productoId as string))];
  const productos = new Map<string, { nombre: string; precio: number; stock: number }>();
  if (ids.length > 0) {
    const { data, error } = await supabase.from('productos').select('id, nombre, precio_venta, cantidad_existente').in('id', ids);
    if (error) throw new Error(error.message);
    for (const p of data ?? []) {
      productos.set(p.id, { nombre: p.nombre, precio: Number(p.precio_venta), stock: Number(p.cantidad_existente) });
    }
  }

  const cantidadPorProducto = new Map<string, number>();
  for (const item of items) {
    if (!item.productoId) continue;
    if (!productos.has(item.productoId)) return 'Uno de los productos no existe. Buscalo de nuevo con buscar_producto.';
    cantidadPorProducto.set(item.productoId, (cantidadPorProducto.get(item.productoId) ?? 0) + item.cantidad);
  }
  for (const [id, cantidad] of cantidadPorProducto) {
    const p = productos.get(id)!;
    if (p.stock <= 0) return `"${p.nombre}" no tiene stock y no se puede vender.`;
    if (cantidad > p.stock) return `Stock insuficiente de "${p.nombre}": hay ${formatoCantidad(p.stock)} y se piden ${formatoCantidad(cantidad)}.`;
  }

  const lineas: LineaVenta[] = items.map((item) => {
    const producto = item.productoId ? productos.get(item.productoId)! : null;
    const precioUnitario = producto ? producto.precio : (item.precioUnitario as number);
    return {
      productoId: item.productoId ?? null,
      nombre: producto ? producto.nombre : (item.nombre as string).trim(),
      cantidad: item.cantidad,
      precioUnitario,
      subtotal: Math.round(item.cantidad * precioUnitario * 100) / 100,
    };
  });

  // Mismo orden de cálculo que VentaForm/createVenta: subtotal → recargo → descuento (sobre subtotal)
  const subtotal = lineas.reduce((acc, l) => acc + l.cantidad * l.precioUnitario, 0);
  const recargo = calcularRecargo(subtotal, metodoPago);
  if (descuento?.tipo === '%' && descuento.valor > 100) return 'El descuento no puede superar el 100%.';
  const montoDescuento = descuento ? calcularDescuento(subtotal, descuento.tipo, descuento.valor) : 0;
  if (montoDescuento > subtotal + recargo) return 'El descuento no puede ser mayor que el total de la venta.';
  const total = Math.round(subtotal + recargo - montoDescuento);

  return { cliente, fecha, lineas, subtotal, recargo, descuento: montoDescuento, total, entrada };
};

/** Resumen legible para mostrarle al usuario antes y después de guardar */
const resumir = (v: VentaArmada) => {
  const { metodoPago, pagoCompleto, descuento, notas } = v.entrada;
  return {
    cliente: v.cliente?.nombre ?? 'Venta al paso (sin cliente)',
    fecha: formatearFechaDB(v.fecha),
    metodoPago,
    items: v.lineas.map(
      (l) => `${formatoCantidad(l.cantidad)} × ${l.nombre} (${pesos(l.precioUnitario)} c/u) = ${pesos(l.subtotal)}`
    ),
    subtotal: pesos(v.subtotal),
    recargo: v.recargo > 0 ? `${pesos(v.recargo)} (${metodoPago} +${PORCENTAJE_RECARGO[metodoPago]}%)` : undefined,
    descuento:
      v.descuento > 0 ? `-${pesos(v.descuento)}${descuento?.tipo === '%' ? ` (${descuento.valor}%)` : ''}` : undefined,
    total: pesos(v.total),
    pago: pagoCompleto ? 'Pagado en el momento' : `NO pagado: queda debiendo ${pesos(v.total)}`,
    notas: notas || undefined,
  };
};

export const registrarToolsVentas = (server: McpServer) => {
  server.registerTool(
    'cotizar_venta',
    {
      title: 'Cotizar venta',
      description:
        'Arma y calcula una venta SIN guardarla: valida stock y devuelve el resumen (ítems, precios, recargo, descuento y total) ' +
        'y el totalConfirmado. Paso obligatorio antes de registrar_venta: mostrale el resumen completo al usuario y esperá su confirmación.',
      inputSchema: entradaVenta,
      annotations: ANOTACION_LECTURA,
    },
    seguro(async (entrada) => {
      const venta = await armarVenta(entrada);
      if (typeof venta === 'string') return fallo(venta);
      return ok({
        resultado: 'COTIZACIÓN (todavía no se guardó nada)',
        resumen: resumir(venta),
        totalConfirmado: venta.total,
        siguientePaso:
          'Mostrale este resumen completo al usuario y preguntá si confirma. Solo con un "sí" explícito llamá a registrar_venta ' +
          'con exactamente los mismos datos y totalConfirmado.',
      });
    })
  );

  server.registerTool(
    'registrar_venta',
    {
      title: 'Registrar venta',
      description:
        'Guarda una venta ya cotizada y confirmada por el usuario: descuenta stock y, si hay cliente, genera el ítem de pago ' +
        '(pagado o como deuda). Usá exactamente los mismos datos que en cotizar_venta. Si el total cambió, no guarda y hay que volver a cotizar.',
      inputSchema: {
        ...entradaVenta,
        totalConfirmado: z.number().int().describe('Total en pesos devuelto por cotizar_venta y confirmado por el usuario'),
        confirmarDuplicado: z
          .boolean()
          .optional()
          .describe('true solo si el usuario confirmó que quiere registrar otra venta igual a una recién cargada'),
      },
      annotations: ANOTACION_CARGA,
    },
    seguro(async ({ totalConfirmado, confirmarDuplicado = false, ...entrada }) => {
      const venta = await armarVenta(entrada);
      if (typeof venta === 'string') return fallo(venta);
      if (venta.total !== totalConfirmado) {
        return fallo(
          `NO SE GUARDÓ: el total calculado ahora es ${pesos(venta.total)} y el confirmado era ${pesos(totalConfirmado)}. ` +
            'Volvé a cotizar_venta, mostrale el nuevo resumen al usuario y pedí confirmación otra vez.'
        );
      }

      const supabase = getSupabase();
      const clienteId = venta.cliente?.id ?? null;
      const { pagoCompleto, metodoPago, notas } = entrada;

      // Anti-duplicado: evita registrar dos veces la misma venta si Claude reintenta
      if (!confirmarDuplicado) {
        const desde = new Date(Date.now() - VENTANA_DUPLICADO_MIN * 60_000).toISOString();
        let query = supabase.from('ventas').select('id, created_at').eq('total', venta.total).gte('created_at', desde).limit(1);
        query = clienteId ? query.eq('cliente_id', clienteId) : query.is('cliente_id', null);
        const { data: similares, error } = await query;
        if (error) throw new Error(error.message);
        if (similares && similares.length > 0) {
          return ok({
            resultado: 'NO REGISTRADA: posible duplicado',
            detalle: `Hace menos de ${VENTANA_DUPLICADO_MIN} minutos se registró una venta de ${pesos(venta.total)} para ${resumir(venta).cliente}.`,
            siguientePaso:
              'Preguntale al usuario si es una venta nueva distinta. Solo si confirma, repetí registrar_venta con confirmarDuplicado=true.',
          });
        }
      }

      const fechaISO = instanteAR(venta.fecha, '12:00'); // mediodía AR, igual que parseFechaDB en el formulario

      // 1. Venta
      const { data: ventaCreada, error: errorVenta } = await supabase
        .from('ventas')
        .insert({
          cliente_id: clienteId,
          fecha: fechaISO,
          total: venta.total,
          descuento: venta.descuento,
          metodo_pago: metodoPago,
          estado_pago: pagoCompleto ? 'Pagado' : 'Pendiente',
          notas: notas || null,
        })
        .select('id')
        .single();
      if (errorVenta) throw new Error(`No se pudo crear la venta: ${errorVenta.message}`);
      const ventaId = ventaCreada.id as string;

      // 2. Ítems (el trigger descuenta stock y falla si no alcanza)
      const { error: errorItems } = await supabase.from('venta_items').insert(
        venta.lineas.map((l) => ({
          venta_id: ventaId,
          producto_id: l.productoId,
          nombre: l.productoId ? null : l.nombre,
          cantidad: l.cantidad,
          precio_unitario: l.precioUnitario,
          subtotal: l.subtotal,
        }))
      );
      if (errorItems) {
        await supabase.from('ventas').delete().eq('id', ventaId);
        return fallo(`NO SE GUARDÓ la venta: ${errorItems.message}`);
      }

      // 3. Ítem de pago (solo con cliente) y vínculo con la venta
      if (clienteId) {
        const { data: itemPago, error: errorItemPago } = await supabase
          .from('items_pago')
          .insert({
            cliente_id: clienteId,
            venta_id: ventaId,
            descripcion: `Venta: ${venta.lineas.map((l) => `${l.nombre} x${l.cantidad}`).join(', ')}`,
            monto: venta.total,
            fecha: fechaISO,
            estado: pagoCompleto ? 'Pagado' : 'Pendiente',
            monto_pagado: pagoCompleto ? venta.total : 0,
          })
          .select('id')
          .single();
        if (errorItemPago) {
          await supabase.from('venta_items').delete().eq('venta_id', ventaId);
          await supabase.from('ventas').delete().eq('id', ventaId);
          return fallo(`NO SE GUARDÓ la venta (falló el ítem de pago): ${errorItemPago.message}`);
        }

        const { error: errorVinculo } = await supabase.from('ventas').update({ item_pago_id: itemPago.id }).eq('id', ventaId);
        // La venta y su deuda ya están creadas: solo se pierde el vínculo de navegación, igual que en createVenta
        if (errorVinculo) console.error('Error al vincular venta con item_pago:', errorVinculo);
      }

      let saldoPendienteCliente: string | undefined;
      if (clienteId) {
        const { data: cliente } = await supabase.from('clientes').select('saldo_pendiente').eq('id', clienteId).maybeSingle();
        if (cliente) saldoPendienteCliente = pesos(Number(cliente.saldo_pendiente));
      }

      return ok({
        resultado: 'Venta registrada',
        resumen: resumir(venta),
        saldoPendienteCliente,
      });
    })
  );
};
