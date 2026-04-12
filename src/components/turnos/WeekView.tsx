import { addDays, startOfDay, format, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar } from 'lucide-react';
import type { Turno } from '@/lib/types';
import { TurnoCard } from './TurnoCard';

interface WeekViewProps {
  turnos: Turno[];
  onEdit: (turno: Turno) => void;
  onDelete: (turnoId: string) => void;
  onGenerarHistoria: (turno: Turno) => void;
}

export function WeekView({ turnos, onEdit, onDelete, onGenerarHistoria }: WeekViewProps) {
  const hoy = startOfDay(new Date());
  // 8 columnas: hoy + los próximos 7 días
  const days = Array.from({ length: 8 }, (_, i) => addDays(hoy, i));

  const turnosForDay = (day: Date) =>
    turnos
      .filter((t) => {
        const d = new Date(t.fechaHora);
        return (
          d.getFullYear() === day.getFullYear() &&
          d.getMonth() === day.getMonth() &&
          d.getDate() === day.getDate()
        );
      })
      .sort((a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime());

  if (turnos.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No hay turnos esta semana</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="grid grid-cols-8 gap-2 min-w-[700px]">
        {days.map((day) => {
          const dayTurnos = turnosForDay(day);
          const today = isToday(day);

          return (
            <div key={day.toISOString()} className="flex flex-col gap-2">
              {/* Encabezado del día */}
              <div
                className={`text-center py-1.5 rounded-md text-sm font-medium ${
                  today
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <div className="text-xs capitalize">
                  {format(day, 'EEE', { locale: es })}
                </div>
                <div>{day.getDate()}</div>
              </div>

              {/* Turnos del día */}
              <div className="space-y-1.5 min-h-[60px]">
                {dayTurnos.length > 0 ? (
                  dayTurnos.map((turno) => (
                    <TurnoCard
                      key={turno.id}
                      turno={turno}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onGenerarHistoria={onGenerarHistoria}
                      showTime
                    />
                  ))
                ) : (
                  <p className="text-xs text-center text-muted-foreground py-4 opacity-50">
                    Sin turnos
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
