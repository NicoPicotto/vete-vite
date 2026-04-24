import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { MensajeRapidoFormData } from '@/lib/types';
import {
  getMensajesRapidos,
  createMensajeRapido,
  updateMensajeRapido,
  deleteMensajeRapido,
} from '@/services/mensajesRapidos.service';

export const mensajesRapidosKeys = {
  all: ['mensajes_rapidos'] as const,
};

export const useMensajesRapidos = () => {
  return useQuery({
    queryKey: mensajesRapidosKeys.all,
    queryFn: getMensajesRapidos,
  });
};

export const useCreateMensajeRapido = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MensajeRapidoFormData) => createMensajeRapido(data),
    onSuccess: (nuevo) => {
      queryClient.invalidateQueries({ queryKey: mensajesRapidosKeys.all });
      toast.success('Mensaje creado', { description: nuevo.titulo });
    },
    onError: (error: Error) => {
      toast.error('Error al crear mensaje', { description: error.message });
    },
  });
};

export const useUpdateMensajeRapido = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MensajeRapidoFormData }) =>
      updateMensajeRapido(id, data),
    onSuccess: (actualizado) => {
      queryClient.invalidateQueries({ queryKey: mensajesRapidosKeys.all });
      toast.success('Mensaje actualizado', { description: actualizado.titulo });
    },
    onError: (error: Error) => {
      toast.error('Error al actualizar mensaje', { description: error.message });
    },
  });
};

export const useDeleteMensajeRapido = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteMensajeRapido(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mensajesRapidosKeys.all });
      toast.success('Mensaje eliminado');
    },
    onError: (error: Error) => {
      toast.error('Error al eliminar mensaje', { description: error.message });
    },
  });
};
