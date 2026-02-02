import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { recordatorioSchema, type RecordatorioFormValues } from '@/lib/schemas';
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
import { Calendar, Clock } from 'lucide-react';

interface RecordatorioFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: RecordatorioFormValues) => void;
  clienteId: string; // Para filtrar las mascotas del cliente
}

// Atajos de fecha
const ATAJOS_FECHA = [
  { label: '+1 mes', meses: 1 },
  { label: '+3 meses', meses: 3 },
  { label: '+6 meses', meses: 6 },
  { label: '+1 año', meses: 12 },
  { label: '+2 años', meses: 24 },
];

export function RecordatorioForm({
  open,
  onOpenChange,
  onSubmit,
  clienteId,
}: RecordatorioFormProps) {
  const { getMascotasByClienteId } = useData();
  const mascotas = getMascotasByClienteId(clienteId);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<RecordatorioFormValues>({
    resolver: zodResolver(recordatorioSchema),
  });

  const mascotaId = watch('mascotaId');
  const fechaRecordatorio = watch('fechaRecordatorio');

  // Estado local para mostrar la fecha seleccionada de forma legible
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>('');

  useEffect(() => {
    if (open) {
      reset({
        mascotaId: '',
        titulo: '',
        descripcion: '',
        fechaRecordatorio: new Date(),
      });
      setFechaSeleccionada('');
    }
  }, [open, reset]);

  // Actualizar la visualización de la fecha cuando cambia
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

  const handleAtajoFecha = (meses: number) => {
    const nuevaFecha = new Date();
    nuevaFecha.setMonth(nuevaFecha.getMonth() + meses);
    setValue('fechaRecordatorio', nuevaFecha, { shouldValidate: true });
  };

  const handleFormSubmit = async (data: RecordatorioFormValues) => {
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Nuevo Recordatorio</DialogTitle>
          <DialogDescription>
            Crea un recordatorio para seguimiento de la mascota
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Mascota Select */}
          <div className="space-y-2">
            <Label htmlFor="mascotaId">
              Mascota <span className="text-destructive">*</span>
            </Label>
            <Select
              value={mascotaId}
              onValueChange={(value) => setValue('mascotaId', value, { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una mascota" />
              </SelectTrigger>
              <SelectContent>
                {mascotas.map((mascota) => (
                  <SelectItem key={mascota.id} value={mascota.id}>
                    {mascota.nombre} ({mascota.especie} - {mascota.raza})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.mascotaId && (
              <p className="text-sm text-destructive">{errors.mascotaId.message}</p>
            )}
          </div>

          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="titulo">
              Título <span className="text-destructive">*</span>
            </Label>
            <Input
              id="titulo"
              placeholder="Ej: Vacuna anual, Control periódico, Revisión post-cirugía"
              {...register('titulo')}
            />
            {errors.titulo && (
              <p className="text-sm text-destructive">{errors.titulo.message}</p>
            )}
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción (opcional)</Label>
            <Textarea
              id="descripcion"
              placeholder="Detalles adicionales sobre el recordatorio..."
              rows={3}
              {...register('descripcion')}
            />
            {errors.descripcion && (
              <p className="text-sm text-destructive">{errors.descripcion.message}</p>
            )}
          </div>

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
                  onClick={() => handleAtajoFecha(atajo.meses)}
                >
                  {atajo.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Fecha Manual */}
          <div className="space-y-2">
            <Label htmlFor="fechaRecordatorio" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Fecha del Recordatorio <span className="text-destructive">*</span>
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleClose(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creando...' : 'Crear Recordatorio'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
