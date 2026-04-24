import { createBrowserRouter } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import DashboardView from '@/views/DashboardView';
import ClientesView from '@/views/ClientesView';
import ClienteDetail from '@/views/ClientesView/ClienteDetail';
import MascotasView from '@/views/MascotasView';
import MascotaDetail from '@/views/MascotasView/MascotaDetail';
import PagosView from '@/views/PagosView';
import RecordatoriosView from '@/views/RecordatoriosView';
import TurnosView from '@/views/TurnosView';
import ProductosView from '@/views/ProductosView';
import VentasView from '@/views/VentasView';
import NuevaVenta from '@/views/VentasView/NuevaVenta';
import VentaDetail from '@/views/VentasView/VentaDetail';
import MensajesRapidosView from '@/views/MensajesRapidosView';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <DashboardView />,
      },
      {
        path: 'clientes',
        element: <ClientesView />,
      },
      {
        path: 'clientes/:id',
        element: <ClienteDetail />,
      },
      {
        path: 'mascotas',
        element: <MascotasView />,
      },
      {
        path: 'mascotas/:id',
        element: <MascotaDetail />,
      },
      {
        path: 'pagos',
        element: <PagosView />,
      },
      {
        path: 'recordatorios',
        element: <RecordatoriosView />,
      },
      {
        path: 'turnos',
        element: <TurnosView />,
      },
      {
        path: 'productos',
        element: <ProductosView />,
      },
      {
        path: 'ventas',
        element: <VentasView />,
      },
      {
        path: 'ventas/nueva',
        element: <NuevaVenta />,
      },
      {
        path: 'ventas/:id',
        element: <VentaDetail />,
      },
      {
        path: 'mensajes-rapidos',
        element: <MensajesRapidosView />,
      },
    ],
  },
]);
