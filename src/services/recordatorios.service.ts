import { supabase } from '@/lib/supabase';
import type { Recordatorio } from '@/lib/types';
import type { RecordatorioFormValues } from '@/lib/schemas';

// ============================================
// INTERFACES PARA BASE DE DATOS
// ============================================

interface RecordatorioDB {
  id: string;
  historia_clinica_id: string | null;
  mascota_id: string;
  cliente_id: string;
  titulo: string;
  descripcion: string | null;
  fecha_recordatorio: string;
  es_recurrente: boolean;
  frecuencia_recurrencia: string | null;
  intervalo_personalizado: number | null;
  estado: 'Pendiente' | 'Completado' | 'Reprogramado' | 'Cancelado';
  creado_por: string | null;
  fecha_creacion: string;
  fecha_original: string | null;
  notas_reprogramacion: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// CONVERSIÓN: DB ↔ TypeScript
// ============================================

const dbToRecordatorio = (db: RecordatorioDB): Recordatorio => ({
  id: db.id,
  historiaClinicaId: db.historia_clinica_id || undefined,
  mascotaId: db.mascota_id,
  clienteId: db.cliente_id,
  titulo: db.titulo,
  descripcion: db.descripcion || undefined,
  fechaRecordatorio: new Date(db.fecha_recordatorio),
  esRecurrente: db.es_recurrente,
  frecuenciaRecurrencia: db.frecuencia_recurrencia as any,
  intervaloPersonalizado: db.intervalo_personalizado || undefined,
  estado: db.estado,
  creadoPor: db.creado_por || undefined,
  fechaCreacion: new Date(db.fecha_creacion),
  fechaOriginal: db.fecha_original ? new Date(db.fecha_original) : undefined,
  notasReprogramacion: db.notas_reprogramacion || undefined,
});

const recordatorioToDb = (
  recordatorio: RecordatorioFormValues & { clienteId: string; historiaClinicaId?: string }
) => ({
  historia_clinica_id: recordatorio.historiaClinicaId || null,
  mascota_id: recordatorio.mascotaId,
  cliente_id: recordatorio.clienteId,
  titulo: recordatorio.titulo,
  descripcion: recordatorio.descripcion || null,
  fecha_recordatorio: recordatorio.fechaRecordatorio.toISOString(),
  es_recurrente: false, // MVP: siempre false
  frecuencia_recurrencia: null,
  intervalo_personalizado: null,
  estado: 'Pendiente' as const,
  creado_por: null,
  fecha_creacion: new Date().toISOString(),
  fecha_original: null,
  notas_reprogramacion: null,
});

// ============================================
// OPERACIONES CRUD
// ============================================

/**
 * Obtener todos los recordatorios (ordenados por fecha)
 */
export const getAllRecordatorios = async (): Promise<Recordatorio[]> => {
  const { data, error } = await supabase
    .from('recordatorios')
    .select('*')
    .order('fecha_recordatorio', { ascending: true });

  if (error) {
    throw new Error(`Error al obtener recordatorios: ${error.message}`);
  }

  return (data as RecordatorioDB[]).map(dbToRecordatorio);
};

/**
 * Obtener recordatorio por ID
 */
export const getRecordatorioById = async (id: string): Promise<Recordatorio> => {
  const { data, error } = await supabase
    .from('recordatorios')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(`Error al obtener recordatorio: ${error.message}`);
  }

  return dbToRecordatorio(data as RecordatorioDB);
};

/**
 * Obtener recordatorios por cliente
 */
export const getRecordatoriosByCliente = async (clienteId: string): Promise<Recordatorio[]> => {
  const { data, error } = await supabase
    .from('recordatorios')
    .select('*')
    .eq('cliente_id', clienteId)
    .order('fecha_recordatorio', { ascending: true });

  if (error) {
    throw new Error(`Error al obtener recordatorios del cliente: ${error.message}`);
  }

  return (data as RecordatorioDB[]).map(dbToRecordatorio);
};

/**
 * Obtener recordatorios por mascota
 */
export const getRecordatoriosByMascota = async (mascotaId: string): Promise<Recordatorio[]> => {
  const { data, error } = await supabase
    .from('recordatorios')
    .select('*')
    .eq('mascota_id', mascotaId)
    .order('fecha_recordatorio', { ascending: true });

  if (error) {
    throw new Error(`Error al obtener recordatorios de la mascota: ${error.message}`);
  }

  return (data as RecordatorioDB[]).map(dbToRecordatorio);
};

/**
 * Crear un nuevo recordatorio
 */
export const createRecordatorio = async (
  recordatorioData: RecordatorioFormValues & { clienteId: string; historiaClinicaId?: string }
): Promise<Recordatorio> => {
  const dbData = recordatorioToDb(recordatorioData);

  const { data, error } = await supabase
    .from('recordatorios')
    .insert(dbData)
    .select()
    .single();

  if (error) {
    throw new Error(`Error al crear recordatorio: ${error.message}`);
  }

  return dbToRecordatorio(data as RecordatorioDB);
};

/**
 * Completar un recordatorio
 */
export const completarRecordatorio = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('recordatorios')
    .update({ estado: 'Completado' })
    .eq('id', id);

  if (error) {
    throw new Error(`Error al completar recordatorio: ${error.message}`);
  }
};

/**
 * Cancelar un recordatorio
 */
export const cancelarRecordatorio = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('recordatorios')
    .update({ estado: 'Cancelado' })
    .eq('id', id);

  if (error) {
    throw new Error(`Error al cancelar recordatorio: ${error.message}`);
  }
};

/**
 * Reprogramar un recordatorio
 */
export const reprogramarRecordatorio = async (
  id: string,
  nuevaFecha: Date,
  notas?: string
): Promise<void> => {
  // Primero obtenemos el recordatorio actual para guardar la fecha original
  const { data: recordatorioActual, error: errorGet } = await supabase
    .from('recordatorios')
    .select('fecha_recordatorio, fecha_original')
    .eq('id', id)
    .single();

  if (errorGet) {
    throw new Error(`Error al obtener recordatorio: ${errorGet.message}`);
  }

  const fechaOriginal =
    recordatorioActual.fecha_original || recordatorioActual.fecha_recordatorio;

  const { error } = await supabase
    .from('recordatorios')
    .update({
      fecha_recordatorio: nuevaFecha.toISOString(),
      fecha_original: fechaOriginal,
      notas_reprogramacion: notas || null,
      estado: 'Reprogramado',
    })
    .eq('id', id);

  if (error) {
    throw new Error(`Error al reprogramar recordatorio: ${error.message}`);
  }
};

/**
 * Eliminar un recordatorio
 */
export const deleteRecordatorio = async (id: string): Promise<void> => {
  const { error } = await supabase.from('recordatorios').delete().eq('id', id);

  if (error) {
    throw new Error(`Error al eliminar recordatorio: ${error.message}`);
  }
};
