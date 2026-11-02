const API_BASE_URL = 'http://127.0.0.1:8000/api';

interface RequestOptions extends RequestInit {
  data?: unknown;
}

export async function apiFetch<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const token = localStorage.getItem('token_key_nexus');

  const headers: HeadersInit = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const config: RequestInit = {
    ...options,
    headers,
  };

  if (options.data !== undefined) {
    config.body = JSON.stringify(options.data);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  // Manejo de token inválido o expirado
  if (response.status === 401 && !endpoint.includes('/login') && !endpoint.includes('/register')) {
    localStorage.removeItem('token_key_nexus');
    localStorage.removeItem('usuario_key_nexus');
    window.location.reload();
  }

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error: Error & { errors?: Record<string, string[]>; status?: number } = new Error(
      result.message || 'Ocurrió un error en la solicitud'
    );
    error.errors = result.errors;
    error.status = response.status;
    throw error;
  }

  return result as T;
}
