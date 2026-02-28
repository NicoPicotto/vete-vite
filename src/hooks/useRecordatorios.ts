import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllRecordatorios,
  getRecordatorioById,
  getRecordatoriosByCliente,
  getRecordatoriosByMascota,
  createRecordatorio,
  completarRecordatorio,
  cancelarRecordatorio,
  reprogramarRecordatorio,
  deleteRecordatorio,
} from '@/services/recordatorios.service';
import type { RecordatorioFormValues } from '@/lib/schemas';
import { toast } from 'sonner';

// ============================================
// QUERIES
// ============================================

/**
 * Hook para obtener todos los recordatorios
 */
export const useRecordatorios = () => {
  return useQuery({
    queryKey: ['recordatorios'],
    queryFn: getAllRecordatorios,
  });
};

/**
 * Hook para obtener un recordatorio por ID
 */
export const useRecordatorio = (id: string) => {
  return useQuery({
    queryKey: ['recordatorio', id],
    queryFn: () => getRecordatorioById(id),
    enabled: !!id,
  });
};

/**
 * Hook para obtener recordatorios por cliente
 */
export const useRecordatoriosByCliente = (clienteId: string) => {
  return useQuery({
    queryKey: ['recordatorios', 'cliente', clienteId],
    queryFn: () => getRecordatoriosByCliente(clienteId),
    enabled: !!clienteId,
  });
};

/**
 * Hook para obtener recordatorios por mascota
 */
export const useRecordatoriosByMascota = (mascotaId: string) => {
  return useQuery({
    queryKey: ['recordatorios', 'mascota', mascotaId],
    queryFn: () => getRecordatoriosByMascota(mascotaId),
    enabled: !!mascotaId,
  });
};

// ============================================
// MUTATIONS
// ============================================

/**
 * Hook para crear un nuevo recordatorio
 */
export const useCreateRecordatorio = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      data: RecordatorioFormValues & { clienteId: string; historiaClinicaId?: string }
    ) => createRecordatorio(data),
    onSuccess: (newRecordatorio) => {
      queryClient.invalidateQueries({ queryKey: ['recordatorios'] });
      queryClient.invalidateQueries({
        queryKey: ['recordatorios', 'cliente', newRecordatorio.clienteId],
      });
      queryClient.invalidateQueries({
        queryKey: ['recordatorios', 'mascota', newRecordatorio.mascotaId],
      });
      toast.success('Recordatorio creado exitosamente');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al crear recordatorio');
    },
  });
};

/**
 * Hook para completar un recordatorio
 */
export const useCompletarRecordatorio = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => completarRecordatorio(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recordatorios'] });
      toast.success('Recordatorio marcado como completado');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al completar recordatorio');
    },
  });
};

/**
 * Hook para cancelar un recordatorio
 */
export const useCancelarRecordatorio = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cancelarRecordatorio(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recordatorios'] });
      toast.success('Recordatorio cancelado');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al cancelar recordatorio');
    },
  });
};

/**
 * Hook para reprogramar un recordatorio
 */
export const useReprogramarRecordatorio = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, nuevaFecha, notas }: { id: string; nuevaFecha: Date; notas?: string }) =>
      reprogramarRecordatorio(id, nuevaFecha, notas),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recordatorios'] });
      toast.success('Recordatorio reprogramado exitosamente');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al reprogramar recordatorio');
    },
  });
};

/**
 * Hook para eliminar un recordatorio
 */
export const useDeleteRecordatorio = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteRecordatorio(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recordatorios'] });
      toast.success('Recordatorio eliminado');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al eliminar recordatorio');
    },
  });
};
