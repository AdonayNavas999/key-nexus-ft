import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface RegisterPageProps {
  alIrALogin: () => void;
  mostrarToast: (tipo: 'success' | 'info' | 'warn' | 'error', resumen: string, detalle: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ alIrALogin, mostrarToast }) => {
  const { register } = useAuth();
  const { esOscuro, toggleTema } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [verPassword, setVerPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [errorMensajes, setErrorMensajes] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMensajes([]);

    if (password !== passwordConfirmation) {
      setErrorMensajes(['La confirmación de la contraseña no coincide.']);
      return;
    }

    try {
      setCargando(true);
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        password_confirmation: passwordConfirmation,
      });
      mostrarToast('success', 'Cuenta Creada', '¡Bienvenido a Key Nexus! Tu cuenta está lista.');
    } catch (err: unknown) {
      const error = err as Error & { errors?: Record<string, string[]> };
      if (error.errors) {
        const lista: string[] = [];
        Object.values(error.errors).forEach((arr) => {
          lista.push(...arr);
        });
        setErrorMensajes(lista);
      } else {
        setErrorMensajes([error.message || 'Error al registrar usuario.']);
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-50 dark:bg-neutral-950">
      {/* Luz ambiental sutil */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-100 dark:bg-emerald-900/20 rounded-full blur-3xl opacity-60 pointer-events-none" />

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
      <div className="glass-panel w-full max-w-lg p-8 rounded-3xl relative z-10 animate-fade-in shadow-xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200/60 dark:border-emerald-700/40 text-emerald-600 mb-3 shadow-sm">
            <i className="pi pi-user-plus text-2xl" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-neutral-100">
            Crear Cuenta en KEY - NEXUS
          </h1>
          <p className="text-sm text-slate-500 dark:text-neutral-400 mt-1">
            Configura tu acceso personal y seguro
          </p>
        </div>

        {/* Lista de errores de validación */}
        {errorMensajes.length > 0 && (
          <div className="mb-5 p-3.5 bg-red-50 dark:bg-red-900/20 border border-red-200/80 dark:border-red-700/40 rounded-xl text-red-700 dark:text-red-400 text-xs space-y-1">
            <div className="font-semibold flex items-center gap-1.5 text-sm text-red-800 dark:text-red-300">
              <i className="pi pi-exclamation-circle text-red-500" />
              Por favor revisa los siguientes campos:
            </div>
            <ul className="list-disc pl-5 space-y-0.5">
              {errorMensajes.map((msg, idx) => (
                <li key={idx}>{msg}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Formulario de Registro */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-neutral-400 mb-1">
              Nombre Completo
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-none text-slate-400">
                <i className="pi pi-user text-sm" />
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre completo"
                required
                className="glass-input w-full pl-10 pr-4 py-2 rounded-xl text-sm text-slate-800 dark:text-neutral-200 placeholder-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-neutral-400 mb-1">
              Correo Electrónico
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-none text-slate-400">
                <i className="pi pi-envelope text-sm" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                required
                className="glass-input w-full pl-10 pr-4 py-2 rounded-xl text-sm text-slate-800 dark:text-neutral-200 placeholder-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-neutral-400 mb-1">
              Contraseña Maestra
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-none text-slate-400">
                <i className="pi pi-key text-sm" />
              </span>
              <input
                type={verPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 12 caracteres (Aa, 123, @$!%*?&)"
                required
                className="glass-input w-full pl-10 pr-11 py-2 rounded-xl text-sm text-slate-800 dark:text-neutral-200 placeholder-slate-400"
              />
              <button
                type="button"
                onClick={() => setVerPassword(!verPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-neutral-300 transition-colors"
              >
                <i className={`pi ${verPassword ? 'pi-eye-slash' : 'pi-eye'} text-sm`} />
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Mínimo 12 caracteres, mayúscula, minúscula, número y símbolo (@$!%*?&).
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-neutral-400 mb-1">
              Confirmar Contraseña Maestra
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-none text-slate-400">
                <i className="pi pi-check-circle text-sm" />
              </span>
              <input
                type={verPassword ? 'text' : 'password'}
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                placeholder="Repite tu contraseña maestra"
                required
                className="glass-input w-full pl-10 pr-4 py-2 rounded-xl text-sm text-slate-800 dark:text-neutral-200 placeholder-slate-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full mt-3 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {cargando ? (
              <>
                <i className="pi pi-spin pi-spinner text-base" />
                <span>Creando cuenta...</span>
              </>
            ) : (
              <>
                <i className="pi pi-check text-base" />
                <span>Registrarme e Ingresar</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-200/60 dark:border-neutral-700/50 text-center text-sm text-slate-600 dark:text-neutral-400">
          ¿Ya tienes tu cuenta creada?{' '}
          <button
            type="button"
            onClick={alIrALogin}
            className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-semibold transition-colors underline cursor-pointer"
          >
            Inicia sesión aquí
          </button>
        </div>
      </div>
    </div>
  );
};
