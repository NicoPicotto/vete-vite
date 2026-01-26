import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { historiaClinicaSchema, type HistoriaClinicaFormValues } from '@/lib/schemas';
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
import { useEffect } from 'react';
import type { HistoriaClinica } from '@/lib/types';

interface HistoriaClinicaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: HistoriaClinicaFormValues) => void;
  editData?: HistoriaClinica;
}

export function HistoriaClinicaForm({
  open,
  onOpenChange,
  onSubmit,
  editData,
}: HistoriaClinicaFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<HistoriaClinicaFormValues>({
    resolver: zodResolver(historiaClinicaSchema),
  });

  // Cargar datos cuando se abre el formulario
  useEffect(() => {
    if (open) {
      if (editData) {
        // Modo editar - cargar datos existentes
        reset({
          motivoConsulta: editData.motivoConsulta,
          diagnostico: editData.diagnostico,
          tratamiento: editData.tratamiento,
          peso: editData.peso,
          temperatura: editData.temperatura,
          veterinario: editData.veterinario,
          notas: editData.notas,
        });
      } else {
        // Modo crear - valores por defecto limpios
        reset({
          motivoConsulta: '',
          diagnostico: '',
          tratamiento: '',
          peso: undefined,
          temperatura: undefined,
          veterinario: '',
          notas: '',
        });
      }
    }
  }, [editData, open, reset]);

  const handleFormSubmit = async (data: HistoriaClinicaFormValues) => {
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
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editData ? 'Editar Consulta' : 'Nueva Consulta'}</DialogTitle>
          <DialogDescription>
            {editData
              ? 'Modifica la información de la consulta'
              : 'Registra una nueva consulta en la historia clínica'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="motivoConsulta">
              Motivo de Consulta <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="motivoConsulta"
              {...register('motivoConsulta')}
              placeholder="Ej: Control anual, vacunación, síntomas de enfermedad..."
              rows={2}
            />
            {errors.motivoConsulta && (
              <p className="text-sm text-destructive">{errors.motivoConsulta.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="diagnostico">
              Diagnóstico <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="diagnostico"
              {...register('diagnostico')}
              placeholder="Ej: Estado general excelente, leve sobrepeso, infección..."
              rows={3}
            />
            {errors.diagnostico && (
              <p className="text-sm text-destructive">{errors.diagnostico.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tratamiento">
              Tratamiento <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="tratamiento"
              {...register('tratamiento')}
              placeholder="Ej: Vacuna antirrábica, medicación, dieta especial..."
              rows={3}
            />
            {errors.tratamiento && (
              <p className="text-sm text-destructive">{errors.tratamiento.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="peso">Peso (kg)</Label>
              <Input
                id="peso"
                type="number"
                step="0.1"
                {...register('peso', { valueAsNumber: true })}
                placeholder="Ej: 12.5"
              />
              {errors.peso && (
                <p className="text-sm text-destructive">{errors.peso.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="temperatura">Temperatura (°C)</Label>
              <Input
                id="temperatura"
                type="number"
                step="0.1"
                {...register('temperatura', { valueAsNumber: true })}
                placeholder="Ej: 38.5"
              />
              {errors.temperatura && (
                <p className="text-sm text-destructive">{errors.temperatura.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="veterinario">Veterinario</Label>
            <Input
              id="veterinario"
              {...register('veterinario')}
              placeholder="Nombre del profesional"
            />
            {errors.veterinario && (
              <p className="text-sm text-destructive">{errors.veterinario.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notas">Notas Adicionales</Label>
            <Textarea
              id="notas"
              {...register('notas')}
              placeholder="Observaciones, recomendaciones..."
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
              {isSubmitting ? 'Guardando...' : editData ? 'Actualizar Consulta' : 'Guardar Consulta'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
