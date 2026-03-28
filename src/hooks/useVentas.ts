import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { VentaFormInput } from '@/lib/types';
import {
  getVentas,
  getVentaById,
  getVentasByCliente,
  createVenta,
  deleteVenta,
  getEstadisticasVentas,
} from '@/services/ventas.service';
import { clientesKeys } from './useClientes';
import { productosKeys } from './useProductos';

// Query keys
export const ventasKeys = {
  all: ['ventas'] as const,
  detail: (id: string) => ['ventas', id] as const,
  byCliente: (clienteId: string) => ['ventas', 'cliente', clienteId] as const,
  estadisticas: ['ventas', 'estadisticas'] as const,
};

/**
 * Hook para obtener todas las ventas
 */
export const useVentas = () => {
  return useQuery({
    queryKey: ventasKeys.all,
    queryFn: getVentas,
  });
};

/**
 * Hook para obtener una venta por ID
 */
export const useVenta = (id: string) => {
  return useQuery({
    queryKey: ventasKeys.detail(id),
    queryFn: () => getVentaById(id),
    enabled: !!id,
  });
};

/**
 * Hook para obtener ventas de un cliente específico
 */
export const useVentasByCliente = (clienteId: string) => {
  return useQuery({
    queryKey: ventasKeys.byCliente(clienteId),
    queryFn: () => getVentasByCliente(clienteId),
    enabled: !!clienteId,
  });
};

/**
 * Hook para obtener estadísticas de ventas
 */
export const useEstadisticasVentas = () => {
  return useQuery({
    queryKey: ventasKeys.estadisticas,
    queryFn: getEstadisticasVentas,
  });
};

/**
 * Hook para crear una nueva venta
 */
export const useCreateVenta = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ventaData: VentaFormInput) => createVenta(ventaData),
    onSuccess: (newVenta) => {
      // Invalidar cache de ventas
      queryClient.invalidateQueries({ queryKey: ventasKeys.all });
      queryClient.invalidateQueries({ queryKey: ventasKeys.estadisticas });

      // Invalidar cache de productos (stock actualizado)
      queryClient.invalidateQueries({ queryKey: productosKeys.all });
      queryClient.invalidateQueries({ queryKey: productosKeys.stockBajo });

      // Solo invalidar cache de cliente si hay cliente asociado (no para ventas al paso)
      if (newVenta.clienteId) {
        queryClient.invalidateQueries({ queryKey: ventasKeys.byCliente(newVenta.clienteId) });
        queryClient.invalidateQueries({ queryKey: clientesKeys.all });
        queryClient.invalidateQueries({ queryKey: clientesKeys.detail(newVenta.clienteId) });
        // Invalidar cache de items de pago (se creó un nuevo item)
        queryClient.invalidateQueries({ queryKey: ['items-pago'] });
      }

      const esVentaAlPaso = !newVenta.clienteId;
      toast.success('Venta registrada exitosamente', {
        description: esVentaAlPaso
          ? `Venta al paso por $${newVenta.total} creada.`
          : `Venta por $${newVenta.total} creada. Se generó automáticamente un item de pago.`,
      });
    },
    onError: (error: Error) => {
      toast.error('Error al registrar venta', {
        description: error.message,
      });
    },
  });
};

/**
 * Hook para eliminar una venta
 * IMPORTANTE: Al eliminar una venta, se restaura el stock automáticamente (trigger)
 * El ItemPago NO se elimina, solo se desvincula
 */
export const useDeleteVenta = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteVenta(id),
    onSuccess: () => {
      // Invalidar cache de ventas
      queryClient.invalidateQueries({ queryKey: ventasKeys.all });
      queryClient.invalidateQueries({ queryKey: ventasKeys.estadisticas });

      // Invalidar cache de productos (stock restaurado)
      queryClient.invalidateQueries({ queryKey: productosKeys.all });
      queryClient.invalidateQueries({ queryKey: productosKeys.stockBajo });

      // Invalidar cache de clientes
      queryClient.invalidateQueries({ queryKey: clientesKeys.all });

      toast.success('Venta eliminada exitosamente', {
        description: 'La venta ha sido eliminada y el stock ha sido restaurado.',
      });
    },
    onError: (error: Error) => {
      toast.error('Error al eliminar venta', {
        description: error.message,
      });
    },
  });
};
