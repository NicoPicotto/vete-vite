import { createBrowserRouter } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import DashboardView from '@/views/DashboardView';
import ClientesView from '@/views/ClientesView';
import ClienteDetail from '@/views/ClientesView/ClienteDetail';
import MascotasView from '@/views/MascotasView';
import MascotaDetail from '@/views/MascotasView/MascotaDetail';
import PagosView from '@/views/PagosView';
import RecordatoriosView from '@/views/RecordatoriosView';

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
    ],
  },
]);
