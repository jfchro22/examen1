// src/modules/api.js

export class ErrorApi extends Error {
    constructor(message, status, data) {
        super(message);
        this.status = status;
        this.data = data;
    }
}

export async function request(url, opciones = {}) {
    const token = localStorage.getItem('auth_token'); // O la forma en que guardés el token del login
    
    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...opciones.headers
    };

    const config = {
        ...opciones,
        headers
    };

    // Si hay un body y no es FormData, lo serializamos a JSON
    if (config.body && !(config.body instanceof FormData) && typeof config.body === 'object') {
        config.body = JSON.stringify(config.body);
    }

    // Configurar AbortController para timeout de 8 segundos
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    config.signal = controller.signal;

    try {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        const response = await fetch(`${baseUrl}${url}`, config);
        clearTimeout(timeoutId);

        // Si la respuesta es 204 No Content, devolvemos null
        if (response.status === 204) {
            return null;
        }

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            if (response.status === 401) {
                // Olvidar sesión y recargar si no está autorizado
                localStorage.removeItem('auth_token');
                window.location.reload();
            }
            throw new ErrorApi(data.mensaje || 'Error en la petición', response.status, data);
        }

        return data;
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new ErrorApi('La petición tardó demasiado y fue cancelada.', 408, null);
        }
        throw error;
    }
}