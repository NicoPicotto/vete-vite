import type {
  Cliente,
  Mascota,
  HistoriaClinica,
  ItemPago,
  Recordatorio,
} from './types';

// ============================================
// MOCK DATA - Para desarrollo sin backend
// ============================================

export const mockClientes: Cliente[] = [
  {
    id: '1',
    nombre: 'Juan',
    apellido: 'Pérez',
    telefono: '+54 11 1234-5678',
    email: 'juan.perez@email.com',
    direccion: 'Av. Corrientes 1234, CABA',
    dniCuit: '12345678',
    fechaRegistro: new Date('2024-01-15'),
    saldoPendiente: 15000,
  },
  {
    id: '2',
    nombre: 'María',
    apellido: 'González',
    telefono: '+54 11 8765-4321',
    email: 'maria.gonzalez@email.com',
    direccion: 'Calle San Martín 567, CABA',
    fechaRegistro: new Date('2024-03-20'),
    saldoPendiente: 0,
  },
  {
    id: '3',
    nombre: 'Carlos',
    apellido: 'Rodríguez',
    telefono: '+54 11 5555-6666',
    direccion: 'Av. Libertador 890, CABA',
    fechaRegistro: new Date('2024-05-10'),
    saldoPendiente: 8500,
  },
];

export const mockMascotas: Mascota[] = [
  {
    id: '1',
    clienteId: '1',
    nombre: 'Max',
    especie: 'Perro',
    raza: 'Golden Retriever',
    fechaNacimiento: new Date('2020-03-15'),
    edad: '4 años',
    sexo: 'Macho',
    estado: 'Activo',
    otrasCaracteristicas: 'Muy activo, le gusta nadar',
  },
  {
    id: '2',
    clienteId: '1',
    nombre: 'Luna',
    especie: 'Gato',
    raza: 'Siamés',
    fechaNacimiento: new Date('2021-07-20'),
    edad: '3 años',
    sexo: 'Hembra',
    estado: 'Activo',
    otrasCaracteristicas: 'Asustadiza con extraños',
  },
  {
    id: '3',
    clienteId: '2',
    nombre: 'Rocky',
    especie: 'Perro',
    raza: 'Bulldog Francés',
    fechaNacimiento: new Date('2019-11-05'),
    edad: '5 años',
    sexo: 'Macho',
    estado: 'Activo',
    otrasCaracteristicas: 'Problemas respiratorios leves',
  },
  {
    id: '4',
    clienteId: '3',
    nombre: 'Michi',
    especie: 'Gato',
    raza: 'Común Europeo',
    fechaNacimiento: new Date('2022-02-14'),
    edad: '2 años',
    sexo: 'Macho',
    estado: 'Activo',
  },
];

export const mockHistoriaClinica: HistoriaClinica[] = [
  {
    id: '1',
    mascotaId: '1',
    fecha: new Date('2024-01-20'),
    motivoConsulta: 'Control anual y vacunación',
    diagnostico: 'Estado general excelente',
    tratamiento: 'Vacuna antirrábica y sextuple',
    peso: 32.5,
    temperatura: 38.5,
    vacunasAplicadas: ['Antirrábica', 'Sextuple'],
    notas: 'Próximo control en 1 año',
    veterinario: 'Dr. Martínez',
    itemsPago: ['1'],
  },
  {
    id: '2',
    mascotaId: '1',
    fecha: new Date('2024-06-15'),
    motivoConsulta: 'Control semestral',
    diagnostico: 'En buen estado, leve sobrepeso',
    tratamiento: 'Recomendación de dieta y ejercicio',
    peso: 34.0,
    temperatura: 38.3,
    notas: 'Reducir porciones de comida, aumentar paseos',
    veterinario: 'Dr. Martínez',
  },
  {
    id: '3',
    mascotaId: '2',
    fecha: new Date('2024-03-10'),
    motivoConsulta: 'Desparasitación',
    diagnostico: 'Estado general normal',
    tratamiento: 'Desparasitante interno',
    peso: 4.2,
    temperatura: 38.8,
    notas: 'Repetir en 3 meses',
    veterinario: 'Dra. López',
    itemsPago: ['2'],
  },
  {
    id: '4',
    mascotaId: '3',
    fecha: new Date('2024-04-25'),
    motivoConsulta: 'Problemas respiratorios',
    diagnostico: 'Estenosis nasal moderada (típica de la raza)',
    tratamiento: 'Medicación antiinflamatoria',
    peso: 12.8,
    temperatura: 38.6,
    notas: 'Evitar ejercicio intenso en días calurosos',
    veterinario: 'Dr. Martínez',
    itemsPago: ['3'],
  },
];

export const mockItemsPago: ItemPago[] = [
  {
    id: '1',
    historiaClinicaId: '1',
    clienteId: '1',
    descripcion: 'Consulta + Vacunación (Max)',
    monto: 15000,
    fecha: new Date('2024-01-20'),
    estado: 'Pendiente',
    montoPagado: 0,
    pagosParciales: [],
  },
  {
    id: '2',
    historiaClinicaId: '3',
    clienteId: '1',
    descripcion: 'Desparasitación (Luna)',
    monto: 5000,
    fecha: new Date('2024-03-10'),
    estado: 'Pagado',
    montoPagado: 5000,
    pagosParciales: [
      {
        id: 'p1',
        monto: 5000,
        fecha: new Date('2024-03-10'),
      },
    ],
  },
  {
    id: '3',
    historiaClinicaId: '4',
    clienteId: '3',
    descripcion: 'Consulta + Tratamiento respiratorio (Rocky)',
    monto: 8500,
    fecha: new Date('2024-04-25'),
    estado: 'Pendiente',
    montoPagado: 0,
    pagosParciales: [],
  },
];

export const mockRecordatorios: Recordatorio[] = [
  {
    id: '1',
    historiaClinicaId: '1',
    mascotaId: '1',
    clienteId: '1',
    titulo: 'Control anual - Max',
    descripcion: 'Control anual y renovación de vacunas',
    fechaRecordatorio: new Date('2025-01-20'),
    esRecurrente: true,
    frecuenciaRecurrencia: 'Anual',
    estado: 'Pendiente',
    creadoPor: 'Dr. Martínez',
    fechaCreacion: new Date('2024-01-20'),
  },
  {
    id: '2',
    historiaClinicaId: '3',
    mascotaId: '2',
    clienteId: '1',
    titulo: 'Desparasitación - Luna',
    descripcion: 'Desparasitación trimestral',
    fechaRecordatorio: new Date('2024-06-10'),
    esRecurrente: true,
    frecuenciaRecurrencia: 'Trimestral',
    estado: 'Completado',
    creadoPor: 'Dra. López',
    fechaCreacion: new Date('2024-03-10'),
  },
  {
    id: '3',
    historiaClinicaId: '4',
    mascotaId: '3',
    clienteId: '3',
    titulo: 'Control respiratorio - Rocky',
    descripcion: 'Revisión de estado respiratorio',
    fechaRecordatorio: new Date('2024-07-25'),
    esRecurrente: false,
    estado: 'Pendiente',
    creadoPor: 'Dr. Martínez',
    fechaCreacion: new Date('2024-04-25'),
  },
];

// ============================================
// FUNCIONES HELPER PARA MOCK DATA
// ============================================

export function getClienteById(id: string): Cliente | undefined {
  return mockClientes.find((c) => c.id === id);
}

export function getMascotaById(id: string): Mascota | undefined {
  return mockMascotas.find((m) => m.id === id);
}

export function getMascotasByClienteId(clienteId: string): Mascota[] {
  return mockMascotas.filter((m) => m.clienteId === clienteId);
}

export function getHistoriaClinicaByMascotaId(mascotaId: string): HistoriaClinica[] {
  return mockHistoriaClinica
    .filter((h) => h.mascotaId === mascotaId)
    .sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
}

export function getItemsPagoByClienteId(clienteId: string): ItemPago[] {
  return mockItemsPago.filter((i) => i.clienteId === clienteId);
}

export function getRecordatoriosByClienteId(clienteId: string): Recordatorio[] {
  return mockRecordatorios.filter((r) => r.clienteId === clienteId);
}

export function getRecordatoriosPendientes(): Recordatorio[] {
  return mockRecordatorios
    .filter((r) => r.estado === 'Pendiente')
    .sort((a, b) => a.fechaRecordatorio.getTime() - b.fechaRecordatorio.getTime());
}

export function getSaldoCliente(clienteId: string): number {
  const items = getItemsPagoByClienteId(clienteId);
  return items.reduce((total, item) => {
    return total + (item.monto - item.montoPagado);
  }, 0);
}
