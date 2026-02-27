import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { HistoriaClinica, HistoriaClinicaFormData } from '@/lib/types';
import {
  getHistoriasClinicas,
  getHistoriaClinicaById,
  getHistoriasClinicasByMascotaId,
  createHistoriaClinica,
  updateHistoriaClinica,
  deleteHistoriaClinica,
} from '@/services/historia.service';

// Query keys
export const historiaClinicaKeys = {
  all: ['historia-clinica'] as const,
  detail: (id: string) => ['historia-clinica', id] as const,
  byMascota: (mascotaId: string) => ['historia-clinica', 'mascota', mascotaId] as const,
};

/**
 * Hook para obtener todas las historias clínicas
 */
export const useHistoriasClinicas = () => {
  return useQuery({
    queryKey: historiaClinicaKeys.all,
    queryFn: getHistoriasClinicas,
  });
};

/**
 * Hook para obtener una historia clínica por ID
 */
export const useHistoriaClinica = (id: string) => {
  return useQuery({
    queryKey: historiaClinicaKeys.detail(id),
    queryFn: () => getHistoriaClinicaById(id),
    enabled: !!id,
  });
};

/**
 * Hook para obtener historias clínicas de una mascota específica
 */
export const useHistoriasClinicasByMascota = (mascotaId: string) => {
  return useQuery({
    queryKey: historiaClinicaKeys.byMascota(mascotaId),
    queryFn: () => getHistoriasClinicasByMascotaId(mascotaId),
    enabled: !!mascotaId,
  });
};

/**
 * Hook para crear una nueva historia clínica
 */
export const useCreateHistoriaClinica = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (historiaData: HistoriaClinicaFormData) => createHistoriaClinica(historiaData),
    onSuccess: (newHistoria) => {
      // Invalidar cache de historias clínicas y de historias de la mascota
      queryClient.invalidateQueries({ queryKey: historiaClinicaKeys.all });
      queryClient.invalidateQueries({ queryKey: historiaClinicaKeys.byMascota(newHistoria.mascotaId) });

      toast.success('Consulta registrada exitosamente', {
        description: 'La historia clínica ha sido actualizada.',
      });
    },
    onError: (error: Error) => {
      toast.error('Error al registrar consulta', {
        description: error.message,
      });
    },
  });
};

/**
 * Hook para actualizar una historia clínica existente
 */
export const useUpdateHistoriaClinica = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: HistoriaClinicaFormData }) =>
      updateHistoriaClinica(id, data),
    onSuccess: (updatedHistoria) => {
      // Invalidar cache de historias clínicas, del detalle específico y de historias de la mascota
      queryClient.invalidateQueries({ queryKey: historiaClinicaKeys.all });
      queryClient.invalidateQueries({ queryKey: historiaClinicaKeys.detail(updatedHistoria.id) });
      queryClient.invalidateQueries({ queryKey: historiaClinicaKeys.byMascota(updatedHistoria.mascotaId) });

      toast.success('Consulta actualizada exitosamente', {
        description: 'Los cambios han sido guardados.',
      });
    },
    onError: (error: Error) => {
      toast.error('Error al actualizar consulta', {
        description: error.message,
      });
    },
  });
};

/**
 * Hook para eliminar una historia clínica
 */
export const useDeleteHistoriaClinica = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteHistoriaClinica(id),
    onSuccess: () => {
      // Invalidar cache de historias clínicas para refrescar todas las listas
      queryClient.invalidateQueries({ queryKey: historiaClinicaKeys.all });
      queryClient.invalidateQueries({ queryKey: ['historia-clinica', 'mascota'] });

      toast.success('Consulta eliminada exitosamente', {
        description: 'El registro ha sido eliminado de la historia clínica.',
      });
    },
    onError: (error: Error) => {
      toast.error('Error al eliminar consulta', {
        description: error.message,
      });
    },
  });
};
