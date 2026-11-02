import React, { useState, useEffect } from 'react';
import type { Credencial, CredencialPayload } from '../types';
import { generarPasswordAleatoria, personalizarConSemilla } from '../utils/generadorPassword';

interface ModalCredencialProps {
  visible: boolean;
  credencialAEditar: Credencial | null;
  alCerrar: () => void;
  alGuardar: (payload: CredencialPayload, id?: number) => Promise<void>;
  mostrarToast: (tipo: 'success' | 'info' | 'warn' | 'error', resumen: string, detalle: string) => void;
}

const LONGITUD_FIJA = 12;

export const ModalCredencial: React.FC<ModalCredencialProps> = ({
  visible,
  credencialAEditar,
  alCerrar,
  alGuardar,
  mostrarToast,
}) => {
  const [nombreApp, setNombreApp] = useState('');
  const [correoUsuario, setCorreoUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [url, setUrl] = useState('');
  const [notas, setNotas] = useState('');
  const [motivo, setMotivo] = useState('');

  const [verPassword, setVerPassword] = useState(false);
  const [mostrarGenerador, setMostrarGenerador] = useState(false);
  const [semilla, setSemilla] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);

  useEffect(() => {
    if (credencialAEditar) {
      setNombreApp(credencialAEditar.nombre_aplicacion);
      setCorreoUsuario(credencialAEditar.correo_o_usuario);
      setContrasena(credencialAEditar.contrasena);
      setUrl(credencialAEditar.url || '');
      setNotas(credencialAEditar.notas || '');
      setMotivo('');
    } else {
      setNombreApp('');
      setCorreoUsuario('');
      setContrasena('');
      setUrl('');
      setNotas('');
      setMotivo('');
    }
    setErrorMensaje(null);
    setSemilla('');
    setMostrarGenerador(false);
  }, [credencialAEditar, visible]);

  if (!visible) return null;

  const esEdicion = !!credencialAEditar;
  const contrasenaCambio = esEdicion && contrasena !== credencialAEditar.contrasena;

  const handleGenerarAleatoria = () => {
    const nueva = generarPasswordAleatoria({
      longitud: LONGITUD_FIJA,
      incluirMayusculas: true,
      incluirMinusculas: true,
      incluirNumeros: true,
      incluirSimbolos: true,
    });
    setContrasena(nueva);
    setVerPassword(true);
    mostrarToast('info', 'Generada', 'Contraseña segura de 12 caracteres generada.');
  };

  const handlePersonalizarSemilla = () => {
    if (!semilla.trim()) {
      setErrorMensaje('El campo no puede estar vacío para fortalecer la contraseña.');
      return;
    }
    setErrorMensaje(null);
    const nueva = personalizarConSemilla(semilla);
    setContrasena(nueva);
    setVerPassword(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMensaje(null);

    if (!nombreApp.trim() || !correoUsuario.trim() || !contrasena.trim()) {
      setErrorMensaje('Nombre de aplicación, correo/usuario y contraseña son obligatorios.');
      return;
    }

    if (contrasenaCambio && !motivo.trim()) {
      setErrorMensaje('Debes indicar el motivo del cambio de contraseña para el historial de cambios.');
      return;
    }

    try {
      setGuardando(true);
      const payload: CredencialPayload = {
        nombre_aplicacion: nombreApp.trim(),
        correo_o_usuario: correoUsuario.trim(),
        contrasena: contrasena.trim(),
        url: url.trim() || null,
        notas: notas.trim() || null,
        ...(contrasenaCambio ? { motivo: motivo.trim() } : {}),
      };

      await alGuardar(payload, credencialAEditar?.id);
      alCerrar();
    } catch (err: unknown) {
      const error = err as Error & { errors?: Record<string, string[]> };
      if (error.errors) {
        const primerError = Object.values(error.errors)[0]?.[0];
        setErrorMensaje(primerError || error.message);
      } else {
        setErrorMensaje(error.message || 'Error al guardar la credencial.');
      }
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="glass-panel w-full max-w-lg p-6 sm:p-7 rounded-3xl border border-white/80 dark:border-neutral-700/50 shadow-2xl relative my-8">
        {/* Cabecera */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200/70 dark:border-neutral-700/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200/60 dark:border-emerald-700/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <i className={`pi ${esEdicion ? 'pi-pencil' : 'pi-plus'} text-sm`} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-neutral-100">
                {esEdicion ? 'Editar Credencial' : 'Nueva Credencial'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-neutral-400">
                {esEdicion ? 'Actualiza los datos o rota la contraseña' : 'Agrega una cuenta protegida'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={alCerrar}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-neutral-200 rounded-lg transition-colors cursor-pointer"
          >
            <i className="pi pi-times text-base" />
          </button>
        </div>

        {/* Error */}
        {errorMensaje && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200/80 dark:border-red-700/40 rounded-xl text-red-700 dark:text-red-400 text-xs flex items-center gap-2">
            <i className="pi pi-exclamation-circle text-red-500 text-sm" />
            <span className="font-medium">{errorMensaje}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Nombre de la Aplicación */}
          <div>
            <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-neutral-400 mb-1">
              Nombre de la Aplicación / Sitio <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={nombreApp}
              onChange={(e) => setNombreApp(e.target.value)}
              placeholder="Ej. Red social, Correo, Servicio web"
              required
              className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm text-slate-800 dark:text-neutral-200 placeholder-slate-400"
            />
          </div>

          {/* Correo o Usuario */}
          <div>
            <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-neutral-400 mb-1">
              Correo Electrónico o Usuario <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={correoUsuario}
              onChange={(e) => setCorreoUsuario(e.target.value)}
              placeholder="Ej. usuario@correo.com o @usuario"
              required
              className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm text-slate-800 dark:text-neutral-200 placeholder-slate-400"
            />
          </div>

          {/* Contraseña */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold uppercase tracking-wider text-slate-600 dark:text-neutral-400">
                Contraseña <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setMostrarGenerador(!mostrarGenerador)}
                className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <i className="pi pi-cog text-xs" />
                <span>{mostrarGenerador ? 'Ocultar Asistente' : 'Generador / Asistente'}</span>
              </button>
            </div>

            <div className="relative">
              <input
                type={verPassword ? 'text' : 'password'}
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                placeholder="Escribe tu contraseña o genera una segura"
                required
                className="glass-input w-full pl-3.5 pr-20 py-2.5 rounded-xl text-sm font-mono text-slate-900 dark:text-neutral-100 placeholder-slate-400"
              />
              <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setVerPassword(!verPassword)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-neutral-300 rounded-lg cursor-pointer"
                  title={verPassword ? 'Ocultar' : 'Ver'}
                >
                  <i className={`pi ${verPassword ? 'pi-eye-slash' : 'pi-eye'} text-sm`} />
                </button>
                <button
                  type="button"
                  onClick={handleGenerarAleatoria}
                  className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors cursor-pointer"
                  title="Generar aleatoria (12 caracteres)"
                >
                  <i className="pi pi-refresh text-sm" />
                </button>
              </div>
            </div>

            {/* Panel Generador */}
            {mostrarGenerador && (
              <div className="mt-2.5 p-3.5 bg-slate-100/70 dark:bg-neutral-800/70 border border-slate-200/80 dark:border-neutral-700/50 rounded-2xl space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-slate-700 dark:text-neutral-300 font-medium">Contraseña aleatoria (12 caracteres):</span>
                  <button
                    type="button"
                    onClick={handleGenerarAleatoria}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <i className="pi pi-bolt text-xs" />
                    <span>Generar (12 caracteres)</span>
                  </button>
                </div>

                <div className="border-t border-slate-200/70 dark:border-neutral-700/50 pt-2.5">
                  <span className="block text-slate-700 dark:text-neutral-300 font-medium mb-1">
                    Personalizar a partir de palabra base:
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={semilla}
                      onChange={(e) => {
                        setSemilla(e.target.value);
                        if (errorMensaje) setErrorMensaje(null);
                      }}
                      placeholder="Ej. MiPalabraBase"
                      className="glass-input flex-1 px-3 py-1.5 rounded-lg text-xs text-slate-800 dark:text-neutral-200 placeholder-slate-400"
                    />
                    <button
                      type="button"
                      onClick={handlePersonalizarSemilla}
                      className="px-3 py-1.5 bg-slate-800 dark:bg-neutral-600 hover:bg-slate-900 dark:hover:bg-slate-500 text-white rounded-lg text-xs font-medium cursor-pointer"
                    >
                      Fortalecer
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Motivo de cambio (condicional) */}
          {contrasenaCambio && (
            <div className="p-3 bg-amber-50/80 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 rounded-xl space-y-1.5 animate-fade-in">
              <label className="block font-bold text-amber-900 dark:text-amber-400">
                Motivo del Cambio de Contraseña <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Ej. Política de seguridad periódica / Cambio preventivo"
                required
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700/50 rounded-lg text-xs text-slate-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
              <p className="text-[11px] text-amber-800 dark:text-amber-400 leading-tight">
                Detectamos que la contraseña cambió. Este motivo quedará registrado en tu historial de cambios.
              </p>
            </div>
          )}

          {/* URL */}
          <div>
            <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-neutral-400 mb-1">
              URL del Sitio Web <span className="text-slate-400 font-normal">(Opcional)</span>
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://ejemplo.com/login"
              className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm text-slate-800 dark:text-neutral-200 placeholder-slate-400"
            />
          </div>

          {/* Notas */}
          <div>
            <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-neutral-400 mb-1">
              Notas Adicionales <span className="text-slate-400 font-normal">(Opcional)</span>
            </label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Preguntas de seguridad, códigos PIN, comentarios..."
              rows={2}
              className="glass-input w-full px-3.5 py-2 rounded-xl text-sm text-slate-800 dark:text-neutral-200 placeholder-slate-400 resize-none"
            />
          </div>

          {/* Botones */}
          <div className="pt-3 border-t border-slate-200/70 dark:border-neutral-700/50 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={alCerrar}
              disabled={guardando}
              className="px-4 py-2 text-slate-600 dark:text-neutral-400 hover:text-slate-800 dark:hover:text-neutral-200 font-medium rounded-xl hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {guardando ? (
                <>
                  <i className="pi pi-spin pi-spinner text-xs" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <i className="pi pi-check text-xs" />
                  <span>{esEdicion ? 'Actualizar Credencial' : 'Guardar Credencial'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
