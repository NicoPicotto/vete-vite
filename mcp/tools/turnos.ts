import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getSupabase } from '../supabase.js';
import { esFechaValida, fechaAR, fechaLargaAR, horaAR, instanteAR, REGEX_HORA, sumarDias } from '../fechas.js';
import { ANOTACION_CARGA, ANOTACION_LECTURA, fallo, ok, seguro } from '../respuestas.js';

const ESTADOS = ['Pendiente', 'Confirmado', 'Cancelado', 'Completado', 'No se presentó'] as const;

// Mismos slots que TurnoFormDialog: cada 30 min de 08:00 a 21:00
const SLOTS: string[] = [];
for (let h = 8; h <= 21; h++) {
  SLOTS.push(`${String(h).padStart(2, '0')}:00`);
  if (h < 21) SLOTS.push(`${String(h).padStart(2, '0')}:30`);
}

interface TurnoDetalleDB {
  id: string;
  cliente_id: string;
  mascota_id: string | null;
  fecha_hora: string;
  tipo: string;
  notas: string | null;
  estado: string;
  cliente_nombre: string;
  cliente_apellido: string;
  cliente_telefono: string;
  mascota_nombre: string | null;
  mascota_especie: string | null;
}

const formatearTurno = (t: TurnoDetalleDB) => {
  const fechaHora = new Date(t.fecha_hora);
  return {
    turnoId: t.id,
    fecha: fechaAR(fechaHora),
    hora: horaAR(fechaHora),
    tipo: t.tipo,
    estado: t.estado,
    cliente: `${t.cliente_nombre} ${t.cliente_apellido}`,
    telefono: t.cliente_telefono,
    mascota: t.mascota_nombre ? `${t.mascota_nombre} (${t.mascota_especie})` : undefined,
    notas: t.notas ?? undefined,
    clienteId: t.cliente_id,
    mascotaId: t.mascota_id ?? undefined,
  };
};

export const registrarToolsTurnos = (server: McpServer) => {
  server.registerTool(
    'turnos',
    {
      title: 'Ver turnos',
      description:
        'Lista los turnos de la agenda entre dos fechas (inclusive), ordenados por hora, con cliente, mascota y estado. ' +
        'Para "hoy" o "mañana" calculá la fecha con fecha_actual.',
      inputSchema: {
        desde: z.string().describe('Fecha inicial YYYY-MM-DD'),
        hasta: z.string().optional().describe('Fecha final YYYY-MM-DD (si se omite, solo el día "desde")'),
        incluirCancelados: z.boolean().optional().describe('Incluir turnos cancelados o en los que no se presentó (por defecto false)'),
      },
      annotations: ANOTACION_LECTURA,
    },
    seguro(async ({ desde, hasta, incluirCancelados = false }) => {
      const fin = hasta ?? desde;
      if (!esFechaValida(desde) || !esFechaValida(fin)) return fallo('Fechas inválidas. Usá el formato YYYY-MM-DD.');
      if (fin < desde) return fallo('La fecha "hasta" no puede ser anterior a "desde".');

      let query = getSupabase()
        .from('turnos_con_detalle')
        .select('*')
        .gte('fecha_hora', instanteAR(desde))
        .lt('fecha_hora', instanteAR(sumarDias(fin, 1)))
        .order('fecha_hora', { ascending: true })
        .limit(300);
      if (!incluirCancelados) query = query.not('estado', 'in', '("Cancelado","No se presentó")');

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      const turnos = (data as TurnoDetalleDB[]).map(formatearTurno);

      if (turnos.length === 0) {
        return ok(desde === fin ? `No hay turnos el ${desde}.` : `No hay turnos entre ${desde} y ${fin}.`);
      }
      return ok({ cantidad: turnos.length, turnos });
    })
  );

  server.registerTool(
    'agendar_turno',
    {
      title: 'Agendar turno',
      description:
        'Agenda un turno nuevo en estado Pendiente. Horarios válidos: cada 30 minutos de 08:00 a 21:00. ' +
        'Si el horario ya está ocupado no lo agenda y avisa: preguntale al usuario si quiere superponerlo (confirmarSuperposicion=true) u otro horario.',
      inputSchema: {
        clienteId: z.string().uuid().describe('ID del cliente (obtenelo con buscar_cliente)'),
        mascotaId: z.string().uuid().optional().describe('ID de la mascota (opcional, debe ser del mismo cliente)'),
        fecha: z.string().describe('Fecha YYYY-MM-DD'),
        hora: z.string().describe('Hora HH:MM en hora Argentina, ej: "17:30"'),
        tipo: z.enum(['Consulta', 'Control']).describe('Tipo de turno'),
        notas: z.string().optional().describe('Notas opcionales'),
        confirmarSuperposicion: z.boolean().optional().describe('true solo si el usuario aceptó agendar en un horario ya ocupado'),
      },
      annotations: ANOTACION_CARGA,
    },
    seguro(async ({ clienteId, mascotaId, fecha, hora, tipo, notas, confirmarSuperposicion = false }) => {
      if (!esFechaValida(fecha)) return fallo('Fecha inválida. Usá el formato YYYY-MM-DD.');
      if (!REGEX_HORA.test(hora) || !SLOTS.includes(hora)) {
        return fallo(`Horario inválido "${hora}". Los turnos son cada 30 minutos de 08:00 a 21:00 (ej: 09:00, 09:30).`);
      }
      if (fecha < fechaAR()) return fallo('No se pueden agendar turnos en fechas pasadas.');

      const supabase = getSupabase();
      const { data: cliente, error: errorCliente } = await supabase
        .from('clientes')
        .select('nombre, apellido')
        .eq('id', clienteId)
        .maybeSingle();
      if (errorCliente) throw new Error(errorCliente.message);
      if (!cliente) return fallo('No existe un cliente con ese ID.');

      if (mascotaId) {
        const { data: mascota, error } = await supabase.from('mascotas').select('cliente_id').eq('id', mascotaId).maybeSingle();
        if (error) throw new Error(error.message);
        if (!mascota) return fallo('No existe una mascota con ese ID.');
        if (mascota.cliente_id !== clienteId) return fallo('La mascota no pertenece a ese cliente.');
      }

      const fechaHora = instanteAR(fecha, hora);

      // Igual que checkDisponibilidadSlot (src/services/turnos.service.ts)
      const { data: ocupados, error: errorSlot } = await supabase
        .from('turnos_con_detalle')
        .select('*')
        .eq('fecha_hora', fechaHora)
        .not('estado', 'in', '("Cancelado","No se presentó")');
      if (errorSlot) throw new Error(errorSlot.message);
      if (ocupados && ocupados.length > 0 && !confirmarSuperposicion) {
        return ok({
          resultado: 'NO AGENDADO: horario ocupado',
          turnosEnEseHorario: (ocupados as TurnoDetalleDB[]).map(formatearTurno),
          siguientePaso: 'Preguntá si quiere superponer el turno (confirmarSuperposicion=true) o elegir otro horario.',
        });
      }

      const { data: creado, error } = await supabase
        .from('turnos')
        .insert({
          cliente_id: clienteId,
          mascota_id: mascotaId ?? null,
          fecha_hora: fechaHora,
          tipo,
          notas: notas || null,
          estado: 'Pendiente',
        })
        .select('id')
        .single();
      if (error) throw new Error(error.message);

      const { data: detalle } = await supabase.from('turnos_con_detalle').select('*').eq('id', creado.id).single();
      return ok({
        resultado: 'Turno agendado',
        dia: fechaLargaAR(new Date(fechaHora)),
        turno: detalle ? formatearTurno(detalle as TurnoDetalleDB) : { turnoId: creado.id },
      });
    })
  );

  server.registerTool(
    'cambiar_estado_turno',
    {
      title: 'Cambiar estado de turno',
      description: 'Cambia el estado de un turno existente (confirmar, cancelar, completar o marcar que no se presentó).',
      inputSchema: {
        turnoId: z.string().uuid().describe('ID del turno (obtenelo con turnos)'),
        estado: z.enum(ESTADOS).describe('Nuevo estado'),
      },
      annotations: ANOTACION_CARGA,
    },
    seguro(async ({ turnoId, estado }) => {
      const supabase = getSupabase();
      const { data, error } = await supabase.from('turnos').update({ estado }).eq('id', turnoId).select('id');
      if (error) throw new Error(error.message);
      if (!data || data.length === 0) return fallo('No existe un turno con ese ID.');

      const { data: detalle } = await supabase.from('turnos_con_detalle').select('*').eq('id', turnoId).single();
      return ok({ resultado: `Turno marcado como ${estado}`, turno: detalle ? formatearTurno(detalle as TurnoDetalleDB) : undefined });
    })
  );
};
