import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registrarToolsGenerales } from './tools/general.js';
import { registrarToolsClientes } from './tools/clientes.js';
import { registrarToolsMascotas } from './tools/mascotas.js';
import { registrarToolsTurnos } from './tools/turnos.js';
import { registrarToolsPagos } from './tools/pagos.js';
import { registrarToolsRecordatorios } from './tools/recordatorios.js';
import { registrarToolsProductos } from './tools/productos.js';

const INSTRUCCIONES = `Asistente de VeteVite, el sistema de gestión de "Clínica para Mascotas" (veterinaria en Argentina).
Quien te habla es personal de la clínica (recepción o veterinarias). Respondé en español rioplatense, breve y claro.

Reglas:
- Fechas y horas siempre en hora de Argentina. Antes de interpretar "hoy", "mañana", "el jueves", etc., llamá a fecha_actual.
- Los IDs se obtienen con buscar_cliente o buscar_mascota. No inventes IDs y no se los muestres al usuario.
- Si una búsqueda devuelve varias coincidencias posibles (ej. dos "Luna"), preguntá cuál antes de cargar algo.
- Antes de cualquier carga (turno, pago, vacuna, desparasitación, recordatorio, cambio de estado) confirmá los datos clave con el usuario si hay alguna ambigüedad.
- Montos en pesos argentinos, enteros, sin decimales.
- No podés borrar ni editar registros, ni hacer ventas, ni cargar historia clínica, ni crear clientes o mascotas: si lo piden, indicá que se hace desde el sistema VeteVite.`;

export const crearServidor = (): McpServer => {
  const server = new McpServer({ name: 'vetevite', title: 'VeteVite', version: '1.0.0' }, { instructions: INSTRUCCIONES });

  registrarToolsGenerales(server);
  registrarToolsClientes(server);
  registrarToolsMascotas(server);
  registrarToolsTurnos(server);
  registrarToolsPagos(server);
  registrarToolsRecordatorios(server);
  registrarToolsProductos(server);

  return server;
};
