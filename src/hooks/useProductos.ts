import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { ProductoFormData, CategoriaProducto } from '@/lib/types';
import {
  getProductos,
  getProductoById,
  getProductosByCategoria,
  getProductosStockBajo,
  createProducto,
  updateProducto,
  deleteProducto,
} from '@/services/productos.service';

// Query keys
export const productosKeys = {
  all: ['productos'] as const,
  detail: (id: string) => ['productos', id] as const,
  byCategoria: (categoria: CategoriaProducto) => ['productos', 'categoria', categoria] as const,
  stockBajo: ['productos', 'stock-bajo'] as const,
};

/**
 * Hook para obtener todos los productos
 */
export const useProductos = () => {
  return useQuery({
    queryKey: productosKeys.all,
    queryFn: getProductos,
  });
};

/**
 * Hook para obtener un producto por ID
 */
export const useProducto = (id: string) => {
  return useQuery({
    queryKey: productosKeys.detail(id),
    queryFn: () => getProductoById(id),
    enabled: !!id,
  });
};

/**
 * Hook para obtener productos por categoría
 */
export const useProductosByCategoria = (categoria: CategoriaProducto) => {
  return useQuery({
    queryKey: productosKeys.byCategoria(categoria),
    queryFn: () => getProductosByCategoria(categoria),
  });
};

/**
 * Hook para obtener productos con stock bajo
 */
export const useProductosStockBajo = () => {
  return useQuery({
    queryKey: productosKeys.stockBajo,
    queryFn: getProductosStockBajo,
  });
};

/**
 * Hook para crear un nuevo producto
 */
export const useCreateProducto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productoData: ProductoFormData) => createProducto(productoData),
    onSuccess: (newProducto) => {
      // Invalidar cache de productos
      queryClient.invalidateQueries({ queryKey: productosKeys.all });
      queryClient.invalidateQueries({ queryKey: productosKeys.byCategoria(newProducto.categoria) });
      queryClient.invalidateQueries({ queryKey: productosKeys.stockBajo });

      toast.success('Producto creado exitosamente', {
        description: `${newProducto.nombre} ha sido agregado al inventario.`,
      });
    },
    onError: (error: Error) => {
      toast.error('Error al crear producto', {
        description: error.message,
      });
    },
  });
};

/**
 * Hook para actualizar un producto existente
 */
export const useUpdateProducto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProductoFormData }) =>
      updateProducto(id, data),
    onSuccess: (updatedProducto) => {
      // Invalidar cache de productos
      queryClient.invalidateQueries({ queryKey: productosKeys.all });
      queryClient.invalidateQueries({ queryKey: productosKeys.detail(updatedProducto.id) });
      queryClient.invalidateQueries({ queryKey: productosKeys.byCategoria(updatedProducto.categoria) });
      queryClient.invalidateQueries({ queryKey: productosKeys.stockBajo });

      toast.success('Producto actualizado exitosamente', {
        description: `${updatedProducto.nombre} ha sido actualizado.`,
      });
    },
    onError: (error: Error) => {
      toast.error('Error al actualizar producto', {
        description: error.message,
      });
    },
  });
};

/**
 * Hook para eliminar un producto
 */
export const useDeleteProducto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProducto(id),
    onSuccess: () => {
      // Invalidar cache de productos
      queryClient.invalidateQueries({ queryKey: productosKeys.all });
      queryClient.invalidateQueries({ queryKey: productosKeys.stockBajo });

      toast.success('Producto eliminado exitosamente', {
        description: 'El producto ha sido eliminado del inventario.',
      });
    },
    onError: (error: Error) => {
      toast.error('Error al eliminar producto', {
        description: error.message,
      });
    },
  });
};
