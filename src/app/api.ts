import { signal } from '@angular/core';

// Indicador para la interfaz. La API comprueba la sesión real en el servidor.
export const sesionActiva = signal(false);

const base = location.protocol === 'https:' ? '/api' : `http://${location.hostname}:8080/api`;

export class ApiError extends Error {
  constructor(readonly status: number) {
    super(`HTTP ${status}`);
  }
}

export async function api<T>(path: string, method = 'GET', body?: object): Promise<T> {
  const headers: Record<string, string> = {};
  if (method !== 'GET') {
    // Spring valida el token CSRF junto con la sesión en las peticiones de escritura.
    // /csrf se pide con GET, así que esta llamada no vuelve a solicitar un token.
    const csrf = await api<{ headerName: string; token: string }>('/csrf');
    headers[csrf.headerName] = csrf.token;
  }
  if (body) headers['Content-Type'] = 'application/json';
  const response = await fetch(base + path, {
    method,
    headers,
    // El navegador gestiona la cookie aunque Angular y la API usen puertos distintos.
    credentials: 'include',
    signal: AbortSignal.timeout(12000),
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) throw new ApiError(response.status);
  return response.headers.get('content-type')?.includes('application/json')
    ? response.json()
    : undefined as T;
}
