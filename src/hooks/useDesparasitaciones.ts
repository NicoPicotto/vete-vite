import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Desparasitacion, DesparasitacionFormData } from '@/lib/types';
import {
  getDesparasitacionesByMascotaId,
  getDesparasitacionById,
  createDesparasitacion,
  updateDesparasitacion,
  deleteDesparasitacion,
} from '@/services/desparasitaciones.service';

// ============================================
// QUERY KEYS
// ============================================
export const desparasitacionesKeys = {
  all: ['desparasitaciones'] as const,
  byMascota: (mascotaId: string) => ['desparasitaciones', 'mascota', mascotaId] as const,
  detail: (id: string) => ['desparasitaciones', 'detail', id] as const,
};

// ============================================
// QUERIES
// ============================================

/**
 * Hook para obtener todas las desparasitaciones de una mascota
 */
export const useDesparasitacionesByMascota = (mascotaId: string) => {
  return useQuery({
    queryKey: desparasitacionesKeys.byMascota(mascotaId),
    queryFn: () => getDesparasitacionesByMascotaId(mascotaId),
    enabled: !!mascotaId,
  });
};

/**
 * Hook para obtener una desparasitación por ID
 */
export const useDesparasitacion = (id: string) => {
  return useQuery({
    queryKey: desparasitacionesKeys.detail(id),
    queryFn: () => getDesparasitacionById(id),
    enabled: !!id,
  });
};

// ============================================
// MUTATIONS
// ============================================

/**
 * Hook para crear una nueva desparasitación
 */
export const useCreateDesparasitacion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DesparasitacionFormData) => createDesparasitacion(data),
    onSuccess: (_, variables) => {
      // Invalidar cache de desparasitaciones de la mascota
      queryClient.invalidateQueries({
        queryKey: desparasitacionesKeys.byMascota(variables.mascotaId),
      });
      toast.success('Desparasitación registrada exitosamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al registrar desparasitación: ${error.message}`);
    },
  });
};

/**
 * Hook para actualizar una desparasitación existente
 */
export const useUpdateDesparasitacion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: DesparasitacionFormData }) =>
      updateDesparasitacion(id, data),
    onSuccess: (updatedDesparasitacion) => {
      // Invalidar cache de desparasitaciones de la mascota
      queryClient.invalidateQueries({
        queryKey: desparasitacionesKeys.byMascota(updatedDesparasitacion.mascotaId),
      });
      // Invalidar cache del detalle
      queryClient.invalidateQueries({
        queryKey: desparasitacionesKeys.detail(updatedDesparasitacion.id),
      });
      toast.success('Desparasitación actualizada exitosamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al actualizar desparasitación: ${error.message}`);
    },
  });
};

/**
 * Hook para eliminar una desparasitación
 */
export const useDeleteDesparasitacion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteDesparasitacion(id),
    onSuccess: (_, deletedId) => {
      // Invalidar todas las queries de desparasitaciones
      queryClient.invalidateQueries({
        queryKey: desparasitacionesKeys.all,
      });
      toast.success('Desparasitación eliminada exitosamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al eliminar desparasitación: ${error.message}`);
    },
  });
};
