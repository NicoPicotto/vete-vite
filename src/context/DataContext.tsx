import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type {
  Cliente,
  Mascota,
  HistoriaClinica,
  ItemPago,
  Recordatorio,
} from '@/lib/types';
import {
  getClientes,
  saveClientes,
  addCliente as storageAddCliente,
  updateCliente as storageUpdateCliente,
  deleteCliente as storageDeleteCliente,
  getMascotas,
  saveMascotas,
  addMascota as storageAddMascota,
  updateMascota as storageUpdateMascota,
  deleteMascota as storageDeleteMascota,
  getHistoriaClinica,
  addHistoriaClinica as storageAddHistoriaClinica,
  updateHistoriaClinica as storageUpdateHistoriaClinica,
  deleteHistoriaClinica as storageDeleteHistoriaClinica,
  getItemsPago,
  getRecordatorios,
  initializeWithMockData,
} from '@/lib/storage';

// ============================================
// TYPES
// ============================================

interface DataContextType {
  // Data
  clientes: Cliente[];
  mascotas: Mascota[];
  historiaClinica: HistoriaClinica[];
  itemsPago: ItemPago[];
  recordatorios: Recordatorio[];

  // Cliente actions
  addCliente: (cliente: Cliente) => void;
  updateCliente: (id: string, cliente: Partial<Cliente>) => void;
  deleteCliente: (id: string) => void;
  getClienteById: (id: string) => Cliente | undefined;

  // Mascota actions
  addMascota: (mascota: Mascota) => void;
  updateMascota: (id: string, mascota: Partial<Mascota>) => void;
  deleteMascota: (id: string) => void;
  getMascotaById: (id: string) => Mascota | undefined;
  getMascotasByClienteId: (clienteId: string) => Mascota[];

  // Historia Clinica actions
  addHistoriaClinica: (historia: HistoriaClinica) => void;
  updateHistoriaClinica: (id: string, historia: Partial<HistoriaClinica>) => void;
  deleteHistoriaClinica: (id: string) => void;
  getHistoriaClinicaByMascotaId: (mascotaId: string) => HistoriaClinica[];

  // Items Pago helpers
  getItemsPagoByClienteId: (clienteId: string) => ItemPago[];
  getSaldoCliente: (clienteId: string) => number;

  // Recordatorios helpers
  getRecordatoriosByClienteId: (clienteId: string) => Recordatorio[];
  getRecordatoriosPendientes: () => Recordatorio[];

  // Refresh data
  refreshData: () => void;
}

// ============================================
// CONTEXT
// ============================================

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [historiaClinica, setHistoriaClinica] = useState<HistoriaClinica[]>([]);
  const [itemsPago, setItemsPago] = useState<ItemPago[]>([]);
  const [recordatorios, setRecordatorios] = useState<Recordatorio[]>([]);

  // Inicializar datos al montar
  useEffect(() => {
    initializeWithMockData();
    loadData();
  }, []);

  const loadData = () => {
    setClientes(getClientes());
    setMascotas(getMascotas());
    setHistoriaClinica(getHistoriaClinica());
    setItemsPago(getItemsPago());
    setRecordatorios(getRecordatorios());
  };

  // ============================================
  // CLIENTE ACTIONS
  // ============================================

  const addCliente = (cliente: Cliente) => {
    storageAddCliente(cliente);
    setClientes((prev) => [...prev, cliente]);
  };

  const updateCliente = (id: string, updatedCliente: Partial<Cliente>) => {
    storageUpdateCliente(id, updatedCliente);
    setClientes((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updatedCliente } : c))
    );
  };

  const deleteCliente = (id: string) => {
    storageDeleteCliente(id);
    setClientes((prev) => prev.filter((c) => c.id !== id));
  };

  const getClienteById = (id: string) => {
    return clientes.find((c) => c.id === id);
  };

  // ============================================
  // MASCOTA ACTIONS
  // ============================================

  const addMascota = (mascota: Mascota) => {
    storageAddMascota(mascota);
    setMascotas((prev) => [...prev, mascota]);
  };

  const updateMascota = (id: string, updatedMascota: Partial<Mascota>) => {
    storageUpdateMascota(id, updatedMascota);
    setMascotas((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updatedMascota } : m))
    );
  };

  const deleteMascota = (id: string) => {
    storageDeleteMascota(id);
    setMascotas((prev) => prev.filter((m) => m.id !== id));
  };

  const getMascotaById = (id: string) => {
    return mascotas.find((m) => m.id === id);
  };

  const getMascotasByClienteId = (clienteId: string) => {
    return mascotas.filter((m) => m.clienteId === clienteId);
  };

  // ============================================
  // HISTORIA CLINICA ACTIONS
  // ============================================

  const addHistoriaClinica = (historia: HistoriaClinica) => {
    storageAddHistoriaClinica(historia);
    setHistoriaClinica((prev) => [...prev, historia]);
  };

  const updateHistoriaClinica = (id: string, updatedHistoria: Partial<HistoriaClinica>) => {
    storageUpdateHistoriaClinica(id, updatedHistoria);
    setHistoriaClinica((prev) =>
      prev.map((h) => (h.id === id ? { ...h, ...updatedHistoria } : h))
    );
  };

  const deleteHistoriaClinica = (id: string) => {
    storageDeleteHistoriaClinica(id);
    setHistoriaClinica((prev) => prev.filter((h) => h.id !== id));
  };

  const getHistoriaClinicaByMascotaId = (mascotaId: string) => {
    return historiaClinica
      .filter((h) => h.mascotaId === mascotaId)
      .sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
  };

  // ============================================
  // ITEMS PAGO HELPERS
  // ============================================

  const getItemsPagoByClienteId = (clienteId: string) => {
    return itemsPago.filter((i) => i.clienteId === clienteId);
  };

  const getSaldoCliente = (clienteId: string) => {
    const items = getItemsPagoByClienteId(clienteId);
    return items.reduce((total, item) => {
      return total + (item.monto - item.montoPagado);
    }, 0);
  };

  // ============================================
  // RECORDATORIOS HELPERS
  // ============================================

  const getRecordatoriosByClienteId = (clienteId: string) => {
    return recordatorios.filter((r) => r.clienteId === clienteId);
  };

  const getRecordatoriosPendientes = () => {
    return recordatorios
      .filter((r) => r.estado === 'Pendiente')
      .sort((a, b) => a.fechaRecordatorio.getTime() - b.fechaRecordatorio.getTime());
  };

  // ============================================
  // REFRESH
  // ============================================

  const refreshData = () => {
    loadData();
  };

  const value: DataContextType = {
    clientes,
    mascotas,
    historiaClinica,
    itemsPago,
    recordatorios,
    addCliente,
    updateCliente,
    deleteCliente,
    getClienteById,
    addMascota,
    updateMascota,
    deleteMascota,
    getMascotaById,
    getMascotasByClienteId,
    addHistoriaClinica,
    updateHistoriaClinica,
    deleteHistoriaClinica,
    getHistoriaClinicaByMascotaId,
    getItemsPagoByClienteId,
    getSaldoCliente,
    getRecordatoriosByClienteId,
    getRecordatoriosPendientes,
    refreshData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

// ============================================
// HOOK
// ============================================

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
}
