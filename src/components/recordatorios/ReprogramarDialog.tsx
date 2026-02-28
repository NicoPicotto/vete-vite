import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { reprogramarRecordatorioSchema, type ReprogramarRecordatorioFormValues } from '@/lib/schemas';
import type { Recordatorio } from '@/lib/types';
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
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ReprogramarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ReprogramarRecordatorioFormValues) => void;
  recordatorio: Recordatorio | null;
}

// Atajos de fecha
const ATAJOS_FECHA = [
  { label: '+1 semana', dias: 7 },
  { label: '+2 semanas', dias: 14 },
  { label: '+1 mes', meses: 1 },
  { label: '+2 meses', meses: 2 },
  { label: '+3 meses', meses: 3 },
];

export function ReprogramarDialog({
  open,
  onOpenChange,
  onSubmit,
  recordatorio,
}: ReprogramarDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<ReprogramarRecordatorioFormValues>({
    resolver: zodResolver(reprogramarRecordatorioSchema),
  });

  // Keep using isSubmitting from formState since this component
  // receives onSubmit as prop and handles mutation in parent

  const fechaRecordatorio = watch('fechaRecordatorio');
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>('');

  useEffect(() => {
    if (open && recordatorio) {
      reset({
        fechaRecordatorio: new Date(),
        notasReprogramacion: '',
      });
    }
  }, [open, recordatorio, reset]);

  // Actualizar visualización de fecha
  useEffect(() => {
    if (fechaRecordatorio) {
      const fecha = new Date(fechaRecordatorio);
      setFechaSeleccionada(
        fecha.toLocaleDateString('es-AR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      );
    }
  }, [fechaRecordatorio]);

  const handleAtajoFecha = (config: { dias?: number; meses?: number }) => {
    const nuevaFecha = new Date();
    if (config.dias) {
      nuevaFecha.setDate(nuevaFecha.getDate() + config.dias);
    }
    if (config.meses) {
      nuevaFecha.setMonth(nuevaFecha.getMonth() + config.meses);
    }
    setValue('fechaRecordatorio', nuevaFecha, { shouldValidate: true });
  };

  const handleFormSubmit = async (data: ReprogramarRecordatorioFormValues) => {
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

  if (!recordatorio) return null;

  const fechaOriginalDisplay = recordatorio.fechaOriginal || recordatorio.fechaRecordatorio;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Reprogramar Recordatorio</DialogTitle>
          <DialogDescription>
            Cambia la fecha del recordatorio y agrega una nota sobre la reprogramación
          </DialogDescription>
        </DialogHeader>

        {/* Información del Recordatorio */}
        <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="font-medium">{recordatorio.titulo}</p>
              {recordatorio.descripcion && (
                <p className="text-sm text-muted-foreground">{recordatorio.descripcion}</p>
              )}
            </div>
            <Badge
              variant={
                recordatorio.estado === 'Pendiente'
                  ? 'destructive'
                  : recordatorio.estado === 'Reprogramado'
                    ? 'secondary'
                    : 'default'
              }
            >
              {recordatorio.estado}
            </Badge>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t">
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Fecha Original</p>
              <p className="text-sm text-muted-foreground">
                {format(fechaOriginalDisplay, 'dd/MM/yyyy', { locale: es })}
              </p>
            </div>
          </div>

          {recordatorio.notasReprogramacion && (
            <div className="pt-2 border-t">
              <p className="text-sm font-medium">Reprogramación anterior</p>
              <p className="text-sm text-muted-foreground">{recordatorio.notasReprogramacion}</p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Atajos de Fecha */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Atajos de Fecha
            </Label>
            <div className="flex flex-wrap gap-2">
              {ATAJOS_FECHA.map((atajo) => (
                <Button
                  key={atajo.label}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAtajoFecha(atajo)}
                >
                  {atajo.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Nueva Fecha */}
          <div className="space-y-2">
            <Label htmlFor="fechaRecordatorio" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Nueva Fecha <span className="text-destructive">*</span>
            </Label>
            <Input
              id="fechaRecordatorio"
              type="date"
              {...register('fechaRecordatorio', {
                valueAsDate: true,
              })}
            />
            {errors.fechaRecordatorio && (
              <p className="text-sm text-destructive">{errors.fechaRecordatorio.message}</p>
            )}
            {fechaSeleccionada && (
              <p className="text-sm text-muted-foreground capitalize">
                📅 {fechaSeleccionada}
              </p>
            )}
          </div>

          {/* Notas de Reprogramación */}
          <div className="space-y-2">
            <Label htmlFor="notasReprogramacion">Motivo de la Reprogramación (opcional)</Label>
            <Textarea
              id="notasReprogramacion"
              placeholder="Ej: Cliente de vacaciones, Feriado, Cambio de horario..."
              rows={3}
              {...register('notasReprogramacion')}
            />
            {errors.notasReprogramacion && (
              <p className="text-sm text-destructive">{errors.notasReprogramacion.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleClose(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Reprogramando...' : 'Reprogramar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
