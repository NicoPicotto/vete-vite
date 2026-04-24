// ============================================
// TYPES Y INTERFACES PRINCIPALES
// Sistema de Gestión Veterinaria
// ============================================

// ============================================
// CLIENTE
// ============================================
export interface Cliente {
  id: string;
  nombre: string;
  apellido: string;
  telefono: string;
  email?: string;
  direccion?: string;
  dniCuit?: string;
  fechaRegistro: Date;
  saldoPendiente: number; // Monto total que debe
}

export type ClienteFormData = Omit<Cliente, 'id' | 'fechaRegistro' | 'saldoPendiente'>;

// ============================================
// MASCOTA
// ============================================
export type Especie = 'Perro' | 'Gato' | 'Exótico' | 'Ave' | 'Roedor' | 'Reptil' | 'Otro';
export type Sexo = 'Macho' | 'Hembra';
export type EstadoMascota = 'Activo' | 'Fallecido';

export interface Mascota {
  id: string;
  clienteId: string;
  nombre: string;
  especie: Especie;
  raza: string;
  fechaNacimiento?: Date;
  sexo: Sexo;
  estado: EstadoMascota;
  otrasCaracteristicas?: string; // Campo libre para notas adicionales
}

export type MascotaFormData = Omit<Mascota, 'id'>;

// ============================================
// VACUNACIONES Y DESPARASITACIONES
// ============================================
export interface Vacunacion {
  id: string;
  mascotaId: string;
  fecha: Date;
  tipoVacuna: string; // Campo de texto libre (ej: "Antirrábica", "Séxtuple")
  notas?: string; // Opcional: lote, laboratorio, próxima dosis
}

export type VacunacionFormData = Omit<Vacunacion, 'id'>;

export interface Desparasitacion {
  id: string;
  mascotaId: string;
  fecha: Date;
  tipoDesparasitacion: string; // Campo de texto libre (ej: "Interna", "Externa", "Pipeta Nexgard")
  notas?: string; // Opcional: lote, laboratorio, próxima dosis
}

export type DesparasitacionFormData = Omit<Desparasitacion, 'id'>;

// ============================================
// HISTORIA CLÍNICA
// ============================================
export interface ArchivoAdjunto {
  nombre: string;
  url: string; // URL pública de Supabase Storage
  tipo: string; // application/pdf, image/jpeg, image/png
  tamano: number; // Tamaño en bytes
}

export interface HistoriaClinica {
  id: string;
  mascotaId: string;
  fecha: Date;
  motivoConsulta: string;
  peso?: number; // en kg
  temperatura?: number; // en °C
  vacunasAplicadas?: string[];
  archivoAdjunto?: ArchivoAdjunto; // 1 solo archivo (PDF o imagen)
  notas?: string;
  veterinario?: string; // Nombre del profesional (hardcoded por ahora)
  itemsPago?: string[]; // IDs de items de pago asociados
}

export type HistoriaClinicaFormData = Omit<HistoriaClinica, 'id' | 'fecha'>;

// ============================================
// PAGOS
// ============================================
export type EstadoPago = 'Pendiente' | 'Pagado Parcial' | 'Pagado';

export interface PagoParcial {
  id: string;
  monto: number;
  fecha: Date;
  notas?: string;
}

export interface ItemPago {
  id: string;
  historiaClinicaId?: string; // Puede estar asociado a una consulta específica
  ventaId?: string; // Puede estar asociado a una venta (nuevo)
  clienteId?: string; // Opcional para ventas al paso (sin cliente)
  descripcion: string;
  monto: number;
  fecha: Date;
  estado: EstadoPago;
  montoPagado: number;
  pagosParciales: PagoParcial[];
}

export type ItemPagoFormData = Omit<ItemPago, 'id' | 'fecha' | 'estado' | 'montoPagado' | 'pagosParciales'>;

// ============================================
// RECORDATORIOS
// ============================================
export type FrecuenciaRecurrencia = 'Mensual' | 'Trimestral' | 'Semestral' | 'Anual' | 'Personalizado';
export type EstadoRecordatorio = 'Pendiente' | 'Completado' | 'Reprogramado' | 'Cancelado';

export interface Recordatorio {
  id: string;
  historiaClinicaId?: string; // Opcional - solo si viene desde historia clínica
  mascotaId: string;
  clienteId: string; // Para facilitar búsquedas
  titulo: string;
  descripcion?: string;
  fechaRecordatorio: Date;
  esRecurrente: boolean;
  frecuenciaRecurrencia?: FrecuenciaRecurrencia;
  intervaloPersonalizado?: number; // En días, si es personalizado
  estado: EstadoRecordatorio;
  creadoPor?: string; // Nombre del veterinario
  fechaCreacion: Date;
  fechaOriginal?: Date; // Para tracking si fue reprogramado
  notasReprogramacion?: string; // Razón de la reprogramación
}

export type RecordatorioFormData = Omit<Recordatorio, 'id' | 'fechaCreacion' | 'estado'>;

// ============================================
// ESTADO DE CUENTA
// ============================================
export interface EstadoCuenta {
  clienteId: string;
  itemsPendientes: ItemPago[];
  totalDeuda: number;
  ultimoPago?: {
    fecha: Date;
    monto: number;
  };
}

// ============================================
// VISTA FICHA RÁPIDA
// ============================================
export interface FichaRapida {
  cliente: Cliente;
  mascotas: Mascota[];
  ultimaConsulta?: {
    mascota: Mascota;
    consulta: HistoriaClinica;
  };
  proximoRecordatorio?: Recordatorio;
  saldoPendiente: number;
}

// ============================================
// BÚSQUEDA
// ============================================
export type TipoResultadoBusqueda = 'cliente' | 'mascota';

export interface ResultadoBusqueda {
  tipo: TipoResultadoBusqueda;
  id: string;
  texto: string; // Texto a mostrar en el resultado
  subtexto?: string; // Información adicional
  cliente?: Cliente;
  mascota?: Mascota;
}

// ============================================
// PRODUCTOS (STOCK)
// ============================================
export type CategoriaProducto = 'PetShop' | 'Farmacia' | 'Medicina';

export interface Producto {
  id: string;
  nombre: string;
  categoria: CategoriaProducto;
  sku?: string;
  precioCosto?: number; // Opcional - a veces no se tiene o cambia
  precioVenta: number;
  cantidadExistente: number;
  cantidadIdeal: number;
  notas?: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export type ProductoFormData = Omit<Producto, 'id' | 'fechaCreacion' | 'fechaActualizacion'>;

// ============================================
// VENTAS
// ============================================
export type MetodoPago = 'Contado' | 'Débito' | 'Crédito';

export interface VentaItem {
  id: string;
  ventaId: string;
  productoId?: string; // NULL para ítems en blanco/personalizados
  nombre?: string; // Nombre personalizado (solo para ítems en blanco)
  cantidad: number;
  precioUnitario: number; // Snapshot del precio al momento de la venta
  subtotal: number; // cantidad * precioUnitario
}

export interface Venta {
  id: string;
  clienteId?: string; // Opcional para ventas al paso
  fecha: Date;
  total: number; // Total FINAL con recargo incluido y descuento aplicado
  descuento: number; // Monto de descuento aplicado (0 si no hay)
  metodoPago: MetodoPago; // Método de pago: Contado (sin recargo), Débito (+5%), Crédito (+20%)
  estadoPago: EstadoPago;
  notas?: string;
  itemPagoId?: string; // ItemPago generado automáticamente
  fechaCreacion: Date;
  items?: VentaItem[]; // Items de la venta (opcional, viene de JOIN)
}

export type VentaFormData = Omit<Venta, 'id' | 'fechaCreacion' | 'estadoPago' | 'total' | 'itemPagoId' | 'items'>;

// Para el formulario de nueva venta (carrito)
export interface VentaItemInput {
  productoId?: string; // Opcional: NULL para ítems en blanco/personalizados
  nombre?: string; // Solo para ítems en blanco (cuando no hay productoId)
  cantidad: number;
  precioUnitario: number; // Se obtiene del producto o se ingresa manualmente
}

export interface VentaFormInput {
  clienteId?: string; // Opcional para ventas al paso
  fecha: Date;
  metodoPago: MetodoPago; // Método de pago con recargos
  notas?: string;
  items: VentaItemInput[];
  pagoCompleto?: boolean; // Si está marcado, se registra como pagado al 100%
  descuento?: number; // Monto de descuento ya calculado (0 si no aplica)
}

// ============================================
// TURNOS
// ============================================
export type TipoTurno = 'Consulta' | 'Control';
export type EstadoTurno = 'Pendiente' | 'Confirmado' | 'Cancelado' | 'Completado' | 'No se presentó';

export interface Turno {
  id: string;
  clienteId: string;
  mascotaId?: string;
  fechaHora: Date;
  tipo: TipoTurno;
  notas?: string;
  estado: EstadoTurno;
  // Campos extra desde la view turnos_con_detalle
  clienteNombre?: string;
  clienteApellido?: string;
  clienteTelefono?: string;
  mascotaNombre?: string;
  mascotaEspecie?: string;
}

export type TurnoFormData = Omit<Turno, 'id' | 'clienteNombre' | 'clienteApellido' | 'clienteTelefono' | 'mascotaNombre' | 'mascotaEspecie'>;

// ============================================
// MENSAJE RÁPIDO
// ============================================
export interface MensajeRapido {
  id: string;
  titulo: string;
  contenido: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export type MensajeRapidoFormData = Pick<MensajeRapido, 'titulo' | 'contenido'>;

// ============================================
// UTILIDADES
// ============================================
export interface SelectOption {
  value: string;
  label: string;
}
