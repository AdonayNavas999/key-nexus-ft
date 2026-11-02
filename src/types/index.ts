export interface Usuario {
  id: number;
  name: string;
  email: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponse {
  message: string;
  access_token: string;
  token_type: string;
  user: Usuario;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface Credencial {
  id: number;
  usuario_id: number;
  nombre_aplicacion: string;
  correo_o_usuario: string;
  contrasena: string;
  url?: string | null;
  notas?: string | null;
  created_at?: string;
  updated_at?: string;
  historial_count?: number;
}

export interface HistorialItem {
  id: number;
  credencial_id: number;
  contrasena_anterior: string;
  contrasena_nueva: string;
  motivo: string;
  created_at: string;
}

export interface HistorialResponse {
  credencial_id: number;
  nombre_aplicacion: string;
  correo_o_usuario: string;
  total_cambios: number;
  historial: HistorialItem[];
}

export interface CredencialPayload {
  nombre_aplicacion: string;
  correo_o_usuario: string;
  contrasena: string;
  url?: string | null;
  notas?: string | null;
  motivo?: string;
}
