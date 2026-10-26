import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getSupabase } from '../supabase.js';
import { esFechaValida, fechaAR, formatearFechaDB, instanteAR, mediodiaUTC, sumarDias } from '../fechas.js';
import { ANOTACION_CARGA, ANOTACION_LECTURA, fallo, ok, seguro } from '../respuestas.js';

interface DatosRecordatorio {
  mascotaId: string;
  clienteId: string;
  titulo: string;
  fecha: string; // YYYY-MM-DD
  descripcion?: string;
  historiaClinicaId?: string;
}

/** Fila para insertar en recordatorios. Mismos campos que recordatorioToDb (src/services/recordatorios.service.ts) */
export const filaRecordatorio = ({ mascotaId, clienteId, titulo, fecha, descripcion, historiaClinicaId }: DatosRecordatorio) => ({
  historia_clinica_id: historiaClinicaId ?? null,
  mascota_id: mascotaId,
  cliente_id: clienteId,
  titulo,
  descripcion: descripcion || null,
  fecha_recordatorio: mediodiaUTC(fecha),
  es_recurrente: false,
  frecuencia_recurrencia: null,
  intervalo_personalizado: null,
  estado: 'Pendiente',
  creado_por: null,
  fecha_creacion: new Date().toISOString(),
  fecha_original: null,
  notas_reprogramacion: null,
});

export const registrarToolsRecordatorios = (server: McpServer) => {
  server.registerTool(
    'recordatorios_proximos',
    {
      title: 'Recordatorios próximos',
      description:
        'Lista los recordatorios pendientes de los próximos días (vacunas a renovar, controles, etc.) con mascota y dueño. ' +
        'Por defecto incluye también los atrasados.',
      inputSchema: {
        dias: z.number().int().min(0).max(365).optional().describe('Cantidad de días hacia adelante (por defecto 7)'),
        incluirAtrasados: z.boolean().optional().describe('Incluir recordatorios vencidos sin completar (por defecto true)'),
      },
      annotations: ANOTACION_LECTURA,
    },
    seguro(async ({ dias = 7, incluirAtrasados = true }) => {
      const hoy = fechaAR();
      let query = getSupabase()
        .from('recordatorios')
        .select('id, titulo, descripcion, fecha_recordatorio, mascotas(nombre, especie), clientes(id, nombre, apellido, telefono)')
        .eq('estado', 'Pendiente')
        .lt('fecha_recordatorio', instanteAR(sumarDias(hoy, dias + 1)))
        .order('fecha_recordatorio', { ascending: true })
        .limit(100);
      if (!incluirAtrasados) query = query.gte('fecha_recordatorio', instanteAR(hoy));

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      if (!data || data.length === 0) return ok(`No hay recordatorios pendientes para los próximos ${dias} días.`);

      const inicioHoy = new Date(instanteAR(hoy));
      return ok(
        data.map((r) => {
          const mascota = r.mascotas as unknown as { nombre: string; especie: string } | null;
          const cliente = r.clientes as unknown as { id: string; nombre: string; apellido: string; telefono: string } | null;
          return {
            fecha: formatearFechaDB(r.fecha_recordatorio),
            atrasado: new Date(r.fecha_recordatorio) < inicioHoy ? true : undefined,
            titulo: r.titulo,
            descripcion: r.descripcion ?? undefined,
            mascota: mascota ? `${mascota.nombre} (${mascota.especie})` : undefined,
            dueno: cliente ? `${cliente.nombre} ${cliente.apellido}` : undefined,
            telefono: cliente?.telefono,
            clienteId: cliente?.id,
          };
        })
      );
    })
  );

  server.registerTool(
    'crear_recordatorio',
    {
      title: 'Crear recordatorio',
      description: 'Crea un recordatorio para una mascota en una fecha (ej: "Refuerzo antirrábica" dentro de 1 año).',
      inputSchema: {
        mascotaId: z.string().uuid().describe('ID de la mascota'),
        titulo: z.string().min(1).describe('Título breve. Ej: "Refuerzo antirrábica"'),
        fecha: z.string().describe('Fecha del recordatorio, YYYY-MM-DD'),
        descripcion: z.string().optional().describe('Detalle opcional'),
      },
      annotations: ANOTACION_CARGA,
    },
    seguro(async ({ mascotaId, titulo, fecha, descripcion }) => {
      if (!esFechaValida(fecha)) return fallo('Fecha inválida. Usá el formato YYYY-MM-DD.');

      const supabase = getSupabase();
      const { data: mascota, error: errorMascota } = await supabase
        .from('mascotas')
        .select('nombre, cliente_id')
        .eq('id', mascotaId)
        .maybeSingle();
      if (errorMascota) throw new Error(errorMascota.message);
      if (!mascota) return fallo('No existe una mascota con ese ID.');

      const { error } = await supabase
        .from('recordatorios')
        .insert(filaRecordatorio({ mascotaId, clienteId: mascota.cliente_id, titulo, fecha, descripcion }));
      if (error) throw new Error(error.message);

      return ok({ resultado: 'Recordatorio creado', mascota: mascota.nombre, titulo, fecha: formatearFechaDB(fecha) });
    })
  );
};
