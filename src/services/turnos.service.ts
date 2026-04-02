import { supabase } from '@/lib/supabase';
import type { Turno } from '@/lib/types';
import type { TurnoFormValues } from '@/lib/schemas';

// ============================================
// INTERFACES PARA BASE DE DATOS
// ============================================

interface TurnoDB {
  id: string;
  cliente_id: string;
  mascota_id: string | null;
  fecha_hora: string;
  tipo: 'Consulta' | 'Control';
  notas: string | null;
  estado: 'Pendiente' | 'Confirmado' | 'Cancelado' | 'Completado' | 'No se presentó';
  created_at: string;
  updated_at: string;
  // Campos extra desde la view turnos_con_detalle
  cliente_nombre?: string;
  cliente_apellido?: string;
  cliente_telefono?: string;
  mascota_nombre?: string | null;
  mascota_especie?: string | null;
}

// ============================================
// CONVERSIÓN: DB ↔ TypeScript
// ============================================

const dbToTurno = (db: TurnoDB): Turno => ({
  id: db.id,
  clienteId: db.cliente_id,
  mascotaId: db.mascota_id || undefined,
  fechaHora: new Date(db.fecha_hora),
  tipo: db.tipo,
  notas: db.notas || undefined,
  estado: db.estado,
  clienteNombre: db.cliente_nombre,
  clienteApellido: db.cliente_apellido,
  clienteTelefono: db.cliente_telefono,
  mascotaNombre: db.mascota_nombre || undefined,
  mascotaEspecie: db.mascota_especie || undefined,
});

// Combina fecha (YYYY-MM-DD) y hora (HH:MM) en un ISO string UTC-aware
const buildFechaHora = (fecha: string, hora: string): string => {
  return new Date(`${fecha}T${hora}:00`).toISOString();
};

// ============================================
// OPERACIONES CRUD
// ============================================

/**
 * Obtener todos los turnos con detalle de cliente y mascota
 */
export const getAllTurnos = async (): Promise<Turno[]> => {
  const { data, error } = await supabase
    .from('turnos_con_detalle')
    .select('*')
    .order('fecha_hora', { ascending: true });

  if (error) {
    throw new Error(`Error al obtener turnos: ${error.message}`);
  }

  return (data as TurnoDB[]).map(dbToTurno);
};

/**
 * Obtener un turno por ID
 */
export const getTurnoById = async (id: string): Promise<Turno> => {
  const { data, error } = await supabase
    .from('turnos_con_detalle')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(`Error al obtener turno: ${error.message}`);
  }

  return dbToTurno(data as TurnoDB);
};

/**
 * Verificar si un slot horario ya está ocupado
 * Devuelve true si hay conflicto
 */
export const checkDisponibilidadSlot = async (
  fecha: string,
  hora: string,
  excludeId?: string
): Promise<boolean> => {
  const fechaHora = buildFechaHora(fecha, hora);

  let query = supabase
    .from('turnos')
    .select('id')
    .eq('fecha_hora', fechaHora)
    .not('estado', 'in', '("Cancelado","No se presentó")');

  if (excludeId) {
    query = query.neq('id', excludeId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Error al verificar disponibilidad: ${error.message}`);
  }

  return (data?.length ?? 0) > 0;
};

/**
 * Crear un nuevo turno
 */
export const createTurno = async (formData: TurnoFormValues): Promise<Turno> => {
  const { data, error } = await supabase
    .from('turnos')
    .insert({
      cliente_id: formData.clienteId,
      mascota_id: formData.mascotaId || null,
      fecha_hora: buildFechaHora(formData.fecha, formData.hora),
      tipo: formData.tipo,
      notas: formData.notas || null,
      estado: formData.estado,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Error al crear turno: ${error.message}`);
  }

  // Fetch completo desde la view para tener los datos de cliente/mascota
  return getTurnoById((data as TurnoDB).id);
};

/**
 * Actualizar un turno existente
 */
export const updateTurno = async (
  id: string,
  formData: Partial<TurnoFormValues>
): Promise<Turno> => {
  const updateData: Record<string, unknown> = {};

  if (formData.clienteId !== undefined) updateData.cliente_id = formData.clienteId;
  if (formData.mascotaId !== undefined) updateData.mascota_id = formData.mascotaId || null;
  if (formData.fecha !== undefined && formData.hora !== undefined) {
    updateData.fecha_hora = buildFechaHora(formData.fecha, formData.hora);
  }
  if (formData.tipo !== undefined) updateData.tipo = formData.tipo;
  if (formData.notas !== undefined) updateData.notas = formData.notas || null;
  if (formData.estado !== undefined) updateData.estado = formData.estado;

  const { error } = await supabase.from('turnos').update(updateData).eq('id', id);

  if (error) {
    throw new Error(`Error al actualizar turno: ${error.message}`);
  }

  return getTurnoById(id);
};

/**
 * Cambiar el estado de un turno
 */
export const updateEstadoTurno = async (
  id: string,
  estado: Turno['estado']
): Promise<void> => {
  const { error } = await supabase.from('turnos').update({ estado }).eq('id', id);

  if (error) {
    throw new Error(`Error al actualizar estado del turno: ${error.message}`);
  }
};

/**
 * Eliminar un turno
 */
export const deleteTurno = async (id: string): Promise<void> => {
  const { error } = await supabase.from('turnos').delete().eq('id', id);

  if (error) {
    throw new Error(`Error al eliminar turno: ${error.message}`);
  }
};
