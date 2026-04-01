import { supabase } from '@/lib/supabase';
import type { Mascota, MascotaFormData } from '@/lib/types';

// Tipo para la tabla de Supabase (snake_case)
interface MascotaDB {
  id: string;
  cliente_id: string;
  nombre: string;
  especie: string;
  raza: string;
  fecha_nacimiento: string | null;
  sexo: string;
  estado: string;
  otras_caracteristicas: string | null;
  created_at: string;
  updated_at: string;
}

// Convertir de DB (snake_case) a TS (camelCase)
const dbToMascota = (db: MascotaDB): Mascota => ({
  id: db.id,
  clienteId: db.cliente_id,
  nombre: db.nombre,
  especie: db.especie as Mascota['especie'],
  raza: db.raza,
  fechaNacimiento: db.fecha_nacimiento ? new Date(db.fecha_nacimiento) : undefined,
  sexo: db.sexo as Mascota['sexo'],
  estado: db.estado as Mascota['estado'],
  otrasCaracteristicas: db.otras_caracteristicas || undefined,
});

// Convertir de TS (camelCase) a DB (snake_case)
const mascotaToDb = (mascota: MascotaFormData) => ({
  cliente_id: mascota.clienteId,
  nombre: mascota.nombre,
  especie: mascota.especie,
  raza: mascota.raza,
  fecha_nacimiento: mascota.fechaNacimiento?.toISOString().split('T')[0] || null,
  sexo: mascota.sexo,
  estado: mascota.estado,
  otras_caracteristicas: mascota.otrasCaracteristicas || null,
});

/**
 * Obtener todas las mascotas
 */
export const getMascotas = async (): Promise<Mascota[]> => {
  const { data, error } = await supabase
    .from('mascotas')
    .select('*')
    .order('nombre', { ascending: true });

  if (error) {
    throw new Error(`Error al obtener mascotas: ${error.message}`);
  }

  return (data as MascotaDB[]).map(dbToMascota);
};

/**
 * Obtener una mascota por ID
 */
export const getMascotaById = async (id: string): Promise<Mascota> => {
  const { data, error } = await supabase
    .from('mascotas')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(`Error al obtener mascota: ${error.message}`);
  }

  if (!data) {
    throw new Error('Mascota no encontrada');
  }

  return dbToMascota(data as MascotaDB);
};

/**
 * Obtener mascotas por cliente ID
 */
export const getMascotasByClienteId = async (clienteId: string): Promise<Mascota[]> => {
  const { data, error } = await supabase
    .from('mascotas')
    .select('*')
    .eq('cliente_id', clienteId)
    .order('nombre', { ascending: true });

  if (error) {
    throw new Error(`Error al obtener mascotas del cliente: ${error.message}`);
  }

  return (data as MascotaDB[]).map(dbToMascota);
};

/**
 * Crear una nueva mascota
 */
export const createMascota = async (mascotaData: MascotaFormData): Promise<Mascota> => {
  const { data, error } = await supabase
    .from('mascotas')
    .insert(mascotaToDb(mascotaData))
    .select()
    .single();

  if (error) {
    throw new Error(`Error al crear mascota: ${error.message}`);
  }

  return dbToMascota(data as MascotaDB);
};

/**
 * Actualizar una mascota existente
 */
export const updateMascota = async (id: string, mascotaData: MascotaFormData): Promise<Mascota> => {
  const { data, error } = await supabase
    .from('mascotas')
    .update(mascotaToDb(mascotaData))
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Error al actualizar mascota: ${error.message}`);
  }

  return dbToMascota(data as MascotaDB);
};

/**
 * Eliminar una mascota
 */
export const deleteMascota = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('mascotas')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Error al eliminar mascota: ${error.message}`);
  }
};
