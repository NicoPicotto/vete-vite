import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trash2, User, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';
import { useVenta, useDeleteVenta } from '@/hooks/useVentas';
import { useCliente } from '@/hooks/useClientes';
import { useProductos } from '@/hooks/useProductos';
import type { EstadoPago } from '@/lib/types';

export default function VentaDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: venta, isLoading, error } = useVenta(id || '');
  const { data: cliente } = useCliente(venta?.clienteId || '');
  const { data: productos = [] } = useProductos();
  const deleteVentaMutation = useDeleteVenta();

  // Helper para obtener nombre de producto por ID
  const getProductoNombre = (productoId: string) => {
    const producto = productos.find((p) => p.id === productoId);
    return producto ? producto.nombre : `Producto #${productoId.slice(0, 8)}...`;
  };

  const handleDelete = () => {
    if (!venta) return;

    deleteVentaMutation.mutate(venta.id, {
      onSuccess: () => {
        navigate('/ventas');
      },
    });
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
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate('/ventas')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Ventas
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-destructive mb-2">Error al cargar venta</p>
              <p className="text-sm text-muted-foreground">{(error as Error).message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading || !venta) {
    return (
      <div>
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate('/ventas')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Ventas
          </Button>
        </div>
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Button variant="ghost" onClick={() => navigate('/ventas')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Ventas
        </Button>
        <Button
          variant="destructive"
          onClick={() => setDeleteDialogOpen(true)}
          disabled={deleteVentaMutation.isPending}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Eliminar Venta
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Información de la Venta */}
        <Card>
          <CardHeader>
            <CardTitle>Información de la Venta</CardTitle>
            <CardDescription>Detalles generales</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Fecha</p>
              <p className="font-medium">
                {format(new Date(venta.fecha), "d 'de' MMMM, yyyy", { locale: es })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">${venta.total}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Estado de Pago</p>
              <div className="mt-1">{getEstadoBadge(venta.estadoPago)}</div>
            </div>
            {venta.notas && (
              <div>
                <p className="text-sm text-muted-foreground">Notas</p>
                <p className="text-sm">{venta.notas}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Información del Cliente */}
        <Card>
          <CardHeader>
            <CardTitle>Cliente</CardTitle>
            <CardDescription>Información del comprador</CardDescription>
          </CardHeader>
          <CardContent>
            {cliente ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nombre</p>
                  <p className="font-medium">
                    {cliente.nombre} {cliente.apellido}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Teléfono</p>
                  <p className="font-medium">{cliente.telefono}</p>
                </div>
                {cliente.email && (
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{cliente.email}</p>
                  </div>
                )}
                <Link to={`/clientes/${cliente.id}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    <User className="mr-2 h-4 w-4" />
                    Ver Perfil del Cliente
                  </Button>
                </Link>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Cargando información del cliente...</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Items de la Venta */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Productos Vendidos</CardTitle>
          <CardDescription>
            {venta.items?.length || 0} producto{venta.items?.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!venta.items || venta.items.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No hay items en esta venta
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-right">Precio Unitario</TableHead>
                    <TableHead className="text-center">Cantidad</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {venta.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {getProductoNombre(item.productoId)}
                      </TableCell>
                      <TableCell className="text-right">${item.precioUnitario}</TableCell>
                      <TableCell className="text-center">{item.cantidad}</TableCell>
                      <TableCell className="text-right font-semibold">
                        ${item.subtotal}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={3} className="text-right font-bold">
                      TOTAL:
                    </TableCell>
                    <TableCell className="text-right font-bold text-lg">
                      ${venta.total}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AlertDialog para confirmar eliminación */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará la venta y <strong>restaurará el stock</strong> de los
              productos. El ItemPago asociado NO se eliminará, solo se desvinculará. Esta
              acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar Venta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
