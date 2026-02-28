import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { pagoParcialSchema, type PagoParcialFormValues } from '@/lib/schemas';
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
import { Badge } from '@/components/ui/badge';

interface PagoParcialFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: PagoParcialFormValues) => void;
  itemPago: ItemPago | null;
}

export function PagoParcialForm({
  open,
  onOpenChange,
  onSubmit,
  itemPago,
}: PagoParcialFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PagoParcialFormValues>({
    resolver: zodResolver(pagoParcialSchema),
  });

  // Reset form cuando se abre el dialog
  useEffect(() => {
    if (open) {
      reset({
        monto: 0,
        fecha: new Date(),
        notas: '',
      });
    }
  }, [open, reset]);

  const handleFormSubmit = async (data: PagoParcialFormValues) => {
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

  if (!itemPago) return null;

  const saldoPendiente = itemPago.monto - itemPago.montoPagado;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Registrar Pago</DialogTitle>
          <DialogDescription>
            Registra un pago parcial o total para este item
          </DialogDescription>
        </DialogHeader>

        {/* Información del Item */}
        <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-sm font-medium">Descripción</p>
              <p className="text-sm text-muted-foreground">{itemPago.descripcion}</p>
            </div>
            <Badge
              variant={
                itemPago.estado === 'Pagado'
                  ? 'default'
                  : itemPago.estado === 'Pagado Parcial'
                    ? 'secondary'
                    : 'destructive'
              }
            >
              {itemPago.estado}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <p className="text-sm font-medium">Monto Total</p>
              <p className="text-lg font-bold">${Math.round(itemPago.monto).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Pagado</p>
              <p className="text-lg font-bold text-green-600">
                ${Math.round(itemPago.montoPagado).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t">
            <p className="text-sm font-medium">Saldo Pendiente</p>
            <p className="text-2xl font-bold text-destructive">
              ${Math.round(saldoPendiente).toLocaleString()}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Monto del Pago */}
          <div className="space-y-2">
            <Label htmlFor="monto">
              Monto del Pago <span className="text-destructive">*</span>
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
            <p className="text-xs text-muted-foreground">
              Máximo: ${Math.round(saldoPendiente).toLocaleString()}
            </p>
          </div>

          {/* Fecha del Pago */}
          <div className="space-y-2">
            <Label htmlFor="fecha">
              Fecha del Pago <span className="text-destructive">*</span>
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

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notas">Notas (opcional)</Label>
            <Textarea
              id="notas"
              placeholder="Método de pago, observaciones, etc."
              {...register('notas')}
            />
            {errors.notas && (
              <p className="text-sm text-destructive">{errors.notas.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleClose(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Registrando...' : 'Registrar Pago'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
