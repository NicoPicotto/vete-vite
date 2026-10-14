import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { generarTextoEstadoCuenta } from '../../src/lib/estadoCuenta.js';
import { getSupabase } from '../supabase.js';
import { formatearFechaDB } from '../fechas.js';
import { ANOTACION_CARGA, ANOTACION_LECTURA, fallo, ok, seguro } from '../respuestas.js';

interface ItemPagoDB {
  id: string;
  descripcion: string;
  monto: number;
  monto_pagado: number;
  fecha: string;
  estado: 'Pendiente' | 'Pagado Parcial' | 'Pagado';
}

export const registrarToolsPagos = (server: McpServer) => {
  server.registerTool(
    'estado_de_cuenta',
    {
      title: 'Estado de cuenta',
      description:
        'Muestra lo que debe un cliente: cada ítem pendiente con su itemPagoId y el texto del estado de cuenta listo para copiar a WhatsApp. ' +
        'Necesario antes de registrar_pago para saber qué ítem se paga.',
      inputSchema: {
        clienteId: z.string().uuid().describe('ID del cliente (obtenelo con buscar_cliente)'),
      },
      annotations: ANOTACION_LECTURA,
    },
    seguro(async ({ clienteId }) => {
      const supabase = getSupabase();
      const { data: cliente, error } = await supabase
        .from('clientes')
        .select('nombre, apellido, saldo_pendiente')
        .eq('id', clienteId)
        .maybeSingle();
      if (error) throw new Error(error.message);
      if (!cliente) return fallo('No existe un cliente con ese ID.');

      const { data, error: errorItems } = await supabase
        .from('items_pago')
        .select('id, descripcion, monto, monto_pagado, fecha, estado')
        .eq('cliente_id', clienteId)
        .neq('estado', 'Pagado')
        .order('fecha', { ascending: true });
      if (errorItems) throw new Error(errorItems.message);
      const items = data as ItemPagoDB[];

      if (items.length === 0) return ok(`${cliente.nombre} ${cliente.apellido} no tiene deuda pendiente.`);

      const textoWhatsApp = generarTextoEstadoCuenta(
        { nombre: cliente.nombre, apellido: cliente.apellido, saldoPendiente: cliente.saldo_pendiente },
        items.map((i) => ({
          descripcion: i.descripcion,
          fecha: new Date(i.fecha),
          monto: i.monto,
          montoPagado: i.monto_pagado,
        }))
      );

      return ok({
        cliente: `${cliente.nombre} ${cliente.apellido}`,
        saldoPendiente: cliente.saldo_pendiente,
        itemsPendientes: items.map((i) => ({
          itemPagoId: i.id,
          descripcion: i.descripcion,
          fecha: formatearFechaDB(i.fecha),
          monto: i.monto,
          pagado: i.monto_pagado,
          pendiente: i.monto - i.monto_pagado,
          estado: i.estado,
        })),
        textoWhatsApp,
      });
    })
  );

  server.registerTool(
    'registrar_pago',
    {
      title: 'Registrar pago',
      description:
        'Registra un pago (total o parcial) sobre un ítem de deuda de un cliente. El saldo del cliente se recalcula solo. ' +
        'Si el cliente tiene varios ítems pendientes y no está claro cuál paga, preguntá antes. ' +
        'Si el pago cubre varios ítems, registralo en varias llamadas (uno por ítem).',
      inputSchema: {
        itemPagoId: z.string().uuid().describe('ID del ítem pendiente (obtenelo con estado_de_cuenta)'),
        monto: z.number().int().positive().describe('Monto pagado en pesos, entero sin decimales'),
      },
      annotations: ANOTACION_CARGA,
    },
    seguro(async ({ itemPagoId, monto }) => {
      const supabase = getSupabase();
      const { data: item, error } = await supabase
        .from('items_pago')
        .select('id, cliente_id, descripcion, monto, monto_pagado')
        .eq('id', itemPagoId)
        .maybeSingle();
      if (error) throw new Error(error.message);
      if (!item) return fallo('No existe un ítem de pago con ese ID.');

      const pendiente = item.monto - (item.monto_pagado || 0);
      if (pendiente <= 0) return fallo(`El ítem "${item.descripcion}" ya está pagado.`);
      if (monto > pendiente) {
        return fallo(
          `El monto ($${monto}) supera lo pendiente de "${item.descripcion}" ($${pendiente}). ` +
            'Registrá como máximo lo pendiente y el resto en otro ítem.'
        );
      }

      // Misma lógica que createPagoParcial (src/services/pagos.service.ts)
      const nuevoMontoPagado = (item.monto_pagado || 0) + monto;
      const nuevoEstado = nuevoMontoPagado >= item.monto ? 'Pagado' : 'Pagado Parcial';

      const { error: errorUpdate } = await supabase
        .from('items_pago')
        .update({ monto_pagado: nuevoMontoPagado, estado: nuevoEstado })
        .eq('id', itemPagoId);
      if (errorUpdate) throw new Error(errorUpdate.message);

      const { data: cliente } = await supabase
        .from('clientes')
        .select('nombre, apellido, saldo_pendiente')
        .eq('id', item.cliente_id)
        .maybeSingle();

      return ok({
        resultado: 'Pago registrado',
        item: item.descripcion,
        montoRegistrado: monto,
        estadoItem: nuevoEstado,
        pendienteDelItem: item.monto - nuevoMontoPagado,
        cliente: cliente ? `${cliente.nombre} ${cliente.apellido}` : undefined,
        saldoPendienteCliente: cliente?.saldo_pendiente,
      });
    })
  );
};
