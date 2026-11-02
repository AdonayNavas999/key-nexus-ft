import React, { useState } from 'react';
import type { Credencial } from '../types';

interface CredencialCardProps {
  credencial: Credencial;
  alEditar: (credencial: Credencial) => void;
  alVerHistorial: (credencial: Credencial) => void;
  alEliminar: (id: number, nombreApp: string) => void;
  mostrarToast: (tipo: 'success' | 'info' | 'warn' | 'error', resumen: string, detalle: string) => void;
}

export const CredencialCard: React.FC<CredencialCardProps> = ({
  credencial,
  alEditar,
  alVerHistorial,
  alEliminar,
  mostrarToast,
}) => {
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const copiarTexto = async (texto: string, etiqueta: string) => {
    try {
      await navigator.clipboard.writeText(texto);
      mostrarToast('info', 'Copiado', `${etiqueta} copiado al portapapeles.`);
    } catch {
      mostrarToast('error', 'Error', 'No se pudo copiar al portapapeles.');
    }
  };

  const inicial = credencial.nombre_aplicacion.charAt(0).toUpperCase();

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col justify-between transition-all duration-200">
      <div>
        {/* Cabecera de la Tarjeta */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200/60 dark:border-emerald-700/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-base shadow-xs">
              {inicial}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-neutral-100 text-base leading-tight">
                {credencial.nombre_aplicacion}
              </h3>
              {credencial.url && (
                <a
                  href={credencial.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:underline flex items-center gap-1 mt-0.5 truncate max-w-[200px]"
                >
                  <i className="pi pi-external-link text-[10px]" />
                  <span>Visitar sitio</span>
                </a>
              )}
            </div>
          </div>

          {/* Badge de Historial */}
          {(credencial.historial_count ?? 0) > 0 && (
            <span
              onClick={() => alVerHistorial(credencial)}
              className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-neutral-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors cursor-pointer border border-slate-200/80 dark:border-neutral-700/50 flex items-center gap-1"
              title="Ver historial de cambios"
            >
              <i className="pi pi-history text-[10px]" />
              {credencial.historial_count} {credencial.historial_count === 1 ? 'cambio' : 'cambios'}
            </span>
          )}
        </div>

        {/* Datos Principales */}
        <div className="space-y-3 my-2 text-xs">
          {/* Correo / Usuario */}
          <div className="bg-slate-50/80 dark:bg-neutral-800/60 border border-slate-200/60 dark:border-neutral-700/40 rounded-xl p-2.5 flex items-center justify-between gap-2">
            <div className="truncate">
              <span className="block text-[10px] uppercase font-bold text-slate-400 dark:text-neutral-500">Usuario / Correo</span>
              <span className="font-medium text-slate-800 dark:text-neutral-200 text-xs truncate select-all">
                {credencial.correo_o_usuario}
              </span>
            </div>
            <button
              type="button"
              onClick={() => copiarTexto(credencial.correo_o_usuario, 'Usuario')}
              className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors rounded-lg hover:bg-white dark:hover:bg-neutral-700 cursor-pointer"
              title="Copiar usuario o correo"
            >
              <i className="pi pi-copy text-sm" />
            </button>
          </div>

          {/* Contraseña */}
          <div className="bg-slate-50/80 dark:bg-neutral-800/60 border border-slate-200/60 dark:border-neutral-700/40 rounded-xl p-2.5 flex items-center justify-between gap-2">
            <div className="truncate flex-1">
              <span className="block text-[10px] uppercase font-bold text-slate-400 dark:text-neutral-500">Contraseña</span>
              <span className="font-mono text-xs font-semibold text-slate-900 dark:text-neutral-100 truncate block select-all">
                {mostrarPassword ? credencial.contrasena : '••••••••••••••••'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setMostrarPassword(!mostrarPassword)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-neutral-200 transition-colors rounded-lg hover:bg-white dark:hover:bg-neutral-700 cursor-pointer"
                title={mostrarPassword ? 'Ocultar' : 'Mostrar'}
              >
                <i className={`pi ${mostrarPassword ? 'pi-eye-slash' : 'pi-eye'} text-sm`} />
              </button>
              <button
                type="button"
                onClick={() => copiarTexto(credencial.contrasena, 'Contraseña')}
                className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors rounded-lg hover:bg-white dark:hover:bg-neutral-700 cursor-pointer"
                title="Copiar contraseña"
              >
                <i className="pi pi-copy text-sm" />
              </button>
            </div>
          </div>

          {/* Notas (si existen) */}
          {credencial.notas && (
            <div className="p-2.5 text-[11px] text-slate-600 dark:text-neutral-400 bg-white/60 dark:bg-neutral-800/40 border border-slate-200/40 dark:border-neutral-700/30 rounded-xl">
              <span className="font-semibold text-slate-500 dark:text-neutral-400 block mb-0.5">Notas:</span>
              <p className="line-clamp-2">{credencial.notas}</p>
            </div>
          )}
        </div>
      </div>

      {/* Acciones de la Tarjeta */}
      <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-neutral-700/40 flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={() => alVerHistorial(credencial)}
          className="text-slate-500 dark:text-neutral-400 hover:text-slate-800 dark:hover:text-neutral-200 font-medium flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <i className="pi pi-history text-xs" />
          <span>Historial</span>
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => alEditar(credencial)}
            className="p-2 text-slate-500 dark:text-neutral-400 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors cursor-pointer"
            title="Editar credencial"
          >
            <i className="pi pi-pencil text-xs" />
          </button>
          <button
            type="button"
            onClick={() => alEliminar(credencial.id, credencial.nombre_aplicacion)}
            className="p-2 text-slate-400 dark:text-neutral-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer"
            title="Eliminar credencial"
          >
            <i className="pi pi-trash text-xs" />
          </button>
        </div>
      </div>
    </div>
  );
};
