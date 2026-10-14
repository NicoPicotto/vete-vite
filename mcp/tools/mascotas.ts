import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getSupabase } from '../supabase.js';
import { esFechaValida, fechaAR, formatearFechaDB, horaAR } from '../fechas.js';
import { ANOTACION_CARGA, ANOTACION_LECTURA, fallo, limpiarBusqueda, ok, seguro } from '../respuestas.js';

const recortar = (texto: string | null, max = 600) =>
  texto && texto.length > max ? `${texto.slice(0, max)}…` : texto ?? undefined;

const fechaOpcional = z
  .string()
  .optional()
  .describe('Fecha YYYY-MM-DD. Si se omite, se usa hoy (hora Argentina)');

/** Devuelve la mascota con su dueño o null si no existe */
const obtenerMascota = async (mascotaId: string) => {
  const { data, error } = await getSupabase()
    .from('mascotas')
    .select('id, nombre, especie, raza, sexo, estado, fecha_nacimiento, otras_caracteristicas, cliente_id, clientes(nombre, apellido, telefono)')
    .eq('id', mascotaId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as
    | (Record<string, string | null> & {
        clientes: { nombre: string; apellido: string; telefono: string } | null;
      })
    | null;
};

/** Valida la fecha (o devuelve hoy) para cargas de vacunas/desparasitaciones */
const resolverFecha = (fecha?: string): string | null => {
  const valor = fecha ?? fechaAR();
  return esFechaValida(valor) ? valor : null;
};

export const registrarToolsMascotas = (server: McpServer) => {
  server.registerTool(
    'buscar_mascota',
    {
      title: 'Buscar mascota',
      description:
        'Busca mascotas por nombre (ej: "Luna"). Devuelve mascotaId, especie, raza y su dueño (clienteId). ' +
        'Si hay varias con el mismo nombre, preguntá de qué dueño se trata.',
      inputSchema: {
        nombre: z.string().min(2).describe('Nombre de la mascota (puede ser parcial)'),
      },
      annotations: ANOTACION_LECTURA,
    },
    seguro(async ({ nombre }) => {
      const termino = limpiarBusqueda(nombre);
      const { data, error } = await getSupabase()
        .from('mascotas')
        .select('id, nombre, especie, raza, sexo, estado, cliente_id, clientes(nombre, apellido, telefono)')
        .ilike('nombre', `%${termino}%`)
        .order('nombre', { ascending: true })
        .limit(15);
      if (error) throw new Error(error.message);
      if (!data || data.length === 0) return ok(`No encontré mascotas llamadas "${nombre}".`);

      return ok(
        data.map((m) => {
          const dueno = m.clientes as unknown as { nombre: string; apellido: string; telefono: string } | null;
          return {
            mascotaId: m.id,
            nombre: m.nombre,
            especie: m.especie,
            raza: m.raza,
            sexo: m.sexo,
            estado: m.estado,
            clienteId: m.cliente_id,
            dueno: dueno ? `${dueno.nombre} ${dueno.apellido}` : undefined,
            telefonoDueno: dueno?.telefono,
          };
        })
      );
    })
  );

  server.registerTool(
    'ficha_mascota',
    {
      title: 'Ficha de mascota',
      description:
        'Ficha completa de una mascota: datos, dueño, últimas consultas de historia clínica (motivo, notas, peso, temperatura), ' +
        'vacunas, desparasitaciones y recordatorios pendientes.',
      inputSchema: {
        mascotaId: z.string().uuid().describe('ID de la mascota (obtenelo con buscar_mascota o buscar_cliente)'),
        cantidadConsultas: z.number().int().min(1).max(30).optional().describe('Cuántas consultas recientes incluir (por defecto 5)'),
      },
      annotations: ANOTACION_LECTURA,
    },
    seguro(async ({ mascotaId, cantidadConsultas = 5 }) => {
      const supabase = getSupabase();
      const mascota = await obtenerMascota(mascotaId);
      if (!mascota) return fallo('No existe una mascota con ese ID.');

      const [historia, vacunas, desparasitaciones, recordatorios] = await Promise.all([
        supabase
          .from('historia_clinica')
          .select('fecha, motivo_consulta, notas, peso, temperatura, veterinario, archivo_adjunto')
          .eq('mascota_id', mascotaId)
          .order('fecha', { ascending: false })
          .limit(cantidadConsultas),
        supabase
          .from('vacunaciones')
          .select('fecha, tipo_vacuna, notas')
          .eq('mascota_id', mascotaId)
          .order('fecha', { ascending: false }),
        supabase
          .from('desparasitaciones')
          .select('fecha, tipo_desparasitacion, notas')
          .eq('mascota_id', mascotaId)
          .order('fecha', { ascending: false }),
        supabase
          .from('recordatorios')
          .select('titulo, descripcion, fecha_recordatorio')
          .eq('mascota_id', mascotaId)
          .eq('estado', 'Pendiente')
          .order('fecha_recordatorio', { ascending: true }),
      ]);
      for (const r of [historia, vacunas, desparasitaciones, recordatorios]) {
        if (r.error) throw new Error(r.error.message);
      }

      const dueno = mascota.clientes;
      return ok({
        mascota: {
          nombre: mascota.nombre,
          especie: mascota.especie,
          raza: mascota.raza,
          sexo: mascota.sexo,
          estado: mascota.estado,
          fechaNacimiento: mascota.fecha_nacimiento ? formatearFechaDB(mascota.fecha_nacimiento) : undefined,
          otrasCaracteristicas: mascota.otras_caracteristicas ?? undefined,
        },
        dueno: dueno ? { clienteId: mascota.cliente_id, nombre: `${dueno.nombre} ${dueno.apellido}`, telefono: dueno.telefono } : undefined,
        ultimasConsultas: (historia.data ?? []).map((h) => {
          const fecha = new Date(h.fecha);
          return {
            fecha: `${formatearFechaDB(h.fecha)} ${horaAR(fecha)}`,
            motivo: h.motivo_consulta,
            notas: recortar(h.notas),
            peso: h.peso ?? undefined,
            temperatura: h.temperatura ?? undefined,
            veterinario: h.veterinario ?? undefined,
            tieneArchivoAdjunto: h.archivo_adjunto ? true : undefined,
          };
        }),
        vacunas: (vacunas.data ?? []).map((v) => ({ fecha: formatearFechaDB(v.fecha), vacuna: v.tipo_vacuna, notas: v.notas ?? undefined })),
        desparasitaciones: (desparasitaciones.data ?? []).map((d) => ({
          fecha: formatearFechaDB(d.fecha),
          tipo: d.tipo_desparasitacion,
          notas: d.notas ?? undefined,
        })),
        recordatoriosPendientes: (recordatorios.data ?? []).map((r) => ({
          fecha: formatearFechaDB(r.fecha_recordatorio),
          titulo: r.titulo,
          descripcion: r.descripcion ?? undefined,
        })),
      });
    })
  );

  server.registerTool(
    'registrar_vacuna',
    {
      title: 'Registrar vacuna',
      description: 'Registra una vacuna aplicada a una mascota.',
      inputSchema: {
        mascotaId: z.string().uuid().describe('ID de la mascota'),
        tipoVacuna: z.string().min(1).describe('Nombre de la vacuna. Ej: "Antirrábica", "Séxtuple", "Triple felina"'),
        fecha: fechaOpcional,
        notas: z.string().optional().describe('Notas opcionales (lote, observaciones)'),
      },
      annotations: ANOTACION_CARGA,
    },
    seguro(async ({ mascotaId, tipoVacuna, fecha, notas }) => {
      const fechaFinal = resolverFecha(fecha);
      if (!fechaFinal) return fallo('Fecha inválida. Usá el formato YYYY-MM-DD.');
      const mascota = await obtenerMascota(mascotaId);
      if (!mascota) return fallo('No existe una mascota con ese ID.');

      const { error } = await getSupabase()
        .from('vacunaciones')
        .insert({ mascota_id: mascotaId, fecha: fechaFinal, tipo_vacuna: tipoVacuna, notas: notas || null });
      if (error) throw new Error(error.message);

      return ok({ resultado: 'Vacuna registrada', mascota: mascota.nombre, vacuna: tipoVacuna, fecha: formatearFechaDB(fechaFinal) });
    })
  );

  server.registerTool(
    'registrar_desparasitacion',
    {
      title: 'Registrar desparasitación',
      description: 'Registra una desparasitación aplicada a una mascota.',
      inputSchema: {
        mascotaId: z.string().uuid().describe('ID de la mascota'),
        tipoDesparasitacion: z.string().min(1).describe('Tipo o producto. Ej: "Pipeta", "Comprimido", "Bravecto"'),
        fecha: fechaOpcional,
        notas: z.string().optional().describe('Notas opcionales'),
      },
      annotations: ANOTACION_CARGA,
    },
    seguro(async ({ mascotaId, tipoDesparasitacion, fecha, notas }) => {
      const fechaFinal = resolverFecha(fecha);
      if (!fechaFinal) return fallo('Fecha inválida. Usá el formato YYYY-MM-DD.');
      const mascota = await obtenerMascota(mascotaId);
      if (!mascota) return fallo('No existe una mascota con ese ID.');

      const { error } = await getSupabase()
        .from('desparasitaciones')
        .insert({ mascota_id: mascotaId, fecha: fechaFinal, tipo_desparasitacion: tipoDesparasitacion, notas: notas || null });
      if (error) throw new Error(error.message);

      return ok({
        resultado: 'Desparasitación registrada',
        mascota: mascota.nombre,
        tipo: tipoDesparasitacion,
        fecha: formatearFechaDB(fechaFinal),
      });
    })
  );
};
