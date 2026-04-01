import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, User, Loader2 } from 'lucide-react';
import { useMascotas } from '@/hooks/useMascotas';
import { useClientes } from '@/hooks/useClientes';
import { calcularEdad } from '@/lib/utils';

export default function MascotasView() {
  const { data: mascotas = [], isLoading: isLoadingMascotas, error: errorMascotas } = useMascotas();
  const { data: clientes = [] } = useClientes();

  // Helper para obtener cliente por ID
  const getClienteById = (clienteId: string) => {
    return clientes.find(c => c.id === clienteId);
  };

  // Mostrar error
  if (errorMascotas) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Mascotas</h1>
          <p className="text-muted-foreground">Listado completo de mascotas registradas</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-destructive mb-2">Error al cargar mascotas</p>
              <p className="text-sm text-muted-foreground">{(errorMascotas as Error).message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Mascotas</h1>
        <p className="text-muted-foreground">Listado completo de mascotas registradas</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todas las Mascotas</CardTitle>
          <CardDescription>
            {isLoadingMascotas ? 'Cargando...' : `${mascotas.length} mascota${mascotas.length !== 1 ? 's' : ''} registrada${mascotas.length !== 1 ? 's' : ''}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingMascotas ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : mascotas.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No hay mascotas registradas</p>
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Especie</TableHead>
                <TableHead>Raza</TableHead>
                <TableHead>Sexo</TableHead>
                <TableHead>Edad</TableHead>
                <TableHead>Dueño</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mascotas.map((mascota) => {
                const cliente = getClienteById(mascota.clienteId);

                return (
                  <TableRow key={mascota.id}>
                    <TableCell className="font-medium">{mascota.nombre}</TableCell>
                    <TableCell>{mascota.especie}</TableCell>
                    <TableCell>{mascota.raza}</TableCell>
                    <TableCell>{mascota.sexo}</TableCell>
                    <TableCell>{mascota.fechaNacimiento ? calcularEdad(mascota.fechaNacimiento) : '-'}</TableCell>
                    <TableCell>
                      {cliente && (
                        <Button variant="link" size="sm" asChild className="p-0 h-auto">
                          <Link to={`/clientes/${cliente.id}`}>
                            <User className="h-3 w-3 mr-1" />
                            {cliente.nombre} {cliente.apellido}
                          </Link>
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={mascota.estado === 'Activo' ? 'default' : 'secondary'}>
                        {mascota.estado}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/mascotas/${mascota.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          Historia Clínica
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
    </div>
  );
}
