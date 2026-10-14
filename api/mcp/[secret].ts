import { timingSafeEqual } from 'node:crypto';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { crearServidor } from '../../mcp/server.js';

// Endpoint del servidor MCP: https://<dominio>/api/mcp/<MCP_SECRET>
// El secreto en la URL funciona como llave de acceso (Claude se conecta sin OAuth).

const secretoValido = (recibido: string | undefined): boolean => {
  const esperado = process.env.MCP_SECRET;
  if (!esperado || !recibido) return false;
  const a = Buffer.from(recibido);
  const b = Buffer.from(esperado);
  return a.length === b.length && timingSafeEqual(a, b);
};

const handler = async (request: Request): Promise<Response> => {
  const recibido = new URL(request.url).pathname.split('/').filter(Boolean).pop();
  if (!secretoValido(recibido)) {
    return new Response('Not found', { status: 404 });
  }

  // Modo stateless: un servidor y un transporte nuevos por request (encaja con funciones serverless)
  const server = crearServidor();
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });
  await server.connect(transport);
  return transport.handleRequest(request);
};

export const GET = handler;
export const POST = handler;
export const DELETE = handler;
