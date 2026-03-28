import { useMemo } from 'react';
import { useClientes } from '@/hooks/useClientes';
import { useMascotas } from '@/hooks/useMascotas';
import { useRecordatorios } from '@/hooks/useRecordatorios';
import { useItemsPago } from '@/hooks/usePagos';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, PawPrint, Bell, CreditCard, Loader2 } from 'lucide-react';

export default function DashboardView() {
  // Hooks de datos
  const { data: clientes = [], isLoading: isLoadingClientes } = useClientes();
  const { data: mascotas = [], isLoading: isLoadingMascotas } = useMascotas();
  const { data: recordatorios = [], isLoading: isLoadingRecordatorios } = useRecordatorios();
  const { data: itemsPago = [], isLoading: isLoadingPagos } = useItemsPago();

  // Calcular recordatorios pendientes
  const recordatoriosPendientes = useMemo(() => {
    return recordatorios
      .filter((r) => r.estado === 'Pendiente' || r.estado === 'Reprogramado')
      .sort(
        (a, b) =>
          new Date(a.fechaRecordatorio).getTime() - new Date(b.fechaRecordatorio).getTime()
      );
  }, [recordatorios]);

  // Calcular deuda total y saldo por cliente
  const { totalDeuda, saldosPorCliente } = useMemo(() => {
    const saldos = new Map<string, number>();
    let total = 0;

    itemsPago.forEach((item) => {
      // Solo calcular saldo si el item tiene cliente asociado (no ventas al paso)
      if (!item.clienteId) return;

      const saldo = item.monto - item.montoPagado;
      if (saldo > 0) {
        saldos.set(item.clienteId, (saldos.get(item.clienteId) || 0) + saldo);
        total += saldo;
      }
    });

    return { totalDeuda: total, saldosPorCliente: saldos };
  }, [itemsPago]);

  // Clientes con deuda
  const clientesConDeuda = useMemo(() => {
    return clientes
      .filter((c) => (saldosPorCliente.get(c.id) || 0) > 0)
      .map((c) => ({
        ...c,
        saldo: saldosPorCliente.get(c.id) || 0,
      }))
      .sort((a, b) => b.saldo - a.saldo);
  }, [clientes, saldosPorCliente]);

  const isLoading = isLoadingClientes || isLoadingMascotas || isLoadingRecordatorios || isLoadingPagos;

  // Mostrar loading mientras carga
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientes.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Mascotas</CardTitle>
            <PawPrint className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mascotas.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recordatorios Pendientes</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recordatoriosPendientes.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deuda Total</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalDeuda.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recordatorios Próximos</CardTitle>
            <CardDescription>Consultas y tratamientos pendientes</CardDescription>
          </CardHeader>
          <CardContent>
            {recordatoriosPendientes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay recordatorios pendientes</p>
            ) : (
              <div className="space-y-3">
                {recordatoriosPendientes.slice(0, 5).map((recordatorio) => (
                  <div key={recordatorio.id} className="flex justify-between items-start border-b pb-2 last:border-0">
                    <div>
                      <p className="font-medium text-sm">{recordatorio.titulo}</p>
                      <p className="text-xs text-muted-foreground">{recordatorio.descripcion}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {recordatorio.fechaRecordatorio.toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Clientes con Deuda</CardTitle>
            <CardDescription>Saldos pendientes de pago</CardDescription>
          </CardHeader>
          <CardContent>
            {clientesConDeuda.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay clientes con deuda pendiente</p>
            ) : (
              <div className="space-y-3">
                {clientesConDeuda.slice(0, 5).map((cliente) => (
                  <div key={cliente.id} className="flex justify-between items-center border-b pb-2 last:border-0">
                    <div>
                      <p className="font-medium text-sm">{cliente.nombre} {cliente.apellido}</p>
                      <p className="text-xs text-muted-foreground">{cliente.telefono}</p>
                    </div>
                    <span className="text-sm font-semibold text-destructive">
                      ${cliente.saldo.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
