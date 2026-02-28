import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { MascotaFormData } from '@/lib/types';
import {
  getMascotas,
  getMascotaById,
  getMascotasByClienteId,
  createMascota,
  updateMascota,
  deleteMascota,
} from '@/services/mascotas.service';

// Query keys
export const mascotasKeys = {
  all: ['mascotas'] as const,
  detail: (id: string) => ['mascotas', id] as const,
  byCliente: (clienteId: string) => ['mascotas', 'cliente', clienteId] as const,
};

/**
 * Hook para obtener todas las mascotas
 */
export const useMascotas = () => {
  return useQuery({
    queryKey: mascotasKeys.all,
    queryFn: getMascotas,
  });
};

/**
 * Hook para obtener una mascota por ID
 */
export const useMascota = (id: string) => {
  return useQuery({
    queryKey: mascotasKeys.detail(id),
    queryFn: () => getMascotaById(id),
    enabled: !!id,
  });
};

/**
 * Hook para obtener mascotas de un cliente específico
 */
export const useMascotasByCliente = (clienteId: string) => {
  return useQuery({
    queryKey: mascotasKeys.byCliente(clienteId),
    queryFn: () => getMascotasByClienteId(clienteId),
    enabled: !!clienteId,
  });
};

/**
 * Hook para crear una nueva mascota
 */
export const useCreateMascota = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (mascotaData: MascotaFormData) => createMascota(mascotaData),
    onSuccess: (newMascota) => {
      // Invalidar cache de mascotas y de mascotas del cliente
      queryClient.invalidateQueries({ queryKey: mascotasKeys.all });
      queryClient.invalidateQueries({ queryKey: mascotasKeys.byCliente(newMascota.clienteId) });

      toast.success('Mascota creada exitosamente', {
        description: `${newMascota.nombre} ha sido agregado/a.`,
      });
    },
    onError: (error: Error) => {
      toast.error('Error al crear mascota', {
        description: error.message,
      });
    },
  });
};

/**
 * Hook para actualizar una mascota existente
 */
export const useUpdateMascota = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MascotaFormData }) =>
      updateMascota(id, data),
    onSuccess: (updatedMascota) => {
      // Invalidar cache de mascotas, del detalle específico y de mascotas del cliente
      queryClient.invalidateQueries({ queryKey: mascotasKeys.all });
      queryClient.invalidateQueries({ queryKey: mascotasKeys.detail(updatedMascota.id) });
      queryClient.invalidateQueries({ queryKey: mascotasKeys.byCliente(updatedMascota.clienteId) });

      toast.success('Mascota actualizada exitosamente', {
        description: `Los datos de ${updatedMascota.nombre} han sido actualizados.`,
      });
    },
    onError: (error: Error) => {
      toast.error('Error al actualizar mascota', {
        description: error.message,
      });
    },
  });
};

/**
 * Hook para eliminar una mascota
 */
export const useDeleteMascota = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteMascota(id),
    onSuccess: () => {
      // Invalidar cache de mascotas para refrescar todas las listas
      queryClient.invalidateQueries({ queryKey: mascotasKeys.all });
      queryClient.invalidateQueries({ queryKey: ['mascotas', 'cliente'] });

      toast.success('Mascota eliminada exitosamente', {
        description: 'La mascota y su historia clínica han sido eliminadas.',
      });
    },
    onError: (error: Error) => {
      toast.error('Error al eliminar mascota', {
        description: error.message,
      });
    },
  });
};
