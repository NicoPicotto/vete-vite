import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Loader2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ProductoForm } from '@/components/productos/ProductoForm';
import type { ProductoFormValues } from '@/lib/schemas';
import type { Producto, CategoriaProducto } from '@/lib/types';
import {
  useProductos,
  useCreateProducto,
  useUpdateProducto,
  useDeleteProducto,
} from '@/hooks/useProductos';

export default function ProductosView() {
  const { data: productos = [], isLoading, error } = useProductos();
  const createProductoMutation = useCreateProducto();
  const updateProductoMutation = useUpdateProducto();
  const deleteProductoMutation = useDeleteProducto();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingProducto, setEditingProducto] = useState<Producto | undefined>(undefined);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productoToDelete, setProductoToDelete] = useState<Producto | null>(null);

  const [filtroCategoria, setFiltroCategoria] = useState<CategoriaProducto | 'Todas'>('Todas');
  const [searchTerm, setSearchTerm] = useState('');

  const productosFiltrados = useMemo(() => {
    const result = filtroCategoria === 'Todas'
      ? productos
      : productos.filter((p) => p.categoria === filtroCategoria);

    const term = searchTerm.toLowerCase().trim();
    if (!term) return result;

    return result.filter(
      (p) =>
        p.nombre.toLowerCase().includes(term) ||
        (p.sku ?? '').toLowerCase().includes(term)
    );
  }, [productos, filtroCategoria, searchTerm]);

  const handleCreateProducto = () => {
    setFormMode('create');
    setEditingProducto(undefined);
    setIsFormOpen(true);
  };

  const handleEditProducto = (producto: Producto) => {
    setFormMode('edit');
    setEditingProducto(producto);
    setIsFormOpen(true);
  };

  const handleSubmit = (data: ProductoFormValues) => {
    if (formMode === 'create') {
      createProductoMutation.mutate(data, {
        onSuccess: () => {
          setIsFormOpen(false);
        },
      });
    } else if (editingProducto) {
      updateProductoMutation.mutate(
        { id: editingProducto.id, data },
        {
          onSuccess: () => {
            setIsFormOpen(false);
            setEditingProducto(undefined);
          },
        }
      );
    }
  };

  const handleDeleteClick = (producto: Producto) => {
    setProductoToDelete(producto);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (productoToDelete) {
      deleteProductoMutation.mutate(productoToDelete.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setProductoToDelete(null);
        },
      });
    }
  };

  // Badge de stock
  const getStockBadge = (producto: Producto) => {
    if (producto.cantidadExistente === 0) {
      return <Badge variant="destructive">Sin Stock</Badge>;
    }
    if (producto.cantidadExistente < producto.cantidadIdeal) {
      return <Badge variant="destructive">Stock Bajo</Badge>;
    }
    return <Badge variant="default" className="bg-green-600">Stock OK</Badge>;
  };

  if (error) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Productos</h1>
            <p className="text-muted-foreground">Gestión de inventario y stock</p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-destructive mb-2">Error al cargar productos</p>
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
          <h1 className="text-3xl font-bold">Productos</h1>
          <p className="text-muted-foreground">Gestión de inventario y stock</p>
        </div>
        <Button
          onClick={handleCreateProducto}
          disabled={createProductoMutation.isPending}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Producto
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Listado de Productos</CardTitle>
              <CardDescription>
                {isLoading
                  ? 'Cargando...'
                  : `${productosFiltrados.length} de ${productos.length} producto${productos.length !== 1 ? 's' : ''}`}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Categoría:</span>
              <Select
                value={filtroCategoria}
                onValueChange={(value) => setFiltroCategoria(value as CategoriaProducto | 'Todas')}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todas">Todas</SelectItem>
                  <SelectItem value="PetShop">PetShop</SelectItem>
                  <SelectItem value="Farmacia">Farmacia</SelectItem>
                  <SelectItem value="Medicina">Medicina</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : productosFiltrados.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {searchTerm
                ? `No se encontraron productos para "${searchTerm}".`
                : filtroCategoria === 'Todas'
                  ? 'No hay productos registrados. Crea el primero.'
                  : `No hay productos en la categoría ${filtroCategoria}.`}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead className="text-right">Stock Actual</TableHead>
                    <TableHead className="text-right">Stock Ideal</TableHead>
                    <TableHead className="text-right">Precio Venta</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productosFiltrados.map((producto) => (
                    <TableRow key={producto.id}>
                      <TableCell className="font-mono text-sm">
                        {producto.sku || '-'}
                      </TableCell>
                      <TableCell className="font-medium">{producto.nombre}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{producto.categoria}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{producto.cantidadExistente}</TableCell>
                      <TableCell className="text-right">{producto.cantidadIdeal}</TableCell>
                      <TableCell className="text-right">${producto.precioVenta}</TableCell>
                      <TableCell>{getStockBadge(producto)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditProducto(producto)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(producto)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Formulario de Producto (Dialog) */}
      <ProductoForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmit}
        initialData={editingProducto}
        mode={formMode}
      />

      {/* AlertDialog para confirmar eliminación */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el producto <strong>{productoToDelete?.nombre}</strong> del
              inventario. Esta acción no se puede deshacer.
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
