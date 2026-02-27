import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { useMascota } from '@/hooks/useMascotas';
import { useCliente } from '@/hooks/useClientes';
import { useHistoriasClinicasByMascota, useCreateHistoriaClinica, useUpdateHistoriaClinica, useDeleteHistoriaClinica } from '@/hooks/useHistoriaClinica';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { ArrowLeft, Plus, Calendar, User, Activity, Edit, Trash2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { HistoriaClinicaForm, type RecordatorioData } from '@/components/historia/HistoriaClinicaForm';
import type { HistoriaClinicaFormValues } from '@/lib/schemas';
import type { HistoriaClinica } from '@/lib/types';
import { toast } from 'sonner';

export default function MascotaDetail() {
  const { id } = useParams<{ id: string }>();

  // TanStack Query hooks para datos desde Supabase
  const { data: mascota, isLoading: isLoadingMascota, error: errorMascota } = useMascota(id!);
  const { data: cliente } = useCliente(mascota?.clienteId || '');
  const { data: historiaClinica = [], isLoading: isLoadingHistoria } = useHistoriasClinicasByMascota(id!);
  const createHistoriaMutation = useCreateHistoriaClinica();
  const updateHistoriaMutation = useUpdateHistoriaClinica();
  const deleteHistoriaMutation = useDeleteHistoriaClinica();

  // DataContext para recordatorios (aún no migrado)
  const { addRecordatorio } = useData();

  const [isConsultaFormOpen, setIsConsultaFormOpen] = useState(false);
  const [editingConsulta, setEditingConsulta] = useState<HistoriaClinica | undefined>();
  const [deletingConsultaId, setDeletingConsultaId] = useState<string | null>(null);

  const handleCreateConsulta = (data: HistoriaClinicaFormValues, recordatorioData?: RecordatorioData) => {
    if (editingConsulta) {
      // Editar consulta existente
      updateHistoriaMutation.mutate(
        { id: editingConsulta.id, data: { mascotaId: id!, ...data } },
        {
          onSuccess: () => {
            setEditingConsulta(undefined);
            setIsConsultaFormOpen(false);
          },
        }
      );
    } else {
      // Crear nueva consulta
      createHistoriaMutation.mutate(
        { mascotaId: id!, ...data },
        {
          onSuccess: (nuevaConsulta) => {
            setIsConsultaFormOpen(false);

            // Crear recordatorio si se proporcionó
            if (recordatorioData && mascota && recordatorioData.titulo.trim()) {
              const nuevoRecordatorio = {
                id: crypto.randomUUID(),
                historiaClinicaId: nuevaConsulta.id,
                mascotaId: id!,
                clienteId: mascota.clienteId,
                titulo: recordatorioData.titulo,
                descripcion: recordatorioData.descripcion,
                fechaRecordatorio: recordatorioData.fechaRecordatorio,
                esRecurrente: false,
                estado: 'Pendiente' as const,
                fechaCreacion: new Date(),
              };
              addRecordatorio(nuevoRecordatorio);
              toast.success('Consulta y recordatorio creados exitosamente');
            }
          },
        }
      );
    }
  };

  const handleEditConsulta = (consulta: HistoriaClinica) => {
    setEditingConsulta(consulta);
    setIsConsultaFormOpen(true);
  };

  const handleDeleteConsulta = () => {
    if (deletingConsultaId) {
      deleteHistoriaMutation.mutate(deletingConsultaId, {
        onSuccess: () => {
          setDeletingConsultaId(null);
        },
      });
    }
  };

  const handleCloseForm = (open: boolean) => {
    setIsConsultaFormOpen(open);
    if (!open) {
      setEditingConsulta(undefined);
    }
  };

  // Mostrar loading
  if (isLoadingMascota) {
    return (
      <div>
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/mascotas">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Link>
        </Button>
        <Card>
          <CardContent className="pt-6 flex justify-center">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <p className="text-muted-foreground">Cargando mascota...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mostrar error o mascota no encontrada
  if (errorMascota || !mascota || !cliente) {
    return (
      <div>
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/mascotas">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Link>
        </Button>
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive mb-2">
              {errorMascota ? 'Error al cargar mascota' : 'Mascota no encontrada'}
            </p>
            {errorMascota && (
              <p className="text-sm text-muted-foreground">
                {(errorMascota as Error).message}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Button variant="ghost" asChild>
          <Link to={`/clientes/${cliente.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Cliente
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button onClick={() => setIsConsultaFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Consulta
          </Button>
        </div>
      </div>

      {/* Información de la Mascota */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{mascota.nombre}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <User className="h-4 w-4" />
                  Dueño: {cliente.nombre} {cliente.apellido}
                </CardDescription>
              </div>
              <Badge variant={mascota.estado === 'Activo' ? 'default' : 'secondary'}>
                {mascota.estado}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Especie</p>
              <p className="font-medium">{mascota.especie}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Raza</p>
              <p className="font-medium">{mascota.raza}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sexo</p>
              <p className="font-medium">{mascota.sexo}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Edad</p>
              <p className="font-medium">{mascota.edad || 'No especificada'}</p>
            </div>
            {mascota.otrasCaracteristicas && (
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">Otras Características</p>
                <p className="font-medium">{mascota.otrasCaracteristicas}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Resumen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total consultas:</span>
              <span className="font-medium">{historiaClinica.length}</span>
            </div>
            {historiaClinica.length > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Última consulta:</span>
                <span className="font-medium text-sm">
                  {format(historiaClinica[0].fecha, 'dd/MM/yyyy')}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Historia Clínica Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Historia Clínica</CardTitle>
          <CardDescription>
            {isLoadingHistoria ? 'Cargando...' : 'Registro completo de consultas y tratamientos'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingHistoria ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : historiaClinica.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No hay consultas registradas</p>
              <Button onClick={() => setIsConsultaFormOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Agregar Primera Consulta
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {historiaClinica.map((consulta) => (
                <div key={consulta.id} className="relative pl-8 pb-6 border-l-2 border-muted last:border-l-0 last:pb-0">
                  {/* Timeline dot */}
                  <div className="absolute left-0 top-0 -translate-x-2.25 w-4 h-4 rounded-full bg-primary border-4 border-background" />

                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">
                          {format(consulta.fecha, "d 'de' MMMM 'de' yyyy", { locale: es })}
                        </span>
                      </div>
                      {consulta.veterinario && (
                        <p className="text-sm text-muted-foreground">
                          Por: {consulta.veterinario}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditConsulta(consulta)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingConsultaId(consulta.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3 mt-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Motivo de Consulta</p>
                      <p>{consulta.motivoConsulta}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Diagnóstico</p>
                      <p>{consulta.diagnostico}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Tratamiento</p>
                      <p>{consulta.tratamiento}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      {consulta.peso && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Peso</p>
                          <p>{consulta.peso} kg</p>
                        </div>
                      )}
                      {consulta.temperatura && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Temperatura</p>
                          <p>{consulta.temperatura}°C</p>
                        </div>
                      )}
                    </div>

                    {consulta.vacunasAplicadas && consulta.vacunasAplicadas.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Vacunas Aplicadas</p>
                        <div className="flex gap-2 flex-wrap">
                          {consulta.vacunasAplicadas.map((vacuna, i) => (
                            <Badge key={i} variant="secondary">{vacuna}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {consulta.notas && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Notas</p>
                        <p className="text-sm">{consulta.notas}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <HistoriaClinicaForm
        open={isConsultaFormOpen}
        onOpenChange={handleCloseForm}
        onSubmit={handleCreateConsulta}
        editData={editingConsulta}
      />

      <AlertDialog open={!!deletingConsultaId} onOpenChange={(open) => !open && setDeletingConsultaId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar consulta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el registro de esta consulta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConsulta} className="bg-destructive hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
