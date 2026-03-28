import { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { VentaForm } from './VentaForm';
import type { VentaFormValues } from '@/lib/schemas';

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
  // Reset cuando se cierra el dialog
  useEffect(() => {
    if (!open) {
      // El reset se maneja dentro de VentaForm
    }
  }, [open]);

  const handleSubmit = (data: VentaFormValues) => {
    onSubmit(data);
    // Cerrar dialog después de submit exitoso
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {readonlyCliente && initialClienteId
              ? 'Nueva Venta para Cliente'
              : 'Nueva Venta'}
          </DialogTitle>
          <DialogDescription>
            Registra una nueva venta de productos
          </DialogDescription>
        </DialogHeader>

        <VentaForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          initialClienteId={initialClienteId}
          readonlyCliente={readonlyCliente}
          onCancel={() => onOpenChange(false)}
          showCancelButton={true}
        />
      </DialogContent>
    </Dialog>
  );
}
