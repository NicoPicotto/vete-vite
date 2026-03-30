import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { recordatorioSchema, type RecordatorioFormValues } from '@/lib/schemas';
import { useMascotasByCliente } from '@/hooks/useMascotas';
import { useCreateRecordatorio } from '@/hooks/useRecordatorios';
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
import { Calendar, Clock } from 'lucide-react';

interface RecordatorioFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clienteId: string; // Para filtrar las mascotas del cliente
  historiaClinicaId?: string; // Opcional - si viene desde historia clínica
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
  clienteId,
  historiaClinicaId,
}: RecordatorioFormProps) {
  // Hooks de datos
  const { data: mascotas = [] } = useMascotasByCliente(clienteId);
  const createRecordatorioMutation = useCreateRecordatorio();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<RecordatorioFormValues>({
    resolver: zodResolver(recordatorioSchema),
  });

  const mascotaId = watch('mascotaId');

  // Estado local para el input de fecha (en formato YYYY-MM-DD para el input HTML)
  const [fechaInput, setFechaInput] = useState<string>('');
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>('');

  useEffect(() => {
    if (open) {
      // Inicializar con fecha de hoy
      const hoy = new Date();
      const fechaISOHoy = hoy.toISOString().split('T')[0];
      setFechaInput(fechaISOHoy);

      reset({
        mascotaId: '',
        titulo: '',
        descripcion: '',
        fechaRecordatorio: hoy,
      });

      setFechaSeleccionada(
        hoy.toLocaleDateString('es-AR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      );
    }
  }, [open, reset]);

  const handleAtajoFecha = (meses: number) => {
    const nuevaFecha = new Date();
    nuevaFecha.setMonth(nuevaFecha.getMonth() + meses);

    // Actualizar el input HTML (formato YYYY-MM-DD)
    const fechaISO = nuevaFecha.toISOString().split('T')[0];
    setFechaInput(fechaISO);

    // Actualizar React Hook Form con Date UTC (mediodía para evitar problemas de timezone)
    const [year, month, day] = fechaISO.split('-').map(Number);
    const fechaUTC = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    setValue('fechaRecordatorio', fechaUTC, { shouldValidate: true });

    // Actualizar visualización legible usando fecha local parseada
    const fechaLocal = new Date(year, month - 1, day);
    setFechaSeleccionada(
      fechaLocal.toLocaleDateString('es-AR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    );
  };

  const handleFormSubmit = async (data: RecordatorioFormValues) => {
    await createRecordatorioMutation.mutateAsync({
      ...data,
      clienteId,
      historiaClinicaId,
    });
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
                  className="bg-white"
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
              value={fechaInput}
              onChange={(e) => {
                const fechaStr = e.target.value;
                setFechaInput(fechaStr);

                if (fechaStr) {
                  // Convertir a Date UTC (mediodía para evitar problemas de timezone)
                  const [year, month, day] = fechaStr.split('-').map(Number);
                  const fechaUTC = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
                  setValue('fechaRecordatorio', fechaUTC, { shouldValidate: true });

                  // Actualizar visualización legible usando la fecha local parseada
                  const fechaLocal = new Date(year, month - 1, day);
                  setFechaSeleccionada(
                    fechaLocal.toLocaleDateString('es-AR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  );
                }
              }}
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
            <Button type="submit" disabled={createRecordatorioMutation.isPending}>
              {createRecordatorioMutation.isPending ? 'Creando...' : 'Crear Recordatorio'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
