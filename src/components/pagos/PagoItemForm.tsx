import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { itemPagoSchema, type ItemPagoFormValues } from '@/lib/schemas';
import type { ItemPago } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { useData } from '@/context/DataContext';

interface PagoItemFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ItemPagoFormValues) => void;
  initialData?: ItemPago;
  mode: 'create' | 'edit';
  clienteId?: string; // Si se provee, se pre-asigna y oculta el select
}

export function PagoItemForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode,
  clienteId: propClienteId,
}: PagoItemFormProps) {
  const { clientes, getClienteById } = useData();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<ItemPagoFormValues>({
    resolver: zodResolver(itemPagoSchema),
  });

  const clienteId = watch('clienteId');

  // Reset form cuando cambia initialData o mode
  useEffect(() => {
    if (initialData && mode === 'edit') {
      reset({
        clienteId: initialData.clienteId,
        descripcion: initialData.descripcion,
        monto: initialData.monto,
        fecha: initialData.fecha,
        entregaInicial: 0,
      });
    } else if (mode === 'create') {
      reset({
        clienteId: propClienteId || '',
        descripcion: '',
        monto: 0,
        fecha: new Date(),
        entregaInicial: 0,
      });
    }
  }, [initialData, mode, reset, propClienteId]);

  const handleFormSubmit = async (data: ItemPagoFormValues) => {
    await onSubmit(data);
    reset();
    onOpenChange(false);
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      reset();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Nuevo Item de Pago' : 'Editar Item de Pago'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Registra un nuevo pago o deuda para un cliente'
              : 'Modifica los datos del item de pago'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Cliente Select o Info */}
          {propClienteId ? (
            <div className="space-y-2">
              <Label>Cliente</Label>
              <div className="rounded-md border bg-muted px-3 py-2">
                <span className="font-medium">
                  {(() => {
                    const cliente = getClienteById(propClienteId);
                    return cliente ? `${cliente.nombre} ${cliente.apellido}` : 'Cliente';
                  })()}
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="clienteId">
                Cliente <span className="text-destructive">*</span>
              </Label>
              <Select
                value={clienteId}
                onValueChange={(value) => setValue('clienteId', value, { shouldValidate: true })}
                disabled={mode === 'edit'}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.nombre} {cliente.apellido}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.clienteId && (
                <p className="text-sm text-destructive">{errors.clienteId.message}</p>
              )}
            </div>
          )}

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="descripcion">
              Descripción <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="descripcion"
              placeholder="Ej: Consulta veterinaria, Vacunas, Cirugía..."
              {...register('descripcion')}
            />
            {errors.descripcion && (
              <p className="text-sm text-destructive">{errors.descripcion.message}</p>
            )}
          </div>

          {/* Monto */}
          <div className="space-y-2">
            <Label htmlFor="monto">
              Monto <span className="text-destructive">*</span>
            </Label>
            <Input
              id="monto"
              type="number"
              step="1"
              placeholder="0"
              {...register('monto', { valueAsNumber: true })}
            />
            {errors.monto && (
              <p className="text-sm text-destructive">{errors.monto.message}</p>
            )}
          </div>

          {/* Fecha */}
          <div className="space-y-2">
            <Label htmlFor="fecha">
              Fecha <span className="text-destructive">*</span>
            </Label>
            <Input
              id="fecha"
              type="date"
              {...register('fecha', {
                valueAsDate: true,
              })}
            />
            {errors.fecha && (
              <p className="text-sm text-destructive">{errors.fecha.message}</p>
            )}
          </div>

          {/* Entrega Inicial - Solo en modo crear */}
          {mode === 'create' && (
            <div className="space-y-2">
              <Label htmlFor="entregaInicial">Entrega / Pago Inicial (opcional)</Label>
              <Input
                id="entregaInicial"
                type="number"
                step="1"
                placeholder="0"
                {...register('entregaInicial', { valueAsNumber: true })}
              />
              {errors.entregaInicial && (
                <p className="text-sm text-destructive">{errors.entregaInicial.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Si el cliente paga en el momento, ingresa el monto aquí
              </p>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleClose(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : mode === 'create' ? 'Crear' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
