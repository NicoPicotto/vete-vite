import { Outlet, Navigate } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { PawPrint } from 'lucide-react';

export default function AppLayout() {
  const { session, loading, passwordRecovery } = useAuth();

  if (loading) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center gap-3 text-muted-foreground'>
        <PawPrint className='h-8 w-8 animate-pulse text-primary' />
      </div>
    );
  }

  if (!session || passwordRecovery) {
    return <Navigate to='/login' replace />;
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="flex items-center h-14 px-4 border-b gap-2">
            <SidebarTrigger />
            <div className="flex-1" />
            {/* Aquí podemos agregar búsqueda rápida, notificaciones, etc */}
          </header>
          <div className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
