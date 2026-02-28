import { useState, useEffect } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Bell, Calendar, Clock, ChevronDown } from 'lucide-react';
import type { HistoriaClinica } from '@/lib/types';

export interface RecordatorioData {
  titulo: string;
  descripcion?: string;
  fechaRecordatorio: Date;
}

interface HistoriaClinicaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: HistoriaClinicaFormValues, recordatorioData?: RecordatorioData) => void;
  editData?: HistoriaClinica;
}

// Atajos de fecha para recordatorios
const ATAJOS_FECHA = [
  { label: '+1 mes', meses: 1 },
  { label: '+3 meses', meses: 3 },
  { label: '+6 meses', meses: 6 },
  { label: '+1 año', meses: 12 },
  { label: '+2 años', meses: 24 },
];

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
    setValue,
  } = useForm<HistoriaClinicaFormValues>({
    resolver: zodResolver(historiaClinicaSchema),
  });

  // Estado para el recordatorio
  const [crearRecordatorio, setCrearRecordatorio] = useState(false);
  const [isCollapsibleOpen, setIsCollapsibleOpen] = useState(false);
  const [recordatorioTitulo, setRecordatorioTitulo] = useState('');
  const [recordatorioDescripcion, setRecordatorioDescripcion] = useState('');
  const [recordatorioFecha, setRecordatorioFecha] = useState<Date>(new Date());
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>('');

  // Estado local para la fecha de la consulta (en formato YYYY-MM-DD para el input)
  const [fechaConsulta, setFechaConsulta] = useState<string>('');

  // Cargar datos cuando se abre el formulario
  useEffect(() => {
    if (open) {
      if (editData) {
        // Modo editar - cargar datos existentes
        // Extraer la fecha en formato ISO (YYYY-MM-DD)
        const fechaString = typeof editData.fecha === 'string' ? editData.fecha : editData.fecha.toISOString();
        const fechaISO = fechaString.split('T')[0]; // "2026-02-25"

        // Setear la fecha en el estado local (formato YYYY-MM-DD para el input)
        setFechaConsulta(fechaISO);

        const [year, month, day] = fechaISO.split('-').map(Number);
        const fechaUTC = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));

        reset({
          fecha: fechaUTC,
          motivoConsulta: editData.motivoConsulta,
          diagnostico: editData.diagnostico,
          tratamiento: editData.tratamiento,
          peso: editData.peso,
          temperatura: editData.temperatura,
          veterinario: editData.veterinario,
          notas: editData.notas,
        });
      } else {
        // Modo crear - valores por defecto limpios (fecha de hoy)
        const hoy = new Date();
        const fechaISOHoy = hoy.toISOString().split('T')[0];
        setFechaConsulta(fechaISOHoy);

        reset({
          fecha: hoy,
          motivoConsulta: '',
          diagnostico: '',
          tratamiento: '',
          peso: undefined,
          temperatura: undefined,
          veterinario: '',
          notas: '',
        });
        // Resetear recordatorio
        setRecordatorioTitulo('');
        setRecordatorioDescripcion('');
        const fechaInicial = new Date();
        fechaInicial.setMonth(fechaInicial.getMonth() + 3); // Default +3 meses
        setRecordatorioFecha(fechaInicial);
      }
      // Resetear estado de recordatorio
      setCrearRecordatorio(false);
      setIsCollapsibleOpen(false);
    }
  }, [editData, open, reset]);

  // Actualizar visualización de fecha del recordatorio
  useEffect(() => {
    if (recordatorioFecha) {
      setFechaSeleccionada(
        recordatorioFecha.toLocaleDateString('es-AR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      );
    }
  }, [recordatorioFecha]);

  // Handler para atajos de fecha
  const handleAtajoFecha = (meses: number) => {
    const nuevaFecha = new Date();
    nuevaFecha.setMonth(nuevaFecha.getMonth() + meses);
    setRecordatorioFecha(nuevaFecha);
  };

  // Handler para checkbox
  const handleCheckboxChange = (checked: boolean) => {
    setCrearRecordatorio(checked);
    setIsCollapsibleOpen(checked);
  };

  const handleFormSubmit = async (data: HistoriaClinicaFormValues) => {
    // Pasar datos del recordatorio si está habilitado
    const recordatorioData: RecordatorioData | undefined = crearRecordatorio
      ? {
          titulo: recordatorioTitulo,
          descripcion: recordatorioDescripcion,
          fechaRecordatorio: recordatorioFecha,
        }
      : undefined;

    await onSubmit(data, recordatorioData);
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
            <Label htmlFor="fecha">
              Fecha de la Consulta <span className="text-destructive">*</span>
            </Label>
            <Input
              id="fecha"
              type="date"
              value={fechaConsulta}
              onChange={(e) => {
                const fechaStr = e.target.value; // "2026-02-25"
                setFechaConsulta(fechaStr);

                // Convertir a Date y actualizar el formulario
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

          {/* Sección de Recordatorio - Solo en modo crear */}
          {!editData && (
            <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="crearRecordatorio"
                  checked={crearRecordatorio}
                  onCheckedChange={handleCheckboxChange}
                />
                <Label
                  htmlFor="crearRecordatorio"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2 cursor-pointer"
                >
                  <Bell className="h-4 w-4" />
                  Crear recordatorio para seguimiento
                </Label>
              </div>

              <Collapsible open={isCollapsibleOpen} onOpenChange={setIsCollapsibleOpen}>
                <CollapsibleTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 w-full justify-between p-2"
                    disabled={!crearRecordatorio}
                  >
                    <span className="text-sm font-medium">
                      {crearRecordatorio ? 'Configurar recordatorio' : 'Habilita la opción para configurar'}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </CollapsibleTrigger>

                <CollapsibleContent className="space-y-4 pt-2">
                  {/* Título del Recordatorio */}
                  <div className="space-y-2">
                    <Label htmlFor="recordatorioTitulo">
                      Título del Recordatorio <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="recordatorioTitulo"
                      value={recordatorioTitulo}
                      onChange={(e) => setRecordatorioTitulo(e.target.value)}
                      placeholder="Ej: Próxima vacuna, Control post-tratamiento..."
                      disabled={!crearRecordatorio}
                    />
                  </div>

                  {/* Descripción del Recordatorio */}
                  <div className="space-y-2">
                    <Label htmlFor="recordatorioDescripcion">Descripción (opcional)</Label>
                    <Textarea
                      id="recordatorioDescripcion"
                      value={recordatorioDescripcion}
                      onChange={(e) => setRecordatorioDescripcion(e.target.value)}
                      placeholder="Detalles adicionales del recordatorio..."
                      rows={2}
                      disabled={!crearRecordatorio}
                    />
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
                          disabled={!crearRecordatorio}
                        >
                          {atajo.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Fecha del Recordatorio */}
                  <div className="space-y-2">
                    <Label htmlFor="recordatorioFecha" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Fecha del Recordatorio <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="recordatorioFecha"
                      type="date"
                      value={recordatorioFecha.toISOString().split('T')[0]}
                      onChange={(e) => setRecordatorioFecha(new Date(e.target.value))}
                      disabled={!crearRecordatorio}
                    />
                    {fechaSeleccionada && crearRecordatorio && (
                      <p className="text-sm text-muted-foreground capitalize">
                        {fechaSeleccionada}
                      </p>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
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
              {isSubmitting ? 'Guardando...' : editData ? 'Actualizar Consulta' : 'Guardar Consulta'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
