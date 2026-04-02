import { useMemo } from 'react';
import { useClientes } from '@/hooks/useClientes';
import { useMascotas } from '@/hooks/useMascotas';
import { useRecordatorios } from '@/hooks/useRecordatorios';
import { useItemsPago } from '@/hooks/usePagos';
import { useTurnos } from '@/hooks/useTurnos';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, PawPrint, Bell, CreditCard, CalendarClock, Loader2 } from 'lucide-react';
import { format, startOfDay, endOfDay } from 'date-fns';
import { es } from 'date-fns/locale';

export default function DashboardView() {
  const { data: clientes = [], isLoading: isLoadingClientes } = useClientes();
  const { data: mascotas = [], isLoading: isLoadingMascotas } = useMascotas();
  const { data: recordatorios = [], isLoading: isLoadingRecordatorios } = useRecordatorios();
  const { data: itemsPago = [], isLoading: isLoadingPagos } = useItemsPago();
  const { data: turnos = [], isLoading: isLoadingTurnos } = useTurnos();

  // Recordatorios pendientes
  const recordatoriosPendientes = useMemo(() => {
    return recordatorios
      .filter((r) => r.estado === 'Pendiente' || r.estado === 'Reprogramado')
      .sort(
        (a, b) =>
          new Date(a.fechaRecordatorio).getTime() - new Date(b.fechaRecordatorio).getTime()
      )
      .map((r) => {
        const cliente = clientes.find((c) => c.id === r.clienteId);
        const mascota = mascotas.find((m) => m.id === r.mascotaId);
        return { ...r, cliente, mascota };
      });
  }, [recordatorios, clientes, mascotas]);

  // Deuda total
  const totalDeuda = useMemo(() => {
    let total = 0;
    itemsPago.forEach((item) => {
      if (!item.clienteId) return;
      const saldo = item.monto - item.montoPagado;
      if (saldo > 0) total += saldo;
    });
    return total;
  }, [itemsPago]);

  // Turnos de hoy
  const turnosHoy = useMemo(() => {
    const hoy = new Date();
    return turnos
      .filter((t) => {
        const fecha = new Date(t.fechaHora);
        return fecha >= startOfDay(hoy) && fecha <= endOfDay(hoy);
      })
      .sort((a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime());
  }, [turnos]);

  const getBadgeEstado = (estado: string) => {
    switch (estado) {
      case 'Confirmado': return 'default';
      case 'Completado': return 'secondary';
      case 'Cancelado':
      case 'No se presentó': return 'outline';
      default: return 'destructive';
    }
  };

  const isLoading =
    isLoadingClientes ||
    isLoadingMascotas ||
    isLoadingRecordatorios ||
    isLoadingPagos ||
    isLoadingTurnos;

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
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Recordatorios Próximos
            </CardTitle>
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
                      <p className="font-medium text-sm">
                        {recordatorio.titulo}
                        {recordatorio.mascota && (
                          <span className="font-normal text-muted-foreground"> — {recordatorio.mascota.nombre}</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">{recordatorio.descripcion}</p>
                      {recordatorio.cliente && (
                        <p className="text-xs text-muted-foreground">
                          {recordatorio.cliente.nombre} {recordatorio.cliente.apellido} · {recordatorio.cliente.telefono}
                        </p>
                      )}
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
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5" />
              Turnos de Hoy
            </CardTitle>
            <CardDescription>
              {format(new Date(), "EEEE d 'de' MMMM", { locale: es })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {turnosHoy.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay turnos para hoy</p>
            ) : (
              <div className="space-y-3">
                {turnosHoy.map((turno) => {
                  const hora = format(new Date(turno.fechaHora), 'HH:mm');
                  return (
                    <div key={turno.id} className="flex justify-between items-start border-b pb-2 last:border-0">
                      <div>
                        <p className="font-medium text-sm">
                          {turno.clienteNombre} {turno.clienteApellido}
                          {turno.mascotaNombre && (
                            <span className="font-normal text-muted-foreground"> — {turno.mascotaNombre}</span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">{turno.clienteTelefono}</p>
                        {turno.notas && (
                          <p className="text-xs text-muted-foreground">{turno.notas}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                        <span className="text-sm font-semibold">{hora}</span>
                        <Badge variant={getBadgeEstado(turno.estado)} className="text-xs">
                          {turno.estado}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
