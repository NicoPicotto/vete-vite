import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getSupabase } from '../supabase.js';
import { ANOTACION_LECTURA, fallo, limpiarBusqueda, ok, seguro } from '../respuestas.js';

interface ClienteDB {
  id: string;
  nombre: string;
  apellido: string;
  telefono: string;
  email: string | null;
  direccion: string | null;
  saldo_pendiente: number;
}

interface MascotaDB {
  id: string;
  cliente_id: string;
  nombre: string;
  especie: string;
  raza: string;
  sexo: string;
  estado: string;
}

export const registrarToolsClientes = (server: McpServer) => {
  server.registerTool(
    'buscar_cliente',
    {
      title: 'Buscar cliente',
      description:
        'Busca clientes (dueños) por nombre, apellido o teléfono. Devuelve sus datos, saldo pendiente y mascotas con sus IDs. ' +
        'Usalo para obtener el clienteId o mascotaId antes de otras acciones. Para buscar por nombre de mascota usá buscar_mascota.',
      inputSchema: {
        texto: z.string().min(2).describe('Nombre, apellido o teléfono (puede ser parcial). Ej: "Gómez", "Ana Pérez", "351555"'),
      },
      annotations: ANOTACION_LECTURA,
    },
    seguro(async ({ texto }) => {
      const supabase = getSupabase();
      const terminos = limpiarBusqueda(texto).split(/\s+/).filter(Boolean);
      if (terminos.length === 0) return fallo('Ingresá un texto de búsqueda válido.');

      let query = supabase
        .from('clientes')
        .select('id, nombre, apellido, telefono, email, direccion, saldo_pendiente')
        .order('apellido', { ascending: true })
        .limit(10);

      // Cada término tiene que aparecer en nombre, apellido o teléfono
      for (const t of terminos) {
        query = query.or(`nombre.ilike.%${t}%,apellido.ilike.%${t}%,telefono.ilike.%${t}%`);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      const clientes = data as ClienteDB[];
      if (clientes.length === 0) return ok(`No encontré clientes que coincidan con "${texto}".`);

      const { data: mascotasData, error: errorMascotas } = await supabase
        .from('mascotas')
        .select('id, cliente_id, nombre, especie, raza, sexo, estado')
        .in('cliente_id', clientes.map((c) => c.id))
        .order('nombre', { ascending: true });
      if (errorMascotas) throw new Error(errorMascotas.message);
      const mascotas = mascotasData as MascotaDB[];

      return ok(
        clientes.map((c) => ({
          clienteId: c.id,
          nombre: `${c.nombre} ${c.apellido}`,
          telefono: c.telefono,
          email: c.email ?? undefined,
          direccion: c.direccion ?? undefined,
          saldoPendiente: c.saldo_pendiente,
          mascotas: mascotas
            .filter((m) => m.cliente_id === c.id)
            .map((m) => ({
              mascotaId: m.id,
              nombre: m.nombre,
              especie: m.especie,
              raza: m.raza,
              sexo: m.sexo,
              estado: m.estado,
            })),
        }))
      );
    })
  );

  server.registerTool(
    'clientes_con_saldo',
    {
      title: 'Clientes con deuda',
      description: 'Lista los clientes que tienen saldo pendiente (deuda), de mayor a menor. Montos en pesos argentinos.',
      inputSchema: {},
      annotations: ANOTACION_LECTURA,
    },
    seguro(async () => {
      const { data, error } = await getSupabase()
        .from('clientes_con_saldo')
        .select('id, nombre, apellido, telefono, saldo_pendiente, total_items_pendientes')
        .order('saldo_pendiente', { ascending: false });
      if (error) throw new Error(error.message);
      if (!data || data.length === 0) return ok('No hay clientes con saldo pendiente.');

      const total = data.reduce((acc, c) => acc + Number(c.saldo_pendiente), 0);
      return ok({
        totalAdeudado: total,
        clientes: data.map((c) => ({
          clienteId: c.id,
          nombre: `${c.nombre} ${c.apellido}`,
          telefono: c.telefono,
          saldoPendiente: c.saldo_pendiente,
          itemsPendientes: c.total_items_pendientes,
        })),
      });
    })
  );
};
