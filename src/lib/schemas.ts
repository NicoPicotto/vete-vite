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
  especie: z.enum(['Perro', 'Gato', 'Exótico', 'Ave', 'Roedor', 'Reptil', 'Otro'], {
    required_error: 'Debes seleccionar una especie',
  }),
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
  sexo: z.enum(['Macho', 'Hembra'], {
    required_error: 'Debes seleccionar el sexo',
  }),
  estado: z.enum(['Activo', 'Fallecido']).default('Activo'),
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
