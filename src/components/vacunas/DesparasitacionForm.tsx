import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { desparasitacionSchema, type DesparasitacionFormValues } from '@/lib/schemas';
import type { Desparasitacion } from '@/lib/types';
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
import { RecordatorioSection, type RecordatorioData } from '@/components/recordatorios/RecordatorioSection';

interface DesparasitacionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: DesparasitacionFormValues, recordatorioData?: RecordatorioData) => void;
  editData?: Desparasitacion;
}

export function DesparasitacionForm({
  open,
  onOpenChange,
  onSubmit,
  editData,
}: DesparasitacionFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<DesparasitacionFormValues>({
    resolver: zodResolver(desparasitacionSchema),
  });

  // Estado local para la fecha (en formato YYYY-MM-DD para el input)
  const [fechaDesparasitacion, setFechaDesparasitacion] = useState<string>('');

  // Estado para el recordatorio
  const [recordatorioData, setRecordatorioData] = useState<RecordatorioData | undefined>(undefined);

  // Cargar datos cuando se abre el formulario
  useEffect(() => {
    if (open) {
      if (editData) {
        // Modo editar - cargar datos existentes
        const fechaString = typeof editData.fecha === 'string' ? editData.fecha : editData.fecha.toISOString();
        const fechaISO = fechaString.split('T')[0];
        setFechaDesparasitacion(fechaISO);

        const [year, month, day] = fechaISO.split('-').map(Number);
        const fechaUTC = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));

        reset({
          fecha: fechaUTC,
          tipoDesparasitacion: editData.tipoDesparasitacion,
          notas: editData.notas || '',
        });
      } else {
        // Modo crear - valores por defecto (fecha de hoy)
        const hoy = new Date();
        const fechaISOHoy = hoy.toISOString().split('T')[0];
        setFechaDesparasitacion(fechaISOHoy);

        reset({
          fecha: hoy,
          tipoDesparasitacion: '',
          notas: '',
        });
      }
    }
  }, [editData, open, reset]);

  const handleFormSubmit = async (data: DesparasitacionFormValues) => {
    await onSubmit(data, recordatorioData);
    reset();
    setRecordatorioData(undefined); // Reset recordatorio
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
            {editData ? 'Editar Desparasitación' : 'Registrar Desparasitación'}
          </DialogTitle>
          <DialogDescription>
            {editData
              ? 'Modifica la información de la desparasitación'
              : 'Registra una nueva desparasitación aplicada a la mascota'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fecha">
              Fecha <span className="text-destructive">*</span>
            </Label>
            <Input
              id="fecha"
              type="date"
              value={fechaDesparasitacion}
              onChange={(e) => {
                const fechaStr = e.target.value;
                setFechaDesparasitacion(fechaStr);

                if (fechaStr) {
                  const [year, month, day] = fechaStr.split('-').map(Number);
                  const fechaUTC = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
                  setValue('fecha', fechaUTC, { shouldValidate: true });
                }
              }}
            />
            {errors.fecha && (
              <p className="text-sm text-destructive">{errors.fecha.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipoDesparasitacion">
              Tipo de Desparasitación <span className="text-destructive">*</span>
            </Label>
            <Input
              id="tipoDesparasitacion"
              {...register('tipoDesparasitacion')}
              placeholder="Ej: Interna, Externa, Pipeta Nexgard..."
              autoComplete="off"
            />
            {errors.tipoDesparasitacion && (
              <p className="text-sm text-destructive">{errors.tipoDesparasitacion.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notas">Notas (opcional)</Label>
            <Textarea
              id="notas"
              {...register('notas')}
              placeholder="Ej: Lote, laboratorio, próxima dosis..."
              rows={3}
            />
            {errors.notas && (
              <p className="text-sm text-destructive">{errors.notas.message}</p>
            )}
          </div>

          {/* Sección de recordatorio - solo en modo crear */}
          {!editData && (
            <RecordatorioSection
              checkboxLabel="Crear recordatorio para próxima desparasitación"
              tituloPlaceholder="Ej: Aplicar próxima dosis de desparasitación"
              onRecordatorioChange={setRecordatorioData}
            />
          )}

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
                : editData
                ? 'Guardar Cambios'
                : 'Registrar Desparasitación'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
