import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './app/router';
import { ThemeProvider } from './components/theme-provider';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AppRoutes />
      </ThemeProvider>
    </BrowserRouter>
  );
}