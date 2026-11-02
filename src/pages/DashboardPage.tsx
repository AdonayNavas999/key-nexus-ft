import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import type { Credencial, CredencialPayload } from '../types';
import { credencialesApi } from '../api/credencialesApi';
import { CredencialCard } from '../components/CredencialCard';
import { ModalCredencial } from '../components/ModalCredencial';
import { ModalHistorial } from '../components/ModalHistorial';
import { confirmarEliminacion } from '../utils/alertas';

interface DashboardPageProps {
  mostrarToast: (tipo: 'success' | 'info' | 'warn' | 'error', resumen: string, detalle: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ mostrarToast }) => {
  const { usuario, logout } = useAuth();
  const { esOscuro, toggleTema } = useTheme();

  const [credenciales, setCredenciales] = useState<Credencial[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [descargandoPdf, setDescargandoPdf] = useState(false);

  const [modalCredencialVisible, setModalCredencialVisible] = useState(false);
  const [credencialAEditar, setCredencialAEditar] = useState<Credencial | null>(null);

  const [modalHistorialVisible, setModalHistorialVisible] = useState(false);
  const [credencialParaHistorial, setCredencialParaHistorial] = useState<Credencial | null>(null);

  const cargarCredenciales = useCallback(async (termino?: string) => {
    try {
      const res = await credencialesApi.obtenerCredenciales(termino);
      setCredenciales(res.data);
    } catch {
      mostrarToast('error', 'Error', 'No se pudieron cargar las credenciales.');
    } finally {
      setCargando(false);
    }
  }, [mostrarToast]);

  useEffect(() => {
    cargarCredenciales();
  }, [cargarCredenciales]);

  useEffect(() => {
    const timer = setTimeout(() => {
      cargarCredenciales(busqueda.trim());
    }, 250);
    return () => clearTimeout(timer);
  }, [busqueda, cargarCredenciales]);

  const handleExportarPdf = async () => {
    try {
      setDescargandoPdf(true);
      mostrarToast('info', 'Generando Reporte', 'Preparando documento físico en PDF...');
      await credencialesApi.descargarPdf();
      mostrarToast('success', 'Descarga Completa', 'Tu reporte de contraseñas fue descargado.');
    } catch (err: unknown) {
      const error = err as Error;
      mostrarToast('error', 'Error', error.message || 'Error al exportar el PDF.');
    } finally {
      setDescargandoPdf(false);
    }
  };

  const handleAbrirCrear = () => {
    setCredencialAEditar(null);
    setModalCredencialVisible(true);
  };

  const handleAbrirEditar = (cred: Credencial) => {
    setCredencialAEditar(cred);
    setModalCredencialVisible(true);
  };

  const handleGuardarCredencial = async (payload: CredencialPayload, id?: number) => {
    if (id) {
      await credencialesApi.actualizarCredencial(id, payload);
      mostrarToast('success', 'Actualizado', 'La credencial se actualizó correctamente.');
    } else {
      await credencialesApi.crearCredencial(payload);
      mostrarToast('success', 'Guardado', 'Nueva credencial guardada correctamente.');
    }
    await cargarCredenciales(busqueda.trim());
  };

  const handleEliminarCredencial = async (id: number, nombreApp: string) => {
    const confirmado = await confirmarEliminacion(nombreApp);
    if (!confirmado) return;

    try {
      await credencialesApi.eliminarCredencial(id);
      mostrarToast('info', 'Eliminado', `${nombreApp} y su historial fueron eliminados.`);
      await cargarCredenciales(busqueda.trim());
    } catch {
      mostrarToast('error', 'Error', 'No se pudo eliminar la credencial.');
    }
  };

  const handleAbrirHistorial = (cred: Credencial) => {
    setCredencialParaHistorial(cred);
    setModalHistorialVisible(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* ── Barra Superior ── */}
      <header className="glass-panel sticky top-0 z-40 border-b border-slate-200/80 dark:border-neutral-700/50 px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Identidad */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <i className="pi pi-shield text-xl" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-neutral-100">
              KEY <span className="text-emerald-600">-</span> NEXUS
            </span>
          </div>

          {/* Acciones del Encabezado */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportarPdf}
              disabled={descargandoPdf || credenciales.length === 0}
              className="px-3.5 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/40 border border-emerald-200/80 dark:border-emerald-700/40 rounded-xl transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              title="Descargar copia física en PDF"
            >
              {descargandoPdf ? (
                <>
                  <i className="pi pi-spin pi-spinner text-xs" />
                  <span className="hidden sm:inline">Generando PDF...</span>
                </>
              ) : (
                <>
                  <i className="pi pi-file-pdf text-sm text-emerald-600 dark:text-emerald-400" />
                  <span className="hidden sm:inline">Exportar PDF</span>
                </>
              )}
            </button>

            <div className="h-6 w-px bg-slate-200 dark:bg-neutral-700 hidden sm:block" />

            {/* Toggle de tema */}
            <button
              type="button"
              onClick={toggleTema}
              className="p-2 text-slate-500 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-xl transition-colors cursor-pointer"
              title={esOscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              <i className={`pi ${esOscuro ? 'pi-sun' : 'pi-moon'} text-base`} />
            </button>

            <div className="h-6 w-px bg-slate-200 dark:bg-neutral-700 hidden sm:block" />

            <div className="text-right hidden md:block">
              <div className="text-xs font-bold text-slate-800 dark:text-neutral-200">{usuario?.name}</div>
              <div className="text-[11px] text-slate-500 dark:text-neutral-400 truncate max-w-[150px]">{usuario?.email}</div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="p-2 text-slate-500 dark:text-neutral-400 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors cursor-pointer"
              title="Cerrar sesión"
            >
              <i className="pi pi-sign-out text-base" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Contenedor Principal ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-6">
        {/* Barra de Búsqueda y Nueva Credencial */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <i className="pi pi-search text-sm" />
            </span>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar aplicación o usuario..."
              className="glass-input w-full pl-10 pr-10 py-2.5 rounded-2xl text-sm text-slate-800 dark:text-neutral-200 placeholder-slate-400"
            />
            {busqueda && (
              <button
                type="button"
                onClick={() => setBusqueda('')}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-neutral-300 cursor-pointer"
              >
                <i className="pi pi-times text-xs" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleAbrirCrear}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold rounded-2xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <i className="pi pi-plus text-sm" />
            <span>Nueva Credencial</span>
          </button>
        </div>

        {/* Listado */}
        {cargando ? (
          <div className="py-20 text-center text-slate-500 dark:text-neutral-400 text-sm flex flex-col items-center gap-3">
            <i className="pi pi-spin pi-spinner text-emerald-600 text-3xl" />
            <span>Cargando tus contraseñas cifradas...</span>
          </div>
        ) : credenciales.length === 0 ? (
          <div className="glass-card p-12 rounded-3xl text-center space-y-3 max-w-md mx-auto my-12">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center text-2xl border border-emerald-200/60 dark:border-emerald-700/40 shadow-xs">
              <i className="pi pi-inbox" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-neutral-100">
              {busqueda ? 'No se encontraron resultados' : 'Sin contraseñas guardadas'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-neutral-400">
              {busqueda
                ? `No hay ninguna credencial que coincida con "${busqueda}".`
                : 'Aún no tienes contraseñas guardadas. Comienza registrando la primera.'}
            </p>
            {busqueda ? (
              <button
                type="button"
                onClick={() => setBusqueda('')}
                className="mt-2 text-xs text-emerald-700 dark:text-emerald-400 font-semibold underline cursor-pointer"
              >
                Limpiar búsqueda
              </button>
            ) : (
              <button
                type="button"
                onClick={handleAbrirCrear}
                className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                <i className="pi pi-plus text-xs" />
                <span>Agregar primera cuenta</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {credenciales.map((cred) => (
              <CredencialCard
                key={cred.id}
                credencial={cred}
                alEditar={handleAbrirEditar}
                alVerHistorial={handleAbrirHistorial}
                alEliminar={handleEliminarCredencial}
                mostrarToast={mostrarToast}
              />
            ))}
          </div>
        )}
      </main>

      <ModalCredencial
        visible={modalCredencialVisible}
        credencialAEditar={credencialAEditar}
        alCerrar={() => setModalCredencialVisible(false)}
        alGuardar={handleGuardarCredencial}
        mostrarToast={mostrarToast}
      />

      <ModalHistorial
        visible={modalHistorialVisible}
        credencial={credencialParaHistorial}
        alCerrar={() => setModalHistorialVisible(false)}
        mostrarToast={mostrarToast}
      />
    </div>
  );
};
