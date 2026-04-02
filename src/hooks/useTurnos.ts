import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllTurnos,
  getTurnoById,
  createTurno,
  updateTurno,
  updateEstadoTurno,
  deleteTurno,
  checkDisponibilidadSlot,
} from '@/services/turnos.service';
import type { TurnoFormValues } from '@/lib/schemas';
import type { Turno } from '@/lib/types';
import { toast } from 'sonner';

// ============================================
// QUERIES
// ============================================

export const useTurnos = () => {
  return useQuery({
    queryKey: ['turnos'],
    queryFn: getAllTurnos,
  });
};

export const useTurno = (id: string) => {
  return useQuery({
    queryKey: ['turno', id],
    queryFn: () => getTurnoById(id),
    enabled: !!id,
  });
};

/**
 * Verifica si un slot de fecha+hora ya está ocupado.
 * Solo hace la query cuando fecha y hora están definidos.
 */
export const useCheckDisponibilidad = (fecha: string, hora: string, excludeId?: string) => {
  return useQuery({
    queryKey: ['turnos', 'disponibilidad', fecha, hora, excludeId],
    queryFn: () => checkDisponibilidadSlot(fecha, hora, excludeId),
    enabled: !!fecha && !!hora,
    staleTime: 10_000, // 10 segundos de cache para no spamear la DB
  });
};

// ============================================
// MUTATIONS
// ============================================

export const useCreateTurno = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TurnoFormValues) => createTurno(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turnos'] });
      toast.success('Turno creado exitosamente');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al crear turno');
    },
  });
};

export const useUpdateTurno = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TurnoFormValues> }) =>
      updateTurno(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turnos'] });
      toast.success('Turno actualizado exitosamente');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al actualizar turno');
    },
  });
};

export const useUpdateEstadoTurno = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: Turno['estado'] }) =>
      updateEstadoTurno(id, estado),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turnos'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al actualizar estado del turno');
    },
  });
};

export const useDeleteTurno = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTurno(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turnos'] });
      toast.success('Turno eliminado');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al eliminar turno');
    },
  });
};
