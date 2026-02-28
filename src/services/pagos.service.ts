import { supabase } from '@/lib/supabase';
import type { ItemPago } from '@/lib/types';
import type { ItemPagoFormValues } from '@/lib/schemas';

// Tipo para la tabla items_pago de Supabase (snake_case)
interface ItemPagoDB {
  id: string;
  cliente_id: string;
  historia_clinica_id: string | null;
  descripcion: string;
  monto: number;
  fecha: string;
  estado: 'Pendiente' | 'Pagado Parcial' | 'Pagado';
  monto_pagado: number;
  created_at: string;
  updated_at: string;
}

// Convertir de DB (snake_case) a TS (camelCase)
const dbToItemPago = (db: ItemPagoDB): ItemPago => ({
  id: db.id,
  clienteId: db.cliente_id,
  historiaClinicaId: db.historia_clinica_id || undefined,
  descripcion: db.descripcion,
  monto: db.monto,
  fecha: new Date(db.fecha),
  estado: db.estado,
  montoPagado: db.monto_pagado,
  pagosParciales: [], // Siempre vacío por ahora
});

// Convertir de TS (camelCase) a DB (snake_case)
const itemPagoToDb = (item: ItemPagoFormValues) => ({
  cliente_id: item.clienteId,
  historia_clinica_id: null, // Por ahora siempre null, se puede asociar después
  descripcion: item.descripcion,
  monto: item.monto,
  fecha: new Date().toISOString(),
});

/**
 * Obtener todos los items de pago
 */
export const getItemsPago = async (): Promise<ItemPago[]> => {
  const { data, error } = await supabase
    .from('items_pago')
    .select('*')
    .order('fecha', { ascending: false });

  if (error) {
    throw new Error(`Error al obtener items de pago: ${error.message}`);
  }

  return (data as ItemPagoDB[]).map(dbToItemPago);
};

/**
 * Obtener un item de pago por ID
 */
export const getItemPagoById = async (id: string): Promise<ItemPago> => {
  const { data, error } = await supabase
    .from('items_pago')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(`Error al obtener item de pago: ${error.message}`);
  }

  if (!data) {
    throw new Error('Item de pago no encontrado');
  }

  return dbToItemPago(data as ItemPagoDB);
};

/**
 * Obtener items de pago por cliente ID
 */
export const getItemsPagoByClienteId = async (clienteId: string): Promise<ItemPago[]> => {
  const { data, error } = await supabase
    .from('items_pago')
    .select('*')
    .eq('cliente_id', clienteId)
    .order('fecha', { ascending: false });

  if (error) {
    throw new Error(`Error al obtener items de pago del cliente: ${error.message}`);
  }

  return (data as ItemPagoDB[]).map(dbToItemPago);
};

/**
 * Crear un nuevo item de pago
 */
export const createItemPago = async (itemData: ItemPagoFormValues): Promise<ItemPago> => {
  const dbData = itemPagoToDb(itemData);

  // Calcular monto_pagado inicial y estado
  const montoPagadoInicial = itemData.entregaInicial || 0;
  let estadoInicial: 'Pendiente' | 'Pagado Parcial' | 'Pagado' = 'Pendiente';

  if (montoPagadoInicial >= itemData.monto) {
    estadoInicial = 'Pagado';
  } else if (montoPagadoInicial > 0) {
    estadoInicial = 'Pagado Parcial';
  }

  // Crear el item de pago con monto_pagado y estado
  const { data: itemCreado, error: itemError } = await supabase
    .from('items_pago')
    .insert({
      ...dbData,
      monto_pagado: montoPagadoInicial,
      estado: estadoInicial,
    })
    .select()
    .single();

  if (itemError) {
    throw new Error(`Error al crear item de pago: ${itemError.message}`);
  }

  return dbToItemPago(itemCreado as ItemPagoDB);
};

/**
 * Actualizar un item de pago existente
 */
export const updateItemPago = async (
  id: string,
  itemData: Partial<ItemPagoFormValues>
): Promise<ItemPago> => {
  const updateData: Partial<{
    descripcion: string;
    monto: number;
  }> = {};

  if (itemData.descripcion) updateData.descripcion = itemData.descripcion;
  if (itemData.monto) updateData.monto = itemData.monto;

  const { data, error } = await supabase
    .from('items_pago')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Error al actualizar item de pago: ${error.message}`);
  }

  return dbToItemPago(data as ItemPagoDB);
};

/**
 * Eliminar un item de pago
 */
export const deleteItemPago = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('items_pago')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Error al eliminar item de pago: ${error.message}`);
  }
};

/**
 * Registrar un pago (incrementar monto_pagado)
 */
export const createPagoParcial = async (
  itemPagoId: string,
  monto: number,
  
): Promise<void> => {
  // 1. Obtener el item actual
  const { data: itemActual, error: itemError } = await supabase
    .from('items_pago')
    .select('monto, monto_pagado')
    .eq('id', itemPagoId)
    .single();

  if (itemError) {
    throw new Error(`Error al obtener item de pago: ${itemError.message}`);
  }

  // 2. Calcular nuevo monto_pagado y estado
  const nuevoMontoPagado = (itemActual.monto_pagado || 0) + monto;
  let nuevoEstado: 'Pendiente' | 'Pagado Parcial' | 'Pagado' = 'Pagado Parcial';

  if (nuevoMontoPagado >= itemActual.monto) {
    nuevoEstado = 'Pagado';
  }

  // 3. Actualizar el item
  const { error: updateError } = await supabase
    .from('items_pago')
    .update({
      monto_pagado: nuevoMontoPagado,
      estado: nuevoEstado,
    })
    .eq('id', itemPagoId);

  if (updateError) {
    throw new Error(`Error al registrar pago: ${updateError.message}`);
  }
};

/**
 * Eliminar un pago parcial (placeholder - no se usa en el MVP)
 */
export const deletePagoParcial = async (): Promise<void> => {
  // No implementado en el MVP
  throw new Error('Eliminar pagos parciales no está implementado en el MVP');
};
