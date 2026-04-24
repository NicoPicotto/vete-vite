import { supabase } from '@/lib/supabase';
import type { MensajeRapido, MensajeRapidoFormData } from '@/lib/types';

interface MensajeRapidoDB {
  id: string;
  titulo: string;
  contenido: string;
  created_at: string;
  updated_at: string;
}

const dbToMensaje = (db: MensajeRapidoDB): MensajeRapido => ({
  id: db.id,
  titulo: db.titulo,
  contenido: db.contenido,
  fechaCreacion: new Date(db.created_at),
  fechaActualizacion: new Date(db.updated_at),
});

export const getMensajesRapidos = async (): Promise<MensajeRapido[]> => {
  const { data, error } = await supabase
    .from('mensajes_rapidos')
    .select('*')
    .order('titulo', { ascending: true });

  if (error) {
    throw new Error(`Error al obtener mensajes rápidos: ${error.message}`);
  }

  return (data as MensajeRapidoDB[]).map(dbToMensaje);
};

export const createMensajeRapido = async (formData: MensajeRapidoFormData): Promise<MensajeRapido> => {
  const { data, error } = await supabase
    .from('mensajes_rapidos')
    .insert({ titulo: formData.titulo, contenido: formData.contenido })
    .select()
    .single();

  if (error) {
    throw new Error(`Error al crear mensaje rápido: ${error.message}`);
  }

  return dbToMensaje(data as MensajeRapidoDB);
};

export const updateMensajeRapido = async (id: string, formData: MensajeRapidoFormData): Promise<MensajeRapido> => {
  const { data, error } = await supabase
    .from('mensajes_rapidos')
    .update({ titulo: formData.titulo, contenido: formData.contenido })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Error al actualizar mensaje rápido: ${error.message}`);
  }

  return dbToMensaje(data as MensajeRapidoDB);
};

export const deleteMensajeRapido = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('mensajes_rapidos')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Error al eliminar mensaje rápido: ${error.message}`);
  }
};
