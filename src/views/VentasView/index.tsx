import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Eye, Loader2, Search, CreditCard } from 'lucide-react';
import { useVentas } from '@/hooks/useVentas';
import { useClientes } from '@/hooks/useClientes';
import { useItemsPago, useCreatePagoParcial } from '@/hooks/usePagos';
import { PagoParcialForm } from '@/components/pagos/PagoParcialForm';
import type { EstadoPago, ItemPago } from '@/lib/types';
import type { PagoParcialFormValues } from '@/lib/schemas';

export default function VentasView() {
  const { data: ventas = [], isLoading, error } = useVentas();
  const { data: clientes = [] } = useClientes();
  const { data: itemsPago = [] } = useItemsPago();
  const createPagoParcialMutation = useCreatePagoParcial();

  const [searchTerm, setSearchTerm] = useState('');
  const [searchFecha, setSearchFecha] = useState('');
  const [pagoFormOpen, setPagoFormOpen] = useState(false);
  const [selectedItemPago, setSelectedItemPago] = useState<ItemPago | null>(null);

  const handleRegistrarPago = (itemPagoId: string) => {
    const item = itemsPago.find((i) => i.id === itemPagoId);
    if (item) {
      setSelectedItemPago(item);
      setPagoFormOpen(true);
    }
  };

  const handlePagoParcialSubmit = (data: PagoParcialFormValues) => {
    if (selectedItemPago) {
      createPagoParcialMutation.mutate({
        itemPagoId: selectedItemPago.id,
        monto: data.monto,
        notas: data.notas,
      });
      setPagoFormOpen(false);
      setSelectedItemPago(null);
    }
  };

  const getClienteNombre = (clienteId?: string) => {
    if (!clienteId) return 'Venta al Paso';
    const cliente = clientes.find((c) => c.id === clienteId);
    return cliente ? `${cliente.nombre} ${cliente.apellido}` : 'Cliente desconocido';
  };

  const ventasFiltradas = useMemo(() => {
    return ventas.filter((venta) => {
      if (searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        const cliente = clientes.find((c) => c.id === venta.clienteId);
        const nombreCliente = cliente
          ? `${cliente.nombre} ${cliente.apellido}`.toLowerCase()
          : 'venta al paso';
        if (!nombreCliente.includes(term)) return false;
      }
      if (searchFecha) {
        const fechaVenta = format(new Date(venta.fecha), 'yyyy-MM-dd');
        if (fechaVenta !== searchFecha) return false;
      }
      return true;
    });
  }, [ventas, clientes, searchTerm, searchFecha]);

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
              : `${ventasFiltradas.length} de ${ventas.length} venta${ventas.length !== 1 ? 's' : ''}`}
          </CardDescription>
          <div className="flex gap-2 mt-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Input
              type="date"
              value={searchFecha}
              onChange={(e) => setSearchFecha(e.target.value)}
              className="w-45"
            />
          </div>
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
          ) : ventasFiltradas.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No se encontraron ventas para los filtros aplicados.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Estado de Pago</TableHead>
                    <TableHead>Notas</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ventasFiltradas.map((venta) => (
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
                      <TableCell>
                        <Badge variant="outline" className={
                          venta.metodoPago === 'Contado' ? 'bg-green-50' :
                          venta.metodoPago === 'Débito' ? 'bg-blue-50' :
                          'bg-amber-50'
                        }>
                          {venta.metodoPago}
                        </Badge>
                      </TableCell>
                      <TableCell>{getEstadoBadge(venta.estadoPago)}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {venta.notas || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {venta.estadoPago !== 'Pagado' && venta.itemPagoId && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRegistrarPago(venta.itemPagoId!)}
                              title="Registrar pago"
                            >
                              <CreditCard className="h-4 w-4" />
                            </Button>
                          )}
                          <Link to={`/ventas/${venta.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      <PagoParcialForm
        open={pagoFormOpen}
        onOpenChange={setPagoFormOpen}
        onSubmit={handlePagoParcialSubmit}
        itemPago={selectedItemPago}
      />
    </div>
  );
}
