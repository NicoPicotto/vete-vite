import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Eye, Loader2 } from 'lucide-react';
import { ClienteForm } from '@/components/clientes/ClienteForm';
import type { ClienteFormValues } from '@/lib/schemas';
import { useClientes, useCreateCliente } from '@/hooks/useClientes';
import { useMascotas } from '@/hooks/useMascotas';
import { useItemsPago } from '@/hooks/usePagos';

export default function ClientesView() {
  // TanStack Query hooks para clientes desde Supabase
  const { data: clientes = [], isLoading, error } = useClientes();
  const createClienteMutation = useCreateCliente();

  // TanStack Query hooks para mascotas desde Supabase
  const { data: mascotas = [] } = useMascotas();

  // TanStack Query hooks para items de pago desde Supabase
  const { data: itemsPago = [] } = useItemsPago();

  // Helper para contar mascotas por cliente
  const getMascotasCountByClienteId = (clienteId: string) => {
    return mascotas.filter(m => m.clienteId === clienteId).length;
  };

  // Calcular saldo por cliente
  const saldosPorCliente = useMemo(() => {
    const saldos = new Map<string, number>();

    itemsPago.forEach((item) => {
      const saldo = item.monto - item.montoPagado;
      if (saldo > 0) {
        saldos.set(item.clienteId, (saldos.get(item.clienteId) || 0) + saldo);
      }
    });

    return saldos;
  }, [itemsPago]);

  const getSaldoCliente = (clienteId: string) => {
    return saldosPorCliente.get(clienteId) || 0;
  };

  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleCreateCliente = (data: ClienteFormValues) => {
    createClienteMutation.mutate(data, {
      onSuccess: () => {
        setIsFormOpen(false);
      },
    });
  };

  // Mostrar error si hay
  if (error) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Clientes</h1>
            <p className="text-muted-foreground">Gestión de clientes y sus mascotas</p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-destructive mb-2">Error al cargar clientes</p>
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
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="text-muted-foreground">Gestión de clientes y sus mascotas</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} disabled={createClienteMutation.isPending}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado de Clientes</CardTitle>
          <CardDescription>
            {isLoading ? 'Cargando...' : `${clientes.length} cliente${clientes.length !== 1 ? 's' : ''} registrado${clientes.length !== 1 ? 's' : ''}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : clientes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No hay clientes registrados</p>
              <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Crear Primer Cliente
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Mascotas</TableHead>
                  <TableHead>Saldo</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientes.map((cliente) => {
                  const mascotasCount = getMascotasCountByClienteId(cliente.id);
                  const saldo = getSaldoCliente(cliente.id);
                  const tieneSaldo = saldo > 0;

                  return (
                    <TableRow key={cliente.id}>
                      <TableCell className="font-medium">
                        {cliente.nombre} {cliente.apellido}
                      </TableCell>
                      <TableCell>{cliente.telefono}</TableCell>
                      <TableCell>{cliente.email || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {mascotasCount} mascota{mascotasCount !== 1 ? 's' : ''}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {tieneSaldo ? (
                          <span className="font-semibold text-destructive">
                            ${saldo.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Al día</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/clientes/${cliente.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver
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

      <ClienteForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleCreateCliente}
        mode="create"
      />
    </div>
  );
}
