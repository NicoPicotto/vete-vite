import { supabase } from '@/lib/supabase';
import type { HistoriaClinica, HistoriaClinicaFormData } from '@/lib/types';

// Tipo para la tabla de Supabase (snake_case)
interface HistoriaClinicaDB {
  id: string;
  mascota_id: string;
  fecha: string;
  motivo_consulta: string;
  diagnostico: string;
  tratamiento: string;
  peso: number | null;
  temperatura: number | null;
  vacunas_aplicadas: string[] | null;
  notas: string | null;
  veterinario: string | null;
  created_at: string;
  updated_at: string;
}

// Convertir de DB (snake_case) a TS (camelCase)
const dbToHistoriaClinica = (db: HistoriaClinicaDB): HistoriaClinica => ({
  id: db.id,
  mascotaId: db.mascota_id,
  fecha: new Date(db.fecha),
  motivoConsulta: db.motivo_consulta,
  diagnostico: db.diagnostico,
  tratamiento: db.tratamiento,
  peso: db.peso || undefined,
  temperatura: db.temperatura || undefined,
  vacunasAplicadas: db.vacunas_aplicadas || undefined,
  notas: db.notas || undefined,
  veterinario: db.veterinario || undefined,
  // archivosAdjuntos e itemsPago se manejarán en futuras iteraciones
});

// Convertir de TS (camelCase) a DB (snake_case)
const historiaClinicaToDb = (historia: HistoriaClinicaFormData) => ({
  mascota_id: historia.mascotaId,
  fecha: new Date().toISOString(),
  motivo_consulta: historia.motivoConsulta,
  diagnostico: historia.diagnostico,
  tratamiento: historia.tratamiento,
  peso: historia.peso || null,
  temperatura: historia.temperatura || null,
  vacunas_aplicadas: historia.vacunasAplicadas || null,
  notas: historia.notas || null,
  veterinario: historia.veterinario || null,
});

/**
 * Obtener todas las historias clínicas
 */
export const getHistoriasClinicas = async (): Promise<HistoriaClinica[]> => {
  const { data, error } = await supabase
    .from('historia_clinica')
    .select('*')
    .order('fecha', { ascending: false });

  if (error) {
    throw new Error(`Error al obtener historias clínicas: ${error.message}`);
  }

  return (data as HistoriaClinicaDB[]).map(dbToHistoriaClinica);
};

/**
 * Obtener una historia clínica por ID
 */
export const getHistoriaClinicaById = async (id: string): Promise<HistoriaClinica> => {
  const { data, error } = await supabase
    .from('historia_clinica')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(`Error al obtener historia clínica: ${error.message}`);
  }

  if (!data) {
    throw new Error('Historia clínica no encontrada');
  }

  return dbToHistoriaClinica(data as HistoriaClinicaDB);
};

/**
 * Obtener historias clínicas por mascota ID
 */
export const getHistoriasClinicasByMascotaId = async (mascotaId: string): Promise<HistoriaClinica[]> => {
  const { data, error } = await supabase
    .from('historia_clinica')
    .select('*')
    .eq('mascota_id', mascotaId)
    .order('fecha', { ascending: false });

  if (error) {
    throw new Error(`Error al obtener historias clínicas de la mascota: ${error.message}`);
  }

  return (data as HistoriaClinicaDB[]).map(dbToHistoriaClinica);
};

/**
 * Crear una nueva historia clínica
 */
export const createHistoriaClinica = async (historiaData: HistoriaClinicaFormData): Promise<HistoriaClinica> => {
  const { data, error } = await supabase
    .from('historia_clinica')
    .insert(historiaClinicaToDb(historiaData))
    .select()
    .single();

  if (error) {
    throw new Error(`Error al crear historia clínica: ${error.message}`);
  }

  return dbToHistoriaClinica(data as HistoriaClinicaDB);
};

/**
 * Actualizar una historia clínica existente
 */
export const updateHistoriaClinica = async (
  id: string,
  historiaData: HistoriaClinicaFormData
): Promise<HistoriaClinica> => {
  const { data, error } = await supabase
    .from('historia_clinica')
    .update(historiaClinicaToDb(historiaData))
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Error al actualizar historia clínica: ${error.message}`);
  }

  return dbToHistoriaClinica(data as HistoriaClinicaDB);
};

/**
 * Eliminar una historia clínica
 */
export const deleteHistoriaClinica = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('historia_clinica')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Error al eliminar historia clínica: ${error.message}`);
  }
};
