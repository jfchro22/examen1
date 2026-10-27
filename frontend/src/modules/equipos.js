// src/modules/equipos.js
import { request } from './api.js';

export async function listarEquipos(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const endpoint = `/equipos${queryParams ? `?${queryParams}` : ''}`;
    return await request(endpoint);
}

export async function obtenerEquipo(id) {
    return await request(`/equipos/${id}`);
}

export async function crearEquipo(data) {
    return await request('/equipos', {
        method: 'POST',
        body: data
    });
}

export async function eliminarEquipo(id) {
    return await request(`/equipos/${id}`, {
        method: 'DELETE'
    });
}

export async function prestarEquipo(id) {
    return await request(`/equipos/${id}/prestamo`, {
        method: 'POST'
    });
}