import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Pencil, Trash2, Copy, Check, Loader2, MessageSquare, Search } from 'lucide-react';
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
import { MensajeRapidoForm } from '@/components/mensajesRapidos/MensajeRapidoForm';
import type { MensajeRapidoFormValues } from '@/lib/schemas';
import type { MensajeRapido } from '@/lib/types';
import {
  useMensajesRapidos,
  useCreateMensajeRapido,
  useUpdateMensajeRapido,
  useDeleteMensajeRapido,
} from '@/hooks/useMensajesRapidos';
import { toast } from 'sonner';

export default function MensajesRapidosView() {
  const { data: mensajes = [], isLoading, error } = useMensajesRapidos();
  const createMutation = useCreateMensajeRapido();
  const updateMutation = useUpdateMensajeRapido();
  const deleteMutation = useDeleteMensajeRapido();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingMensaje, setEditingMensaje] = useState<MensajeRapido | undefined>(undefined);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [mensajeToDelete, setMensajeToDelete] = useState<MensajeRapido | null>(null);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const mensajesFiltrados = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return mensajes;
    return mensajes.filter(
      (m) =>
        m.titulo.toLowerCase().includes(term) ||
        m.contenido.toLowerCase().includes(term)
    );
  }, [mensajes, searchTerm]);

  const handleCreate = () => {
    setFormMode('create');
    setEditingMensaje(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (mensaje: MensajeRapido) => {
    setFormMode('edit');
    setEditingMensaje(mensaje);
    setIsFormOpen(true);
  };

  const handleSubmit = (data: MensajeRapidoFormValues) => {
    if (formMode === 'create') {
      createMutation.mutate(data, { onSuccess: () => setIsFormOpen(false) });
    } else if (editingMensaje) {
      updateMutation.mutate(
        { id: editingMensaje.id, data },
        {
          onSuccess: () => {
            setIsFormOpen(false);
            setEditingMensaje(undefined);
          },
        }
      );
    }
  };

  const handleDeleteClick = (mensaje: MensajeRapido) => {
    setMensajeToDelete(mensaje);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (mensajeToDelete) {
      deleteMutation.mutate(mensajeToDelete.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setMensajeToDelete(null);
        },
      });
    }
  };

  const handleCopiar = (mensaje: MensajeRapido) => {
    navigator.clipboard.writeText(mensaje.contenido).then(() => {
      setCopiedId(mensaje.id);
      toast.success('Mensaje copiado');
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  if (error) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Mensajes Rápidos</h1>
            <p className="text-muted-foreground">Mensajes predefinidos para copiar y pegar</p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-destructive mb-2">Error al cargar mensajes</p>
              <p className="text-sm text-muted-foreground">{(error as Error).message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Mensajes Rápidos</h1>
          <p className="text-muted-foreground">
            {isLoading ? 'Cargando...' : `${mensajesFiltrados.length} de ${mensajes.length} mensaje${mensajes.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Button onClick={handleCreate} disabled={createMutation.isPending}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Mensaje
        </Button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por título o contenido..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : mensajes.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-16 text-muted-foreground">
              <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No hay mensajes guardados todavía.</p>
              <p className="text-sm mt-1">Creá el primero con el botón de arriba.</p>
            </div>
          </CardContent>
        </Card>
      ) : mensajesFiltrados.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-16 text-muted-foreground">
              <p>No se encontraron mensajes para "{searchTerm}".</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mensajesFiltrados.map((mensaje) => (
            <Card key={mensaje.id} className="flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base leading-snug">{mensaje.titulo}</CardTitle>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(mensaje)}
                      className="h-7 w-7 p-0"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(mensaje)}
                      className="h-7 w-7 p-0"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 gap-3">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap flex-1 line-clamp-5">
                  {mensaje.contenido}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => handleCopiar(mensaje)}
                >
                  {copiedId === mensaje.id ? (
                    <>
                      <Check className="mr-2 h-4 w-4 text-green-600" />
                      <span className="text-green-600">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copiar mensaje
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <MensajeRapidoForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmit}
        initialData={editingMensaje}
        mode={formMode}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar mensaje?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará el mensaje <strong>{mensajeToDelete?.titulo}</strong>. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
