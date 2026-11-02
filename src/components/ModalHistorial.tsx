import React, { useState, useEffect } from 'react';
import type { Credencial, HistorialResponse } from '../types';
import { credencialesApi } from '../api/credencialesApi';

interface ModalHistorialProps {
  visible: boolean;
  credencial: Credencial | null;
  alCerrar: () => void;
  mostrarToast: (tipo: 'success' | 'info' | 'warn' | 'error', resumen: string, detalle: string) => void;
}

export const ModalHistorial: React.FC<ModalHistorialProps> = ({
  visible,
  credencial,
  alCerrar,
  mostrarToast,
}) => {
  const [datosHistorial, setDatosHistorial] = useState<HistorialResponse | null>(null);
  const [cargando, setCargando] = useState(false);
  const [visibilidadClaves, setVisibilidadClaves] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (visible && credencial) {
      setCargando(true);
      setVisibilidadClaves({});
      credencialesApi
        .obtenerHistorial(credencial.id)
        .then((res) => setDatosHistorial(res))
        .catch(() => {
          mostrarToast('error', 'Error', 'No se pudo cargar el historial de cambios.');
        })
        .finally(() => setCargando(false));
    } else {
      setDatosHistorial(null);
    }
  }, [visible, credencial]);

  if (!visible || !credencial) return null;

  const toggleVer = (id: number) => {
    setVisibilidadClaves((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copiar = async (texto: string) => {
    try {
      await navigator.clipboard.writeText(texto);
      mostrarToast('info', 'Copiado', 'Contraseña copiada al portapapeles.');
    } catch {
      mostrarToast('error', 'Error', 'No se pudo copiar.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="glass-panel w-full max-w-xl p-6 sm:p-7 rounded-3xl border border-white/80 dark:border-neutral-700/50 shadow-2xl relative my-8">
        {/* Cabecera */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200/70 dark:border-neutral-700/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200/60 dark:border-emerald-700/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
              <i className="pi pi-history text-sm" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-neutral-100">
                Historial de Cambios · {credencial.nombre_aplicacion}
              </h2>
              <p className="text-xs text-slate-500 dark:text-neutral-400">{credencial.correo_o_usuario}</p>
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

        {/* Contenido */}
        {cargando ? (
          <div className="py-12 text-center text-slate-500 dark:text-neutral-400 text-xs flex flex-col items-center gap-2">
            <i className="pi pi-spin pi-spinner text-emerald-600 text-2xl" />
            <span>Consultando historial de cambios...</span>
          </div>
        ) : !datosHistorial || datosHistorial.historial.length === 0 ? (
          <div className="py-10 text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-neutral-500 text-lg">
              <i className="pi pi-info-circle" />
            </div>
            <h4 className="font-semibold text-slate-800 dark:text-neutral-200 text-sm">Sin rotaciones de contraseña</h4>
            <p className="text-xs text-slate-500 dark:text-neutral-400 max-w-xs mx-auto">
              Esta credencial se mantiene con su contraseña original y no registra cambios previos.
            </p>
          </div>
        ) : (
          <div className="space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
            <div className="text-xs font-semibold text-slate-500 dark:text-neutral-400 px-1">
              Total de rotaciones registradas: {datosHistorial.total_cambios}
            </div>

            {datosHistorial.historial.map((item, index) => {
              const isVisible = visibilidadClaves[item.id] || false;
              const fecha = new Date(item.created_at).toLocaleString('es-ES', {
                dateStyle: 'medium',
                timeStyle: 'short',
              });

              return (
                <div
                  key={item.id}
                  className="p-4 bg-white/80 dark:bg-neutral-800/70 border border-slate-200/80 dark:border-neutral-700/40 rounded-2xl shadow-xs space-y-2.5 text-xs"
                >
                  <div className="flex items-center justify-between text-slate-500 dark:text-neutral-400 font-medium">
                    <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Rotación #{datosHistorial.historial.length - index}
                    </span>
                    <span className="text-[11px]">{fecha}</span>
                  </div>

                  {/* Motivo */}
                  <div className="p-2.5 bg-amber-50/60 dark:bg-amber-900/20 border border-amber-200/70 dark:border-amber-700/30 rounded-xl text-amber-950 dark:text-amber-300 font-medium text-[11px] flex items-start gap-2">
                    <i className="pi pi-comment text-amber-600 dark:text-amber-400 mt-0.5 text-xs" />
                    <div>
                      <span className="font-bold text-amber-900 dark:text-amber-300 block">Motivo del cambio:</span>
                      <span>{item.motivo}</span>
                    </div>
                  </div>

                  {/* Comparación anterior vs nueva */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 bg-slate-50 dark:bg-neutral-900/60 border border-slate-200/60 dark:border-neutral-700/40 rounded-xl">
                      <span className="text-slate-400 dark:text-neutral-500 font-bold uppercase text-[10px] block mb-0.5">
                        Contraseña Anterior
                      </span>
                      <div className="flex items-center justify-between font-mono">
                        <span className="text-slate-600 dark:text-neutral-400 truncate select-all">
                          {isVisible ? item.contrasena_anterior : '••••••••••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => copiar(item.contrasena_anterior)}
                          className="p-1 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded cursor-pointer"
                          title="Copiar anterior"
                        >
                          <i className="pi pi-copy text-xs" />
                        </button>
                      </div>
                    </div>

                    <div className="p-2 bg-emerald-50/40 dark:bg-emerald-900/20 border border-emerald-200/60 dark:border-emerald-700/30 rounded-xl">
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold uppercase text-[10px] block mb-0.5">
                        Contraseña Nueva
                      </span>
                      <div className="flex items-center justify-between font-mono">
                        <span className="text-slate-900 dark:text-neutral-100 font-semibold truncate select-all">
                          {isVisible ? item.contrasena_nueva : '••••••••••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => copiar(item.contrasena_nueva)}
                          className="p-1 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded cursor-pointer"
                          title="Copiar nueva"
                        >
                          <i className="pi pi-copy text-xs" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => toggleVer(item.id)}
                      className="text-[11px] font-semibold text-slate-500 dark:text-neutral-400 hover:text-slate-800 dark:hover:text-neutral-200 transition-colors cursor-pointer"
                    >
                      {isVisible ? 'Ocultar contraseñas' : 'Revelar contraseñas'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pie */}
        <div className="mt-5 pt-3 border-t border-slate-200/70 dark:border-neutral-700/50 flex justify-end">
          <button
            type="button"
            onClick={alCerrar}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-300 font-medium rounded-xl text-xs transition-colors cursor-pointer"
          >
            Cerrar Historial
          </button>
        </div>
      </div>
    </div>
  );
};
