import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productoSchema, type ProductoFormValues } from '@/lib/schemas';
import type { Producto } from '@/lib/types';
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
import { useEffect } from 'react';

interface ProductoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ProductoFormValues) => void;
  initialData?: Producto;
  mode: 'create' | 'edit';
}

export function ProductoForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode,
}: ProductoFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<ProductoFormValues>({
    resolver: zodResolver(productoSchema),
    defaultValues: initialData
      ? {
          nombre: initialData.nombre,
          categoria: initialData.categoria,
          sku: initialData.sku || '',
          precioCosto: initialData.precioCosto,
          precioVenta: initialData.precioVenta,
          cantidadExistente: initialData.cantidadExistente,
          cantidadIdeal: initialData.cantidadIdeal,
          notas: initialData.notas || '',
        }
      : {
          nombre: '',
          categoria: 'PetShop',
          sku: '',
          precioCosto: undefined,
          precioVenta: 0,
          cantidadExistente: 0,
          cantidadIdeal: 0,
          notas: '',
        },
  });

  const categoria = watch('categoria');

  // Resetear formulario cuando cambia el modo o initialData
  useEffect(() => {
    if (initialData && mode === 'edit') {
      reset({
        nombre: initialData.nombre,
        categoria: initialData.categoria,
        sku: initialData.sku || '',
        precioCosto: initialData.precioCosto,
        precioVenta: initialData.precioVenta,
        cantidadExistente: initialData.cantidadExistente,
        cantidadIdeal: initialData.cantidadIdeal,
        notas: initialData.notas || '',
      });
    } else if (mode === 'create') {
      reset({
        nombre: '',
        categoria: 'PetShop',
        sku: '',
        precioCosto: undefined,
        precioVenta: 0,
        cantidadExistente: 0,
        cantidadIdeal: 0,
        notas: '',
      });
    }
  }, [initialData, mode, reset]);

  const handleFormSubmit = async (data: ProductoFormValues) => {
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
            {mode === 'create' ? 'Nuevo Producto' : 'Editar Producto'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Ingresa los datos del nuevo producto'
              : 'Modifica los datos del producto'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre del Producto *</Label>
            <Input
              id="nombre"
              {...register('nombre')}
              placeholder="Ej: Alimento Balanceado Pro Plan"
            />
            {errors.nombre && (
              <p className="text-sm text-red-500">{errors.nombre.message}</p>
            )}
          </div>

          {/* Categoría y SKU */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoría *</Label>
              <Select
                value={categoria}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onValueChange={(value) => setValue('categoria', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PetShop">PetShop</SelectItem>
                  <SelectItem value="Farmacia">Farmacia</SelectItem>
                  <SelectItem value="Medicina">Medicina</SelectItem>
                </SelectContent>
              </Select>
              {errors.categoria && (
                <p className="text-sm text-red-500">{errors.categoria.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">SKU (opcional)</Label>
              <Input
                id="sku"
                {...register('sku')}
                placeholder="Ej: PP-001"
              />
              {errors.sku && (
                <p className="text-sm text-red-500">{errors.sku.message}</p>
              )}
            </div>
          </div>

          {/* Precios */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="precioCosto">Precio de Costo (opcional) ($)</Label>
              <Input
                id="precioCosto"
                type="number"
                {...register('precioCosto', { valueAsNumber: true })}
                placeholder="0"
              />
              {errors.precioCosto && (
                <p className="text-sm text-red-500">{errors.precioCosto.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="precioVenta">Precio de Venta * ($)</Label>
              <Input
                id="precioVenta"
                type="number"
                {...register('precioVenta', { valueAsNumber: true })}
                placeholder="0"
              />
              {errors.precioVenta && (
                <p className="text-sm text-red-500">{errors.precioVenta.message}</p>
              )}
            </div>
          </div>

          {/* Cantidades */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cantidadExistente">Stock Actual * (unidades)</Label>
              <Input
                id="cantidadExistente"
                type="number"
                {...register('cantidadExistente', { valueAsNumber: true })}
                placeholder="0"
              />
              {errors.cantidadExistente && (
                <p className="text-sm text-red-500">{errors.cantidadExistente.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cantidadIdeal">Stock Ideal * (unidades)</Label>
              <Input
                id="cantidadIdeal"
                type="number"
                {...register('cantidadIdeal', { valueAsNumber: true })}
                placeholder="0"
              />
              {errors.cantidadIdeal && (
                <p className="text-sm text-red-500">{errors.cantidadIdeal.message}</p>
              )}
            </div>
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notas">Notas (opcional)</Label>
            <Textarea
              id="notas"
              {...register('notas')}
              placeholder="Información adicional: lote, vencimiento, proveedor, etc."
              rows={3}
            />
            {errors.notas && (
              <p className="text-sm text-red-500">{errors.notas.message}</p>
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
                ? mode === 'create'
                  ? 'Creando...'
                  : 'Guardando...'
                : mode === 'create'
                ? 'Crear Producto'
                : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
