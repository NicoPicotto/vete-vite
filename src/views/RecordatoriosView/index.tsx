import { useState } from 'react';
import { useData } from '@/context/DataContext';
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
import { Calendar as CalendarIcon, CheckCircle, XCircle, Trash2, Bell } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { ReprogramarDialog } from '@/components/recordatorios/ReprogramarDialog';
import type { Recordatorio } from '@/lib/types';
import { toast } from 'sonner';

export default function RecordatoriosView() {
  const {
    recordatorios,
    clientes,
    mascotas,
    completarRecordatorio,
    cancelarRecordatorio,
    deleteRecordatorio,
    getRecordatoriosProximos,
    reprogramarRecordatorio,
  } = useData();

  const [reprogramandoRecordatorio, setReprogramandoRecordatorio] = useState<
    Recordatorio | null
  >(null);
  const [deletingRecordatorioId, setDeletingRecordatorioId] = useState<string | null>(null);

  // Filtrar recordatorios por rango de días
  const recordatorios7Dias = getRecordatoriosProximos(7);
  const recordatorios30Dias = getRecordatoriosProximos(30);
  const todosRecordatorios = recordatorios
    .filter((r) => r.estado !== 'Completado' && r.estado !== 'Cancelado')
    .sort(
      (a, b) => new Date(a.fechaRecordatorio).getTime() - new Date(b.fechaRecordatorio).getTime()
    );

  const handleCompletar = (id: string) => {
    completarRecordatorio(id);
    toast.success('Recordatorio completado');
  };

  const handleCancelar = (id: string) => {
    cancelarRecordatorio(id);
    toast.success('Recordatorio cancelado');
  };

  const handleDeleteRecordatorio = () => {
    if (deletingRecordatorioId) {
      deleteRecordatorio(deletingRecordatorioId);
      toast.success('Recordatorio eliminado');
      setDeletingRecordatorioId(null);
    }
  };

  const handleReprogramar = (recordatorio: Recordatorio) => {
    setReprogramandoRecordatorio(recordatorio);
  };

  const handleReprogramarSubmit = (data: { fechaRecordatorio: Date; notasReprogramacion?: string }) => {
    if (reprogramandoRecordatorio) {
      reprogramarRecordatorio(
        reprogramandoRecordatorio.id,
        data.fechaRecordatorio,
        data.notasReprogramacion
      );
      toast.success('Recordatorio reprogramado');
      setReprogramandoRecordatorio(null);
    }
  };

  const getMascotaNombre = (mascotaId: string) => {
    const mascota = mascotas.find((m) => m.id === mascotaId);
    return mascota?.nombre || 'Desconocido';
  };

  const getClienteNombre = (clienteId: string) => {
    const cliente = clientes.find((c) => c.id === clienteId);
    return cliente ? `${cliente.nombre} ${cliente.apellido}` : 'Desconocido';
  };

  const formatFechaRelativa = (fecha: Date) => {
    const hoy = new Date();
    const diff = differenceInDays(fecha, hoy);

    if (diff === 0) return 'Hoy';
    if (diff === 1) return 'Mañana';
    if (diff === -1) return 'Ayer';
    if (diff > 0) return `En ${diff} días`;
    return `Atrasado ${Math.abs(diff)} días`;
  };

  const getBadgeVariant = (estado: Recordatorio['estado']) => {
    switch (estado) {
      case 'Completado':
        return 'default'; // Verde
      case 'Reprogramado':
        return 'secondary'; // Azul
      case 'Cancelado':
        return 'outline'; // Gris
      default:
        return 'destructive'; // Rojo para pendientes
    }
  };

  const renderRecordatoriosTable = (recordatoriosList: Recordatorio[]) => {
    if (recordatoriosList.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No hay recordatorios en este rango</p>
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Mascota</TableHead>
            <TableHead>Título</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recordatoriosList.map((recordatorio) => {
            const fecha = new Date(recordatorio.fechaRecordatorio);
            const puedeActuar =
              recordatorio.estado !== 'Completado' && recordatorio.estado !== 'Cancelado';

            return (
              <TableRow key={recordatorio.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {format(fecha, "d 'de' MMMM, yyyy", { locale: es })}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {formatFechaRelativa(fecha)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{getClienteNombre(recordatorio.clienteId)}</TableCell>
                <TableCell>{getMascotaNombre(recordatorio.mascotaId)}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{recordatorio.titulo}</span>
                    {recordatorio.descripcion && (
                      <span className="text-sm text-muted-foreground">
                        {recordatorio.descripcion}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getBadgeVariant(recordatorio.estado)}>
                    {recordatorio.estado}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {puedeActuar && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCompletar(recordatorio.id)}
                          title="Completar"
                        >
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleReprogramar(recordatorio)}
                          title="Reprogramar"
                        >
                          <CalendarIcon className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCancelar(recordatorio.id)}
                          title="Cancelar"
                        >
                          <XCircle className="h-4 w-4 text-orange-600" />
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingRecordatorioId(recordatorio.id)}
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

  const deletingRecordatorio = recordatorios.find((r) => r.id === deletingRecordatorioId);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Recordatorios</h1>
        <p className="text-muted-foreground">
          Gestión de recordatorios para seguimiento de pacientes
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Calendario de Recordatorios</CardTitle>
          <CardDescription>
            Organiza y visualiza los recordatorios según proximidad
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="7dias" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="7dias">
                Próximos 7 días
                {recordatorios7Dias.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {recordatorios7Dias.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="30dias">
                Próximos 30 días
                {recordatorios30Dias.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {recordatorios30Dias.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="todos">
                Todos
                {todosRecordatorios.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {todosRecordatorios.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="7dias" className="mt-6">
              {renderRecordatoriosTable(recordatorios7Dias)}
            </TabsContent>

            <TabsContent value="30dias" className="mt-6">
              {renderRecordatoriosTable(recordatorios30Dias)}
            </TabsContent>

            <TabsContent value="todos" className="mt-6">
              {renderRecordatoriosTable(todosRecordatorios)}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ReprogramarDialog
        open={reprogramandoRecordatorio !== null}
        onOpenChange={(open) => !open && setReprogramandoRecordatorio(null)}
        onSubmit={handleReprogramarSubmit}
        recordatorio={reprogramandoRecordatorio}
      />

      <AlertDialog
        open={deletingRecordatorioId !== null}
        onOpenChange={(open) => !open && setDeletingRecordatorioId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar recordatorio?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el recordatorio "
              {deletingRecordatorio?.titulo}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRecordatorio}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
