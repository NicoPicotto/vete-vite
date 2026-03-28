import { supabase } from '@/lib/supabase';
import type { Venta, VentaItem, VentaFormInput } from '@/lib/types';

// Tipos para las tablas de Supabase (snake_case)
interface VentaDB {
  id: string;
  cliente_id: string | null; // Puede ser null para ventas al paso
  fecha: string;
  total: number;
  metodo_pago: 'Contado' | 'Débito' | 'Crédito';
  estado_pago: 'Pendiente' | 'Pagado Parcial' | 'Pagado';
  notas: string | null;
  item_pago_id: string | null;
  created_at: string;
  updated_at: string;
}

interface VentaItemDB {
  id: string;
  venta_id: string;
  producto_id: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  created_at: string;
}

// interface VentaConDetallesDB extends VentaDB {
//   cliente_nombre: string;
//   cliente_apellido: string;
//   cliente_telefono: string;
//   items?: Array<{
//     id: string;
//     producto_id: string;
//     producto_nombre: string;
//     cantidad: number;
//     precio_unitario: number;
//     subtotal: number;
//   }>;
// }

// Convertir de DB (snake_case) a TS (camelCase)
const dbToVenta = (db: VentaDB, items?: VentaItemDB[]): Venta => ({
  id: db.id,
  clienteId: db.cliente_id || undefined, // Convertir null a undefined
  fecha: new Date(db.fecha),
  total: db.total,
  metodoPago: db.metodo_pago,
  estadoPago: db.estado_pago,
  notas: db.notas || undefined,
  itemPagoId: db.item_pago_id || undefined,
  fechaCreacion: new Date(db.created_at),
  items: items ? items.map(dbToVentaItem) : undefined,
});

const dbToVentaItem = (db: VentaItemDB): VentaItem => ({
  id: db.id,
  ventaId: db.venta_id,
  productoId: db.producto_id,
  cantidad: db.cantidad,
  precioUnitario: db.precio_unitario,
  subtotal: db.subtotal,
});

/**
 * Obtener todas las ventas
 */
export const getVentas = async (): Promise<Venta[]> => {
  const { data, error } = await supabase
    .from('ventas')
    .select('*')
    .order('fecha', { ascending: false });

  if (error) {
    throw new Error(`Error al obtener ventas: ${error.message}`);
  }

  return (data as VentaDB[]).map((venta) => dbToVenta(venta));
};

/**
 * Obtener ventas por cliente
 */
export const getVentasByCliente = async (clienteId: string): Promise<Venta[]> => {
  const { data, error } = await supabase
    .from('ventas')
    .select('*')
    .eq('cliente_id', clienteId)
    .order('fecha', { ascending: false });

  if (error) {
    throw new Error(`Error al obtener ventas del cliente: ${error.message}`);
  }

  return (data as VentaDB[]).map((venta) => dbToVenta(venta));
};

/**
 * Obtener una venta por ID con sus items
 */
export const getVentaById = async (id: string): Promise<Venta> => {
  // Obtener venta
  const { data: ventaData, error: ventaError } = await supabase
    .from('ventas')
    .select('*')
    .eq('id', id)
    .single();

  if (ventaError) {
    throw new Error(`Error al obtener venta: ${ventaError.message}`);
  }

  if (!ventaData) {
    throw new Error('Venta no encontrada');
  }

  // Obtener items de la venta
  const { data: itemsData, error: itemsError } = await supabase
    .from('venta_items')
    .select('*')
    .eq('venta_id', id)
    .order('created_at', { ascending: true });

  if (itemsError) {
    throw new Error(`Error al obtener items de la venta: ${itemsError.message}`);
  }

  return dbToVenta(ventaData as VentaDB, (itemsData as VentaItemDB[]) || []);
};

/**
 * Calcular recargo según método de pago
 * Exportada para uso en UI (mostrar recargo en tiempo real)
 */
export const calcularRecargo = (subtotal: number, metodoPago: 'Contado' | 'Débito' | 'Crédito'): number => {
  switch (metodoPago) {
    case 'Contado':
      return 0; // Sin recargo
    case 'Débito':
      return Math.round(subtotal * 0.05); // +5%
    case 'Crédito':
      return Math.round(subtotal * 0.20); // +20%
    default:
      return 0;
  }
};

/**
 * Crear una nueva venta con sus items
 * También genera automáticamente un ItemPago asociado (solo si hay cliente)
 */
export const createVenta = async (ventaData: VentaFormInput): Promise<Venta> => {
  // 1. Calcular subtotal (suma de productos sin recargo)
  const subtotal = ventaData.items.reduce((acc, item) => acc + item.precioUnitario * item.cantidad, 0);

  // 2. Calcular recargo según método de pago
  const recargo = calcularRecargo(subtotal, ventaData.metodoPago);

  // 3. Calcular total final (subtotal + recargo)
  const total = subtotal + recargo;

  // 4. Crear la venta
  // Si es venta al paso (sin cliente) y se pagó completo, el estado es 'Pagado', sino 'Pendiente'
  const esVentaAlPaso = !ventaData.clienteId;
  const estadoInicial = esVentaAlPaso && ventaData.pagoCompleto ? 'Pagado' : 'Pendiente';

  const { data: ventaCreada, error: ventaError } = await supabase
    .from('ventas')
    .insert({
      cliente_id: ventaData.clienteId || null,
      fecha: ventaData.fecha.toISOString(),
      total,
      metodo_pago: ventaData.metodoPago,
      estado_pago: estadoInicial,
      notas: ventaData.notas || null,
    })
    .select()
    .single();

  if (ventaError) {
    throw new Error(`Error al crear venta: ${ventaError.message}`);
  }

  const ventaId = (ventaCreada as VentaDB).id;

  // 2. Crear los items de la venta
  const itemsToInsert = ventaData.items.map((item) => ({
    venta_id: ventaId,
    producto_id: item.productoId,
    cantidad: item.cantidad,
    precio_unitario: item.precioUnitario,
    subtotal: item.cantidad * item.precioUnitario,
  }));

  const { error: itemsError } = await supabase
    .from('venta_items')
    .insert(itemsToInsert);

  if (itemsError) {
    // Rollback: eliminar la venta si falla la inserción de items
    await supabase.from('ventas').delete().eq('id', ventaId);
    throw new Error(`Error al crear items de venta: ${itemsError.message}`);
  }

  // 3. Crear ItemPago asociado SOLO si hay cliente (no para ventas al paso)
  if (!esVentaAlPaso) {
    // Obtener nombres de productos para descripción más descriptiva
    const productosIds = ventaData.items.map((item) => item.productoId);
    const { data: productosData, error: productosError } = await supabase
      .from('productos')
      .select('id, nombre')
      .in('id', productosIds);

    if (productosError) {
      console.error('Error al obtener nombres de productos para descripción:', productosError);
    }

    // Crear descripción con nombres de productos y cantidades (ej: "Pipeta 100mg x3, Shampoo x1")
    const productosMap = new Map(productosData?.map((p) => [p.id, p.nombre]) || []);
    const descripcionProductos = ventaData.items
      .map((item) => {
        const nombre = productosMap.get(item.productoId) || 'Producto';
        return `${nombre} x${item.cantidad}`;
      })
      .join(', ');

    // Determinar monto_pagado y estado según si se pagó completo en el momento
    const montoPagadoInicial = ventaData.pagoCompleto ? total : 0;
    const estadoPagoInicial: 'Pendiente' | 'Pagado Parcial' | 'Pagado' = ventaData.pagoCompleto ? 'Pagado' : 'Pendiente';

    const { data: itemPagoCreado, error: itemPagoError } = await supabase
      .from('items_pago')
      .insert({
        cliente_id: ventaData.clienteId,
        venta_id: ventaId,
        descripcion: `Venta: ${descripcionProductos}`,
        monto: total,
        fecha: ventaData.fecha.toISOString(),
        estado: estadoPagoInicial,
        monto_pagado: montoPagadoInicial,
      })
      .select()
      .single();

    if (itemPagoError) {
      // Rollback: eliminar venta e items si falla la creación del ItemPago
      await supabase.from('venta_items').delete().eq('venta_id', ventaId);
      await supabase.from('ventas').delete().eq('id', ventaId);
      throw new Error(`Error al crear item de pago: ${itemPagoError.message}`);
    }

    // 4. Actualizar la venta con el item_pago_id y estado_pago (si fue pago completo)
    const updateData: { item_pago_id: string; estado_pago?: 'Pagado' } = {
      item_pago_id: (itemPagoCreado as any).id,
    };

    // Si se pagó completo, actualizar también el estado_pago
    if (ventaData.pagoCompleto) {
      updateData.estado_pago = 'Pagado';
    }

    const { error: updateError } = await supabase
      .from('ventas')
      .update(updateData)
      .eq('id', ventaId);

    if (updateError) {
      console.error('Error al actualizar venta con item_pago_id y estado:', updateError);
      // No lanzamos error porque la venta ya está creada correctamente
    }
  }
  // Si es venta al paso, NO se crea ItemPago

  // 5. Retornar la venta completa con items
  return getVentaById(ventaId);
};

/**
 * Eliminar una venta
 * NOTA: Esto también elimina los items (CASCADE) y restaura el stock automáticamente (trigger)
 * El ItemPago asociado NO se elimina (ON DELETE SET NULL), solo se desvincula
 */
export const deleteVenta = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('ventas')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Error al eliminar venta: ${error.message}`);
  }
};

/**
 * Obtener estadísticas de ventas (opcional, para dashboard futuro)
 */
export const getEstadisticasVentas = async () => {
  const { data, error } = await supabase
    .from('ventas')
    .select('total, estado_pago, fecha');

  if (error) {
    throw new Error(`Error al obtener estadísticas: ${error.message}`);
  }

  const ventas = data as VentaDB[];

  return {
    totalVentas: ventas.length,
    montoTotal: ventas.reduce((acc, v) => acc + v.total, 0),
    ventasPendientes: ventas.filter((v) => v.estado_pago === 'Pendiente').length,
    ventasPagadas: ventas.filter((v) => v.estado_pago === 'Pagado').length,
  };
};
