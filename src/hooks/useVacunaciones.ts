import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { VacunacionFormData } from '@/lib/types';
import {
  getVacunacionesByMascotaId,
  getVacunacionById,
  createVacunacion,
  updateVacunacion,
  deleteVacunacion,
} from '@/services/vacunaciones.service';

// ============================================
// QUERY KEYS
// ============================================
export const vacunacionesKeys = {
  all: ['vacunaciones'] as const,
  byMascota: (mascotaId: string) => ['vacunaciones', 'mascota', mascotaId] as const,
  detail: (id: string) => ['vacunaciones', 'detail', id] as const,
};

// ============================================
// QUERIES
// ============================================

/**
 * Hook para obtener todas las vacunaciones de una mascota
 */
export const useVacunacionesByMascota = (mascotaId: string) => {
  return useQuery({
    queryKey: vacunacionesKeys.byMascota(mascotaId),
    queryFn: () => getVacunacionesByMascotaId(mascotaId),
    enabled: !!mascotaId,
  });
};

/**
 * Hook para obtener una vacunación por ID
 */
export const useVacunacion = (id: string) => {
  return useQuery({
    queryKey: vacunacionesKeys.detail(id),
    queryFn: () => getVacunacionById(id),
    enabled: !!id,
  });
};

// ============================================
// MUTATIONS
// ============================================

/**
 * Hook para crear una nueva vacunación
 */
export const useCreateVacunacion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: VacunacionFormData) => createVacunacion(data),
    onSuccess: (_, variables) => {
      // Invalidar cache de vacunaciones de la mascota
      queryClient.invalidateQueries({
        queryKey: vacunacionesKeys.byMascota(variables.mascotaId),
      });
      toast.success('Vacunación registrada exitosamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al registrar vacunación: ${error.message}`);
    },
  });
};

/**
 * Hook para actualizar una vacunación existente
 */
export const useUpdateVacunacion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: VacunacionFormData }) =>
      updateVacunacion(id, data),
    onSuccess: (updatedVacunacion) => {
      // Invalidar cache de vacunaciones de la mascota
      queryClient.invalidateQueries({
        queryKey: vacunacionesKeys.byMascota(updatedVacunacion.mascotaId),
      });
      // Invalidar cache del detalle
      queryClient.invalidateQueries({
        queryKey: vacunacionesKeys.detail(updatedVacunacion.id),
      });
      toast.success('Vacunación actualizada exitosamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al actualizar vacunación: ${error.message}`);
    },
  });
};

/**
 * Hook para eliminar una vacunación
 */
export const useDeleteVacunacion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteVacunacion(id),
    onSuccess: () => {
      // Invalidar todas las queries de vacunaciones
      queryClient.invalidateQueries({
        queryKey: vacunacionesKeys.all,
      });
      toast.success('Vacunación eliminada exitosamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al eliminar vacunación: ${error.message}`);
    },
  });
};
