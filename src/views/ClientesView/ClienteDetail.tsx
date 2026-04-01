import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
   useCliente,
   useUpdateCliente,
   useDeleteCliente,
} from "@/hooks/useClientes";
import {
   useMascotasByCliente,
   useCreateMascota,
   useUpdateMascota,
   useDeleteMascota,
} from "@/hooks/useMascotas";
import {
   useItemsPagoByCliente,
   useCreatePagoParcial,
   useDeleteItemPago,
} from "@/hooks/usePagos";
import {
   useRecordatoriosByCliente,
   useCompletarRecordatorio,
   useCancelarRecordatorio,
   useReprogramarRecordatorio,
   useDeleteRecordatorio,
} from "@/hooks/useRecordatorios";
import { useVentasByCliente, useCreateVenta } from "@/hooks/useVentas";
import {
   Card,
   CardContent,
   CardDescription,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
   ArrowLeft,
   Mail,
   Phone,
   MapPin,
   CreditCard,
   Plus,
   Eye,
   Edit,
   Trash2,
   Bell,
   Calendar as CalendarIcon,
   CheckCircle,
   XCircle,
   Loader2,
   ShoppingCart,
} from "lucide-react";
import { ClienteForm } from "@/components/clientes/ClienteForm";
import { MascotaForm } from "@/components/mascotas/MascotaForm";
import { PagoItemForm } from "@/components/pagos/PagoItemForm";
import { PagoParcialForm } from "@/components/pagos/PagoParcialForm";
import { RecordatorioForm } from "@/components/recordatorios/RecordatorioForm";
import { ReprogramarDialog } from "@/components/recordatorios/ReprogramarDialog";
import { VentaFormDialog } from "@/components/ventas/VentaFormDialog";
import type {
   ClienteFormValues,
   MascotaFormValues,
   PagoParcialFormValues,
   ReprogramarRecordatorioFormValues,
   VentaFormValues,
} from "@/lib/schemas";
import type { ItemPago, Recordatorio } from "@/lib/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { calcularEdad } from "@/lib/utils";

export default function ClienteDetail() {
   const { id } = useParams<{ id: string }>();
   const navigate = useNavigate();

   // TanStack Query hooks para cliente desde Supabase
   const {
      data: cliente,
      isLoading: isLoadingCliente,
      error: errorCliente,
   } = useCliente(id!);
   const updateClienteMutation = useUpdateCliente();
   const deleteClienteMutation = useDeleteCliente();

   // TanStack Query hooks para mascotas desde Supabase
   const { data: mascotas = [], isLoading: isLoadingMascotas } =
      useMascotasByCliente(id!);
   const createMascotaMutation = useCreateMascota();
   const updateMascotaMutation = useUpdateMascota();
   const deleteMascotaMutation = useDeleteMascota();

   // TanStack Query hooks para pagos desde Supabase
   const { data: itemsPago = [], isLoading: isLoadingPagos } =
      useItemsPagoByCliente(id!);
   const createPagoParcialMutation = useCreatePagoParcial();
   const deleteItemPagoMutation = useDeleteItemPago();

   // Hooks de recordatorios
   const { data: recordatorios = [], isLoading: isLoadingRecordatorios } =
      useRecordatoriosByCliente(id!);
   const completarRecordatorioMutation = useCompletarRecordatorio();
   const cancelarRecordatorioMutation = useCancelarRecordatorio();
   const reprogramarRecordatorioMutation = useReprogramarRecordatorio();
   const deleteRecordatorioMutation = useDeleteRecordatorio();

   // Hooks de ventas
   const { data: ventas = [], isLoading: isLoadingVentas } = useVentasByCliente(
      id!,
   );
   const createVentaMutation = useCreateVenta();

   const [isEditFormOpen, setIsEditFormOpen] = useState(false);
   const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
   const [isMascotaFormOpen, setIsMascotaFormOpen] = useState(false);
   const [editingMascota, setEditingMascota] = useState<string | null>(null);

   // Estados para pagos
   const [isPagoFormOpen, setIsPagoFormOpen] = useState(false);
   const [isPagoParcialFormOpen, setIsPagoParcialFormOpen] = useState(false);
   const [editingPago, setEditingPago] = useState<ItemPago | null>(null);
   const [selectedPagoForPayment, setSelectedPagoForPayment] =
      useState<ItemPago | null>(null);

   // Estados para recordatorios
   const [isRecordatorioFormOpen, setIsRecordatorioFormOpen] = useState(false);
   const [isReprogramarDialogOpen, setIsReprogramarDialogOpen] =
      useState(false);
   const [selectedRecordatorio, setSelectedRecordatorio] =
      useState<Recordatorio | null>(null);

   // Estados para ventas
   const [isVentaFormOpen, setIsVentaFormOpen] = useState(false);

   const handleEditCliente = (data: ClienteFormValues) => {
      updateClienteMutation.mutate(
         { id: id!, data },
         {
            onSuccess: () => {
               setIsEditFormOpen(false);
            },
         },
      );
   };

   const handleDeleteCliente = () => {
      deleteClienteMutation.mutate(id!, {
         onSuccess: () => {
            navigate("/clientes");
         },
      });
   };

   const handleCreateMascota = (data: MascotaFormValues) => {
      const mascotaData = {
         clienteId: id!,
         ...data,
      };
      createMascotaMutation.mutate(mascotaData, {
         onSuccess: () => {
            setIsMascotaFormOpen(false);
         },
      });
   };

   const handleEditMascota = (data: MascotaFormValues) => {
      if (editingMascota) {
         updateMascotaMutation.mutate(
            { id: editingMascota, data: { clienteId: id!, ...data } },
            {
               onSuccess: () => {
                  setEditingMascota(null);
                  setIsMascotaFormOpen(false);
               },
            },
         );
      }
   };

   const handleDeleteMascota = (mascotaId: string, nombreMascota: string) => {
      if (confirm(`¿Estás seguro de eliminar a ${nombreMascota}?`)) {
         deleteMascotaMutation.mutate(mascotaId);
      }
   };

   const openEditMascota = (mascotaId: string) => {
      setEditingMascota(mascotaId);
      setIsMascotaFormOpen(true);
   };

   const mascotaToEdit = editingMascota
      ? mascotas.find((m) => m.id === editingMascota)
      : undefined;

   // ============================================
   // HANDLERS - PAGOS
   // ============================================

   const handleCreatePago = () => {
      setEditingPago(null);
      setIsPagoFormOpen(true);
   };

   const handleEditPago = (pago: ItemPago) => {
      setEditingPago(pago);
      setIsPagoFormOpen(true);
   };

   const handleDeletePago = (pagoId: string, descripcion: string) => {
      if (confirm(`¿Estás seguro de eliminar el pago "${descripcion}"?`)) {
         deleteItemPagoMutation.mutate(pagoId);
      }
   };

   const handleRegistrarPago = (pago: ItemPago) => {
      setSelectedPagoForPayment(pago);
      setIsPagoParcialFormOpen(true);
   };

   const handlePagoSubmit = () => {
      // La lógica de crear/editar se maneja en PagoItemForm
      setIsPagoFormOpen(false);
      setEditingPago(null);
   };

   const handlePagoParcialSubmit = (data: PagoParcialFormValues) => {
      if (selectedPagoForPayment) {
         createPagoParcialMutation.mutate({
            itemPagoId: selectedPagoForPayment.id,
            monto: data.monto,
            notas: data.notas,
         });
         setIsPagoParcialFormOpen(false);
         setSelectedPagoForPayment(null);
      }
   };

   // ============================================
   // HANDLERS - RECORDATORIOS
   // ============================================

   const handleCreateRecordatorio = () => {
      setIsRecordatorioFormOpen(true);
   };

   const handleReprogramar = (recordatorio: Recordatorio) => {
      setSelectedRecordatorio(recordatorio);
      setIsReprogramarDialogOpen(true);
   };

   const handleReprogramarSubmit = (
      data: ReprogramarRecordatorioFormValues,
   ) => {
      if (selectedRecordatorio) {
         reprogramarRecordatorioMutation.mutate({
            id: selectedRecordatorio.id,
            nuevaFecha: data.fechaRecordatorio,
            notas: data.notasReprogramacion,
         });
         setIsReprogramarDialogOpen(false);
         setSelectedRecordatorio(null);
      }
   };

   const handleCompletar = (recordatorioId: string) => {
      completarRecordatorioMutation.mutate(recordatorioId);
   };

   const handleCancelar = (recordatorioId: string) => {
      if (confirm("¿Estás seguro de cancelar este recordatorio?")) {
         cancelarRecordatorioMutation.mutate(recordatorioId);
      }
   };

   const handleDeleteRecordatorio = (
      recordatorioId: string,
      titulo: string,
   ) => {
      if (confirm(`¿Estás seguro de eliminar el recordatorio "${titulo}"?`)) {
         deleteRecordatorioMutation.mutate(recordatorioId);
      }
   };

   // ============================================
   // HANDLERS DE VENTAS
   // ============================================

   const handleCreateVenta = (data: VentaFormValues) => {
      createVentaMutation.mutate(data, {
         onSuccess: () => {
            setIsVentaFormOpen(false);
         },
      });
   };

   // Mostrar loading
   if (isLoadingCliente) {
      return (
         <div>
            <Button variant='ghost' asChild className='mb-4'>
               <Link to='/clientes'>
                  <ArrowLeft className='mr-2 h-4 w-4' />
                  Volver
               </Link>
            </Button>
            <Card>
               <CardContent className='pt-6 flex justify-center'>
                  <div className='flex items-center gap-2'>
                     <div className='h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent' />
                     <p className='text-muted-foreground'>
                        Cargando cliente...
                     </p>
                  </div>
               </CardContent>
            </Card>
         </div>
      );
   }

   // Mostrar error
   if (errorCliente || !cliente) {
      return (
         <div>
            <Button variant='ghost' asChild className='mb-4'>
               <Link to='/clientes'>
                  <ArrowLeft className='mr-2 h-4 w-4' />
                  Volver
               </Link>
            </Button>
            <Card>
               <CardContent className='pt-6'>
                  <p className='text-destructive mb-2'>
                     {errorCliente
                        ? "Error al cargar cliente"
                        : "Cliente no encontrado"}
                  </p>
                  {errorCliente && (
                     <p className='text-sm text-muted-foreground'>
                        {(errorCliente as Error).message}
                     </p>
                  )}
               </CardContent>
            </Card>
         </div>
      );
   }

   return (
      <div>
         <div className='flex justify-between items-center mb-4'>
            <Button variant='ghost' asChild>
               <Link to='/clientes'>
                  <ArrowLeft className='mr-2 h-4 w-4' />
                  Volver a Clientes
               </Link>
            </Button>
            <div className='flex gap-2'>
               <Button
                  variant='outline'
                  onClick={() => setIsEditFormOpen(true)}
               >
                  <Edit className='mr-2 h-4 w-4' />
                  Editar
               </Button>
               <Button
                  variant='destructive'
                  onClick={() => setIsDeleteDialogOpen(true)}
               >
                  <Trash2 className='mr-2 h-4 w-4' />
                  Eliminar
               </Button>
            </div>
         </div>

         <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {/* Información del Cliente */}
            <Card className='lg:col-span-2'>
               <CardHeader>
                  <CardTitle className='text-2xl'>
                     {cliente.nombre} {cliente.apellido}
                  </CardTitle>
                  <CardDescription>
                     Cliente desde {cliente.fechaRegistro.toLocaleDateString()}
                  </CardDescription>
               </CardHeader>
               <CardContent className='space-y-4'>
                  <div className='flex items-center gap-2 text-sm'>
                     <Phone className='h-4 w-4 text-muted-foreground' />
                     <span>{cliente.telefono}</span>
                  </div>
                  {cliente.email && (
                     <div className='flex items-center gap-2 text-sm'>
                        <Mail className='h-4 w-4 text-muted-foreground' />
                        <span>{cliente.email}</span>
                     </div>
                  )}
                  {cliente.direccion && (
                     <div className='flex items-center gap-2 text-sm'>
                        <MapPin className='h-4 w-4 text-muted-foreground' />
                        <span>{cliente.direccion}</span>
                     </div>
                  )}
                  {cliente.dniCuit && (
                     <div className='flex items-center gap-2 text-sm'>
                        <span className='text-muted-foreground'>DNI/CUIT:</span>
                        <span>{cliente.dniCuit}</span>
                     </div>
                  )}
               </CardContent>
            </Card>

            {/* Estado de Cuenta */}
            <Card>
               <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                     <CreditCard className='h-5 w-5' />
                     Estado de Cuenta
                  </CardTitle>
               </CardHeader>
               <CardContent>
                  <div className='space-y-2'>
                     <div className='flex justify-between items-center'>
                        <span className='text-sm text-muted-foreground'>
                           Total items:
                        </span>
                        <span className='font-medium'>{itemsPago.length}</span>
                     </div>
                     <div className='flex justify-between items-center'>
                        <span className='text-sm text-muted-foreground'>
                           Pendientes:
                        </span>
                        <span className='font-medium'>
                           {
                              itemsPago.filter((i) => i.estado !== "Pagado")
                                 .length
                           }
                        </span>
                     </div>
                     <div className='border-t pt-2 mt-2'>
                        <div className='flex justify-between items-center'>
                           <span className='font-medium'>Saldo:</span>
                           <span
                              className={`font-bold text-lg ${cliente.saldoPendiente > 0 ? "text-destructive" : "text-green-600"}`}
                           >
                              ${cliente.saldoPendiente.toLocaleString()}
                           </span>
                        </div>
                     </div>
                  </div>
               </CardContent>
            </Card>
         </div>

         {/* Mascotas */}
         <Card className='mt-6'>
            <CardHeader>
               <div className='flex justify-between items-center'>
                  <div>
                     <CardTitle>Mascotas</CardTitle>
                     <CardDescription>
                        {isLoadingMascotas
                           ? "Cargando..."
                           : `${mascotas.length} mascota${mascotas.length !== 1 ? "s" : ""} registrada${mascotas.length !== 1 ? "s" : ""}`}
                     </CardDescription>
                  </div>
                  <Button
                     onClick={() => {
                        setEditingMascota(null);
                        setIsMascotaFormOpen(true);
                     }}
                     disabled={isLoadingMascotas}
                  >
                     <Plus className='mr-2 h-4 w-4' />
                     Nueva Mascota
                  </Button>
               </div>
            </CardHeader>
            <CardContent>
               {isLoadingMascotas ? (
                  <div className='flex justify-center items-center py-8'>
                     <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
                  </div>
               ) : mascotas.length === 0 ? (
                  <p className='text-sm text-muted-foreground'>
                     No hay mascotas registradas
                  </p>
               ) : (
                  <Table>
                     <TableHeader>
                        <TableRow>
                           <TableHead>Nombre</TableHead>
                           <TableHead>Especie</TableHead>
                           <TableHead>Raza</TableHead>
                           <TableHead>Edad</TableHead>
                           <TableHead>Estado</TableHead>
                           <TableHead className='text-right'>
                              Acciones
                           </TableHead>
                        </TableRow>
                     </TableHeader>
                     <TableBody>
                        {mascotas.map((mascota) => (
                           <TableRow key={mascota.id}>
                              <TableCell className='font-medium'>
                                 {mascota.nombre}
                              </TableCell>
                              <TableCell>{mascota.especie}</TableCell>
                              <TableCell>{mascota.raza}</TableCell>
                              <TableCell>{mascota.fechaNacimiento ? calcularEdad(mascota.fechaNacimiento) : "-"}</TableCell>
                              <TableCell>
                                 <Badge
                                    variant={
                                       mascota.estado === "Activo"
                                          ? "default"
                                          : "secondary"
                                    }
                                 >
                                    {mascota.estado}
                                 </Badge>
                              </TableCell>
                              <TableCell className='text-right'>
                                 <div className='flex justify-end gap-2'>
                                    <Button
                                       variant='ghost'
                                       size='sm'
                                       asChild
                                       title='Ver historia clínica'
                                    >
                                       <Link to={`/mascotas/${mascota.id}`}>
                                          <Eye className='h-4 w-4' />
                                       </Link>
                                    </Button>
                                    <Button
                                       variant='ghost'
                                       size='sm'
                                       title='Editar mascota'
                                       onClick={() =>
                                          openEditMascota(mascota.id)
                                       }
                                    >
                                       <Edit className='h-4 w-4' />
                                    </Button>
                                    <Button
                                       variant='ghost'
                                       size='sm'
                                       title='Eliminar mascota'
                                       onClick={() =>
                                          handleDeleteMascota(
                                             mascota.id,
                                             mascota.nombre,
                                          )
                                       }
                                    >
                                       <Trash2 className='h-4 w-4 text-destructive' />
                                    </Button>
                                 </div>
                              </TableCell>
                           </TableRow>
                        ))}
                     </TableBody>
                  </Table>
               )}
            </CardContent>
         </Card>

         {/* Historial de Pagos */}
         <Card className='mt-6'>
            <CardHeader>
               <div className='flex justify-between items-center'>
                  <div>
                     <CardTitle>Historial de Pagos</CardTitle>
                     <CardDescription>
                        Registro de cargos y pagos
                     </CardDescription>
                  </div>
                  <Button onClick={handleCreatePago}>
                     <Plus className='mr-2 h-4 w-4' />
                     Nuevo Pago
                  </Button>
               </div>
            </CardHeader>
            <CardContent>
               {isLoadingPagos ? (
                  <div className='flex justify-center items-center py-8'>
                     <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
                  </div>
               ) : itemsPago.length === 0 ? (
                  <p className='text-sm text-muted-foreground'>
                     No hay pagos registrados
                  </p>
               ) : (
                  <Table>
                     <TableHeader>
                        <TableRow>
                           <TableHead>Fecha</TableHead>
                           <TableHead>Descripción</TableHead>
                           <TableHead className='text-right'>Monto</TableHead>
                           <TableHead className='text-right'>Pagado</TableHead>
                           <TableHead className='text-right'>
                              Pendiente
                           </TableHead>
                           <TableHead>Estado</TableHead>
                           <TableHead className='text-right'>
                              Acciones
                           </TableHead>
                        </TableRow>
                     </TableHeader>
                     <TableBody>
                        {itemsPago.map((item) => {
                           const pendiente = item.monto - item.montoPagado;
                           return (
                              <TableRow key={item.id}>
                                 <TableCell>
                                    {format(item.fecha, "dd/MM/yyyy", {
                                       locale: es,
                                    })}
                                 </TableCell>
                                 <TableCell>{item.descripcion}</TableCell>
                                 <TableCell className='text-right'>
                                    ${Math.round(item.monto).toLocaleString()}
                                 </TableCell>
                                 <TableCell className='text-right text-green-600'>
                                    $
                                    {Math.round(
                                       item.montoPagado,
                                    ).toLocaleString()}
                                 </TableCell>
                                 <TableCell className='text-right font-bold text-destructive'>
                                    ${Math.round(pendiente).toLocaleString()}
                                 </TableCell>
                                 <TableCell>
                                    <Badge
                                       variant={
                                          item.estado === "Pagado"
                                             ? "default"
                                             : item.estado === "Pagado Parcial"
                                               ? "secondary"
                                               : "destructive"
                                       }
                                    >
                                       {item.estado}
                                    </Badge>
                                 </TableCell>
                                 <TableCell className='text-right'>
                                    <div className='flex justify-end gap-2'>
                                       {item.estado !== "Pagado" && (
                                          <Button
                                             variant='ghost'
                                             size='sm'
                                             onClick={() =>
                                                handleRegistrarPago(item)
                                             }
                                             title='Registrar pago'
                                          >
                                             <CreditCard className='h-4 w-4' />
                                          </Button>
                                       )}
                                       <Button
                                          variant='ghost'
                                          size='sm'
                                          onClick={() => handleEditPago(item)}
                                          title='Editar'
                                       >
                                          <Edit className='h-4 w-4' />
                                       </Button>
                                       <Button
                                          variant='ghost'
                                          size='sm'
                                          onClick={() =>
                                             handleDeletePago(
                                                item.id,
                                                item.descripcion,
                                             )
                                          }
                                          title='Eliminar'
                                       >
                                          <Trash2 className='h-4 w-4 text-destructive' />
                                       </Button>
                                    </div>
                                 </TableCell>
                              </TableRow>
                           );
                        })}
                     </TableBody>
                  </Table>
               )}
            </CardContent>
         </Card>

         {/* Recordatorios */}
         <Card className='mt-6'>
            <CardHeader>
               <div className='flex justify-between items-center'>
                  <div>
                     <CardTitle className='flex items-center gap-2'>
                        <Bell className='h-5 w-5' />
                        Recordatorios
                     </CardTitle>
                     <CardDescription>
                        Seguimientos y alertas programadas
                     </CardDescription>
                  </div>
                  <Button onClick={handleCreateRecordatorio}>
                     <Plus className='mr-2 h-4 w-4' />
                     Nuevo Recordatorio
                  </Button>
               </div>
            </CardHeader>
            <CardContent>
               {isLoadingRecordatorios ? (
                  <div className='flex justify-center items-center py-8'>
                     <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
                  </div>
               ) : recordatorios.length === 0 ? (
                  <p className='text-sm text-muted-foreground'>
                     No hay recordatorios registrados
                  </p>
               ) : (
                  <Table>
                     <TableHeader>
                        <TableRow>
                           <TableHead>Fecha</TableHead>
                           <TableHead>Mascota</TableHead>
                           <TableHead>Título</TableHead>
                           <TableHead>Estado</TableHead>
                           <TableHead className='text-right'>
                              Acciones
                           </TableHead>
                        </TableRow>
                     </TableHeader>
                     <TableBody>
                        {recordatorios
                           .sort(
                              (a, b) =>
                                 a.fechaRecordatorio.getTime() -
                                 b.fechaRecordatorio.getTime(),
                           )
                           .map((recordatorio) => {
                              const mascota = mascotas.find(
                                 (m) => m.id === recordatorio.mascotaId,
                              );
                              const hoy = new Date();
                              hoy.setHours(0, 0, 0, 0);
                              const fechaRec = new Date(
                                 recordatorio.fechaRecordatorio,
                              );
                              fechaRec.setHours(0, 0, 0, 0);
                              const diasDiferencia = Math.ceil(
                                 (fechaRec.getTime() - hoy.getTime()) /
                                    (1000 * 60 * 60 * 24),
                              );

                              return (
                                 <TableRow key={recordatorio.id}>
                                    <TableCell>
                                       <div>
                                          <p className='font-medium'>
                                             {format(
                                                recordatorio.fechaRecordatorio,
                                                "dd/MM/yyyy",
                                                { locale: es },
                                             )}
                                          </p>
                                          {recordatorio.estado !==
                                             "Completado" &&
                                             recordatorio.estado !==
                                                "Cancelado" && (
                                                <p className='text-xs text-muted-foreground'>
                                                   {diasDiferencia === 0
                                                      ? "Hoy"
                                                      : diasDiferencia === 1
                                                        ? "Mañana"
                                                        : diasDiferencia > 0
                                                          ? `En ${diasDiferencia} días`
                                                          : `Atrasado ${Math.abs(diasDiferencia)} días`}
                                                </p>
                                             )}
                                       </div>
                                    </TableCell>
                                    <TableCell>
                                       {mascota
                                          ? mascota.nombre
                                          : "Desconocida"}
                                    </TableCell>
                                    <TableCell>
                                       <div>
                                          <p className='font-medium'>
                                             {recordatorio.titulo}
                                          </p>
                                          {recordatorio.descripcion && (
                                             <p className='text-xs text-muted-foreground'>
                                                {recordatorio.descripcion}
                                             </p>
                                          )}
                                       </div>
                                    </TableCell>
                                    <TableCell>
                                       <Badge
                                          variant={
                                             recordatorio.estado ===
                                             "Completado"
                                                ? "default"
                                                : recordatorio.estado ===
                                                    "Reprogramado"
                                                  ? "secondary"
                                                  : recordatorio.estado ===
                                                      "Cancelado"
                                                    ? "outline"
                                                    : "destructive"
                                          }
                                       >
                                          {recordatorio.estado}
                                       </Badge>
                                    </TableCell>
                                    <TableCell className='text-right'>
                                       <div className='flex justify-end gap-2'>
                                          {recordatorio.estado !==
                                             "Completado" &&
                                             recordatorio.estado !==
                                                "Cancelado" && (
                                                <>
                                                   <Button
                                                      variant='ghost'
                                                      size='sm'
                                                      onClick={() =>
                                                         handleCompletar(
                                                            recordatorio.id,
                                                         )
                                                      }
                                                      title='Marcar como completado'
                                                   >
                                                      <CheckCircle className='h-4 w-4 text-green-600' />
                                                   </Button>
                                                   <Button
                                                      variant='ghost'
                                                      size='sm'
                                                      onClick={() =>
                                                         handleReprogramar(
                                                            recordatorio,
                                                         )
                                                      }
                                                      title='Reprogramar'
                                                   >
                                                      <CalendarIcon className='h-4 w-4' />
                                                   </Button>
                                                   <Button
                                                      variant='ghost'
                                                      size='sm'
                                                      onClick={() =>
                                                         handleCancelar(
                                                            recordatorio.id,
                                                         )
                                                      }
                                                      title='Cancelar'
                                                   >
                                                      <XCircle className='h-4 w-4' />
                                                   </Button>
                                                </>
                                             )}
                                          <Button
                                             variant='ghost'
                                             size='sm'
                                             onClick={() =>
                                                handleDeleteRecordatorio(
                                                   recordatorio.id,
                                                   recordatorio.titulo,
                                                )
                                             }
                                             title='Eliminar'
                                          >
                                             <Trash2 className='h-4 w-4 text-destructive' />
                                          </Button>
                                       </div>
                                    </TableCell>
                                 </TableRow>
                              );
                           })}
                     </TableBody>
                  </Table>
               )}
            </CardContent>
         </Card>

         {/* ============================================ */}
         {/* VENTAS DEL CLIENTE */}
         {/* ============================================ */}
         <Card className='mt-6'>
            <CardHeader>
               <div className='flex justify-between items-center'>
                  <div>
                     <CardTitle>Ventas</CardTitle>
                     <CardDescription>
                        {isLoadingVentas
                           ? "Cargando..."
                           : `${ventas.length} venta${ventas.length !== 1 ? "s" : ""} registrada${ventas.length !== 1 ? "s" : ""}`}
                     </CardDescription>
                  </div>
                  <Button
                     onClick={() => setIsVentaFormOpen(true)}
                     disabled={isLoadingVentas}
                  >
                     <ShoppingCart className='mr-2 h-4 w-4' />
                     Nueva Venta
                  </Button>
               </div>
            </CardHeader>
            <CardContent>
               {isLoadingVentas ? (
                  <div className='flex justify-center items-center py-8'>
                     <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
                  </div>
               ) : ventas.length === 0 ? (
                  <p className='text-sm text-muted-foreground'>
                     No hay ventas registradas para este cliente.
                  </p>
               ) : (
                  <Table>
                     <TableHeader>
                        <TableRow>
                           <TableHead>Fecha</TableHead>
                           <TableHead className='text-right'>Total</TableHead>
                           <TableHead>Estado Pago</TableHead>
                           <TableHead className='text-right'>
                              Acciones
                           </TableHead>
                        </TableRow>
                     </TableHeader>
                     <TableBody>
                        {ventas.map((venta) => {
                           const estadoBadge =
                              venta.estadoPago === "Pagado" ? (
                                 <Badge
                                    variant='default'
                                    className='bg-green-600'
                                 >
                                    Pagado
                                 </Badge>
                              ) : venta.estadoPago === "Pagado Parcial" ? (
                                 <Badge
                                    variant='default'
                                    className='bg-yellow-600'
                                 >
                                    Pagado Parcial
                                 </Badge>
                              ) : (
                                 <Badge variant='destructive'>Pendiente</Badge>
                              );

                           return (
                              <TableRow key={venta.id}>
                                 <TableCell>
                                    {format(
                                       new Date(venta.fecha),
                                       "d 'de' MMMM, yyyy",
                                       { locale: es },
                                    )}
                                 </TableCell>
                                 <TableCell className='text-right font-semibold'>
                                    ${venta.total}
                                 </TableCell>
                                 <TableCell>{estadoBadge}</TableCell>
                                 <TableCell className='text-right'>
                                    <Button variant='ghost' size='sm' asChild>
                                       <Link to={`/ventas/${venta.id}`}>
                                          <Eye className='h-4 w-4' />
                                       </Link>
                                    </Button>
                                 </TableCell>
                              </TableRow>
                           );
                        })}
                     </TableBody>
                  </Table>
               )}
            </CardContent>
         </Card>

         {/* Formulario de Edición Cliente */}
         <ClienteForm
            open={isEditFormOpen}
            onOpenChange={setIsEditFormOpen}
            onSubmit={handleEditCliente}
            initialData={cliente}
            mode='edit'
         />

         {/* Formulario de Crear/Editar Mascota */}
         <MascotaForm
            open={isMascotaFormOpen}
            onOpenChange={(open) => {
               setIsMascotaFormOpen(open);
               if (!open) setEditingMascota(null);
            }}
            onSubmit={editingMascota ? handleEditMascota : handleCreateMascota}
            initialData={mascotaToEdit}
            mode={editingMascota ? "edit" : "create"}
         />

         {/* Formulario de Pago */}
         <PagoItemForm
            open={isPagoFormOpen}
            onOpenChange={(open) => {
               setIsPagoFormOpen(open);
               if (!open) setEditingPago(null);
            }}
            onSubmit={handlePagoSubmit}
            initialData={editingPago || undefined}
            mode={editingPago ? "edit" : "create"}
            clienteId={id}
         />

         {/* Formulario de Pago Parcial */}
         <PagoParcialForm
            open={isPagoParcialFormOpen}
            onOpenChange={(open) => {
               setIsPagoParcialFormOpen(open);
               if (!open) setSelectedPagoForPayment(null);
            }}
            onSubmit={handlePagoParcialSubmit}
            itemPago={selectedPagoForPayment}
         />

         {/* Formulario de Recordatorio */}
         <RecordatorioForm
            open={isRecordatorioFormOpen}
            onOpenChange={setIsRecordatorioFormOpen}
            clienteId={id!}
         />

         {/* Diálogo de Reprogramar Recordatorio */}
         <ReprogramarDialog
            open={isReprogramarDialogOpen}
            onOpenChange={setIsReprogramarDialogOpen}
            onSubmit={handleReprogramarSubmit}
            recordatorio={selectedRecordatorio}
         />

         {/* Diálogo de Nueva Venta */}
         <VentaFormDialog
            open={isVentaFormOpen}
            onOpenChange={setIsVentaFormOpen}
            onSubmit={handleCreateVenta}
            initialClienteId={id}
            readonlyCliente={true}
            isSubmitting={createVentaMutation.isPending}
         />

         {/* Diálogo de Confirmación de Eliminación */}
         <AlertDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
         >
            <AlertDialogContent>
               <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                     Esta acción no se puede deshacer. Se eliminará
                     permanentemente el cliente{" "}
                     <span className='font-semibold'>
                        {cliente.nombre} {cliente.apellido}
                     </span>
                     {mascotas.length > 0 && (
                        <span>
                           {" "}
                           y todas sus mascotas ({mascotas.length} mascota
                           {mascotas.length !== 1 ? "s" : ""})
                        </span>
                     )}
                     .
                  </AlertDialogDescription>
               </AlertDialogHeader>
               <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                     onClick={handleDeleteCliente}
                     className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  >
                     Eliminar
                  </AlertDialogAction>
               </AlertDialogFooter>
            </AlertDialogContent>
         </AlertDialog>
      </div>
   );
}
