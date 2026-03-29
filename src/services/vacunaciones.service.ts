import { supabase } from '@/lib/supabase';
import type { Vacunacion, VacunacionFormData } from '@/lib/types';

// Tipo para la tabla de Supabase (snake_case)
interface VacunacionDB {
  id: string;
  mascota_id: string;
  fecha: string;
  tipo_vacuna: string;
  notas: string | null;
  created_at: string;
  updated_at: string;
}

// Convertir de DB (snake_case) a TS (camelCase)
const dbToVacunacion = (db: VacunacionDB): Vacunacion => ({
  id: db.id,
  mascotaId: db.mascota_id,
  fecha: new Date(db.fecha),
  tipoVacuna: db.tipo_vacuna,
  notas: db.notas || undefined,
});

// Convertir de TS (camelCase) a DB (snake_case)
const vacunacionToDb = (vacunacion: VacunacionFormData) => ({
  mascota_id: vacunacion.mascotaId,
  fecha: vacunacion.fecha.toISOString().split('T')[0], // Solo fecha YYYY-MM-DD
  tipo_vacuna: vacunacion.tipoVacuna,
  notas: vacunacion.notas || null,
});

/**
 * Obtener todas las vacunaciones de una mascota
 */
export const getVacunacionesByMascotaId = async (mascotaId: string): Promise<Vacunacion[]> => {
  const { data, error } = await supabase
    .from('vacunaciones')
    .select('*')
    .eq('mascota_id', mascotaId)
    .order('fecha', { ascending: false });

  if (error) {
    throw new Error(`Error al obtener vacunaciones: ${error.message}`);
  }

  return (data as VacunacionDB[]).map(dbToVacunacion);
};

/**
 * Obtener una vacunación por ID
 */
export const getVacunacionById = async (id: string): Promise<Vacunacion> => {
  const { data, error } = await supabase
    .from('vacunaciones')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(`Error al obtener vacunación: ${error.message}`);
  }

  if (!data) {
    throw new Error('Vacunación no encontrada');
  }

  return dbToVacunacion(data as VacunacionDB);
};

/**
 * Crear una nueva vacunación
 */
export const createVacunacion = async (vacunacionData: VacunacionFormData): Promise<Vacunacion> => {
  const { data, error } = await supabase
    .from('vacunaciones')
    .insert(vacunacionToDb(vacunacionData))
    .select()
    .single();

  if (error) {
    throw new Error(`Error al crear vacunación: ${error.message}`);
  }

  return dbToVacunacion(data as VacunacionDB);
};

/**
 * Actualizar una vacunación existente
 */
export const updateVacunacion = async (
  id: string,
  vacunacionData: VacunacionFormData
): Promise<Vacunacion> => {
  const { data, error } = await supabase
    .from('vacunaciones')
    .update(vacunacionToDb(vacunacionData))
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Error al actualizar vacunación: ${error.message}`);
  }

  return dbToVacunacion(data as VacunacionDB);
};

/**
 * Eliminar una vacunación
 */
export const deleteVacunacion = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('vacunaciones')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Error al eliminar vacunación: ${error.message}`);
  }
};
