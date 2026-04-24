import { useState } from 'react';
import { useClientes } from '@/hooks/useClientes';
import {
  useItemsPago,
  useDeleteItemPago,
  useCreatePagoParcial,
} from '@/hooks/usePagos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
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
import { PagoItemForm } from '@/components/pagos/PagoItemForm';
import { PagoParcialForm } from '@/components/pagos/PagoParcialForm';
import type { ItemPago } from '@/lib/types';
import type { PagoParcialFormValues } from '@/lib/schemas';
import { DollarSign, Pencil, Trash2, CreditCard, User, Loader2, Copy, Check, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

export default function PagosView() {
  const navigate = useNavigate();

  // Hooks de datos
  const { data: clientes = [], isLoading: isLoadingClientes } = useClientes();
  const { data: itemsPago = [], isLoading: isLoadingPagos } = useItemsPago();
  const deleteItemPagoMutation = useDeleteItemPago();
  const createPagoParcialMutation = useCreatePagoParcial();

  // Estados para formularios
  const [itemFormOpen, setItemFormOpen] = useState(false);
  const [pagoFormOpen, setPagoFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedItem, setSelectedItem] = useState<ItemPago | null>(null);

  // Estado para AlertDialog de eliminación
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ItemPago | null>(null);

  // Estado para feedback de copia
  const [copiedClienteId, setCopiedClienteId] = useState<string | null>(null);

  // Estado para búsqueda
  const [searchTerm, setSearchTerm] = useState('');

  // ============================================
  // CALCULOS
  // ============================================

  // Calcular saldo pendiente por cliente
  const getSaldoCliente = (clienteId: string): number => {
    return itemsPago
      .filter((item) => item.clienteId === clienteId)
      .reduce((total, item) => total + (item.monto - item.montoPagado), 0);
  };

  // Clientes con saldo pendiente
  const clientesConSaldo = clientes
    .map((cliente) => ({
      ...cliente,
      saldoPendiente: getSaldoCliente(cliente.id),
    }))
    .filter((cliente) => cliente.saldoPendiente > 0)
    .sort((a, b) => b.saldoPendiente - a.saldoPendiente);

  const clientesConSaldoFiltrados = clientesConSaldo.filter((cliente) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      cliente.nombre.toLowerCase().includes(term) ||
      cliente.apellido.toLowerCase().includes(term) ||
      cliente.telefono.includes(term)
    );
  });

  // ============================================
  // HANDLERS - ITEM PAGO
  // ============================================

  const handleEditItem = (item: ItemPago) => {
    setSelectedItem(item);
    setFormMode('edit');
    setItemFormOpen(true);
  };

  const handleDeleteClick = (item: ItemPago) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      deleteItemPagoMutation.mutate(itemToDelete.id);
      setItemToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleItemSubmit = () => {
    // La lógica de crear/editar se maneja en el PagoItemForm
    // que usa los hooks directamente
    setItemFormOpen(false);
    setSelectedItem(null);
  };

  // ============================================
  // HANDLERS - PAGO PARCIAL
  // ============================================

  const handleRegistrarPago = (item: ItemPago) => {
    setSelectedItem(item);
    setPagoFormOpen(true);
  };

  const handlePagoParcialSubmit = (data: PagoParcialFormValues) => {
    if (selectedItem) {
      createPagoParcialMutation.mutate({
        itemPagoId: selectedItem.id,
        monto: data.monto,
        notas: data.notas,
      });
      setPagoFormOpen(false);
      setSelectedItem(null);
    }
  };

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  const getEstadoBadgeVariant = (estado: ItemPago['estado']) => {
    switch (estado) {
      case 'Pagado':
        return 'default';
      case 'Pagado Parcial':
        return 'secondary';
      default:
        return 'destructive';
    }
  };

  const getClienteNombre = (clienteId: string | undefined) => {
    if (!clienteId) return 'Venta al Paso';
    const cliente = clientes.find((c) => c.id === clienteId);
    return cliente ? `${cliente.nombre} ${cliente.apellido}` : 'Desconocido';
  };

  const getItemsPagoByClienteId = (clienteId: string) => {
    return itemsPago.filter((item) => item.clienteId === clienteId);
  };

  const handleCopiarEstadoCuenta = (
    cliente: (typeof clientesConSaldo)[0],
    items: ItemPago[]
  ) => {
    const itemsPendientes = items.filter((i) => i.estado !== 'Pagado');
    const hoy = format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: es });

    const lineasItems = itemsPendientes
      .map((item) => {
        const pendiente = item.monto - item.montoPagado;
        const fecha = format(item.fecha, 'dd/MM/yyyy', { locale: es });
        const pagado = item.montoPagado > 0 ? `\n   ✅ Pagado: $${Math.round(item.montoPagado).toLocaleString()}` : '';
        return `• ${item.descripcion}\n   📅 Fecha: ${fecha} | Total: $${Math.round(item.monto).toLocaleString()}${pagado}\n   ⏳ Pendiente: $${Math.round(pendiente).toLocaleString()}`;
      })
      .join('\n\n');

    const texto = `*Estado de Cuenta — ${cliente.nombre} ${cliente.apellido}*\n📅 ${hoy}\n\n${lineasItems}\n\n━━━━━━━━━━━━━━━\n💰 *TOTAL ADEUDADO: $${Math.round(cliente.saldoPendiente).toLocaleString()}*\n\nSi quisieras transferir te facilito el alias: clinicaparamascotas2 a nombre de Florencia Ciravegna (Naranja X)`;

    navigator.clipboard.writeText(texto).then(() => {
      setCopiedClienteId(cliente.id);
      toast.success('Estado de cuenta copiado');
      setTimeout(() => setCopiedClienteId(null), 2000);
    });
  };

  // ============================================
  // LOADING STATE
  // ============================================

  if (isLoadingClientes || isLoadingPagos) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Pagos y Cuentas</h1>
        <Card>
          <CardContent className="py-10">
            <div className="flex justify-center items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <p className="text-muted-foreground">Cargando datos de pagos...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mb-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Pagos y Cuentas</h1>
        <p className="text-muted-foreground">
          Gestión de pagos, cuentas corrientes y saldos pendientes
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="saldos" className="w-full">
        <TabsList>
          <TabsTrigger value="saldos">
            <DollarSign className="mr-2 h-4 w-4" />
            Clientes con Saldo ({clientesConSaldo.length})
          </TabsTrigger>
          <TabsTrigger value="todos">
            <CreditCard className="mr-2 h-4 w-4" />
            Todos los Pagos ({itemsPago.length})
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: Clientes con Saldo */}
        <TabsContent value="saldos" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, apellido o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          {clientesConSaldoFiltrados.length === 0 ? (
            <Card>
              <CardContent className="py-10">
                <div className="text-center text-muted-foreground">
                  <DollarSign className="mx-auto h-12 w-12 opacity-50 mb-4" />
                  <p>
                    {searchTerm.trim()
                      ? `No se encontraron clientes para "${searchTerm}"`
                      : 'No hay clientes con saldo pendiente'}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {clientesConSaldoFiltrados.map((cliente) => {
                const items = getItemsPagoByClienteId(cliente.id);
                const itemsPendientes = items.filter((i) => i.estado !== 'Pagado');

                return (
                  <Card key={cliente.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>
                            {cliente.nombre} {cliente.apellido}
                          </CardTitle>
                          <CardDescription>
                            {cliente.telefono} {cliente.email && `• ${cliente.email}`}
                          </CardDescription>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Saldo Total</p>
                            <p className="text-2xl font-bold text-destructive">
                              ${Math.round(cliente.saldoPendiente).toLocaleString()}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => handleCopiarEstadoCuenta(cliente, items)}
                          >
                            {copiedClienteId === cliente.id ? (
                              <Check className="h-4 w-4 mr-1 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4 mr-1" />
                            )}
                            {copiedClienteId === cliente.id ? 'Copiado' : 'Copiar estado de cuenta'}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Descripción</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead className="text-right">Monto</TableHead>
                            <TableHead className="text-right">Pagado</TableHead>
                            <TableHead className="text-right">Pendiente</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {itemsPendientes.map((item) => {
                            const pendiente = item.monto - item.montoPagado;
                            return (
                              <TableRow key={item.id}>
                                <TableCell className="font-medium max-w-45 truncate" title={item.descripcion}>
                                  {item.descripcion}
                                </TableCell>
                                <TableCell>
                                  {format(item.fecha, 'dd/MM/yyyy', { locale: es })}
                                </TableCell>
                                <TableCell className="text-right">
                                  ${Math.round(item.monto).toLocaleString()}
                                </TableCell>
                                <TableCell className="text-right text-green-600">
                                  ${Math.round(item.montoPagado).toLocaleString()}
                                </TableCell>
                                <TableCell className="text-right font-bold text-destructive">
                                  ${Math.round(pendiente).toLocaleString()}
                                </TableCell>
                                <TableCell>
                                  <Badge variant={getEstadoBadgeVariant(item.estado)}>
                                    {item.estado}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleRegistrarPago(item)}
                                      title="Registrar pago"
                                    >
                                      <CreditCard className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditItem(item)}
                                      title="Editar"
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => navigate(`/clientes/${cliente.id}`)}
                                      title="Ver perfil del cliente"
                                    >
                                      <User className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* TAB 2: Todos los Pagos */}
        <TabsContent value="todos">
          <Card>
            <CardHeader>
              <CardTitle>Todos los Items de Pago</CardTitle>
              <CardDescription>
                Lista completa de todos los items de pago registrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {itemsPago.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground">
                  <CreditCard className="mx-auto h-12 w-12 opacity-50 mb-4" />
                  <p>No hay items de pago registrados</p>
                  <p className="text-sm mt-2">Crea items de pago desde la vista de detalle de cada cliente</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                      <TableHead className="text-right">Pagado</TableHead>
                      <TableHead className="text-right">Pendiente</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {itemsPago
                      .sort((a, b) => b.fecha.getTime() - a.fecha.getTime())
                      .map((item) => {
                        const pendiente = item.monto - item.montoPagado;
                        return (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">
                              {getClienteNombre(item.clienteId)}
                            </TableCell>
                            <TableCell className="font-medium max-w-45 truncate">{item.descripcion}</TableCell>
                            <TableCell>
                              {format(item.fecha, 'dd/MM/yyyy', { locale: es })}
                            </TableCell>
                            <TableCell className="text-right">
                              ${Math.round(item.monto).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right text-green-600">
                              ${Math.round(item.montoPagado).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right font-bold text-destructive">
                              ${Math.round(pendiente).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Badge variant={getEstadoBadgeVariant(item.estado)}>
                                {item.estado}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                {item.estado !== 'Pagado' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRegistrarPago(item)}
                                  >
                                    <CreditCard className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditItem(item)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteClick(item)}
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
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Formulario Item Pago */}
      <PagoItemForm
        open={itemFormOpen}
        onOpenChange={setItemFormOpen}
        onSubmit={handleItemSubmit}
        initialData={selectedItem || undefined}
        mode={formMode}
      />

      {/* Formulario Pago Parcial */}
      <PagoParcialForm
        open={pagoFormOpen}
        onOpenChange={setPagoFormOpen}
        onSubmit={handlePagoParcialSubmit}
        itemPago={selectedItem}
      />

      {/* AlertDialog Eliminar */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el item de pago "{itemToDelete?.descripcion}".
              {itemToDelete && itemToDelete.pagosParciales.length > 0 && (
                <span className="block mt-2 font-semibold text-destructive">
                  Este item tiene {itemToDelete.pagosParciales.length} pago(s) parcial(es) registrado(s).
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
