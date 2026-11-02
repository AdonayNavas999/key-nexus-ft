import { apiFetch } from './cliente';
import type { Credencial, CredencialPayload, HistorialResponse } from '../types';

export const credencialesApi = {
  obtenerCredenciales: async (buscar?: string): Promise<{ data: Credencial[] }> => {
    const query = buscar ? `?buscar=${encodeURIComponent(buscar)}` : '';
    return apiFetch<{ data: Credencial[] }>(`/credenciales${query}`, {
      method: 'GET',
    });
  },

  obtenerCredencial: async (id: number): Promise<{ credencial: Credencial }> => {
    return apiFetch<{ credencial: Credencial }>(`/credenciales/${id}`, {
      method: 'GET',
    });
  },

  crearCredencial: async (payload: CredencialPayload): Promise<{ message: string; credencial: Credencial }> => {
    return apiFetch<{ message: string; credencial: Credencial }>('/credenciales', {
      method: 'POST',
      data: payload,
    });
  },

  actualizarCredencial: async (
    id: number,
    payload: Partial<CredencialPayload>
  ): Promise<{ message: string; credencial: Credencial }> => {
    return apiFetch<{ message: string; credencial: Credencial }>(`/credenciales/${id}`, {
      method: 'PUT',
      data: payload,
    });
  },

  eliminarCredencial: async (id: number): Promise<{ message: string }> => {
    return apiFetch<{ message: string }>(`/credenciales/${id}`, {
      method: 'DELETE',
    });
  },

  obtenerHistorial: async (id: number): Promise<HistorialResponse> => {
    return apiFetch<HistorialResponse>(`/credenciales/${id}/historial`, {
      method: 'GET',
    });
  },

  descargarPdf: async (): Promise<void> => {
    const token = localStorage.getItem('token_key_nexus');
    const response = await fetch('http://127.0.0.1:8000/api/credenciales/exportar/pdf', {
      method: 'GET',
      headers: {
        'Accept': 'application/pdf',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      throw new Error('No se pudo generar el reporte PDF.');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `KEY-NEXUS-Reporte-${new Date().toLocaleDateString('es-ES').replace(/\//g, '-')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
