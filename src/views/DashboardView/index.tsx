import { useData } from '@/context/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, PawPrint, Bell, CreditCard } from 'lucide-react';

export default function DashboardView() {
  const { clientes, mascotas, getRecordatoriosPendientes, getSaldoCliente } = useData();
  const recordatoriosPendientes = getRecordatoriosPendientes();
  const totalDeuda = clientes.reduce((sum, c) => sum + getSaldoCliente(c.id), 0);

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
            <div className="space-y-3">
              {clientes
                .filter((c) => getSaldoCliente(c.id) > 0)
                .map((cliente) => (
                  <div key={cliente.id} className="flex justify-between items-center border-b pb-2 last:border-0">
                    <div>
                      <p className="font-medium text-sm">{cliente.nombre} {cliente.apellido}</p>
                      <p className="text-xs text-muted-foreground">{cliente.telefono}</p>
                    </div>
                    <span className="text-sm font-semibold text-destructive">
                      ${getSaldoCliente(cliente.id).toLocaleString()}
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
