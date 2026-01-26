import { RouterProvider } from 'react-router-dom';
import { router } from '@/lib/router';
import { Toaster } from 'sonner';
import { DataProvider } from '@/context/DataContext';

function App() {
  return (
    <DataProvider>
      <RouterProvider router={router} />
      <Toaster position="top-right" />
    </DataProvider>
  );
}

export default App;
