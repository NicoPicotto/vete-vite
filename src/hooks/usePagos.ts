import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getItemsPago,
  getItemPagoById,
  getItemsPagoByClienteId,
  createItemPago,
  updateItemPago,
  deleteItemPago,
  createPagoParcial,
  deletePagoParcial,
} from '@/services/pagos.service';
import type { ItemPagoFormValues } from '@/lib/schemas';
import { toast } from 'sonner';


/**
 * Hook para obtener todos los items de pago
 */
export const useItemsPago = () => {
  return useQuery({
    queryKey: ['items-pago'],
    queryFn: getItemsPago,
  });
};

/**
 * Hook para obtener un item de pago por ID
 */
export const useItemPago = (id: string) => {
  return useQuery({
    queryKey: ['item-pago', id],
    queryFn: () => getItemPagoById(id),
    enabled: !!id,
  });
};

/**
 * Hook para obtener items de pago de un cliente específico
 */
export const useItemsPagoByCliente = (clienteId: string) => {
  return useQuery({
    queryKey: ['items-pago', 'cliente', clienteId],
    queryFn: () => getItemsPagoByClienteId(clienteId),
    enabled: !!clienteId,
  });
};

/**
 * Hook para crear un nuevo item de pago
 */
export const useCreateItemPago = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ItemPagoFormValues) => createItemPago(data),
    onSuccess: (newItem) => {
      queryClient.invalidateQueries({ queryKey: ['items-pago'] });
      queryClient.invalidateQueries({ queryKey: ['items-pago', 'cliente', newItem.clienteId] });
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      queryClient.invalidateQueries({ queryKey: ['cliente', newItem.clienteId] });
      toast.success('Item de pago creado exitosamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al crear item de pago: ${error.message}`);
    },
  });
};

/**
 * Hook para actualizar un item de pago
 */
export const useUpdateItemPago = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ItemPagoFormValues> }) =>
      updateItemPago(id, data),
    onSuccess: (updatedItem) => {
      queryClient.invalidateQueries({ queryKey: ['items-pago'] });
      queryClient.invalidateQueries({ queryKey: ['item-pago', updatedItem.id] });
      queryClient.invalidateQueries({ queryKey: ['items-pago', 'cliente', updatedItem.clienteId] });
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      queryClient.invalidateQueries({ queryKey: ['cliente', updatedItem.clienteId] });
      toast.success('Item de pago actualizado exitosamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al actualizar item de pago: ${error.message}`);
    },
  });
};

/**
 * Hook para eliminar un item de pago
 */
export const useDeleteItemPago = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteItemPago(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items-pago'] });
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast.success('Item de pago eliminado exitosamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al eliminar item de pago: ${error.message}`);
    },
  });
};

/**
 * Hook para crear un pago parcial
 */
export const useCreatePagoParcial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemPagoId, monto }: { itemPagoId: string; monto: number; notas?: string }) =>
      createPagoParcial(itemPagoId, monto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['items-pago'] });
      queryClient.invalidateQueries({ queryKey: ['item-pago', variables.itemPagoId] });
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast.success('Pago parcial registrado exitosamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al registrar pago parcial: ${error.message}`);
    },
  });
};

/**
 * Hook para eliminar un pago parcial (no implementado en MVP)
 */
export const useDeletePagoParcial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deletePagoParcial(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items-pago'] });
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast.success('Pago parcial eliminado exitosamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al eliminar pago parcial: ${error.message}`);
    },
  });
};
