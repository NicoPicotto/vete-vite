// ============================================
// ZOD SCHEMAS PARA VALIDACIÓN DE FORMULARIOS
// ============================================

import { z } from 'zod';

// ============================================
// CLIENTE SCHEMA
// ============================================

export const clienteSchema = z.object({
  nombre: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres'),
  apellido: z
    .string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(50, 'El apellido no puede exceder 50 caracteres'),
  telefono: z
    .string()
    .min(8, 'El teléfono debe tener al menos 8 caracteres')
    .max(20, 'El teléfono no puede exceder 20 caracteres'),
  email: z
    .string()
    .email('Email inválido')
    .optional()
    .or(z.literal('')),
  direccion: z
    .string()
    .max(200, 'La dirección no puede exceder 200 caracteres')
    .optional()
    .or(z.literal('')),
  dniCuit: z
    .string()
    .max(15, 'El DNI/CUIT no puede exceder 15 caracteres')
    .optional()
    .or(z.literal('')),
});

export type ClienteFormValues = z.infer<typeof clienteSchema>;

// ============================================
// MASCOTA SCHEMA
// ============================================

export const mascotaSchema = z.object({
  nombre: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres'),
  especie: z.enum(['Perro', 'Gato', 'Exótico', 'Ave', 'Roedor', 'Reptil', 'Otro']),
  raza: z
    .string()
    .min(2, 'La raza debe tener al menos 2 caracteres')
    .max(50, 'La raza no puede exceder 50 caracteres'),
  fechaNacimiento: z.date().optional(),
  edad: z
    .string()
    .max(20, 'La edad no puede exceder 20 caracteres')
    .optional()
    .or(z.literal('')),
  sexo: z.enum(['Macho', 'Hembra']),
  estado: z.enum(['Activo', 'Fallecido']),
  otrasCaracteristicas: z
    .string()
    .max(500, 'Las características no pueden exceder 500 caracteres')
    .optional()
    .or(z.literal('')),
});

export type MascotaFormValues = z.infer<typeof mascotaSchema>;

// ============================================
// HISTORIA CLINICA SCHEMA
// ============================================

export const historiaClinicaSchema = z.object({
  fecha: z.date(),
  motivoConsulta: z
    .string()
    .min(3, 'El motivo debe tener al menos 3 caracteres')
    .max(500, 'El motivo no puede exceder 500 caracteres'),
  diagnostico: z
    .string()
    .min(3, 'El diagnóstico debe tener al menos 3 caracteres')
    .max(1000, 'El diagnóstico no puede exceder 1000 caracteres'),
  tratamiento: z
    .string()
    .min(3, 'El tratamiento debe tener al menos 3 caracteres')
    .max(1000, 'El tratamiento no puede exceder 1000 caracteres'),
  peso: z
    .number()
    .positive('El peso debe ser positivo')
    .max(1000, 'El peso parece excesivo')
    .optional(),
  temperatura: z
    .number()
    .min(30, 'La temperatura parece muy baja')
    .max(45, 'La temperatura parece muy alta')
    .optional(),
  vacunasAplicadas: z.array(z.string()).optional(),
  notas: z
    .string()
    .max(2000, 'Las notas no pueden exceder 2000 caracteres')
    .optional()
    .or(z.literal('')),
  veterinario: z
    .string()
    .max(100, 'El nombre del veterinario no puede exceder 100 caracteres')
    .optional()
    .or(z.literal('')),
});

export type HistoriaClinicaFormValues = z.infer<typeof historiaClinicaSchema>;

// ============================================
// ITEM PAGO SCHEMA
// ============================================

export const itemPagoSchema = z.object({
  clienteId: z.string().min(1, 'Debes seleccionar un cliente'),
  descripcion: z
    .string()
    .min(3, 'La descripción debe tener al menos 3 caracteres')
    .max(500, 'La descripción no puede exceder 500 caracteres'),
  monto: z
    .number()
    .positive('El monto debe ser positivo')
    .max(999999999, 'El monto es excesivo'),
  fecha: z.date(),
  entregaInicial: z
    .number()
    .min(0, 'La entrega no puede ser negativa')
    .max(999999999, 'El monto es excesivo')
    .optional(),
});

export type ItemPagoFormValues = z.infer<typeof itemPagoSchema>;

// ============================================
// PAGO PARCIAL SCHEMA
// ============================================

export const pagoParcialSchema = z.object({
  monto: z
    .number()
    .positive('El monto debe ser positivo')
    .max(999999999, 'El monto es excesivo'),
  fecha: z.date(),
  notas: z
    .string()
    .max(500, 'Las notas no pueden exceder 500 caracteres')
    .optional()
    .or(z.literal('')),
});

export type PagoParcialFormValues = z.infer<typeof pagoParcialSchema>;

// ============================================
// RECORDATORIO SCHEMA
// ============================================

export const recordatorioSchema = z.object({
  mascotaId: z.string().min(1, 'Debes seleccionar una mascota'),
  titulo: z
    .string()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(200, 'El título no puede exceder 200 caracteres'),
  descripcion: z
    .string()
    .max(1000, 'La descripción no puede exceder 1000 caracteres')
    .optional()
    .or(z.literal('')),
  fechaRecordatorio: z.date(),
});

export type RecordatorioFormValues = z.infer<typeof recordatorioSchema>;

// Schema para reprogramación
export const reprogramarRecordatorioSchema = z.object({
  fechaRecordatorio: z.date(),
  notasReprogramacion: z
    .string()
    .max(500, 'Las notas no pueden exceder 500 caracteres')
    .optional()
    .or(z.literal('')),
});

export type ReprogramarRecordatorioFormValues = z.infer<typeof reprogramarRecordatorioSchema>;

// ============================================
// PRODUCTO SCHEMA
// ============================================

export const productoSchema = z.object({
  nombre: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(200, 'El nombre no puede exceder 200 caracteres'),
  categoria: z.enum(['PetShop', 'Farmacia', 'Medicina']),
  sku: z
    .string()
    .max(50, 'El SKU no puede exceder 50 caracteres')
    .optional()
    .or(z.literal('')),
  precioCosto: z
    .number()
    .min(0, 'El precio de costo no puede ser negativo')
    .max(999999999, 'El precio es excesivo')
    .optional(), // Precio de costo opcional
  precioVenta: z
    .number()
    .positive('El precio de venta debe ser positivo')
    .max(999999999, 'El precio es excesivo'),
  cantidadExistente: z
    .number()
    .int('Debe ser un número entero')
    .min(0, 'La cantidad no puede ser negativa')
    .max(999999, 'La cantidad es excesiva'),
  cantidadIdeal: z
    .number()
    .int('Debe ser un número entero')
    .min(0, 'La cantidad no puede ser negativa')
    .max(999999, 'La cantidad es excesiva'),
  notas: z
    .string()
    .max(1000, 'Las notas no pueden exceder 1000 caracteres')
    .optional()
    .or(z.literal('')),
});

export type ProductoFormValues = z.infer<typeof productoSchema>;

// ============================================
// VENTA SCHEMA
// ============================================

export const ventaItemInputSchema = z.object({
  productoId: z.string().min(1, 'Debes seleccionar un producto'),
  cantidad: z
    .number()
    .int('Debe ser un número entero')
    .positive('La cantidad debe ser positiva')
    .max(999999, 'La cantidad es excesiva'),
  precioUnitario: z
    .number()
    .min(0, 'El precio no puede ser negativo')
    .max(999999999, 'El precio es excesivo'),
});

export const ventaSchema = z.object({
  clienteId: z.string().optional().or(z.literal('')), // Cliente opcional para ventas al paso
  fecha: z.date(),
  metodoPago: z.enum(['Contado', 'Débito', 'Crédito']), // Método de pago con recargos
  notas: z
    .string()
    .max(1000, 'Las notas no pueden exceder 1000 caracteres')
    .optional()
    .or(z.literal('')),
  items: z
    .array(ventaItemInputSchema)
    .min(1, 'Debes agregar al menos un producto a la venta'),
  pagoCompleto: z.boolean().optional(), // Si está marcado, se paga el 100% al crear
});

export type VentaFormValues = z.infer<typeof ventaSchema>;
