// ============================================
// LOCALSTORAGE HELPERS
// Para persistir datos mientras no tengamos backend
// ============================================

import type {
  Cliente,
  Mascota,
  HistoriaClinica,
  ItemPago,
  Recordatorio,
} from './types';
import {
  mockClientes,
  mockMascotas,
  mockHistoriaClinica,
  mockItemsPago,
  mockRecordatorios,
} from './mock-data';

const STORAGE_KEYS = {
  CLIENTES: 'vete-vite-clientes',
  MASCOTAS: 'vete-vite-mascotas',
  HISTORIA_CLINICA: 'vete-vite-historia-clinica',
  ITEMS_PAGO: 'vete-vite-items-pago',
  RECORDATORIOS: 'vete-vite-recordatorios',
} as const;

// ============================================
// GENERIC HELPERS
// ============================================

function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;

    const parsed = JSON.parse(item);

    // Convertir strings de fecha a objetos Date
    return reviveDates(parsed);
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
}

// Helper para convertir strings de fecha a objetos Date
function reviveDates<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(reviveDates) as T;
  }

  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    // Si la key contiene "fecha" o "date" y el value es string ISO, convertir a Date
    if (
      (key.toLowerCase().includes('fecha') || key.toLowerCase().includes('date')) &&
      typeof value === 'string' &&
      !isNaN(Date.parse(value))
    ) {
      result[key] = new Date(value);
    } else if (typeof value === 'object') {
      result[key] = reviveDates(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

// ============================================
// CLIENTES
// ============================================

export function getClientes(): Cliente[] {
  return getFromStorage<Cliente[]>(STORAGE_KEYS.CLIENTES, []);
}

export function saveClientes(clientes: Cliente[]): void {
  saveToStorage(STORAGE_KEYS.CLIENTES, clientes);
}

export function addCliente(cliente: Cliente): void {
  const clientes = getClientes();
  clientes.push(cliente);
  saveClientes(clientes);
}

export function updateCliente(id: string, updatedCliente: Partial<Cliente>): void {
  const clientes = getClientes();
  const index = clientes.findIndex((c) => c.id === id);
  if (index !== -1) {
    clientes[index] = { ...clientes[index], ...updatedCliente };
    saveClientes(clientes);
  }
}

export function deleteCliente(id: string): void {
  const clientes = getClientes();
  const filtered = clientes.filter((c) => c.id !== id);
  saveClientes(filtered);
}

// ============================================
// MASCOTAS
// ============================================

export function getMascotas(): Mascota[] {
  return getFromStorage<Mascota[]>(STORAGE_KEYS.MASCOTAS, []);
}

export function saveMascotas(mascotas: Mascota[]): void {
  saveToStorage(STORAGE_KEYS.MASCOTAS, mascotas);
}

export function addMascota(mascota: Mascota): void {
  const mascotas = getMascotas();
  mascotas.push(mascota);
  saveMascotas(mascotas);
}

export function updateMascota(id: string, updatedMascota: Partial<Mascota>): void {
  const mascotas = getMascotas();
  const index = mascotas.findIndex((m) => m.id === id);
  if (index !== -1) {
    mascotas[index] = { ...mascotas[index], ...updatedMascota };
    saveMascotas(mascotas);
  }
}

export function deleteMascota(id: string): void {
  const mascotas = getMascotas();
  const filtered = mascotas.filter((m) => m.id !== id);
  saveMascotas(filtered);
}

// ============================================
// HISTORIA CLINICA
// ============================================

export function getHistoriaClinica(): HistoriaClinica[] {
  return getFromStorage<HistoriaClinica[]>(STORAGE_KEYS.HISTORIA_CLINICA, []);
}

export function saveHistoriaClinica(historias: HistoriaClinica[]): void {
  saveToStorage(STORAGE_KEYS.HISTORIA_CLINICA, historias);
}

export function addHistoriaClinica(historia: HistoriaClinica): void {
  const historias = getHistoriaClinica();
  historias.push(historia);
  saveHistoriaClinica(historias);
}

export function updateHistoriaClinica(id: string, updatedHistoria: Partial<HistoriaClinica>): void {
  const historias = getHistoriaClinica();
  const index = historias.findIndex((h) => h.id === id);
  if (index !== -1) {
    historias[index] = { ...historias[index], ...updatedHistoria };
    saveHistoriaClinica(historias);
  }
}

export function deleteHistoriaClinica(id: string): void {
  const historias = getHistoriaClinica();
  const filtered = historias.filter((h) => h.id !== id);
  saveHistoriaClinica(filtered);
}

// ============================================
// ITEMS PAGO
// ============================================

export function getItemsPago(): ItemPago[] {
  return getFromStorage<ItemPago[]>(STORAGE_KEYS.ITEMS_PAGO, []);
}

export function saveItemsPago(items: ItemPago[]): void {
  saveToStorage(STORAGE_KEYS.ITEMS_PAGO, items);
}

export function addItemPago(item: ItemPago): void {
  const items = getItemsPago();
  items.push(item);
  saveItemsPago(items);
}

// ============================================
// RECORDATORIOS
// ============================================

export function getRecordatorios(): Recordatorio[] {
  return getFromStorage<Recordatorio[]>(STORAGE_KEYS.RECORDATORIOS, []);
}

export function saveRecordatorios(recordatorios: Recordatorio[]): void {
  saveToStorage(STORAGE_KEYS.RECORDATORIOS, recordatorios);
}

export function addRecordatorio(recordatorio: Recordatorio): void {
  const recordatorios = getRecordatorios();
  recordatorios.push(recordatorio);
  saveRecordatorios(recordatorios);
}

// ============================================
// INITIALIZE WITH MOCK DATA
// ============================================

export function initializeWithMockData(): void {
  // Solo inicializar si no hay datos en localStorage
  const clientes = getClientes();
  if (clientes.length === 0) {
    saveClientes(mockClientes);
    saveMascotas(mockMascotas);
    saveHistoriaClinica(mockHistoriaClinica);
    saveItemsPago(mockItemsPago);
    saveRecordatorios(mockRecordatorios);

    console.log('✅ Datos mock inicializados en localStorage');
  }
}

// ============================================
// CLEAR ALL DATA (útil para testing)
// ============================================

export function clearAllData(): void {
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
  console.log('🗑️ Todos los datos han sido eliminados');
}
