import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './appRoutes';
import { ThemeProvider } from './components/theme-provider';
import { Toaster } from 'sonner';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AppRoutes />
        <Toaster />
      </ThemeProvider>
    </BrowserRouter>
  );
}