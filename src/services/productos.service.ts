import { supabase } from '@/lib/supabase';
import type { Producto, ProductoFormData, CategoriaProducto } from '@/lib/types';

// Tipo para la tabla de Supabase (snake_case)
interface ProductoDB {
  id: string;
  nombre: string;
  categoria: CategoriaProducto;
  sku: string | null;
  precio_costo: number | null; // Puede ser null (opcional)
  precio_venta: number;
  cantidad_existente: number;
  cantidad_ideal: number;
  notas: string | null;
  created_at: string;
  updated_at: string;
}

// Convertir de DB (snake_case) a TS (camelCase)
const dbToProducto = (db: ProductoDB): Producto => ({
  id: db.id,
  nombre: db.nombre,
  categoria: db.categoria,
  sku: db.sku || undefined,
  precioCosto: db.precio_costo ?? undefined, // Convertir null a undefined
  precioVenta: db.precio_venta,
  cantidadExistente: db.cantidad_existente,
  cantidadIdeal: db.cantidad_ideal,
  notas: db.notas || undefined,
  fechaCreacion: new Date(db.created_at),
  fechaActualizacion: new Date(db.updated_at),
});

// Convertir de TS (camelCase) a DB (snake_case)
const productoToDb = (producto: ProductoFormData) => ({
  nombre: producto.nombre,
  categoria: producto.categoria,
  sku: producto.sku || null,
  precio_costo: producto.precioCosto ?? null, // Convertir undefined a null
  precio_venta: producto.precioVenta,
  cantidad_existente: producto.cantidadExistente,
  cantidad_ideal: producto.cantidadIdeal,
  notas: producto.notas || null,
});

/**
 * Obtener todos los productos
 */
export const getProductos = async (): Promise<Producto[]> => {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .order('nombre', { ascending: true });

  if (error) {
    throw new Error(`Error al obtener productos: ${error.message}`);
  }

  return (data as ProductoDB[]).map(dbToProducto);
};

/**
 * Obtener productos por categoría
 */
export const getProductosByCategoria = async (categoria: CategoriaProducto): Promise<Producto[]> => {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .eq('categoria', categoria)
    .order('nombre', { ascending: true });

  if (error) {
    throw new Error(`Error al obtener productos por categoría: ${error.message}`);
  }

  return (data as ProductoDB[]).map(dbToProducto);
};

/**
 * Obtener productos con stock bajo (existente < ideal)
 */
export const getProductosStockBajo = async (): Promise<Producto[]> => {
  const { data, error } = await supabase
    .from('productos_stock_bajo')
    .select('*')
    .order('faltante', { ascending: false });

  if (error) {
    throw new Error(`Error al obtener productos con stock bajo: ${error.message}`);
  }

  return (data as ProductoDB[]).map(dbToProducto);
};

/**
 * Obtener un producto por ID
 */
export const getProductoById = async (id: string): Promise<Producto> => {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(`Error al obtener producto: ${error.message}`);
  }

  if (!data) {
    throw new Error('Producto no encontrado');
  }

  return dbToProducto(data as ProductoDB);
};

/**
 * Crear un nuevo producto
 */
export const createProducto = async (productoData: ProductoFormData): Promise<Producto> => {
  const { data, error } = await supabase
    .from('productos')
    .insert(productoToDb(productoData))
    .select()
    .single();

  if (error) {
    throw new Error(`Error al crear producto: ${error.message}`);
  }

  return dbToProducto(data as ProductoDB);
};

/**
 * Actualizar un producto existente
 */
export const updateProducto = async (id: string, productoData: ProductoFormData): Promise<Producto> => {
  const { data, error } = await supabase
    .from('productos')
    .update(productoToDb(productoData))
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Error al actualizar producto: ${error.message}`);
  }

  return dbToProducto(data as ProductoDB);
};

/**
 * Eliminar un producto
 */
export const deleteProducto = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('productos')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Error al eliminar producto: ${error.message}`);
  }
};
