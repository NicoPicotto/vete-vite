import { supabase } from '@/lib/supabase';
import type { Cliente, ClienteFormData } from '@/lib/types';

// Tipo para la tabla de Supabase (snake_case)
interface ClienteDB {
  id: string;
  nombre: string;
  apellido: string;
  telefono: string;
  email: string | null;
  direccion: string | null;
  dni_cuit: string | null;
  fecha_registro: string;
  saldo_pendiente: number;
  created_at: string;
  updated_at: string;
}

// Convertir de DB (snake_case) a TS (camelCase)
const dbToCliente = (db: ClienteDB): Cliente => ({
  id: db.id,
  nombre: db.nombre,
  apellido: db.apellido,
  telefono: db.telefono,
  email: db.email || undefined,
  direccion: db.direccion || undefined,
  dniCuit: db.dni_cuit || undefined,
  fechaRegistro: new Date(db.fecha_registro),
  saldoPendiente: db.saldo_pendiente,
});

// Convertir de TS (camelCase) a DB (snake_case)
const clienteToDb = (cliente: ClienteFormData) => ({
  nombre: cliente.nombre,
  apellido: cliente.apellido,
  telefono: cliente.telefono,
  email: cliente.email || null,
  direccion: cliente.direccion || null,
  dni_cuit: cliente.dniCuit || null,
});

/**
 * Obtener todos los clientes
 */
export const getClientes = async (): Promise<Cliente[]> => {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .order('apellido', { ascending: true });

  if (error) {
    throw new Error(`Error al obtener clientes: ${error.message}`);
  }

  return (data as ClienteDB[]).map(dbToCliente);
};

/**
 * Obtener un cliente por ID
 */
export const getClienteById = async (id: string): Promise<Cliente> => {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(`Error al obtener cliente: ${error.message}`);
  }

  if (!data) {
    throw new Error('Cliente no encontrado');
  }

  return dbToCliente(data as ClienteDB);
};

/**
 * Crear un nuevo cliente
 */
export const createCliente = async (clienteData: ClienteFormData): Promise<Cliente> => {
  const { data, error } = await supabase
    .from('clientes')
    .insert(clienteToDb(clienteData))
    .select()
    .single();

  if (error) {
    throw new Error(`Error al crear cliente: ${error.message}`);
  }

  return dbToCliente(data as ClienteDB);
};

/**
 * Actualizar un cliente existente
 */
export const updateCliente = async (id: string, clienteData: ClienteFormData): Promise<Cliente> => {
  const { data, error } = await supabase
    .from('clientes')
    .update(clienteToDb(clienteData))
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Error al actualizar cliente: ${error.message}`);
  }

  return dbToCliente(data as ClienteDB);
};

/**
 * Eliminar un cliente
 */
export const deleteCliente = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('clientes')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Error al eliminar cliente: ${error.message}`);
  }
};
