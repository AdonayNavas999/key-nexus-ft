import React, { useRef, useState } from 'react';
import { Toast } from 'primereact/toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';

const ContenidoApp: React.FC<{
  mostrarToast: (tipo: 'success' | 'info' | 'warn' | 'error', resumen: string, detalle: string) => void;
}> = ({ mostrarToast }) => {
  const { autenticado, cargando } = useAuth();
  const [vistaAuth, setVistaAuth] = useState<'login' | 'register'>('login');

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="glass-panel p-6 rounded-2xl flex items-center gap-3 shadow-md">
          <i className="pi pi-spin pi-spinner text-emerald-600 text-2xl" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Verificando sesión segura...</span>
        </div>
      </div>
    );
  }

  if (autenticado) {
    return <DashboardPage mostrarToast={mostrarToast} />;
  }

  if (vistaAuth === 'register') {
    return (
      <RegisterPage
        alIrALogin={() => setVistaAuth('login')}
        mostrarToast={mostrarToast}
      />
    );
  }

  return (
    <LoginPage
      alIrARegistro={() => setVistaAuth('register')}
      mostrarToast={mostrarToast}
    />
  );
};

export default function App() {
  const toastRef = useRef<Toast>(null);

  const mostrarToast = (
    tipo: 'success' | 'info' | 'warn' | 'error',
    resumen: string,
    detalle: string
  ) => {
    toastRef.current?.show({
      severity: tipo,
      summary: resumen,
      detail: detalle,
      life: 3000,
    });
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        {/* Componente Toast de PrimeReact para notificaciones limpias */}
        <Toast ref={toastRef} position="top-right" />
        <ContenidoApp mostrarToast={mostrarToast} />
      </AuthProvider>
    </ThemeProvider>
  );
}
