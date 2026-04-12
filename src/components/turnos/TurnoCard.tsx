import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ClipboardPlus, Edit, Trash2 } from 'lucide-react';
import type { Turno } from '@/lib/types';

interface TurnoCardProps {
  turno: Turno;
  onEdit: (turno: Turno) => void;
  onDelete: (turnoId: string) => void;
  onGenerarHistoria: (turno: Turno) => void;
  showTime?: boolean;
}

const getBadgeEstado = (estado: Turno['estado']) => {
  switch (estado) {
    case 'Confirmado':
      return 'default';
    case 'Completado':
      return 'secondary';
    case 'Cancelado':
    case 'No se presentó':
      return 'outline';
    default:
      return 'destructive'; // Pendiente
  }
};

export function TurnoCard({
  turno,
  onEdit,
  onDelete,
  onGenerarHistoria,
  showTime = false,
}: TurnoCardProps) {
  const puedeGenerarHistoria =
    !!turno.mascotaId &&
    turno.estado !== 'Cancelado' &&
    turno.estado !== 'No se presentó';

  const d = new Date(turno.fechaHora);
  const horaStr = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;

  return (
    <div className="group flex items-start gap-2 p-2 rounded-md border bg-card hover:bg-accent/30 transition-colors">
      {showTime && (
        <span className="text-xs font-mono font-medium text-muted-foreground pt-0.5 min-w-[36px] shrink-0">
          {horaStr}
        </span>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-medium text-sm truncate">
            {turno.clienteNombre} {turno.clienteApellido}
          </span>
          <Badge
            variant={turno.tipo === 'Consulta' ? 'default' : 'secondary'}
            className="text-xs h-4 px-1"
          >
            {turno.tipo}
          </Badge>
          <Badge variant={getBadgeEstado(turno.estado)} className="text-xs h-4 px-1">
            {turno.estado}
          </Badge>
        </div>
        {turno.mascotaNombre && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {turno.mascotaNombre} · {turno.mascotaEspecie}
          </p>
        )}
        {turno.notas && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{turno.notas}</p>
        )}
      </div>
      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        {puedeGenerarHistoria && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            title="Generar Historia Clínica"
            onClick={() => onGenerarHistoria(turno)}
          >
            <ClipboardPlus className="h-3 w-3 text-green-600" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          title="Editar"
          onClick={() => onEdit(turno)}
        >
          <Edit className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          title="Eliminar"
          onClick={() => onDelete(turno.id)}
        >
          <Trash2 className="h-3 w-3 text-destructive" />
        </Button>
      </div>
    </div>
  );
}
