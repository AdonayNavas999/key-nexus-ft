import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface LoginPageProps {
  alIrARegistro: () => void;
  mostrarToast: (tipo: 'success' | 'info' | 'warn' | 'error', resumen: string, detalle: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ alIrARegistro, mostrarToast }) => {
  const { login } = useAuth();
  const { esOscuro, toggleTema } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verPassword, setVerPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMensaje(null);

    if (!email.trim() || !password.trim()) {
      setErrorMensaje('Por favor ingresa tu correo y contraseña.');
      return;
    }

    try {
      setCargando(true);
      await login({ email: email.trim(), password });
      mostrarToast('success', 'Bienvenido', 'Inicio de sesión exitoso en Key Nexus.');
    } catch (err: unknown) {
      const error = err as Error & { errors?: Record<string, string[]> };
      if (error.errors && error.errors.email) {
        setErrorMensaje(error.errors.email[0]);
      } else {
        setErrorMensaje(error.message || 'Credenciales incorrectas o error al conectar.');
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-50 dark:bg-neutral-950">
      {/* Luz sutil de fondo */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-100 dark:bg-emerald-900/20 rounded-full blur-3xl opacity-60 pointer-events-none" />

      {/* Botón de tema */}
      <button
        type="button"
        onClick={toggleTema}
        className="absolute top-4 right-4 p-2.5 rounded-xl glass-panel text-slate-500 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
        title={esOscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      >
        <i className={`pi ${esOscuro ? 'pi-sun' : 'pi-moon'} text-base`} />
      </button>

      {/* Tarjeta de Cristal Líquido */}
      <div className="glass-panel w-full max-w-md p-8 rounded-3xl relative z-10 animate-fade-in shadow-xl">
        {/* Cabecera / Identidad */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200/60 dark:border-emerald-700/40 text-emerald-600 mb-4 shadow-sm">
            <i className="pi pi-lock text-2xl" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-neutral-100">
            KEY <span className="text-emerald-600 font-light">-</span> NEXUS
          </h1>
          <p className="text-sm text-slate-500 dark:text-neutral-400 mt-1">
            Gestor personal y seguro de contraseñas
          </p>
        </div>

        {/* Mensaje de error */}
        {errorMensaje && (
          <div className="mb-6 p-3.5 bg-red-50 dark:bg-red-900/20 border border-red-200/80 dark:border-red-700/40 rounded-xl text-red-700 dark:text-red-400 text-sm flex items-start gap-2.5 animate-shake">
            <i className="pi pi-exclamation-circle text-red-500 mt-0.5 text-base" />
            <div className="flex-1 font-medium">{errorMensaje}</div>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-neutral-400 mb-1.5">
              Correo Electrónico
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <i className="pi pi-envelope text-sm" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                required
                className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-slate-800 dark:text-neutral-200 placeholder-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-neutral-400 mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <i className="pi pi-key text-sm" />
              </span>
              <input
                type={verPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tu contraseña maestra"
                required
                className="glass-input w-full pl-10 pr-11 py-2.5 rounded-xl text-sm text-slate-800 dark:text-neutral-200 placeholder-slate-400"
              />
              <button
                type="button"
                onClick={() => setVerPassword(!verPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-neutral-300 transition-colors"
                title={verPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                <i className={`pi ${verPassword ? 'pi-eye-slash' : 'pi-eye'} text-sm`} />
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full mt-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {cargando ? (
              <>
                <i className="pi pi-spin pi-spinner text-base" />
                <span>Iniciando sesión...</span>
              </>
            ) : (
              <>
                <i className="pi pi-sign-in text-base" />
                <span>Iniciar Sesión</span>
              </>
            )}
          </button>
        </form>

        {/* Cambiar a Registro */}
        <div className="mt-8 pt-5 border-t border-slate-200/60 dark:border-neutral-700/50 text-center text-sm text-slate-600 dark:text-neutral-400">
          ¿Aún no tienes tu cuenta personal?{' '}
          <button
            type="button"
            onClick={alIrARegistro}
            className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-semibold transition-colors underline cursor-pointer"
          >
            Regístrate aquí
          </button>
        </div>
      </div>
    </div>
  );
};
