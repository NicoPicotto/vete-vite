import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getSupabase } from '../supabase.js';
import { fechaAR, fechaLargaAR, horaAR, sumarDias } from '../fechas.js';
import { ANOTACION_LECTURA, limpiarBusqueda, ok, seguro } from '../respuestas.js';

export const registrarToolsGenerales = (server: McpServer) => {
  server.registerTool(
    'fecha_actual',
    {
      title: 'Fecha y hora actual',
      description:
        'Devuelve la fecha y hora actual en Argentina, y las fechas de mañana y pasado. ' +
        'Usalo SIEMPRE antes de interpretar fechas relativas ("hoy", "mañana", "el jueves", "en 3 meses").',
      inputSchema: {},
      annotations: ANOTACION_LECTURA,
    },
    seguro(async () => {
      const ahora = new Date();
      const hoy = fechaAR(ahora);
      return ok({
        hoy,
        diaDeHoy: fechaLargaAR(ahora),
        horaActual: horaAR(ahora),
        manana: sumarDias(hoy, 1),
        pasadoManana: sumarDias(hoy, 2),
        zonaHoraria: 'America/Argentina/Buenos_Aires (UTC-3)',
      });
    })
  );

  server.registerTool(
    'mensajes_rapidos',
    {
      title: 'Mensajes rápidos',
      description: 'Devuelve los mensajes predefinidos de la clínica (textos para WhatsApp). Se puede filtrar por texto.',
      inputSchema: {
        texto: z.string().optional().describe('Filtro opcional por título o contenido'),
      },
      annotations: ANOTACION_LECTURA,
    },
    seguro(async ({ texto }) => {
      let query = getSupabase().from('mensajes_rapidos').select('titulo, contenido').order('titulo', { ascending: true });
      const termino = texto ? limpiarBusqueda(texto) : '';
      if (termino) query = query.or(`titulo.ilike.%${termino}%,contenido.ilike.%${termino}%`);

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      if (!data || data.length === 0) return ok('No hay mensajes rápidos que coincidan.');
      return ok(data);
    })
  );
};
