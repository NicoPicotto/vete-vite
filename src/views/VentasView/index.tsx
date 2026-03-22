import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Eye, Loader2 } from 'lucide-react';
import { useVentas } from '@/hooks/useVentas';
import { useClientes } from '@/hooks/useClientes';
import type { EstadoPago } from '@/lib/types';

export default function VentasView() {
  const { data: ventas = [], isLoading, error } = useVentas();
  const { data: clientes = [] } = useClientes();

  const getClienteNombre = (clienteId: string) => {
    const cliente = clientes.find((c) => c.id === clienteId);
    return cliente ? `${cliente.nombre} ${cliente.apellido}` : 'Cliente desconocido';
  };

  const getEstadoBadge = (estado: EstadoPago) => {
    switch (estado) {
      case 'Pagado':
        return <Badge variant="default" className="bg-green-600">Pagado</Badge>;
      case 'Pagado Parcial':
        return <Badge variant="default" className="bg-yellow-600">Pagado Parcial</Badge>;
      case 'Pendiente':
        return <Badge variant="destructive">Pendiente</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  if (error) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Ventas</h1>
            <p className="text-muted-foreground">Registro de ventas realizadas</p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-destructive mb-2">Error al cargar ventas</p>
              <p className="text-sm text-muted-foreground">{(error as Error).message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Ventas</h1>
          <p className="text-muted-foreground">Registro de ventas realizadas</p>
        </div>
        <Link to="/ventas/nueva">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Venta
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado de Ventas</CardTitle>
          <CardDescription>
            {isLoading
              ? 'Cargando...'
              : `${ventas.length} venta${ventas.length !== 1 ? 's' : ''} registrada${ventas.length !== 1 ? 's' : ''}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : ventas.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No hay ventas registradas. Crea la primera.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Estado de Pago</TableHead>
                    <TableHead>Notas</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ventas.map((venta) => (
                    <TableRow key={venta.id}>
                      <TableCell>
                        {format(new Date(venta.fecha), "d 'de' MMMM, yyyy", { locale: es })}
                      </TableCell>
                      <TableCell className="font-medium">
                        {getClienteNombre(venta.clienteId)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        ${venta.total}
                      </TableCell>
                      <TableCell>{getEstadoBadge(venta.estadoPago)}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {venta.notas || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link to={`/ventas/${venta.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
