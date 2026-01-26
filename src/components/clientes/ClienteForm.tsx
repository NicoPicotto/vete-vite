import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { clienteSchema, type ClienteFormValues } from '@/lib/schemas';
import type { Cliente } from '@/lib/types';
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

interface ClienteFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ClienteFormValues) => void;
  initialData?: Cliente;
  mode: 'create' | 'edit';
}

export function ClienteForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode,
}: ClienteFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ClienteFormValues>({
    resolver: zodResolver(clienteSchema),
    defaultValues: initialData
      ? {
          nombre: initialData.nombre,
          apellido: initialData.apellido,
          telefono: initialData.telefono,
          email: initialData.email || '',
          direccion: initialData.direccion || '',
          dniCuit: initialData.dniCuit || '',
        }
      : undefined,
  });

  const handleFormSubmit = async (data: ClienteFormValues) => {
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
            {mode === 'create' ? 'Nuevo Cliente' : 'Editar Cliente'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Ingresa los datos del nuevo cliente'
              : 'Modifica los datos del cliente'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">
                Nombre <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nombre"
                {...register('nombre')}
                placeholder="Juan"
                autoComplete="off"
              />
              {errors.nombre && (
                <p className="text-sm text-destructive">{errors.nombre.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="apellido">
                Apellido <span className="text-destructive">*</span>
              </Label>
              <Input
                id="apellido"
                {...register('apellido')}
                placeholder="Pérez"
                autoComplete="off"
              />
              {errors.apellido && (
                <p className="text-sm text-destructive">{errors.apellido.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefono">
              Teléfono <span className="text-destructive">*</span>
            </Label>
            <Input
              id="telefono"
              {...register('telefono')}
              placeholder="+54 11 1234-5678"
              autoComplete="off"
            />
            {errors.telefono && (
              <p className="text-sm text-destructive">{errors.telefono.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="juan.perez@email.com"
              autoComplete="off"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dniCuit">DNI / CUIT</Label>
            <Input
              id="dniCuit"
              {...register('dniCuit')}
              placeholder="12345678"
              autoComplete="off"
            />
            {errors.dniCuit && (
              <p className="text-sm text-destructive">{errors.dniCuit.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="direccion">Dirección</Label>
            <Textarea
              id="direccion"
              {...register('direccion')}
              placeholder="Av. Corrientes 1234, CABA"
              rows={2}
            />
            {errors.direccion && (
              <p className="text-sm text-destructive">{errors.direccion.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'Guardando...'
                : mode === 'create'
                ? 'Crear Cliente'
                : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
