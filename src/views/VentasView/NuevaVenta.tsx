import { useNavigate } from 'react-router-dom';
import { VentaForm } from '@/components/ventas/VentaForm';
import { useCreateVenta } from '@/hooks/useVentas';
import type { VentaFormValues } from '@/lib/schemas';

export default function NuevaVenta() {
  const navigate = useNavigate();
  const createVentaMutation = useCreateVenta();

  const handleSubmit = (data: VentaFormValues) => {
    createVentaMutation.mutate(data, {
      onSuccess: (newVenta) => {
        // Redirigir al detalle de la venta creada
        navigate(`/ventas/${newVenta.id}`);
      },
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Nueva Venta</h1>
        <p className="text-muted-foreground">Registra una nueva venta de productos</p>
      </div>

      <VentaForm onSubmit={handleSubmit} isSubmitting={createVentaMutation.isPending} />
    </div>
  );
}
