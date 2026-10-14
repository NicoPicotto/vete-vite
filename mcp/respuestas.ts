import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

export const ok = (data: unknown): CallToolResult => ({
  content: [{ type: 'text', text: typeof data === 'string' ? data : JSON.stringify(data, null, 1) }],
});

export const fallo = (mensaje: string): CallToolResult => ({
  content: [{ type: 'text', text: mensaje }],
  isError: true,
});

/** Envuelve el handler de un tool para devolver errores de Supabase como mensaje legible */
export const seguro =
  <A>(fn: (args: A) => Promise<CallToolResult>) =>
  async (args: A): Promise<CallToolResult> => {
    try {
      return await fn(args);
    } catch (error) {
      return fallo(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

/** Limpia texto de búsqueda para usarlo dentro de filtros .or() de PostgREST */
export const limpiarBusqueda = (texto: string): string =>
  texto.replace(/[,()*%\\]/g, ' ').trim();

export const ANOTACION_LECTURA = { readOnlyHint: true, openWorldHint: false } as const;
export const ANOTACION_CARGA = {
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: false,
  openWorldHint: false,
} as const;
