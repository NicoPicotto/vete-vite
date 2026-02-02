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
  addItemPago as storageAddItemPago,
  updateItemPago as storageUpdateItemPago,
  deleteItemPago as storageDeleteItemPago,
  getRecordatorios,
  addRecordatorio as storageAddRecordatorio,
  updateRecordatorio as storageUpdateRecordatorio,
  deleteRecordatorio as storageDeleteRecordatorio,
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

  // Items Pago actions
  addItemPago: (item: ItemPago) => void;
  updateItemPago: (id: string, item: Partial<ItemPago>) => void;
  deleteItemPago: (id: string) => void;
  getItemPagoById: (id: string) => ItemPago | undefined;
  getItemsPagoByClienteId: (clienteId: string) => ItemPago[];
  getSaldoCliente: (clienteId: string) => number;
  registrarPagoParcial: (itemId: string, monto: number, notas?: string) => void;

  // Recordatorios actions
  addRecordatorio: (recordatorio: Recordatorio) => void;
  updateRecordatorio: (id: string, recordatorio: Partial<Recordatorio>) => void;
  deleteRecordatorio: (id: string) => void;
  getRecordatorioById: (id: string) => Recordatorio | undefined;
  getRecordatoriosByClienteId: (clienteId: string) => Recordatorio[];
  getRecordatoriosByMascotaId: (mascotaId: string) => Recordatorio[];
  getRecordatoriosPendientes: () => Recordatorio[];
  getRecordatoriosProximos: (dias: number) => Recordatorio[];
  reprogramarRecordatorio: (id: string, nuevaFecha: Date, notas?: string) => void;
  completarRecordatorio: (id: string) => void;
  cancelarRecordatorio: (id: string) => void;

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
  // ITEMS PAGO ACTIONS
  // ============================================

  const addItemPago = (item: ItemPago) => {
    storageAddItemPago(item);
    setItemsPago((prev) => [...prev, item]);
  };

  const updateItemPago = (id: string, updatedItem: Partial<ItemPago>) => {
    storageUpdateItemPago(id, updatedItem);
    setItemsPago((prev) =>
      prev.map((i) => (i.id === id ? { ...i, ...updatedItem } : i))
    );
  };

  const deleteItemPago = (id: string) => {
    storageDeleteItemPago(id);
    setItemsPago((prev) => prev.filter((i) => i.id !== id));
  };

  const getItemPagoById = (id: string) => {
    return itemsPago.find((i) => i.id === id);
  };

  const getItemsPagoByClienteId = (clienteId: string) => {
    return itemsPago.filter((i) => i.clienteId === clienteId);
  };

  const getSaldoCliente = (clienteId: string) => {
    const items = getItemsPagoByClienteId(clienteId);
    return items.reduce((total, item) => {
      return total + (item.monto - item.montoPagado);
    }, 0);
  };

  const registrarPagoParcial = (itemId: string, monto: number, notas?: string) => {
    const item = getItemPagoById(itemId);
    if (!item) return;

    const nuevoPago = {
      id: crypto.randomUUID(),
      monto,
      fecha: new Date(),
      notas: notas || '',
    };

    const nuevoMontoPagado = item.montoPagado + monto;
    const nuevosPagosParciales = [...item.pagosParciales, nuevoPago];

    // Determinar nuevo estado
    let nuevoEstado: 'Pendiente' | 'Pagado Parcial' | 'Pagado' = 'Pendiente';
    if (nuevoMontoPagado >= item.monto) {
      nuevoEstado = 'Pagado';
    } else if (nuevoMontoPagado > 0) {
      nuevoEstado = 'Pagado Parcial';
    }

    updateItemPago(itemId, {
      montoPagado: nuevoMontoPagado,
      pagosParciales: nuevosPagosParciales,
      estado: nuevoEstado,
    });
  };

  // ============================================
  // RECORDATORIOS ACTIONS
  // ============================================

  const addRecordatorio = (recordatorio: Recordatorio) => {
    storageAddRecordatorio(recordatorio);
    setRecordatorios((prev) => [...prev, recordatorio]);
  };

  const updateRecordatorio = (id: string, updatedRecordatorio: Partial<Recordatorio>) => {
    storageUpdateRecordatorio(id, updatedRecordatorio);
    setRecordatorios((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updatedRecordatorio } : r))
    );
  };

  const deleteRecordatorio = (id: string) => {
    storageDeleteRecordatorio(id);
    setRecordatorios((prev) => prev.filter((r) => r.id !== id));
  };

  const getRecordatorioById = (id: string) => {
    return recordatorios.find((r) => r.id === id);
  };

  const getRecordatoriosByClienteId = (clienteId: string) => {
    return recordatorios.filter((r) => r.clienteId === clienteId);
  };

  const getRecordatoriosByMascotaId = (mascotaId: string) => {
    return recordatorios.filter((r) => r.mascotaId === mascotaId);
  };

  const getRecordatoriosPendientes = () => {
    return recordatorios
      .filter((r) => r.estado === 'Pendiente' || r.estado === 'Reprogramado')
      .sort((a, b) => a.fechaRecordatorio.getTime() - b.fechaRecordatorio.getTime());
  };

  const getRecordatoriosProximos = (dias: number) => {
    const hoy = new Date();
    const limite = new Date();
    limite.setDate(hoy.getDate() + dias);

    return recordatorios
      .filter((r) => {
        const esPendiente = r.estado === 'Pendiente' || r.estado === 'Reprogramado';
        const dentroDelRango = r.fechaRecordatorio >= hoy && r.fechaRecordatorio <= limite;
        return esPendiente && dentroDelRango;
      })
      .sort((a, b) => a.fechaRecordatorio.getTime() - b.fechaRecordatorio.getTime());
  };

  const reprogramarRecordatorio = (id: string, nuevaFecha: Date, notas?: string) => {
    const recordatorio = getRecordatorioById(id);
    if (!recordatorio) return;

    updateRecordatorio(id, {
      fechaRecordatorio: nuevaFecha,
      estado: 'Reprogramado',
      fechaOriginal: recordatorio.fechaOriginal || recordatorio.fechaRecordatorio,
      notasReprogramacion: notas,
    });
  };

  const completarRecordatorio = (id: string) => {
    updateRecordatorio(id, { estado: 'Completado' });
  };

  const cancelarRecordatorio = (id: string) => {
    updateRecordatorio(id, { estado: 'Cancelado' });
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
    addItemPago,
    updateItemPago,
    deleteItemPago,
    getItemPagoById,
    getItemsPagoByClienteId,
    getSaldoCliente,
    registrarPagoParcial,
    addRecordatorio,
    updateRecordatorio,
    deleteRecordatorio,
    getRecordatorioById,
    getRecordatoriosByClienteId,
    getRecordatoriosByMascotaId,
    getRecordatoriosPendientes,
    getRecordatoriosProximos,
    reprogramarRecordatorio,
    completarRecordatorio,
    cancelarRecordatorio,
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
