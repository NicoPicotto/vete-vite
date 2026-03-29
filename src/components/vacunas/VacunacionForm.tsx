import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { vacunacionSchema, type VacunacionFormValues } from '@/lib/schemas';
import type { Vacunacion } from '@/lib/types';
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

interface VacunacionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: VacunacionFormValues) => void;
  editData?: Vacunacion;
}

export function VacunacionForm({
  open,
  onOpenChange,
  onSubmit,
  editData,
}: VacunacionFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<VacunacionFormValues>({
    resolver: zodResolver(vacunacionSchema),
  });

  // Estado local para la fecha (en formato YYYY-MM-DD para el input)
  const [fechaVacuna, setFechaVacuna] = useState<string>('');

  // Cargar datos cuando se abre el formulario
  useEffect(() => {
    if (open) {
      if (editData) {
        // Modo editar - cargar datos existentes
        const fechaString = typeof editData.fecha === 'string' ? editData.fecha : editData.fecha.toISOString();
        const fechaISO = fechaString.split('T')[0];
        setFechaVacuna(fechaISO);

        const [year, month, day] = fechaISO.split('-').map(Number);
        const fechaUTC = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));

        reset({
          fecha: fechaUTC,
          tipoVacuna: editData.tipoVacuna,
          notas: editData.notas || '',
        });
      } else {
        // Modo crear - valores por defecto (fecha de hoy)
        const hoy = new Date();
        const fechaISOHoy = hoy.toISOString().split('T')[0];
        setFechaVacuna(fechaISOHoy);

        reset({
          fecha: hoy,
          tipoVacuna: '',
          notas: '',
        });
      }
    }
  }, [editData, open, reset]);

  const handleFormSubmit = async (data: VacunacionFormValues) => {
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
            {editData ? 'Editar Vacunación' : 'Registrar Vacunación'}
          </DialogTitle>
          <DialogDescription>
            {editData
              ? 'Modifica la información de la vacunación'
              : 'Registra una nueva vacuna aplicada a la mascota'}
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
              value={fechaVacuna}
              onChange={(e) => {
                const fechaStr = e.target.value;
                setFechaVacuna(fechaStr);

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
            <Label htmlFor="tipoVacuna">
              Tipo de Vacuna <span className="text-destructive">*</span>
            </Label>
            <Input
              id="tipoVacuna"
              {...register('tipoVacuna')}
              placeholder="Ej: Antirrábica, Séxtuple, Triple Felina..."
              autoComplete="off"
            />
            {errors.tipoVacuna && (
              <p className="text-sm text-destructive">{errors.tipoVacuna.message}</p>
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
                : 'Registrar Vacunación'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
