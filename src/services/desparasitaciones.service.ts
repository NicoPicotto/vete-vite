import { supabase } from '@/lib/supabase';
import type { Desparasitacion, DesparasitacionFormData } from '@/lib/types';

// Tipo para la tabla de Supabase (snake_case)
interface DesparasitacionDB {
  id: string;
  mascota_id: string;
  fecha: string;
  tipo_desparasitacion: string;
  notas: string | null;
  created_at: string;
  updated_at: string;
}

// Convertir de DB (snake_case) a TS (camelCase)
const dbToDesparasitacion = (db: DesparasitacionDB): Desparasitacion => ({
  id: db.id,
  mascotaId: db.mascota_id,
  fecha: new Date(db.fecha),
  tipoDesparasitacion: db.tipo_desparasitacion,
  notas: db.notas || undefined,
});

// Convertir de TS (camelCase) a DB (snake_case)
const desparasitacionToDb = (desparasitacion: DesparasitacionFormData) => ({
  mascota_id: desparasitacion.mascotaId,
  fecha: desparasitacion.fecha.toISOString().split('T')[0], // Solo fecha YYYY-MM-DD
  tipo_desparasitacion: desparasitacion.tipoDesparasitacion,
  notas: desparasitacion.notas || null,
});

/**
 * Obtener todas las desparasitaciones de una mascota
 */
export const getDesparasitacionesByMascotaId = async (mascotaId: string): Promise<Desparasitacion[]> => {
  const { data, error } = await supabase
    .from('desparasitaciones')
    .select('*')
    .eq('mascota_id', mascotaId)
    .order('fecha', { ascending: false });

  if (error) {
    throw new Error(`Error al obtener desparasitaciones: ${error.message}`);
  }

  return (data as DesparasitacionDB[]).map(dbToDesparasitacion);
};

/**
 * Obtener una desparasitación por ID
 */
export const getDesparasitacionById = async (id: string): Promise<Desparasitacion> => {
  const { data, error } = await supabase
    .from('desparasitaciones')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(`Error al obtener desparasitación: ${error.message}`);
  }

  if (!data) {
    throw new Error('Desparasitación no encontrada');
  }

  return dbToDesparasitacion(data as DesparasitacionDB);
};

/**
 * Crear una nueva desparasitación
 */
export const createDesparasitacion = async (desparasitacionData: DesparasitacionFormData): Promise<Desparasitacion> => {
  const { data, error } = await supabase
    .from('desparasitaciones')
    .insert(desparasitacionToDb(desparasitacionData))
    .select()
    .single();

  if (error) {
    throw new Error(`Error al crear desparasitación: ${error.message}`);
  }

  return dbToDesparasitacion(data as DesparasitacionDB);
};

/**
 * Actualizar una desparasitación existente
 */
export const updateDesparasitacion = async (
  id: string,
  desparasitacionData: DesparasitacionFormData
): Promise<Desparasitacion> => {
  const { data, error } = await supabase
    .from('desparasitaciones')
    .update(desparasitacionToDb(desparasitacionData))
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Error al actualizar desparasitación: ${error.message}`);
  }

  return dbToDesparasitacion(data as DesparasitacionDB);
};

/**
 * Eliminar una desparasitación
 */
export const deleteDesparasitacion = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('desparasitaciones')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Error al eliminar desparasitación: ${error.message}`);
  }
};
