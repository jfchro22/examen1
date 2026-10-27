// src/components/listado.js
import { listarEquipos, eliminarEquipo } from '../modules/equipos.js';

let paginaActual = 1;
let busquedaActual = '';
let estadoActual = '';

export async function initListado() {
    const contenedorLista = document.querySelector('#lista-equipos'); // Ajustá según el ID de tu HTML
    const inputBuscar = document.querySelector('#buscar');
    const selectEstado = document.querySelector('#filtro-estado');
    const btnAnterior = document.querySelector('#btn-anterior');
    const btnSiguiente = document.querySelector('#btn-siguiente');
    const spanResumen = document.querySelector('#resumen-paginacion');
    const spanPagina = document.querySelector('#pagina-actual');

    if (!contenedorLista) return;

    async function cargarDatos() {
        contenedorLista.setAttribute('aria-busy', 'true');
        try {
            const data = await listarEquipos({
                page: paginaActual,
                q: busquedaActual,
                estado: estadoActual
            });

            contenedorLista.innerHTML = '';

            const template = document.querySelector('#tpl-equipo');
            
            if (data.data.length === 0) {
                contenedorLista.innerHTML = '<p class="estado-vacio">No se encontraron equipos registrados.</p>';
                spanResumen.textContent = 'Mostrando 0 de 0';
                return;
            }

            data.data.forEach(equipo => {
                const clone = template.content.cloneNode(true);
                
                const card = clone.querySelector('.equipo-card'); // Ajustá la clase de tu HTML
                if (card) {
                    card.setAttribute('data-id', equipo.id);
                    card.setAttribute('data-estado', equipo.estado);
                }

                clone.querySelector('.codigo').textContent = equipo.codigo;
                clone.querySelector('.nombre').textContent = equipo.nombre;
                clone.querySelector('.estado').textContent = equipo.estado;
                clone.querySelector('.categoria').textContent = equipo.categoria ? equipo.categoria.nombre : 'Sin categoría';
                clone.querySelector('.fecha').textContent = equipo.fecha_adquisicion;

                contenedorLista.appendChild(clone);
            });

            // Actualizar metadatos de paginación
            const { current_page, last_page, from, to, total } = data.meta;
            paginaActual = current_page;
            spanResumen.textContent = `Mostrando ${from || 0}-${to || 0} de ${total}`;
            spanPagina.textContent = `Página ${current_page} de ${last_page}`;

            btnAnterior.disabled = current_page <= 1;
            btnSiguiente.disabled = current_page >= last_page;

        } catch (error) {
            console.error('Error al cargar equipos:', error);
        } finally {
            contenedorLista.setAttribute('aria-busy', 'false');
        }
    }

    // Delegación de eventos para eliminar
    contenedorLista.addEventListener('click', async (e) => {
        const btnEliminar = e.target.closest('.btn-eliminar');
        if (!btnEliminar) return;

        const card = btnEliminar.closest('[data-id]');
        const id = card.getAttribute('data-id');

        if (confirm('¿Estás seguro de que deseas eliminar este equipo?')) {
            try {
                await eliminarEquipo(id);
                // Si la página se queda sin elementos y no es la primera, retrocedemos una página
                const itemsRestantes = contenedorLista.querySelectorAll('[data-id]').length;
                if (itemsRestantes === 1 && paginaActual > 1) {
                    paginaActual--;
                }
                cargarDatos();
            } catch (error) {
                if (error.status === 409) {
                    alert(error.data.mensaje || 'No se puede eliminar un equipo prestado.');
                } else {
                    alert('Ocurrió un error al intentar eliminar el equipo.');
                }
            }
        }
    });

    // Filtros y controles
    if (inputBuscar) {
        inputBuscar.addEventListener('input', (e) => {
            busquedaActual = e.target.value;
            paginaActual = 1;
            cargarDatos();
        });
    }

    if (selectEstado) {
        selectEstado.addEventListener('change', (e) => {
            estadoActual = e.target.value;
            paginaActual = 1;
            cargarDatos();
        });
    }

    if (btnAnterior) {
        btnAnterior.addEventListener('click', () => {
            if (paginaActual > 1) {
                paginaActual--;
                cargarDatos();
            }
        });
    }

    if (btnSiguiente) {
        btnSiguiente.addEventListener('click', () => {
            paginaActual++;
            cargarDatos();
        });
    }

    cargarDatos();
}