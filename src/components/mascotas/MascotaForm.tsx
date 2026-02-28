import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { mascotaSchema, type MascotaFormValues } from '@/lib/schemas';
import type { Mascota } from '@/lib/types';
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

interface MascotaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: MascotaFormValues) => void;
  initialData?: Mascota;
  mode: 'create' | 'edit';
}

const especies = ['Perro', 'Gato', 'Exótico', 'Ave', 'Roedor', 'Reptil', 'Otro'] as const;
const sexos = ['Macho', 'Hembra'] as const;
const estados = ['Activo', 'Fallecido'] as const;

export function MascotaForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode,
}: MascotaFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<MascotaFormValues>({
    resolver: zodResolver(mascotaSchema),
    defaultValues: initialData
      ? {
          nombre: initialData.nombre,
          especie: initialData.especie,
          raza: initialData.raza,
          fechaNacimiento: initialData.fechaNacimiento
            ? new Date(initialData.fechaNacimiento)
            : undefined,
          edad: initialData.edad || '',
          sexo: initialData.sexo,
          estado: initialData.estado,
          otrasCaracteristicas: initialData.otrasCaracteristicas || '',
        }
      : {
          nombre: '',
          raza: '',
          fechaNacimiento: undefined,
          edad: '',
          estado: 'Activo',
          otrasCaracteristicas: '',
        },
  });

  const especie = watch('especie');
  const sexo = watch('sexo');
  const estado = watch('estado');

  // Reset form cuando cambia initialData
  useEffect(() => {
    if (initialData) {
      reset({
        nombre: initialData.nombre,
        especie: initialData.especie,
        raza: initialData.raza,
        fechaNacimiento: initialData.fechaNacimiento
          ? new Date(initialData.fechaNacimiento)
          : undefined,
        edad: initialData.edad || '',
        sexo: initialData.sexo,
        estado: initialData.estado,
        otrasCaracteristicas: initialData.otrasCaracteristicas || '',
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = async (data: MascotaFormValues) => {
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Nueva Mascota' : 'Editar Mascota'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Ingresa los datos de la nueva mascota'
              : 'Modifica los datos de la mascota'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">
              Nombre <span className="text-destructive">*</span>
            </Label>
            <Input
              id="nombre"
              {...register('nombre')}
              placeholder="Max"
              autoComplete="off"
            />
            {errors.nombre && (
              <p className="text-sm text-destructive">{errors.nombre.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="especie">
                Especie <span className="text-destructive">*</span>
              </Label>
              <Select
                value={especie}
                onValueChange={(value) =>
                  setValue('especie', value as (typeof especies)[number], {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona especie" />
                </SelectTrigger>
                <SelectContent>
                  {especies.map((esp) => (
                    <SelectItem key={esp} value={esp}>
                      {esp}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.especie && (
                <p className="text-sm text-destructive">{errors.especie.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="raza">
                Raza <span className="text-destructive">*</span>
              </Label>
              <Input
                id="raza"
                {...register('raza')}
                placeholder="Golden Retriever"
                autoComplete="off"
              />
              {errors.raza && (
                <p className="text-sm text-destructive">{errors.raza.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sexo">
                Sexo <span className="text-destructive">*</span>
              </Label>
              <Select
                value={sexo}
                onValueChange={(value) =>
                  setValue('sexo', value as (typeof sexos)[number], {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona sexo" />
                </SelectTrigger>
                <SelectContent>
                  {sexos.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.sexo && (
                <p className="text-sm text-destructive">{errors.sexo.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edad">Edad</Label>
              <Input
                id="edad"
                {...register('edad')}
                placeholder="3 años"
                autoComplete="off"
              />
              {errors.edad && (
                <p className="text-sm text-destructive">{errors.edad.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="estado">Estado</Label>
            <Select
              value={estado}
              onValueChange={(value) =>
                setValue('estado', value as (typeof estados)[number], {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {estados.map((est) => (
                  <SelectItem key={est} value={est}>
                    {est}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.estado && (
              <p className="text-sm text-destructive">{errors.estado.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="otrasCaracteristicas">Otras Características</Label>
            <Textarea
              id="otrasCaracteristicas"
              {...register('otrasCaracteristicas')}
              placeholder="Ej: Muy activo, le gusta nadar, asustadizo con extraños..."
              rows={3}
            />
            {errors.otrasCaracteristicas && (
              <p className="text-sm text-destructive">
                {errors.otrasCaracteristicas.message}
              </p>
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
                ? 'Crear Mascota'
                : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
