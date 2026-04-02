import { useState, useMemo } from 'react';
import {
  useTurnos,
  useCreateTurno,
  useUpdateTurno,
  useUpdateEstadoTurno,
  useDeleteTurno,
} from '@/hooks/useTurnos';
import { useCreateHistoriaClinica } from '@/hooks/useHistoriaClinica';
import { useCreateRecordatorio } from '@/hooks/useRecordatorios';
import { uploadArchivoHistoriaClinica } from '@/services/storage.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Calendar,
  ClipboardPlus,
  Edit,
  Loader2,
  Plus,
  Trash2,
} from 'lucide-react';
import { format, isToday, startOfDay, endOfDay, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { TurnoFormDialog } from '@/components/turnos/TurnoFormDialog';
import { HistoriaClinicaForm, type RecordatorioData } from '@/components/historia/HistoriaClinicaForm';
import type { Turno } from '@/lib/types';
import type { TurnoFormValues, HistoriaClinicaFormValues } from '@/lib/schemas';
import { toast } from 'sonner';

export default function TurnosView() {
  const { data: turnos = [], isLoading } = useTurnos();

  const createTurnoMutation = useCreateTurno();
  const updateTurnoMutation = useUpdateTurno();
  const updateEstadoMutation = useUpdateEstadoTurno();
  const deleteTurnoMutation = useDeleteTurno();
  const createHistoriaMutation = useCreateHistoriaClinica();
  const createRecordatorioMutation = useCreateRecordatorio();

  const [isTurnoFormOpen, setIsTurnoFormOpen] = useState(false);
  const [editingTurno, setEditingTurno] = useState<Turno | undefined>();
  const [deletingTurnoId, setDeletingTurnoId] = useState<string | null>(null);

  // Estado para el modal de Historia Clínica
  const [historiaFormTurno, setHistoriaFormTurno] = useState<Turno | null>(null);

  // ============================================
  // FILTROS POR TAB
  // ============================================

  const turnosHoy = useMemo(() => {
    const hoy = new Date();
    return turnos
      .filter((t) => {
        const fecha = new Date(t.fechaHora);
        return fecha >= startOfDay(hoy) && fecha <= endOfDay(hoy);
      })
      .sort((a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime());
  }, [turnos]);

  const turnosSemana = useMemo(() => {
    const hoy = new Date();
    const fin = endOfDay(addDays(hoy, 7));
    return turnos
      .filter((t) => {
        const fecha = new Date(t.fechaHora);
        return fecha >= startOfDay(hoy) && fecha <= fin;
      })
      .sort((a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime());
  }, [turnos]);

  const todosTurnos = useMemo(() => {
    const hoy = startOfDay(new Date());
    return turnos
      .filter((t) => new Date(t.fechaHora) >= hoy)
      .sort((a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime());
  }, [turnos]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleCreateTurno = (data: TurnoFormValues) => {
    createTurnoMutation.mutate(data, {
      onSuccess: () => {
        setIsTurnoFormOpen(false);
      },
    });
  };

  const handleUpdateTurno = (data: TurnoFormValues) => {
    if (!editingTurno) return;
    updateTurnoMutation.mutate(
      { id: editingTurno.id, data },
      {
        onSuccess: () => {
          setEditingTurno(undefined);
          setIsTurnoFormOpen(false);
        },
      }
    );
  };

  const handleDeleteTurno = () => {
    if (deletingTurnoId) {
      deleteTurnoMutation.mutate(deletingTurnoId);
      setDeletingTurnoId(null);
    }
  };

  const handleOpenEdit = (turno: Turno) => {
    setEditingTurno(turno);
    setIsTurnoFormOpen(true);
  };

  const handleCloseForm = (open: boolean) => {
    setIsTurnoFormOpen(open);
    if (!open) setEditingTurno(undefined);
  };

  const handleGenerarHistoria = async (
    data: HistoriaClinicaFormValues,
    recordatorioData?: RecordatorioData,
    archivo?: File
  ) => {
    if (!historiaFormTurno?.mascotaId) return;

    let archivoAdjunto = undefined;

    try {
      // Subir archivo si hay uno
      if (archivo) {
        const tempId = `turno-${historiaFormTurno.id}`;
        archivoAdjunto = await uploadArchivoHistoriaClinica(tempId, archivo);
      }

      createHistoriaMutation.mutate(
        {
          mascotaId: historiaFormTurno.mascotaId,
          ...data,
          ...(archivoAdjunto && { archivoAdjunto }),
        },
        {
          onSuccess: (nuevaHistoria) => {
            // Crear recordatorio si fue solicitado
            if (recordatorioData && historiaFormTurno.clienteId) {
              createRecordatorioMutation.mutate({
                mascotaId: historiaFormTurno.mascotaId!,
                clienteId: historiaFormTurno.clienteId,
                historiaClinicaId: nuevaHistoria.id,
                titulo: recordatorioData.titulo,
                descripcion: recordatorioData.descripcion,
                fechaRecordatorio: recordatorioData.fechaRecordatorio,
              });
            }

            // Marcar el turno como Completado
            updateEstadoMutation.mutate(
              { id: historiaFormTurno.id, estado: 'Completado' },
              {
                onSuccess: () => {
                  toast.success('Historia clínica creada y turno marcado como Completado');
                },
              }
            );

            setHistoriaFormTurno(null);
          },
        }
      );
    } catch {
      toast.error('Error al subir el archivo adjunto');
    }
  };

  // ============================================
  // HELPERS DE DISPLAY
  // ============================================

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

  const getBadgeTipo = (tipo: Turno['tipo']) => {
    return tipo === 'Consulta' ? 'default' : 'secondary';
  };

  const formatFechaHora = (fechaHora: Date) => {
    const d = new Date(fechaHora);
    return {
      fecha: format(d, "d 'de' MMMM", { locale: es }),
      hora: format(d, 'HH:mm'),
      esHoy: isToday(d),
    };
  };

  // ============================================
  // RENDER TABLE
  // ============================================

  const renderTabla = (lista: Turno[]) => {
    if (lista.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No hay turnos en este período</p>
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha y Hora</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Mascota</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Notas</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lista.map((turno) => {
            const { fecha, hora, esHoy } = formatFechaHora(turno.fechaHora);
            const puedeGenerarHistoria =
              !!turno.mascotaId &&
              turno.estado !== 'Cancelado' &&
              turno.estado !== 'No se presentó';

            return (
              <TableRow key={turno.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{hora}</span>
                    <span className="text-sm text-muted-foreground">
                      {esHoy ? 'Hoy' : fecha}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {turno.clienteNombre} {turno.clienteApellido}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {turno.clienteTelefono}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {turno.mascotaNombre ? (
                    <div className="flex flex-col">
                      <span>{turno.mascotaNombre}</span>
                      <span className="text-xs text-muted-foreground">
                        {turno.mascotaEspecie}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={getBadgeTipo(turno.tipo)}>{turno.tipo}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getBadgeEstado(turno.estado)}>{turno.estado}</Badge>
                </TableCell>
                <TableCell>
                  {turno.notas ? (
                    <span className="text-sm text-muted-foreground line-clamp-2 max-w-[180px]">
                      {turno.notas}
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    {puedeGenerarHistoria && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setHistoriaFormTurno(turno)}
                        title="Generar Historia Clínica"
                      >
                        <ClipboardPlus className="h-4 w-4 text-green-600" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenEdit(turno)}
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingTurnoId(turno.id)}
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  };

  const deletingTurno = turnos.find((t) => t.id === deletingTurnoId);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Turnos</h1>
          <p className="text-muted-foreground">Gestión de turnos y agenda de la clínica</p>
        </div>
        <Button onClick={() => setIsTurnoFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Turno
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agenda de Turnos</CardTitle>
          <CardDescription>Visualizá los turnos por período</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Tabs defaultValue="hoy" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="hoy">
                  Hoy
                  {turnosHoy.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {turnosHoy.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="semana">
                  Esta semana
                  {turnosSemana.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {turnosSemana.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="todos">
                  Todos
                  {todosTurnos.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {todosTurnos.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="hoy" className="mt-6">
                {renderTabla(turnosHoy)}
              </TabsContent>

              <TabsContent value="semana" className="mt-6">
                {renderTabla(turnosSemana)}
              </TabsContent>

              <TabsContent value="todos" className="mt-6">
                {renderTabla(todosTurnos)}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <TurnoFormDialog
        open={isTurnoFormOpen}
        onOpenChange={handleCloseForm}
        onSubmit={editingTurno ? handleUpdateTurno : handleCreateTurno}
        editData={editingTurno}
        isSubmitting={createTurnoMutation.isPending || updateTurnoMutation.isPending}
      />

      {/* Historia Clínica Dialog (reutilizado desde MascotaDetail) */}
      <HistoriaClinicaForm
        open={historiaFormTurno !== null}
        onOpenChange={(open) => !open && setHistoriaFormTurno(null)}
        onSubmit={handleGenerarHistoria}
      />

      {/* Confirm Delete */}
      <AlertDialog
        open={deletingTurnoId !== null}
        onOpenChange={(open) => !open && setDeletingTurnoId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar turno?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará el turno de{' '}
              <strong>
                {deletingTurno?.clienteNombre} {deletingTurno?.clienteApellido}
              </strong>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTurno}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
