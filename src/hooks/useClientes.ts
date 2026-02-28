import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { ClienteFormData } from '@/lib/types';
import {
  getClientes,
  getClienteById,
  createCliente,
  updateCliente,
  deleteCliente,
} from '@/services/clientes.service';

// Query keys
export const clientesKeys = {
  all: ['clientes'] as const,
  detail: (id: string) => ['clientes', id] as const,
};

/**
 * Hook para obtener todos los clientes
 */
export const useClientes = () => {
  return useQuery({
    queryKey: clientesKeys.all,
    queryFn: getClientes,
  });
};

/**
 * Hook para obtener un cliente por ID
 */
export const useCliente = (id: string) => {
  return useQuery({
    queryKey: clientesKeys.detail(id),
    queryFn: () => getClienteById(id),
    enabled: !!id, // Solo ejecutar si hay un ID
  });
};

/**
 * Hook para crear un nuevo cliente
 */
export const useCreateCliente = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (clienteData: ClienteFormData) => createCliente(clienteData),
    onSuccess: (newCliente) => {
      // Invalidar cache de clientes para refrescar la lista
      queryClient.invalidateQueries({ queryKey: clientesKeys.all });

      toast.success('Cliente creado exitosamente', {
        description: `${newCliente.nombre} ${newCliente.apellido} ha sido agregado.`,
      });
    },
    onError: (error: Error) => {
      toast.error('Error al crear cliente', {
        description: error.message,
      });
    },
  });
};

/**
 * Hook para actualizar un cliente existente
 */
export const useUpdateCliente = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ClienteFormData }) =>
      updateCliente(id, data),
    onSuccess: (updatedCliente) => {
      // Invalidar cache de clientes y del detalle específico
      queryClient.invalidateQueries({ queryKey: clientesKeys.all });
      queryClient.invalidateQueries({ queryKey: clientesKeys.detail(updatedCliente.id) });

      toast.success('Cliente actualizado exitosamente', {
        description: `Los datos de ${updatedCliente.nombre} ${updatedCliente.apellido} han sido actualizados.`,
      });
    },
    onError: (error: Error) => {
      toast.error('Error al actualizar cliente', {
        description: error.message,
      });
    },
  });
};

/**
 * Hook para eliminar un cliente
 */
export const useDeleteCliente = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCliente(id),
    onSuccess: () => {
      // Invalidar cache de clientes para refrescar la lista
      queryClient.invalidateQueries({ queryKey: clientesKeys.all });

      toast.success('Cliente eliminado exitosamente', {
        description: 'El cliente y sus datos asociados han sido eliminados.',
      });
    },
    onError: (error: Error) => {
      toast.error('Error al eliminar cliente', {
        description: error.message,
      });
    },
  });
};
