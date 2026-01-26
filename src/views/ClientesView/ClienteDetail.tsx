import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
import { ArrowLeft, Mail, Phone, MapPin, CreditCard, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { ClienteForm } from '@/components/clientes/ClienteForm';
import { MascotaForm } from '@/components/mascotas/MascotaForm';
import type { ClienteFormValues, MascotaFormValues } from '@/lib/schemas';
import { toast } from 'sonner';

export default function ClienteDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    getClienteById,
    getMascotasByClienteId,
    getItemsPagoByClienteId,
    updateCliente,
    deleteCliente,
    addMascota,
    updateMascota,
    deleteMascota,
  } = useData();

  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isMascotaFormOpen, setIsMascotaFormOpen] = useState(false);
  const [editingMascota, setEditingMascota] = useState<string | null>(null);

  const cliente = getClienteById(id!);
  const mascotas = getMascotasByClienteId(id!);
  const itemsPago = getItemsPagoByClienteId(id!);

  const handleEditCliente = (data: ClienteFormValues) => {
    updateCliente(id!, data);
    toast.success('Cliente actualizado exitosamente');
  };

  const handleDeleteCliente = () => {
    deleteCliente(id!);
    toast.success('Cliente eliminado exitosamente');
    navigate('/clientes');
  };

  const handleCreateMascota = (data: MascotaFormValues) => {
    const nuevaMascota = {
      id: crypto.randomUUID(),
      clienteId: id!,
      ...data,
    };
    addMascota(nuevaMascota);
    toast.success('Mascota creada exitosamente');
  };

  const handleEditMascota = (data: MascotaFormValues) => {
    if (editingMascota) {
      updateMascota(editingMascota, data);
      toast.success('Mascota actualizada exitosamente');
      setEditingMascota(null);
    }
  };

  const handleDeleteMascota = (mascotaId: string, nombreMascota: string) => {
    if (confirm(`¿Estás seguro de eliminar a ${nombreMascota}?`)) {
      deleteMascota(mascotaId);
      toast.success('Mascota eliminada exitosamente');
    }
  };

  const openEditMascota = (mascotaId: string) => {
    setEditingMascota(mascotaId);
    setIsMascotaFormOpen(true);
  };

  const mascotaToEdit = editingMascota ? mascotas.find(m => m.id === editingMascota) : undefined;

  if (!cliente) {
    return (
      <div>
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/clientes">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Link>
        </Button>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Cliente no encontrado</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Button variant="ghost" asChild>
          <Link to="/clientes">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Clientes
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsEditFormOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
          <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información del Cliente */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-2xl">
              {cliente.nombre} {cliente.apellido}
            </CardTitle>
            <CardDescription>
              Cliente desde {cliente.fechaRegistro.toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{cliente.telefono}</span>
            </div>
            {cliente.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{cliente.email}</span>
              </div>
            )}
            {cliente.direccion && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{cliente.direccion}</span>
              </div>
            )}
            {cliente.dniCuit && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">DNI/CUIT:</span>
                <span>{cliente.dniCuit}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Estado de Cuenta */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Estado de Cuenta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total items:</span>
                <span className="font-medium">{itemsPago.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Pendientes:</span>
                <span className="font-medium">
                  {itemsPago.filter((i) => i.estado !== 'Pagado').length}
                </span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Saldo:</span>
                  <span className={`font-bold text-lg ${cliente.saldoPendiente > 0 ? 'text-destructive' : 'text-green-600'}`}>
                    ${cliente.saldoPendiente.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mascotas */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Mascotas</CardTitle>
              <CardDescription>{mascotas.length} mascota{mascotas.length !== 1 ? 's' : ''} registrada{mascotas.length !== 1 ? 's' : ''}</CardDescription>
            </div>
            <Button onClick={() => {
              setEditingMascota(null);
              setIsMascotaFormOpen(true);
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Mascota
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {mascotas.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay mascotas registradas</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Especie</TableHead>
                  <TableHead>Raza</TableHead>
                  <TableHead>Edad</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mascotas.map((mascota) => (
                  <TableRow key={mascota.id}>
                    <TableCell className="font-medium">{mascota.nombre}</TableCell>
                    <TableCell>{mascota.especie}</TableCell>
                    <TableCell>{mascota.raza}</TableCell>
                    <TableCell>{mascota.edad || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={mascota.estado === 'Activo' ? 'default' : 'secondary'}>
                        {mascota.estado}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/mascotas/${mascota.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditMascota(mascota.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteMascota(mascota.id, mascota.nombre)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
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
      {itemsPago.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Historial de Pagos</CardTitle>
            <CardDescription>Registro de cargos y pagos</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Pagado</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {itemsPago.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.fecha.toLocaleDateString()}</TableCell>
                    <TableCell>{item.descripcion}</TableCell>
                    <TableCell>${item.monto.toLocaleString()}</TableCell>
                    <TableCell>${item.montoPagado.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          item.estado === 'Pagado'
                            ? 'default'
                            : item.estado === 'Pagado Parcial'
                            ? 'secondary'
                            : 'destructive'
                        }
                      >
                        {item.estado}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Formulario de Edición Cliente */}
      <ClienteForm
        open={isEditFormOpen}
        onOpenChange={setIsEditFormOpen}
        onSubmit={handleEditCliente}
        initialData={cliente}
        mode="edit"
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
        mode={editingMascota ? 'edit' : 'create'}
      />

      {/* Diálogo de Confirmación de Eliminación */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el cliente{' '}
              <span className="font-semibold">
                {cliente.nombre} {cliente.apellido}
              </span>
              {mascotas.length > 0 && (
                <span>
                  {' '}
                  y todas sus mascotas ({mascotas.length} mascota{mascotas.length !== 1 ? 's' : ''})
                </span>
              )}
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCliente} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
