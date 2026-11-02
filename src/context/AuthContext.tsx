import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Usuario, LoginPayload, RegisterPayload } from '../types';
import { authApi } from '../api/authApi';

interface AuthContextType {
  usuario: Usuario | null;
  token: string | null;
  autenticado: boolean;
  cargando: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    const guardado = localStorage.getItem('usuario_key_nexus');
    return guardado ? JSON.parse(guardado) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token_key_nexus');
  });
  const [cargando, setCargando] = useState<boolean>(true);

  // Al iniciar, si hay token pero no usuario en memoria, verificar con /api/me
  useEffect(() => {
    const verificarSesion = async () => {
      const tokenGuardado = localStorage.getItem('token_key_nexus');
      if (tokenGuardado) {
        try {
          const user = await authApi.getMe();
          setUsuario(user);
          localStorage.setItem('usuario_key_nexus', JSON.stringify(user));
        } catch {
          localStorage.removeItem('token_key_nexus');
          localStorage.removeItem('usuario_key_nexus');
          setUsuario(null);
          setToken(null);
        }
      }
      setCargando(false);
    };

    verificarSesion();
  }, []);

  const login = async (payload: LoginPayload) => {
    const res = await authApi.login(payload);
    setToken(res.access_token);
    setUsuario(res.user);
    localStorage.setItem('token_key_nexus', res.access_token);
    localStorage.setItem('usuario_key_nexus', JSON.stringify(res.user));
  };

  const register = async (payload: RegisterPayload) => {
    const res = await authApi.register(payload);
    setToken(res.access_token);
    setUsuario(res.user);
    localStorage.setItem('token_key_nexus', res.access_token);
    localStorage.setItem('usuario_key_nexus', JSON.stringify(res.user));
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignorar error si el token ya no es válido en el servidor
    } finally {
      setToken(null);
      setUsuario(null);
      localStorage.removeItem('token_key_nexus');
      localStorage.removeItem('usuario_key_nexus');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        autenticado: !!token,
        cargando,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
