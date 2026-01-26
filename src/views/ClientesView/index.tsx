import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Eye } from 'lucide-react';
import { ClienteForm } from '@/components/clientes/ClienteForm';
import type { ClienteFormValues } from '@/lib/schemas';
import { toast } from 'sonner';

export default function ClientesView() {
  const { clientes, getMascotasByClienteId, addCliente, getSaldoCliente } = useData();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleCreateCliente = (data: ClienteFormValues) => {
    const nuevoCliente = {
      id: crypto.randomUUID(),
      ...data,
      fechaRegistro: new Date(),
      saldoPendiente: 0,
    };

    addCliente(nuevoCliente);
    toast.success('Cliente creado exitosamente');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="text-muted-foreground">Gestión de clientes y sus mascotas</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado de Clientes</CardTitle>
          <CardDescription>
            {clientes.length} cliente{clientes.length !== 1 ? 's' : ''} registrado{clientes.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {clientes.length === 0 ? (
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
                  const mascotas = getMascotasByClienteId(cliente.id);
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
                          {mascotas.length} mascota{mascotas.length !== 1 ? 's' : ''}
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
