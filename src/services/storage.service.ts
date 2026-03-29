import { supabase } from '@/lib/supabase';

// Tipos permitidos: PDF e imágenes
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB en bytes

export interface ArchivoSubido {
  nombre: string;
  url: string;
  tipo: string;
  tamano: number;
}

/**
 * Subir archivo a Supabase Storage
 * Bucket: historia-clinica
 * Path: {historia_clinica_id}/{nombre_archivo}
 */
export const uploadArchivoHistoriaClinica = async (
  historiaClinicaId: string,
  file: File
): Promise<ArchivoSubido> => {
  // Validación 1: Tamaño máximo (5 MB)
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('El archivo no puede superar 5 MB');
  }

  // Validación 2: Tipo de archivo (PDF o imagen)
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Solo se permiten archivos PDF o imágenes (JPG, PNG)');
  }

  // Generar path único: {id_consulta}/{timestamp}_{filename}
  const timestamp = Date.now();
  const fileName = `${timestamp}_${file.name}`;
  const path = `${historiaClinicaId}/${fileName}`;

  // Subir archivo a Supabase Storage
  const { data, error } = await supabase.storage
    .from('historia-clinica')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false, // No sobrescribir si existe
    });

  if (error) {
    throw new Error(`Error al subir archivo: ${error.message}`);
  }

  // Obtener URL pública del archivo
  const { data: { publicUrl } } = supabase.storage
    .from('historia-clinica')
    .getPublicUrl(path);

  return {
    nombre: file.name,
    url: publicUrl,
    tipo: file.type,
    tamano: file.size,
  };
};

/**
 * Eliminar archivo de Supabase Storage
 * Se usa al eliminar una consulta o al reemplazar un archivo
 */
export const deleteArchivoHistoriaClinica = async (
  historiaClinicaId: string,
  archivoUrl: string
): Promise<void> => {
  try {
    // Extraer el path del URL
    // URL ejemplo: https://xxx.supabase.co/storage/v1/object/public/historia-clinica/abc-123/file.pdf
    // Extraemos: abc-123/file.pdf
    const urlParts = archivoUrl.split('/historia-clinica/');
    if (urlParts.length < 2) {
      console.warn('URL de archivo inválida, no se puede eliminar:', archivoUrl);
      return;
    }

    const path = urlParts[1];

    const { error } = await supabase.storage
      .from('historia-clinica')
      .remove([path]);

    if (error) {
      console.error('Error al eliminar archivo:', error.message);
      // No lanzamos error para no bloquear la eliminación de la consulta
    }
  } catch (err) {
    console.error('Error al procesar eliminación de archivo:', err);
    // No lanzamos error para no bloquear la eliminación de la consulta
  }
};

/**
 * Eliminar todos los archivos de una consulta
 * Útil al eliminar la consulta completa
 */
export const deleteAllArchivosHistoriaClinica = async (
  historiaClinicaId: string
): Promise<void> => {
  try {
    // Listar todos los archivos de esta consulta
    const { data: files, error: listError } = await supabase.storage
      .from('historia-clinica')
      .list(historiaClinicaId);

    if (listError) {
      console.error('Error al listar archivos:', listError.message);
      return;
    }

    if (!files || files.length === 0) {
      return; // No hay archivos para eliminar
    }

    // Crear array de paths completos
    const filePaths = files.map(file => `${historiaClinicaId}/${file.name}`);

    // Eliminar todos los archivos
    const { error: deleteError } = await supabase.storage
      .from('historia-clinica')
      .remove(filePaths);

    if (deleteError) {
      console.error('Error al eliminar archivos:', deleteError.message);
    }
  } catch (err) {
    console.error('Error al procesar eliminación de archivos:', err);
    // No lanzamos error para no bloquear la eliminación de la consulta
  }
};
