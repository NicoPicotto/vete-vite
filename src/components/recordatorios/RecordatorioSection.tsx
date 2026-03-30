import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { addMonths, addYears } from 'date-fns';

export interface RecordatorioData {
  titulo: string;
  descripcion?: string;
  fechaRecordatorio: Date;
}

interface RecordatorioSectionProps {
  checkboxLabel?: string;
  tituloPlaceholder?: string;
  onRecordatorioChange: (data: RecordatorioData | undefined) => void;
}

export function RecordatorioSection({
  checkboxLabel = 'Crear recordatorio',
  tituloPlaceholder = 'Ej: Recordatorio de seguimiento',
  onRecordatorioChange,
}: RecordatorioSectionProps) {
  const [crearRecordatorio, setCrearRecordatorio] = useState(false);
  const [isCollapsibleOpen, setIsCollapsibleOpen] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState<Date>(addMonths(new Date(), 1));

  // Notificar cambios al componente padre
  const notifyChange = (
    shouldCreate: boolean,
    newTitulo: string,
    newDescripcion: string,
    newFecha: Date
  ) => {
    if (shouldCreate && newTitulo.trim()) {
      onRecordatorioChange({
        titulo: newTitulo,
        descripcion: newDescripcion || undefined,
        fechaRecordatorio: newFecha,
      });
    } else {
      onRecordatorioChange(undefined);
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    setCrearRecordatorio(checked);
    setIsCollapsibleOpen(checked);
    notifyChange(checked, titulo, descripcion, fecha);
  };

  const handleTituloChange = (newTitulo: string) => {
    setTitulo(newTitulo);
    notifyChange(crearRecordatorio, newTitulo, descripcion, fecha);
  };

  const handleDescripcionChange = (newDescripcion: string) => {
    setDescripcion(newDescripcion);
    notifyChange(crearRecordatorio, titulo, newDescripcion, fecha);
  };

  const handleFechaChange = (newFecha: Date) => {
    setFecha(newFecha);
    notifyChange(crearRecordatorio, titulo, descripcion, newFecha);
  };

  return (
    <div className="space-y-4 pt-4 border-t">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="crear-recordatorio"
          checked={crearRecordatorio}
          onCheckedChange={(checked) => handleCheckboxChange(!!checked)}
        />
        <Label
          htmlFor="crear-recordatorio"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
        >
          <Bell className="h-4 w-4" />
          {checkboxLabel}
        </Label>
      </div>

      <Collapsible open={isCollapsibleOpen} onOpenChange={setIsCollapsibleOpen}>
        <CollapsibleContent className="space-y-4 pt-2">
          {/* Título del recordatorio */}
          <div className="space-y-2">
            <Label htmlFor="recordatorio-titulo">
              Título del recordatorio <span className="text-destructive">*</span>
            </Label>
            <Input
              id="recordatorio-titulo"
              value={titulo}
              onChange={(e) => handleTituloChange(e.target.value)}
              placeholder={tituloPlaceholder}
              disabled={!crearRecordatorio}
            />
          </div>

          {/* Descripción del recordatorio */}
          <div className="space-y-2">
            <Label htmlFor="recordatorio-descripcion">Descripción (opcional)</Label>
            <Textarea
              id="recordatorio-descripcion"
              value={descripcion}
              onChange={(e) => handleDescripcionChange(e.target.value)}
              placeholder="Información adicional..."
              rows={2}
              disabled={!crearRecordatorio}
            />
          </div>

          {/* Fecha del recordatorio */}
          <div className="space-y-2">
            <Label htmlFor="recordatorio-fecha">
              Fecha del recordatorio <span className="text-destructive">*</span>
            </Label>
            <Input
              id="recordatorio-fecha"
              type="date"
              value={fecha.toISOString().split('T')[0]}
              onChange={(e) => {
                const fechaStr = e.target.value;
                if (fechaStr) {
                  const [year, month, day] = fechaStr.split('-').map(Number);
                  const fechaUTC = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
                  handleFechaChange(fechaUTC);
                }
              }}
              disabled={!crearRecordatorio}
            />

            {/* Atajos de fecha */}
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleFechaChange(addMonths(new Date(), 1))}
                disabled={!crearRecordatorio}
              >
                +1 mes
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleFechaChange(addMonths(new Date(), 3))}
                disabled={!crearRecordatorio}
              >
                +3 meses
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleFechaChange(addMonths(new Date(), 6))}
                disabled={!crearRecordatorio}
              >
                +6 meses
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleFechaChange(addYears(new Date(), 1))}
                disabled={!crearRecordatorio}
              >
                +1 año
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleFechaChange(addYears(new Date(), 2))}
                disabled={!crearRecordatorio}
              >
                +2 años
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
