import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { mensajeRapidoSchema, type MensajeRapidoFormValues } from '@/lib/schemas';
import type { MensajeRapido } from '@/lib/types';
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

interface MensajeRapidoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: MensajeRapidoFormValues) => void;
  initialData?: MensajeRapido;
  mode: 'create' | 'edit';
}

export function MensajeRapidoForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode,
}: MensajeRapidoFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<MensajeRapidoFormValues>({
    resolver: zodResolver(mensajeRapidoSchema),
    defaultValues: { titulo: '', contenido: '' },
  });

  useEffect(() => {
    if (initialData && mode === 'edit') {
      reset({ titulo: initialData.titulo, contenido: initialData.contenido });
    } else if (mode === 'create') {
      reset({ titulo: '', contenido: '' });
    }
  }, [initialData, mode, reset]);

  const handleFormSubmit = async (data: MensajeRapidoFormValues) => {
    await onSubmit(data);
    reset();
  };

  const handleClose = (open: boolean) => {
    if (!open) reset();
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Nuevo Mensaje Rápido' : 'Editar Mensaje Rápido'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Guardá un mensaje para copiar con un click'
              : 'Modificá el título o el contenido del mensaje'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título *</Label>
            <Input
              id="titulo"
              {...register('titulo')}
              placeholder="Ej: Turno confirmado"
            />
            {errors.titulo && (
              <p className="text-sm text-red-500">{errors.titulo.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contenido">Mensaje *</Label>
            <Textarea
              id="contenido"
              {...register('contenido')}
              placeholder="Escribí el mensaje aquí..."
              rows={6}
            />
            {errors.contenido && (
              <p className="text-sm text-red-500">{errors.contenido.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleClose(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? mode === 'create' ? 'Creando...' : 'Guardando...'
                : mode === 'create' ? 'Crear Mensaje' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
