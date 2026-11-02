import { apiFetch } from './cliente';
import type { AuthResponse, LoginPayload, RegisterPayload, Usuario } from '../types';

export const authApi = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    return apiFetch<AuthResponse>('/login', {
      method: 'POST',
      data: payload,
    });
  },

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    return apiFetch<AuthResponse>('/register', {
      method: 'POST',
      data: payload,
    });
  },

  logout: async (): Promise<{ message: string }> => {
    return apiFetch<{ message: string }>('/logout', {
      method: 'POST',
    });
  },

  getMe: async (): Promise<Usuario> => {
    return apiFetch<Usuario>('/me', {
      method: 'GET',
    });
  },
};
