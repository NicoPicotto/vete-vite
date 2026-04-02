import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { turnoSchema, type TurnoFormValues } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
} from "@/components/ui/dialog";
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
import { AlertTriangle } from "lucide-react";
import { useClientes } from "@/hooks/useClientes";
import { useMascotas } from "@/hooks/useMascotas";
import { useCheckDisponibilidad } from "@/hooks/useTurnos";
import type { Turno } from "@/lib/types";

// Genera los slots horarios de 8:00 a 21:00 en intervalos de 30 minutos
const generarSlotsHorarios = (): string[] => {
   const slots: string[] = [];
   for (let h = 8; h <= 21; h++) {
      slots.push(`${String(h).padStart(2, "0")}:00`);
      if (h < 21) slots.push(`${String(h).padStart(2, "0")}:30`);
   }
   return slots;
};

const SLOTS_HORARIOS = generarSlotsHorarios();

interface TurnoFormDialogProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   onSubmit: (data: TurnoFormValues) => void;
   editData?: Turno;
   isSubmitting?: boolean;
}

export function TurnoFormDialog({
   open,
   onOpenChange,
   onSubmit,
   editData,
   isSubmitting = false,
}: TurnoFormDialogProps) {
   const { data: clientes = [] } = useClientes();
   const { data: todasMascotas = [] } = useMascotas();

   const {
      register,
      handleSubmit,
      formState: { errors },
      reset,
      setValue,
      watch,
   } = useForm<TurnoFormValues>({
      resolver: zodResolver(turnoSchema),
      defaultValues: {
         estado: "Pendiente",
         tipo: "Consulta",
      },
   });

   const clienteId = watch("clienteId");
   const fecha = watch("fecha");
   const hora = watch("hora");

   // Estado local para mostrar el label del cliente seleccionado en el combobox
   const [clienteLabel, setClienteLabel] = useState("");

   // Mascotas filtradas por el cliente seleccionado
   const mascotasDelCliente = todasMascotas.filter(
      (m) => m.clienteId === clienteId,
   );

   // Verificar disponibilidad del slot
   const { data: slotOcupado } = useCheckDisponibilidad(
      fecha ?? "",
      hora ?? "",
      editData?.id,
   );

   // Items para el combobox de clientes
   const clientesItems = clientes.map((c) => ({
      value: `${c.nombre} ${c.apellido} ${c.telefono}`.toLowerCase(),
      label: `${c.nombre} ${c.apellido} - ${c.telefono}`,
      id: c.id,
   }));

   // Cargar datos al abrir el formulario
   useEffect(() => {
      if (open) {
         if (editData) {
            const d =
               editData.fechaHora instanceof Date
                  ? editData.fechaHora
                  : new Date(editData.fechaHora);

            // Usar tiempo LOCAL para evitar el desfase por UTC-3 (Argentina)
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, "0");
            const day = String(d.getDate()).padStart(2, "0");
            const fechaStr = `${year}-${month}-${day}`;
            const horaStr = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

            reset({
               clienteId: editData.clienteId,
               mascotaId: editData.mascotaId ?? "",
               fecha: fechaStr,
               hora: horaStr,
               tipo: editData.tipo,
               notas: editData.notas ?? "",
               estado: editData.estado,
            });

            const cliente = clientes.find((c) => c.id === editData.clienteId);
            if (cliente) {
               setClienteLabel(
                  `${cliente.nombre} ${cliente.apellido} - ${cliente.telefono}`,
               );
            }
         } else {
            const hoyD = new Date();
            const hoy = `${hoyD.getFullYear()}-${String(hoyD.getMonth() + 1).padStart(2, "0")}-${String(hoyD.getDate()).padStart(2, "0")}`;
            reset({
               clienteId: "",
               mascotaId: "",
               fecha: hoy,
               hora: "",
               tipo: "Consulta",
               notas: "",
               estado: "Pendiente",
            });
            setClienteLabel("");
         }
      }
   }, [open, editData, clientes, reset]);

   // Resetear mascota cuando cambia el cliente
   useEffect(() => {
      if (clienteId) {
         setValue("mascotaId", "");
      }
   }, [clienteId, setValue]);

   const handleFormSubmit = (data: TurnoFormValues) => {
      onSubmit(data);
   };

   const handleClose = (open: boolean) => {
      if (!open) reset();
      onOpenChange(open);
   };

   return (
      <Dialog open={open} onOpenChange={handleClose}>
         <DialogContent className='sm:max-w-[520px] max-h-[90vh] overflow-y-auto'>
            <DialogHeader>
               <DialogTitle>
                  {editData ? "Editar Turno" : "Nuevo Turno"}
               </DialogTitle>
               <DialogDescription>
                  {editData
                     ? "Modificá los datos del turno"
                     : "Registrá un nuevo turno"}
               </DialogDescription>
            </DialogHeader>

            <form
               onSubmit={handleSubmit(handleFormSubmit)}
               className='space-y-4'
            >
               {/* Cliente */}
               <div className='space-y-2'>
                  <Label>
                     Cliente <span className='text-destructive'>*</span>
                  </Label>
                  <Combobox
                     items={clientesItems}
                     value={clienteLabel}
                     onValueChange={(value) => {
                        const selected = clientesItems.find(
                           (item) => item.label === value,
                        );
                        setValue("clienteId", selected?.id ?? "", {
                           shouldValidate: true,
                        });
                        setClienteLabel(selected?.label ?? "");
                     }}
                  >
                     <ComboboxInput placeholder='Buscar cliente...' />
                     <ComboboxContent>
                        <ComboboxEmpty>
                           No se encontró ningún cliente.
                        </ComboboxEmpty>
                        <ComboboxList>
                           {(item) => (
                              <ComboboxItem key={item.id} value={item.label}>
                                 {item.label}
                              </ComboboxItem>
                           )}
                        </ComboboxList>
                     </ComboboxContent>
                  </Combobox>
                  {errors.clienteId && (
                     <p className='text-sm text-destructive'>
                        {errors.clienteId.message}
                     </p>
                  )}
               </div>

               {/* Mascota */}
               <div className='space-y-2'>
                  <Label>Mascota (opcional)</Label>
                  <Select
                     value={watch("mascotaId") ?? ""}
                     onValueChange={(value) =>
                        setValue("mascotaId", value === "none" ? "" : value)
                     }
                     disabled={!clienteId || mascotasDelCliente.length === 0}
                  >
                     <SelectTrigger className="w-full">
                        <SelectValue
                           placeholder={
                              !clienteId
                                 ? "Seleccioná un cliente primero"
                                 : mascotasDelCliente.length === 0
                                   ? "Sin mascotas registradas"
                                   : "Seleccionar mascota..."
                           }
                        />
                     </SelectTrigger>
                     <SelectContent>
                        <SelectItem value='none'>Sin mascota</SelectItem>
                        {mascotasDelCliente.map((m) => (
                           <SelectItem key={m.id} value={m.id}>
                              {m.nombre} ({m.especie})
                           </SelectItem>
                        ))}
                     </SelectContent>
                  </Select>
               </div>

               {/* Fecha y Hora */}
               <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                     <Label htmlFor='fecha'>
                        Fecha <span className='text-destructive'>*</span>
                     </Label>
                     <Input id='fecha' type='date' {...register("fecha")} />
                     {errors.fecha && (
                        <p className='text-sm text-destructive'>
                           {errors.fecha.message}
                        </p>
                     )}
                  </div>

                  <div className='space-y-2'>
                     <Label>
                        Hora <span className='text-destructive'>*</span>
                     </Label>
                     <Select
                        value={watch("hora") ?? ""}
                        onValueChange={(value) =>
                           setValue("hora", value, { shouldValidate: true })
                        }
                     >
                        <SelectTrigger className="w-full">
                           <SelectValue placeholder='Seleccionar hora...' />
                        </SelectTrigger>
                        <SelectContent>
                           {SLOTS_HORARIOS.map((slot) => (
                              <SelectItem key={slot} value={slot}>
                                 {slot}
                              </SelectItem>
                           ))}
                        </SelectContent>
                     </Select>
                     {errors.hora && (
                        <p className='text-sm text-destructive'>
                           {errors.hora.message}
                        </p>
                     )}
                  </div>
               </div>

               {/* Warning de slot ocupado */}
               {slotOcupado && fecha && hora && (
                  <div className='flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-sm'>
                     <AlertTriangle className='h-4 w-4 mt-0.5 shrink-0' />
                     <span>
                        Ya existe un turno para el {fecha} a las {hora}. Podés
                        igualmente guardar este turno si es necesario.
                     </span>
                  </div>
               )}
               <div className='grid grid-cols-2 gap-4'>
                  {/* Tipo */}
                  <div className='space-y-2'>
                     <Label>
                        Tipo <span className='text-destructive'>*</span>
                     </Label>
                     <Select
                        value={watch("tipo")}
                        onValueChange={(value) =>
                           setValue("tipo", value as TurnoFormValues["tipo"], {
                              shouldValidate: true,
                           })
                        }
                     >
                        <SelectTrigger className="w-full">
                           <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                           <SelectItem value='Consulta'>Consulta</SelectItem>
                           <SelectItem value='Control'>Control</SelectItem>
                        </SelectContent>
                     </Select>
                     {errors.tipo && (
                        <p className='text-sm text-destructive'>
                           {errors.tipo.message}
                        </p>
                     )}
                  </div>

                  {/* Estado */}
                  <div className='space-y-2'>
                     <Label>Estado</Label>
                     <Select
                        value={watch("estado")}
                        onValueChange={(value) =>
                           setValue(
                              "estado",
                              value as TurnoFormValues["estado"],
                              { shouldValidate: true },
                           )
                        }
                     >
                        <SelectTrigger className="w-full">
                           <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                           <SelectItem value='Pendiente'>Pendiente</SelectItem>
                           <SelectItem value='Confirmado'>
                              Confirmado
                           </SelectItem>
                           <SelectItem value='Cancelado'>Cancelado</SelectItem>
                           <SelectItem value='Completado'>
                              Completado
                           </SelectItem>
                           <SelectItem value='No se presentó'>
                              No se presentó
                           </SelectItem>
                        </SelectContent>
                     </Select>
                  </div>
               </div>

               {/* Notas */}
               <div className='space-y-2'>
                  <Label htmlFor='notas'>Notas (opcional)</Label>
                  <Textarea
                     id='notas'
                     {...register("notas")}
                     placeholder='Motivo del turno, observaciones previas...'
                     rows={3}
                  />
                  {errors.notas && (
                     <p className='text-sm text-destructive'>
                        {errors.notas.message}
                     </p>
                  )}
               </div>

               <DialogFooter>
                  <Button
                     type='button'
                     variant='outline'
                     onClick={() => handleClose(false)}
                     disabled={isSubmitting}
                  >
                     Cancelar
                  </Button>
                  <Button type='submit' disabled={isSubmitting}>
                     {isSubmitting
                        ? "Guardando..."
                        : editData
                          ? "Actualizar Turno"
                          : "Guardar Turno"}
                  </Button>
               </DialogFooter>
            </form>
         </DialogContent>
      </Dialog>
   );
}
