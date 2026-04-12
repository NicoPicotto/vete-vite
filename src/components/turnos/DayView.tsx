import { Calendar } from 'lucide-react';
import type { Turno } from '@/lib/types';
import { TurnoCard } from './TurnoCard';

// Slots de 30 min entre 08:00 y 21:00
const SLOTS: string[] = [];
for (let h = 8; h <= 21; h++) {
  SLOTS.push(`${h.toString().padStart(2, '0')}:00`);
  if (h < 21) SLOTS.push(`${h.toString().padStart(2, '0')}:30`);
}

interface DayViewProps {
  turnos: Turno[];
  onEdit: (turno: Turno) => void;
  onDelete: (turnoId: string) => void;
  onGenerarHistoria: (turno: Turno) => void;
}

export function DayView({ turnos, onEdit, onDelete, onGenerarHistoria }: DayViewProps) {
  if (turnos.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No hay turnos para hoy</p>
      </div>
    );
  }

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  const isCurrentSlot = (slot: string) => {
    const [h, m] = slot.split(':').map(Number);
    return currentHour === h && (currentMinute < 30 ? m === 0 : m === 30);
  };

  const turnosForSlot = (slot: string) => {
    const [h, m] = slot.split(':').map(Number);
    return turnos.filter((t) => {
      const d = new Date(t.fechaHora);
      return d.getHours() === h && d.getMinutes() === m;
    });
  };

  return (
    <div className="flex flex-col divide-y">
      {SLOTS.map((slot) => {
        const slotTurnos = turnosForSlot(slot);
        const current = isCurrentSlot(slot);
        const isEmpty = slotTurnos.length === 0;

        return (
          <div
            key={slot}
            className={`flex gap-3 px-1 py-1.5 transition-opacity ${
              current ? 'bg-primary/5' : ''
            } ${isEmpty ? 'opacity-35 hover:opacity-100' : ''}`}
          >
            <span
              className={`text-xs font-mono font-medium min-w-[40px] pt-2 shrink-0 ${
                current ? 'text-primary font-bold' : 'text-muted-foreground'
              }`}
            >
              {slot}
            </span>
            <div className="flex-1 space-y-1">
              {slotTurnos.length > 0 ? (
                slotTurnos.map((turno) => (
                  <TurnoCard
                    key={turno.id}
                    turno={turno}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onGenerarHistoria={onGenerarHistoria}
                  />
                ))
              ) : (
                <div className="h-6" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
