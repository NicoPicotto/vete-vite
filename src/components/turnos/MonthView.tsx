import { useState } from 'react';
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  format,
  isSameMonth,
  isToday,
  isSameDay,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Turno } from '@/lib/types';
import { TurnoCard } from './TurnoCard';

interface MonthViewProps {
  turnos: Turno[];
  onEdit: (turno: Turno) => void;
  onDelete: (turnoId: string) => void;
  onGenerarHistoria: (turno: Turno) => void;
}

const WEEK_DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

// Colores de punto según estado del turno
const dotColor = (estado: Turno['estado']) => {
  if (estado === 'Completado') return 'bg-green-500';
  if (estado === 'Cancelado' || estado === 'No se presentó') return 'bg-muted-foreground/50';
  return 'bg-primary';
};

export function MonthView({ turnos, onEdit, onDelete, onGenerarHistoria }: MonthViewProps) {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  // La grilla empieza el lunes anterior (o el mismo lunes) al primer día del mes
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  // Armar array de semanas
  const weeks: Date[][] = [];
  let day = calStart;
  while (day <= calEnd) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(day);
      day = addDays(day, 1);
    }
    weeks.push(week);
  }

  const turnosForDay = (date: Date) =>
    turnos.filter((t) => isSameDay(new Date(t.fechaHora), date));

  const selectedTurnos = turnosForDay(selectedDate).sort(
    (a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime()
  );

  return (
    <div className="space-y-5">
      {/* Navegación del mes */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-sm font-semibold capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: es })}
        </h3>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Grilla del calendario */}
      <div>
        {/* Cabecera días de semana */}
        <div className="grid grid-cols-7 mb-1">
          {WEEK_DAYS.map((d) => (
            <div
              key={d}
              className="text-xs font-medium text-muted-foreground text-center py-1"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Semanas */}
        <div className="border rounded-md overflow-hidden">
          {weeks.map((week, wi) => (
            <div
              key={wi}
              className={`grid grid-cols-7 ${wi < weeks.length - 1 ? 'border-b' : ''}`}
            >
              {week.map((date, di) => {
                const dayTurnos = turnosForDay(date);
                const inCurrentMonth = isSameMonth(date, currentMonth);
                const isSelected = isSameDay(date, selectedDate);
                const isCurrentDay = isToday(date);

                return (
                  <button
                    key={di}
                    onClick={() => setSelectedDate(date)}
                    className={`relative p-1.5 min-h-[56px] text-left transition-colors border-r last:border-r-0 ${
                      isSelected ? 'bg-primary/10' : 'hover:bg-muted/50'
                    } ${!inCurrentMonth ? 'opacity-30' : ''}`}
                  >
                    <span
                      className={`text-xs font-medium inline-flex items-center justify-center w-5 h-5 rounded-full ${
                        isCurrentDay
                          ? 'bg-primary text-primary-foreground'
                          : 'text-foreground'
                      }`}
                    >
                      {date.getDate()}
                    </span>

                    {/* Puntos de turnos */}
                    {dayTurnos.length > 0 && (
                      <div className="mt-1 flex gap-0.5 flex-wrap items-center">
                        {dayTurnos.slice(0, 4).map((t) => (
                          <span
                            key={t.id}
                            className={`inline-block w-1.5 h-1.5 rounded-full ${dotColor(t.estado)}`}
                          />
                        ))}
                        {dayTurnos.length > 4 && (
                          <span className="text-[9px] text-muted-foreground leading-none">
                            +{dayTurnos.length - 4}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Turnos del día seleccionado */}
      <div>
        <h4 className="text-sm font-medium mb-3 capitalize">
          {isToday(selectedDate)
            ? 'Hoy'
            : format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
          {selectedTurnos.length > 0 && (
            <span className="ml-2 text-muted-foreground font-normal">
              ({selectedTurnos.length} turno{selectedTurnos.length !== 1 ? 's' : ''})
            </span>
          )}
        </h4>

        {selectedTurnos.length > 0 ? (
          <div className="space-y-2">
            {selectedTurnos.map((turno) => (
              <TurnoCard
                key={turno.id}
                turno={turno}
                onEdit={onEdit}
                onDelete={onDelete}
                onGenerarHistoria={onGenerarHistoria}
                showTime
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground text-sm">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-40" />
            No hay turnos para este día
          </div>
        )}
      </div>
    </div>
  );
}
