import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMascota } from '@/hooks/useMascotas';
import { useCliente } from '@/hooks/useClientes';
import { useHistoriasClinicasByMascota, useCreateHistoriaClinica, useUpdateHistoriaClinica, useDeleteHistoriaClinica } from '@/hooks/useHistoriaClinica';
import { useCreateRecordatorio } from '@/hooks/useRecordatorios';
import { useVacunacionesByMascota, useCreateVacunacion, useDeleteVacunacion } from '@/hooks/useVacunaciones';
import { useDesparasitacionesByMascota, useCreateDesparasitacion, useDeleteDesparasitacion } from '@/hooks/useDesparasitaciones';
import { uploadArchivoHistoriaClinica, deleteAllArchivosHistoriaClinica } from '@/services/storage.service';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Plus, Calendar, User, Activity, Edit, Trash2, Loader2, Syringe, Bug } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { calcularEdad } from '@/lib/utils';
import { HistoriaClinicaForm, type RecordatorioData } from '@/components/historia/HistoriaClinicaForm';
import { VacunacionForm } from '@/components/vacunas/VacunacionForm';
import { DesparasitacionForm } from '@/components/vacunas/DesparasitacionForm';
import type { HistoriaClinicaFormValues, VacunacionFormValues, DesparasitacionFormValues } from '@/lib/schemas';
import type { HistoriaClinica } from '@/lib/types';
import { toast } from 'sonner';

export default function MascotaDetail() {
  const { id } = useParams<{ id: string }>();

  // TanStack Query hooks para datos desde Supabase
  const { data: mascota, isLoading: isLoadingMascota, error: errorMascota } = useMascota(id!);
  const { data: cliente } = useCliente(mascota?.clienteId || '');
  const { data: historiaClinica = [], isLoading: isLoadingHistoria } = useHistoriasClinicasByMascota(id!);
  const { data: vacunaciones = [], isLoading: isLoadingVacunas } = useVacunacionesByMascota(id!);
  const { data: desparasitaciones = [], isLoading: isLoadingDesparasitaciones } = useDesparasitacionesByMascota(id!);

  const createHistoriaMutation = useCreateHistoriaClinica();
  const updateHistoriaMutation = useUpdateHistoriaClinica();
  const deleteHistoriaMutation = useDeleteHistoriaClinica();
  const createRecordatorioMutation = useCreateRecordatorio();
  const createVacunacionMutation = useCreateVacunacion();
  const deleteVacunacionMutation = useDeleteVacunacion();
  const createDesparasitacionMutation = useCreateDesparasitacion();
  const deleteDesparasitacionMutation = useDeleteDesparasitacion();

  const [isConsultaFormOpen, setIsConsultaFormOpen] = useState(false);
  const [editingConsulta, setEditingConsulta] = useState<HistoriaClinica | undefined>();
  const [deletingConsultaId, setDeletingConsultaId] = useState<string | null>(null);

  // Estados para vacunas
  const [isVacunaFormOpen, setIsVacunaFormOpen] = useState(false);
  const [deletingVacunaId, setDeletingVacunaId] = useState<string | null>(null);

  // Estados para desparasitaciones
  const [isDesparasitacionFormOpen, setIsDesparasitacionFormOpen] = useState(false);
  const [deletingDesparasitacionId, setDeletingDesparasitacionId] = useState<string | null>(null);

  const handleCreateConsulta = async (
    data: HistoriaClinicaFormValues,
    recordatorioData?: RecordatorioData,
    archivo?: File
  ) => {
    if (editingConsulta) {
      // Editar consulta existente (sin manejo de archivo por ahora)
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
      try {
        // 1. Subir archivo si existe
        let archivoAdjunto;
        if (archivo) {
          toast.loading('Subiendo archivo...');
          // Primero creamos la consulta para tener el ID
          const consultaData = { mascotaId: id!, ...data };
          const nuevaConsulta = await createHistoriaMutation.mutateAsync(consultaData);

          // Luego subimos el archivo con el ID de la consulta
          archivoAdjunto = await uploadArchivoHistoriaClinica(nuevaConsulta.id, archivo);

          // Actualizar la consulta con el archivo
          await updateHistoriaMutation.mutateAsync({
            id: nuevaConsulta.id,
            data: { mascotaId: id!, ...data, archivoAdjunto },
          });

          toast.dismiss();
          setIsConsultaFormOpen(false);

          // Crear recordatorio si se proporcionó
          if (recordatorioData && mascota && recordatorioData.titulo.trim()) {
            createRecordatorioMutation.mutate({
              historiaClinicaId: nuevaConsulta.id,
              mascotaId: id!,
              clienteId: mascota.clienteId,
              titulo: recordatorioData.titulo,
              descripcion: recordatorioData.descripcion,
              fechaRecordatorio: recordatorioData.fechaRecordatorio,
            });
          } else {
            toast.success('Consulta y archivo guardados exitosamente');
          }
        } else {
          // Sin archivo, flujo normal
          createHistoriaMutation.mutate(
            { mascotaId: id!, ...data },
            {
              onSuccess: (nuevaConsulta) => {
                setIsConsultaFormOpen(false);

                // Crear recordatorio si se proporcionó
                if (recordatorioData && mascota && recordatorioData.titulo.trim()) {
                  createRecordatorioMutation.mutate({
                    historiaClinicaId: nuevaConsulta.id,
                    mascotaId: id!,
                    clienteId: mascota.clienteId,
                    titulo: recordatorioData.titulo,
                    descripcion: recordatorioData.descripcion,
                    fechaRecordatorio: recordatorioData.fechaRecordatorio,
                  });
                } else {
                  toast.success('Consulta creada exitosamente');
                }
              },
            }
          );
        }
      } catch (error) {
        toast.dismiss();
        toast.error('Error al crear consulta: ' + (error as Error).message);
      }
    }
  };

  const handleEditConsulta = (consulta: HistoriaClinica) => {
    setEditingConsulta(consulta);
    setIsConsultaFormOpen(true);
  };

  const handleDeleteConsulta = async () => {
    if (deletingConsultaId) {
      // Eliminar archivos adjuntos antes de eliminar la consulta
      try {
        await deleteAllArchivosHistoriaClinica(deletingConsultaId);
      } catch (error) {
        console.error('Error al eliminar archivos:', error);
        // Continuar con la eliminación de la consulta aunque falle la eliminación de archivos
      }

      // Eliminar la consulta
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

  // Handlers para vacunas
  const handleCreateVacunacion = (data: VacunacionFormValues, recordatorioData?: RecordatorioData) => {
    createVacunacionMutation.mutate(
      { mascotaId: id!, ...data },
      {
        onSuccess: () => {
          setIsVacunaFormOpen(false);

          // Crear recordatorio si fue solicitado
          if (recordatorioData && mascota && recordatorioData.titulo.trim()) {
            createRecordatorioMutation.mutate({
              mascotaId: id!,
              clienteId: mascota.clienteId,
              titulo: recordatorioData.titulo,
              descripcion: recordatorioData.descripcion,
              fechaRecordatorio: recordatorioData.fechaRecordatorio,
            });
          }
        },
      }
    );
  };

  const handleDeleteVacunacion = () => {
    if (deletingVacunaId) {
      deleteVacunacionMutation.mutate(deletingVacunaId, {
        onSuccess: () => {
          setDeletingVacunaId(null);
        },
      });
    }
  };

  // Handlers para desparasitaciones
  const handleCreateDesparasitacion = (data: DesparasitacionFormValues, recordatorioData?: RecordatorioData) => {
    createDesparasitacionMutation.mutate(
      { mascotaId: id!, ...data },
      {
        onSuccess: () => {
          setIsDesparasitacionFormOpen(false);

          // Crear recordatorio si fue solicitado
          if (recordatorioData && mascota && recordatorioData.titulo.trim()) {
            createRecordatorioMutation.mutate({
              mascotaId: id!,
              clienteId: mascota.clienteId,
              titulo: recordatorioData.titulo,
              descripcion: recordatorioData.descripcion,
              fechaRecordatorio: recordatorioData.fechaRecordatorio,
            });
          }
        },
      }
    );
  };

  const handleDeleteDesparasitacion = () => {
    if (deletingDesparasitacionId) {
      deleteDesparasitacionMutation.mutate(deletingDesparasitacionId, {
        onSuccess: () => {
          setDeletingDesparasitacionId(null);
        },
      });
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
              <p className="text-sm text-muted-foreground">Fecha de Nacimiento</p>
              <p className="font-medium">
                {mascota.fechaNacimiento
                  ? `${format(mascota.fechaNacimiento, 'dd/MM/yyyy')} (${calcularEdad(mascota.fechaNacimiento)})`
                  : 'No especificada'}
              </p>
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

                    {consulta.archivoAdjunto && (
                      <div className="pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <a
                            href={consulta.archivoAdjunto.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2"
                          >
                            <Calendar className="h-4 w-4" />
                            Ver {consulta.archivoAdjunto.tipo === 'application/pdf' ? 'PDF' : 'Imagen'}
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sección de Vacunas y Desparasitaciones con Tabs */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Calendario de Vacunas y Desparasitaciones</CardTitle>
          <CardDescription>Registro histórico de vacunas y desparasitaciones aplicadas</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="vacunas" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="vacunas">
                <Syringe className="h-4 w-4 mr-2" />
                Vacunas
              </TabsTrigger>
              <TabsTrigger value="desparasitaciones">
                <Bug className="h-4 w-4 mr-2" />
                Desparasitaciones
              </TabsTrigger>
            </TabsList>

            {/* Tab de Vacunas */}
            <TabsContent value="vacunas" className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={() => setIsVacunaFormOpen(true)} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Registrar Vacuna
                </Button>
              </div>

              {isLoadingVacunas ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : vacunaciones.length === 0 ? (
                <div className="text-center py-8">
                  <Syringe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No hay vacunas registradas</p>
                </div>
              ) : (
                <div className="border rounded-lg">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 font-medium text-sm">Fecha</th>
                        <th className="text-left p-3 font-medium text-sm">Tipo de Vacuna</th>
                        <th className="text-left p-3 font-medium text-sm">Notas</th>
                        <th className="text-right p-3 font-medium text-sm">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vacunaciones.map((vacuna) => (
                        <tr key={vacuna.id} className="border-t hover:bg-muted/30">
                          <td className="p-3 text-sm">
                            {format(vacuna.fecha, 'dd/MM/yyyy', { locale: es })}
                          </td>
                          <td className="p-3 font-medium text-sm">{vacuna.tipoVacuna}</td>
                          <td className="p-3 text-sm text-muted-foreground">
                            {vacuna.notas || '-'}
                          </td>
                          <td className="p-3 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeletingVacunaId(vacuna.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>

            {/* Tab de Desparasitaciones */}
            <TabsContent value="desparasitaciones" className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={() => setIsDesparasitacionFormOpen(true)} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Registrar Desparasitación
                </Button>
              </div>

              {isLoadingDesparasitaciones ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : desparasitaciones.length === 0 ? (
                <div className="text-center py-8">
                  <Bug className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No hay desparasitaciones registradas</p>
                </div>
              ) : (
                <div className="border rounded-lg">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 font-medium text-sm">Fecha</th>
                        <th className="text-left p-3 font-medium text-sm">Tipo</th>
                        <th className="text-left p-3 font-medium text-sm">Notas</th>
                        <th className="text-right p-3 font-medium text-sm">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {desparasitaciones.map((desparasitacion) => (
                        <tr key={desparasitacion.id} className="border-t hover:bg-muted/30">
                          <td className="p-3 text-sm">
                            {format(desparasitacion.fecha, 'dd/MM/yyyy', { locale: es })}
                          </td>
                          <td className="p-3 font-medium text-sm">{desparasitacion.tipoDesparasitacion}</td>
                          <td className="p-3 text-sm text-muted-foreground">
                            {desparasitacion.notas || '-'}
                          </td>
                          <td className="p-3 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeletingDesparasitacionId(desparasitacion.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Formularios */}
      <HistoriaClinicaForm
        open={isConsultaFormOpen}
        onOpenChange={handleCloseForm}
        onSubmit={handleCreateConsulta}
        editData={editingConsulta}
      />

      <VacunacionForm
        open={isVacunaFormOpen}
        onOpenChange={setIsVacunaFormOpen}
        onSubmit={handleCreateVacunacion}
      />

      <DesparasitacionForm
        open={isDesparasitacionFormOpen}
        onOpenChange={setIsDesparasitacionFormOpen}
        onSubmit={handleCreateDesparasitacion}
      />

      {/* AlertDialogs */}
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

      <AlertDialog open={!!deletingVacunaId} onOpenChange={(open) => !open && setDeletingVacunaId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar vacunación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el registro de esta vacunación.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteVacunacion} className="bg-destructive hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deletingDesparasitacionId} onOpenChange={(open) => !open && setDeletingDesparasitacionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar desparasitación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el registro de esta desparasitación.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDesparasitacion} className="bg-destructive hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
