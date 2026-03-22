import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ventaSchema, type VentaFormValues } from '@/lib/schemas';
import type { Producto } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, ShoppingCart } from 'lucide-react';
import { useClientes } from '@/hooks/useClientes';
import { useProductos } from '@/hooks/useProductos';

interface CartItem {
  producto: Producto;
  cantidad: number;
}

interface VentaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: VentaFormValues) => void;
  initialClienteId?: string;
  readonlyCliente?: boolean;
  isSubmitting?: boolean;
}

export function VentaFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialClienteId,
  readonlyCliente = false,
  isSubmitting = false,
}: VentaFormDialogProps) {
  const { data: clientes = [] } = useClientes();
  const { data: productos = [] } = useProductos();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProductoId, setSelectedProductoId] = useState('');
  const [cantidad, setCantidad] = useState(1);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<VentaFormValues>({
    resolver: zodResolver(ventaSchema),
    defaultValues: {
      clienteId: initialClienteId || '',
      fecha: new Date(),
      notas: '',
      items: [],
      pagoCompleto: false,
    },
  });

  const clienteId = watch('clienteId');
  const pagoCompleto = watch('pagoCompleto');
  const clienteActual = clientes.find((c) => c.id === clienteId);

  // Sync cart to form items whenever cart changes
  useEffect(() => {
    const items = cart.map((item) => ({
      productoId: item.producto.id,
      cantidad: item.cantidad,
      precioUnitario: item.producto.precioVenta,
    }));
    setValue('items', items);
  }, [cart, setValue]);

  // Agregar producto al carrito
  const handleAddToCart = () => {
    if (!selectedProductoId) return;

    const producto = productos.find((p) => p.id === selectedProductoId);
    if (!producto) return;

    if (cantidad > producto.cantidadExistente) {
      alert(`Stock insuficiente. Solo hay ${producto.cantidadExistente} unidades disponibles.`);
      return;
    }

    const existingItemIndex = cart.findIndex((item) => item.producto.id === producto.id);

    if (existingItemIndex >= 0) {
      const newCart = [...cart];
      const newCantidad = newCart[existingItemIndex].cantidad + cantidad;

      if (newCantidad > producto.cantidadExistente) {
        alert(`Stock insuficiente. Solo hay ${producto.cantidadExistente} unidades disponibles.`);
        return;
      }

      newCart[existingItemIndex].cantidad = newCantidad;
      setCart(newCart);
    } else {
      setCart([...cart, { producto, cantidad }]);
    }

    setSelectedProductoId('');
    setCantidad(1);
  };

  const handleRemoveFromCart = (productoId: string) => {
    setCart(cart.filter((item) => item.producto.id !== productoId));
  };

  const total = cart.reduce((acc, item) => acc + item.producto.precioVenta * item.cantidad, 0);

  const handleFormSubmit = async (data: any) => {
    if (cart.length === 0) {
      alert('Debes agregar al menos un producto a la venta.');
      return;
    }

    const items = cart.map((item) => ({
      productoId: item.producto.id,
      cantidad: item.cantidad,
      precioUnitario: item.producto.precioVenta,
    }));

    const ventaData = {
      clienteId: data.clienteId,
      fecha: data.fecha,
      notas: data.notas,
      items,
      pagoCompleto: data.pagoCompleto || false,
    };

    await onSubmit(ventaData);

    // Reset form y carrito
    reset();
    setCart([]);
    onOpenChange(false);
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      reset();
      setCart([]);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="min-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {readonlyCliente && clienteActual
              ? `Nueva Venta para ${clienteActual.nombre} ${clienteActual.apellido}`
              : 'Nueva Venta'}
          </DialogTitle>
          <DialogDescription>
            Registra una nueva venta de productos
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información de la Venta</CardTitle>
              <CardDescription>Selecciona el cliente y la fecha de la venta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Cliente */}
              <div className="space-y-2">
                <Label htmlFor="clienteId">Cliente *</Label>
                {readonlyCliente && clienteActual ? (
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-md border">
                    <span className="font-medium">
                      {clienteActual.nombre} {clienteActual.apellido}
                    </span>
                    <span className="text-muted-foreground">- {clienteActual.telefono}</span>
                  </div>
                ) : (
                  <Select value={clienteId} onValueChange={(value) => setValue('clienteId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientes.map((cliente) => (
                        <SelectItem key={cliente.id} value={cliente.id}>
                          {cliente.nombre} {cliente.apellido} - {cliente.telefono}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {errors.clienteId && (
                  <p className="text-sm text-red-500">{errors.clienteId.message}</p>
                )}
              </div>

              {/* Fecha */}
              <div className="space-y-2">
                <Label htmlFor="fecha">Fecha *</Label>
                <Input
                  id="fecha"
                  type="date"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setValue('fecha', new Date(e.target.value))}
                />
                {errors.fecha && <p className="text-sm text-red-500">{errors.fecha.message}</p>}
              </div>

              {/* Notas */}
              <div className="space-y-2">
                <Label htmlFor="notas">Notas (opcional)</Label>
                <Textarea
                  id="notas"
                  {...register('notas')}
                  placeholder="Observaciones sobre la venta"
                  rows={2}
                />
                {errors.notas && <p className="text-sm text-red-500">{errors.notas.message}</p>}
              </div>

              {/* Pago Completo */}
              <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg border">
                <Checkbox
                  id="pagoCompleto"
                  checked={pagoCompleto}
                  onCheckedChange={(checked) => setValue('pagoCompleto', checked as boolean)}
                />
                <div className="flex flex-col">
                  <Label
                    htmlFor="pagoCompleto"
                    className="cursor-pointer font-medium"
                  >
                    El cliente pagó el total en este momento
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Si está marcado, la venta se registrará como pagada completamente
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Productos de la Venta</CardTitle>
              <CardDescription>Agrega productos al carrito</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Selector de productos */}
              <div className="grid grid-cols-[1fr_100px_auto] gap-4 items-end">
                <div className="space-y-2">
                  <Label htmlFor="producto">Producto</Label>
                  <Select value={selectedProductoId} onValueChange={setSelectedProductoId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un producto" />
                    </SelectTrigger>
                    <SelectContent>
                      {productos
                        .filter((p) => p.cantidadExistente > 0)
                        .map((producto) => (
                          <SelectItem key={producto.id} value={producto.id}>
                            {producto.nombre} - ${producto.precioVenta} (Stock: {producto.cantidadExistente})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cantidad">Cantidad</Label>
                  <Input
                    id="cantidad"
                    type="number"
                    min="1"
                    value={cantidad}
                    onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
                  />
                </div>

                <Button type="button" onClick={handleAddToCart} disabled={!selectedProductoId}>
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar
                </Button>
              </div>

              {/* Carrito */}
              {cart.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>El carrito está vacío</p>
                  <p className="text-sm">Agrega productos para crear la venta</p>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead className="text-right">Precio Unit.</TableHead>
                        <TableHead className="text-center">Cantidad</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                        <TableHead className="text-right">Acción</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cart.map((item) => (
                        <TableRow key={item.producto.id}>
                          <TableCell className="font-medium">{item.producto.nombre}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.producto.categoria}</Badge>
                          </TableCell>
                          <TableCell className="text-right">${item.producto.precioVenta}</TableCell>
                          <TableCell className="text-center">{item.cantidad}</TableCell>
                          <TableCell className="text-right font-semibold">
                            ${item.producto.precioVenta * item.cantidad}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveFromCart(item.producto.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={4} className="text-right font-bold">
                          TOTAL:
                        </TableCell>
                        <TableCell className="text-right font-bold text-lg">${total}</TableCell>
                        <TableCell />
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || cart.length === 0 || !clienteId}
            >
              {isSubmitting ? 'Guardando...' : 'Registrar Venta'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
