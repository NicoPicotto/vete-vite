import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ventaSchema, type VentaFormValues } from "@/lib/schemas";
import type { Producto, MetodoPago } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
   Card,
   CardContent,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";
import {
   Combobox,
   ComboboxContent,
   ComboboxEmpty,
   ComboboxInput,
   ComboboxItem,
   ComboboxList,
} from "@/components/ui/combobox";
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@/components/ui/table";
import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, ShoppingCart, UserPlus, PenLine } from "lucide-react";
import { useClientes, useCreateCliente } from "@/hooks/useClientes";
import { useProductos } from "@/hooks/useProductos";
import { calcularRecargo } from "@/services/ventas.service";
import { ClienteForm } from "@/components/clientes/ClienteForm";

interface CartItem {
   tipo: "producto" | "personalizado";
   producto?: Producto;
   // Para ítems personalizados:
   nombre?: string;
   precioPersonalizado?: number;
   // Compartido:
   cantidad: number;
   // ID único para manejo del carrito
   _id: string;
}

interface ItemPersonalizadoForm {
   nombre: string;
   precio: number;
   cantidad: number;
}

interface VentaFormProps {
   onSubmit: (data: VentaFormValues) => void;
   isSubmitting?: boolean;
   initialClienteId?: string; // Cliente prellenado (desde ClienteDetail)
   readonlyCliente?: boolean; // Si true, no se puede cambiar el cliente
   onCancel?: () => void; // Función personalizada de cancelación (para Dialog)
   showCancelButton?: boolean; // Mostrar botón cancelar (default: true)
}

export function VentaForm({
   onSubmit,
   isSubmitting,
   initialClienteId,
   readonlyCliente = false,
   onCancel,
   showCancelButton = true,
}: VentaFormProps) {
   const { data: clientes = [] } = useClientes();
   const { data: productos = [] } = useProductos();
   const createClienteMutation = useCreateCliente();

   const [crearClienteOpen, setCrearClienteOpen] = useState(false);
   const [cart, setCart] = useState<CartItem[]>([]);
   const [selectedProductoId, setSelectedProductoId] = useState("");
   const [cantidad, setCantidad] = useState(1);

   // Estado del dialog de ítem personalizado
   const [itemPersonalizadoOpen, setItemPersonalizadoOpen] = useState(false);
   const [itemPersonalizado, setItemPersonalizado] =
      useState<ItemPersonalizadoForm>({ nombre: "", precio: 0, cantidad: 1 });

   const {
      register,
      handleSubmit,
      formState: { errors },
      setValue,
      watch,
   } = useForm<VentaFormValues>({
      resolver: zodResolver(ventaSchema),
      defaultValues: {
         clienteId: initialClienteId || "",
         fecha: new Date(),
         metodoPago: "Contado", // Contado por defecto
         notas: "",
         items: [],
         pagoCompleto: true, // Checked por defecto
      },
   });

   const clienteId = watch("clienteId");
   const metodoPago = watch("metodoPago");
   const pagoCompleto = watch("pagoCompleto");

   // Buscar cliente actual para mostrar nombre
   const clienteActual = clientes.find((c) => c.id === clienteId);

   // Preparar items para combobox de clientes (value usado para búsqueda)
   const clientesItems = clientes.map((c) => ({
      value: `${c.nombre} ${c.apellido} ${c.telefono}`.toLowerCase(),
      label: `${c.nombre} ${c.apellido} - ${c.telefono}`,
      id: c.id,
   }));

   // Preparar items para combobox de productos
   const productosItems = productos
      .filter((p) => p.cantidadExistente > 0)
      .map((p) => ({
         value: `${p.nombre} ${p.categoria}`.toLowerCase(),
         label: `${p.nombre} - $${p.precioVenta} (Stock: ${p.cantidadExistente})`,
         id: p.id,
      }));

   // Sync cart to form items whenever cart changes
   useEffect(() => {
      const items = cart.map((item) => {
         if (item.tipo === "producto" && item.producto) {
            return {
               productoId: item.producto.id,
               cantidad: item.cantidad,
               precioUnitario: item.producto.precioVenta,
            };
         } else {
            return {
               nombre: item.nombre,
               cantidad: item.cantidad,
               precioUnitario: item.precioPersonalizado ?? 0,
            };
         }
      });
      setValue("items", items);
   }, [cart, setValue]);

   // Agregar producto del inventario al carrito
   const handleAddToCart = () => {
      if (!selectedProductoId) return;

      const producto = productos.find((p) => p.id === selectedProductoId);
      if (!producto) return;

      // Verificar stock disponible
      if (cantidad > producto.cantidadExistente) {
         alert(
            `Stock insuficiente. Solo hay ${producto.cantidadExistente} unidades disponibles.`,
         );
         return;
      }

      // Verificar si ya está en el carrito
      const existingItemIndex = cart.findIndex(
         (item) => item.tipo === "producto" && item.producto?.id === producto.id,
      );

      if (existingItemIndex >= 0) {
         const newCart = [...cart];
         const newCantidad = newCart[existingItemIndex].cantidad + cantidad;

         if (newCantidad > producto.cantidadExistente) {
            alert(
               `Stock insuficiente. Solo hay ${producto.cantidadExistente} unidades disponibles.`,
            );
            return;
         }

         newCart[existingItemIndex].cantidad = newCantidad;
         setCart(newCart);
      } else {
         setCart([
            ...cart,
            { tipo: "producto", producto, cantidad, _id: crypto.randomUUID() },
         ]);
      }

      setSelectedProductoId("");
      setCantidad(1);
   };

   // Agregar ítem personalizado al carrito
   const handleAddItemPersonalizado = () => {
      if (!itemPersonalizado.nombre.trim()) return;
      if (itemPersonalizado.precio <= 0) return;
      if (itemPersonalizado.cantidad <= 0) return;

      setCart([
         ...cart,
         {
            tipo: "personalizado",
            nombre: itemPersonalizado.nombre.trim(),
            precioPersonalizado: itemPersonalizado.precio,
            cantidad: itemPersonalizado.cantidad,
            _id: crypto.randomUUID(),
         },
      ]);

      // Resetear y cerrar
      setItemPersonalizado({ nombre: "", precio: 0, cantidad: 1 });
      setItemPersonalizadoOpen(false);
   };

   // Obtener precio unitario de un ítem del carrito
   const getPrecioUnitario = (item: CartItem) => {
      return item.tipo === "producto"
         ? (item.producto?.precioVenta ?? 0)
         : (item.precioPersonalizado ?? 0);
   };

   // Obtener nombre de un ítem del carrito
   const getNombreItem = (item: CartItem) => {
      return item.tipo === "producto" ? (item.producto?.nombre ?? "") : (item.nombre ?? "");
   };

   // Eliminar ítem del carrito por su _id único
   const handleRemoveFromCart = (id: string) => {
      setCart(cart.filter((item) => item._id !== id));
   };

   // Calcular subtotal (sin recargo)
   const subtotal = cart.reduce(
      (acc, item) => acc + getPrecioUnitario(item) * item.cantidad,
      0,
   );

   // Calcular recargo según método de pago
   const recargo = calcularRecargo(subtotal, metodoPago);

   // Calcular total final (subtotal + recargo)
   const total = subtotal + recargo;

   // Crear cliente rápido desde la venta y auto-seleccionarlo
   const handleCrearCliente = (
      data: import("@/lib/schemas").ClienteFormValues,
   ) => {
      createClienteMutation.mutate(data, {
         onSuccess: (newCliente) => {
            setValue("clienteId", newCliente.id);
            setCrearClienteOpen(false);
         },
      });
   };

   // Enviar formulario
   const handleFormSubmit = (data: VentaFormValues) => {
      if (cart.length === 0) {
         alert("Debes agregar al menos un producto a la venta.");
         return;
      }

      const items = cart.map((item) => {
         if (item.tipo === "producto" && item.producto) {
            return {
               productoId: item.producto.id,
               cantidad: item.cantidad,
               precioUnitario: item.producto.precioVenta,
            };
         } else {
            return {
               nombre: item.nombre,
               cantidad: item.cantidad,
               precioUnitario: item.precioPersonalizado ?? 0,
            };
         }
      });

      onSubmit({ ...data, items });
   };

   return (
      <>
         <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-6'>
            <Card>
               <CardHeader>
                  <CardTitle>Información de la Venta</CardTitle>
               </CardHeader>
               <CardContent className='space-y-6'>
                  {/* Grid 2 columnas para Cliente y Fecha */}
                  <div className='grid md:grid-cols-2 gap-4'>
                     {/* Cliente */}
                     <div className='space-y-2 self-end'>
                        <div className='flex items-center justify-between'>
                           <Label htmlFor='clienteId'>Cliente (opcional)</Label>
                           {!readonlyCliente && (
                              <Button
                                 type='button'
                                 variant='ghost'
                                 size='sm'
                                 onClick={() => setCrearClienteOpen(true)}
                                 className='h-auto p-0 text-xs text-primary hover:bg-transparent hover:underline'
                              >
                                 <UserPlus className='h-3 w-3' />
                                 Nuevo cliente
                              </Button>
                           )}
                        </div>
                        <p className='text-xs text-muted-foreground'>
                           Deja en blanco para ventas al paso (sin cliente)
                        </p>
                        {readonlyCliente && clienteActual ? (
                           <div className='flex items-center gap-2 p-3 bg-muted rounded-md border'>
                              <span className='font-medium'>
                                 {clienteActual.nombre} {clienteActual.apellido}
                              </span>
                              <span className='text-muted-foreground'>
                                 - {clienteActual.telefono}
                              </span>
                           </div>
                        ) : (
                           <Combobox
                              items={clientesItems}
                              value={
                                 clienteActual
                                    ? `${clienteActual.nombre} ${clienteActual.apellido} - ${clienteActual.telefono}`
                                    : ""
                              }
                              onValueChange={(value) => {
                                 const selectedCliente = clientesItems.find(
                                    (item) => item.label === value,
                                 );
                                 setValue(
                                    "clienteId",
                                    selectedCliente?.id || "",
                                 );
                              }}
                           >
                              <ComboboxInput
                                 className='mb-0'
                                 placeholder='Buscar cliente (opcional)...'
                              />
                              <ComboboxContent>
                                 <ComboboxEmpty>
                                    No se encontró ningún cliente.
                                 </ComboboxEmpty>
                                 <ComboboxList>
                                    {(item) => (
                                       <ComboboxItem
                                          key={item.id}
                                          value={item.label}
                                       >
                                          {item.label}
                                       </ComboboxItem>
                                    )}
                                 </ComboboxList>
                              </ComboboxContent>
                           </Combobox>
                        )}
                        {errors.clienteId && (
                           <p className='text-sm text-red-500'>
                              {errors.clienteId.message}
                           </p>
                        )}
                     </div>

                     {/* Fecha */}
                     <div className='space-y-2 self-end'>
                        <Label htmlFor='fecha'>Fecha *</Label>
                        <Input
                           id='fecha'
                           type='date'
                           defaultValue={new Date().toISOString().split("T")[0]}
                           onChange={(e) =>
                              setValue("fecha", new Date(e.target.value))
                           }
                        />
                        {errors.fecha && (
                           <p className='text-sm text-red-500'>
                              {errors.fecha.message}
                           </p>
                        )}
                     </div>
                  </div>

                  {/* Grid 2 columnas para Método de Pago y Pago Completo */}
                  <div className='grid md:grid-cols-2 gap-4'>
                     {/* Método de Pago */}
                     <div className='space-y-2 self-end'>
                        <Label htmlFor='metodoPago'>Método de Pago *</Label>
                        <Select
                           value={metodoPago}
                           onValueChange={(value) =>
                              setValue("metodoPago", value as MetodoPago)
                           }
                        >
                           <SelectTrigger className='w-full mb-0'>
                              <SelectValue placeholder='Seleccionar método de pago' />
                           </SelectTrigger>
                           <SelectContent>
                              <SelectItem value='Contado'>
                                 Contado (sin recargo)
                              </SelectItem>
                              <SelectItem value='Débito'>
                                 Débito (+5%)
                              </SelectItem>
                              <SelectItem value='Crédito'>
                                 Crédito (+20%)
                              </SelectItem>
                           </SelectContent>
                        </Select>
                        {errors.metodoPago && (
                           <p className='text-sm text-red-500'>
                              {errors.metodoPago.message}
                           </p>
                        )}
                     </div>

                     {/* Pago Completo */}
                     <div className='flex space-x-2 h-fit self-end p-2 mb-1'>
                        <Checkbox
                           id='pagoCompleto'
                           checked={pagoCompleto}
                           onCheckedChange={(checked) =>
                              setValue("pagoCompleto", checked as boolean)
                           }
                        />
                        <div className='h-fit'>
                           <Label
                              htmlFor='pagoCompleto'
                              className='cursor-pointer font-medium'
                           >
                              El cliente pagó el total en este momento
                           </Label>
                        </div>
                     </div>
                  </div>

                  <div className='space-y-2'>
                     <Label htmlFor='notas'>Notas (opcional)</Label>
                     <Textarea
                        id='notas'
                        {...register("notas")}
                        placeholder='Observaciones sobre la venta'
                        rows={3}
                     />
                     {errors.notas && (
                        <p className='text-sm text-red-500'>
                           {errors.notas.message}
                        </p>
                     )}
                  </div>
               </CardContent>
            </Card>

            <Card>
               <CardHeader>
                  <CardTitle>Productos de la Venta</CardTitle>
               </CardHeader>
               <CardContent className='space-y-4'>
                  {/* Selector de productos del inventario */}
                  <div className='grid grid-cols-[1fr_100px_auto] gap-4 items-end'>
                     <div className='flex flex-col gap-2'>
                        <Label htmlFor='producto'>Producto del inventario</Label>
                        <Combobox
                           items={productosItems}
                           value={
                              selectedProductoId
                                 ? productosItems.find(
                                      (p) => p.id === selectedProductoId,
                                   )?.label || ""
                                 : ""
                           }
                           onValueChange={(value) => {
                              const selectedProducto = productosItems.find(
                                 (item) => item.label === value,
                              );
                              setSelectedProductoId(
                                 selectedProducto?.id || "",
                              );
                           }}
                        >
                           <ComboboxInput placeholder='Buscar producto...' />
                           <ComboboxContent>
                              <ComboboxEmpty>
                                 No se encontró ningún producto.
                              </ComboboxEmpty>
                              <ComboboxList>
                                 {(item) => (
                                    <ComboboxItem
                                       key={item.id}
                                       value={item.label}
                                    >
                                       {item.label}
                                    </ComboboxItem>
                                 )}
                              </ComboboxList>
                           </ComboboxContent>
                        </Combobox>
                     </div>

                     <div className='space-y-2'>
                        <Label htmlFor='cantidad'>Cantidad</Label>
                        <Input
                           id='cantidad'
                           type='number'
                           min='1'
                           value={cantidad}
                           onChange={(e) =>
                              setCantidad(parseInt(e.target.value) || 1)
                           }
                        />
                     </div>

                     <Button
                        type='button'
                        onClick={handleAddToCart}
                        disabled={!selectedProductoId}
                     >
                        <Plus className='mr-2 h-4 w-4' />
                        Agregar
                     </Button>
                  </div>

                  {/* Botón ítem personalizado */}
                  <div className='flex items-center gap-2'>
                     <div className='flex-1 border-t border-dashed' />
                     <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() => setItemPersonalizadoOpen(true)}
                        className='text-muted-foreground hover:text-foreground shrink-0'
                     >
                        <PenLine className='h-4 w-4 mr-2' />
                        Ítem personalizado
                     </Button>
                     <div className='flex-1 border-t border-dashed' />
                  </div>

                  {/* Carrito */}
                  {cart.length === 0 ? (
                     <div className='text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg'>
                        <ShoppingCart className='h-12 w-12 mx-auto mb-2 opacity-50' />
                        <p>El carrito está vacío</p>
                        <p className='text-sm'>
                           Agrega productos para crear la venta
                        </p>
                     </div>
                  ) : (
                     <div className='border rounded-lg overflow-hidden'>
                        <Table>
                           <TableHeader>
                              <TableRow>
                                 <TableHead>Producto</TableHead>
                                 <TableHead>Categoría</TableHead>
                                 <TableHead className='text-right'>
                                    Precio Unit.
                                 </TableHead>
                                 <TableHead className='text-center'>
                                    Cantidad
                                 </TableHead>
                                 <TableHead className='text-right'>
                                    Subtotal
                                 </TableHead>
                                 <TableHead className='text-right'>
                                    Acción
                                 </TableHead>
                              </TableRow>
                           </TableHeader>
                           <TableBody>
                              {cart.map((item) => (
                                 <TableRow key={item._id}>
                                    <TableCell className='font-medium'>
                                       {getNombreItem(item)}
                                    </TableCell>
                                    <TableCell>
                                       {item.tipo === "producto" ? (
                                          <Badge variant='outline'>
                                             {item.producto?.categoria}
                                          </Badge>
                                       ) : (
                                          <Badge
                                             variant='outline'
                                             className='border-dashed text-muted-foreground'
                                          >
                                             Personalizado
                                          </Badge>
                                       )}
                                    </TableCell>
                                    <TableCell className='text-right'>
                                       ${getPrecioUnitario(item)}
                                    </TableCell>
                                    <TableCell className='text-center'>
                                       {item.cantidad}
                                    </TableCell>
                                    <TableCell className='text-right font-semibold'>
                                       $
                                       {getPrecioUnitario(item) * item.cantidad}
                                    </TableCell>
                                    <TableCell className='text-right'>
                                       <Button
                                          variant='ghost'
                                          size='sm'
                                          onClick={() =>
                                             handleRemoveFromCart(item._id)
                                          }
                                       >
                                          <Trash2 className='h-4 w-4 text-destructive' />
                                       </Button>
                                    </TableCell>
                                 </TableRow>
                              ))}
                              {/* Subtotal */}
                              <TableRow>
                                 <TableCell
                                    colSpan={4}
                                    className='text-right font-medium'
                                 >
                                    Subtotal:
                                 </TableCell>
                                 <TableCell className='text-right font-medium'>
                                    ${subtotal}
                                 </TableCell>
                                 <TableCell />
                              </TableRow>
                              {/* Recargo (solo si aplica) */}
                              {recargo > 0 && (
                                 <TableRow>
                                    <TableCell
                                       colSpan={4}
                                       className='text-right text-amber-700 font-medium'
                                    >
                                       Recargo{" "}
                                       {metodoPago === "Débito"
                                          ? "(+5%)"
                                          : "(+20%)"}
                                       :
                                    </TableCell>
                                    <TableCell className='text-right text-amber-700 font-medium'>
                                       ${recargo}
                                    </TableCell>
                                    <TableCell />
                                 </TableRow>
                              )}
                              {/* Total Final */}
                              <TableRow className='bg-muted/50'>
                                 <TableCell
                                    colSpan={4}
                                    className='text-right font-bold text-lg'
                                 >
                                    TOTAL:
                                 </TableCell>
                                 <TableCell className='text-right font-bold text-lg'>
                                    ${total}
                                 </TableCell>
                                 <TableCell />
                              </TableRow>
                           </TableBody>
                        </Table>
                     </div>
                  )}
               </CardContent>
            </Card>

            <div className='flex justify-end gap-4'>
               {showCancelButton && (
                  <Button
                     type='button'
                     variant='outline'
                     onClick={onCancel || (() => window.history.back())}
                     disabled={isSubmitting}
                  >
                     Cancelar
                  </Button>
               )}
               <Button
                  type='submit'
                  disabled={isSubmitting || cart.length === 0}
               >
                  {isSubmitting ? "Guardando..." : "Registrar Venta"}
               </Button>
            </div>

            <ClienteForm
               open={crearClienteOpen}
               onOpenChange={setCrearClienteOpen}
               onSubmit={handleCrearCliente}
               mode='create'
            />
         </form>

         {/* Dialog ítem personalizado */}
         <Dialog
            open={itemPersonalizadoOpen}
            onOpenChange={setItemPersonalizadoOpen}
         >
            <DialogContent className='sm:max-w-sm'>
               <DialogHeader>
                  <DialogTitle>Ítem personalizado</DialogTitle>
               </DialogHeader>
               <div className='space-y-4 py-2'>
                  <div className='space-y-2'>
                     <Label htmlFor='ip-nombre'>Nombre *</Label>
                     <Input
                        id='ip-nombre'
                        placeholder='Ej: Consulta, Servicio de baño...'
                        value={itemPersonalizado.nombre}
                        onChange={(e) =>
                           setItemPersonalizado((prev) => ({
                              ...prev,
                              nombre: e.target.value,
                           }))
                        }
                     />
                  </div>
                  <div className='grid grid-cols-2 gap-4'>
                     <div className='space-y-2'>
                        <Label htmlFor='ip-precio'>Precio *</Label>
                        <Input
                           id='ip-precio'
                           type='number'
                           min='1'
                           placeholder='0'
                           value={itemPersonalizado.precio || ""}
                           onChange={(e) =>
                              setItemPersonalizado((prev) => ({
                                 ...prev,
                                 precio: parseInt(e.target.value) || 0,
                              }))
                           }
                        />
                     </div>
                     <div className='space-y-2'>
                        <Label htmlFor='ip-cantidad'>Cantidad *</Label>
                        <Input
                           id='ip-cantidad'
                           type='number'
                           min='1'
                           value={itemPersonalizado.cantidad}
                           onChange={(e) =>
                              setItemPersonalizado((prev) => ({
                                 ...prev,
                                 cantidad: parseInt(e.target.value) || 1,
                              }))
                           }
                        />
                     </div>
                  </div>
               </div>
               <DialogFooter>
                  <Button
                     type='button'
                     variant='outline'
                     onClick={() => setItemPersonalizadoOpen(false)}
                  >
                     Cancelar
                  </Button>
                  <Button
                     type='button'
                     onClick={handleAddItemPersonalizado}
                     disabled={
                        !itemPersonalizado.nombre.trim() ||
                        itemPersonalizado.precio <= 0 ||
                        itemPersonalizado.cantidad <= 0
                     }
                  >
                     <Plus className='mr-2 h-4 w-4' />
                     Agregar al carrito
                  </Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>
      </>
   );
}
