import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getSupabase } from '../supabase.js';
import { ANOTACION_LECTURA, limpiarBusqueda, ok, seguro } from '../respuestas.js';

export const registrarToolsProductos = (server: McpServer) => {
  server.registerTool(
    'stock_bajo',
    {
      title: 'Productos con stock bajo',
      description: 'Lista los productos cuyo stock actual está por debajo del stock ideal, con cuánto falta.',
      inputSchema: {},
      annotations: ANOTACION_LECTURA,
    },
    seguro(async () => {
      const { data, error } = await getSupabase()
        .from('productos_stock_bajo')
        .select('nombre, categoria, cantidad_existente, cantidad_ideal, faltante')
        .order('faltante', { ascending: false });
      if (error) throw new Error(error.message);
      if (!data || data.length === 0) return ok('Todos los productos están en su stock ideal o por encima.');

      return ok(
        data.map((p) => ({
          producto: p.nombre,
          categoria: p.categoria,
          stockActual: p.cantidad_existente,
          stockIdeal: p.cantidad_ideal,
          faltan: p.faltante,
        }))
      );
    })
  );

  server.registerTool(
    'buscar_producto',
    {
      title: 'Buscar producto',
      description:
        'Busca productos del inventario por nombre o SKU (los servicios, como las consultas, también son productos). ' +
        'Devuelve productoId, precio de venta, stock y notas (lote, vencimiento, etc.). Los marcados sinStock no se pueden vender.',
      inputSchema: {
        texto: z.string().min(2).describe('Nombre o SKU (puede ser parcial). Ej: "Bravecto", "alimento gato"'),
      },
      annotations: ANOTACION_LECTURA,
    },
    seguro(async ({ texto }) => {
      const terminos = limpiarBusqueda(texto).split(/\s+/).filter(Boolean);
      let query = getSupabase()
        .from('productos')
        .select('id, nombre, categoria, sku, precio_venta, cantidad_existente, cantidad_ideal, notas')
        .order('nombre', { ascending: true })
        .limit(20);
      for (const t of terminos) {
        query = query.or(`nombre.ilike.%${t}%,sku.ilike.%${t}%`);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      if (!data || data.length === 0) return ok(`No encontré productos que coincidan con "${texto}".`);

      return ok(
        data.map((p) => ({
          productoId: p.id,
          producto: p.nombre,
          categoria: p.categoria,
          sku: p.sku ?? undefined,
          precioVenta: p.precio_venta,
          stock: p.cantidad_existente,
          sinStock: Number(p.cantidad_existente) <= 0 ? true : undefined,
          stockIdeal: p.cantidad_ideal,
          notas: p.notas ?? undefined,
        }))
      );
    })
  );
};
