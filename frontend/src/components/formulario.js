// src/components/formulario.js
import { crearEquipo } from '../modules/equipos.js';
import { request } from '../modules/api.js';

export async function initFormulario(onEquipoGuardado) {
    const form = document.querySelector('#form-equipo'); // Ajustá según el ID de tu formulario en el HTML
    const selectCategoria = document.querySelector('#categoria_id');
    const btnGuardar = form?.querySelector('button[type="submit"]');

    if (!form) return;

    // 1. Cargar las categorías en el select al iniciar
    try {
        const categoriasData = await request('/categorias');
        if (selectCategoria && categoriasData.data) {
            selectCategoria.innerHTML = '<option value="">Seleccione una categoría</option>';
            categoriasData.data.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.id;
                option.textContent = cat.nombre;
                selectCategoria.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error al cargar categorías:', error);
    }

    // 2. Manejar el envío del formulario
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Limpiar errores previos y aria-invalid
        form.querySelectorAll('[data-error]').forEach(el => el.textContent = '');
        form.querySelectorAll('[aria-invalid="true"]').forEach(el => el.removeAttribute('aria-invalid'));

        const formData = new FormData(form);
        const data = {};

        formData.forEach((value, key) => {
            if (key === 'categoria_id' || key === 'costo_interno') {
                data[key] = value !== '' ? Number(value) : value;
            } else {
                data[key] = value;
            }
        });

        // Deshabilitar el botón y mostrar estado de carga
        const textoOriginal = btnGuardar.textContent;
        btnGuardar.disabled = true;
        btnGuardar.textContent = 'Guardando...';

        try {
            await crearEquipo(data);
            
            // Limpiar formulario y recargar lista
            form.reset();
            if (typeof onEquipoGuardado === 'function') {
                onEquipoGuardado();
            }
        } catch (error) {
            if (error.status === 422 && error.data && error.data.errors) {
                // Mapear los errores 422 al campo correspondiente
                Object.keys(error.data.errors).forEach(campo => {
                    const mensajeError = error.data.errors[campo][0];
                    const inputField = form.querySelector(`[name="${campo}"]`);
                    const errorContainer = form.querySelector(`[data-error="${campo}"]`);

                    if (inputField) {
                        inputField.setAttribute('aria-invalid', 'true');
                    }
                    if (errorContainer) {
                        errorContainer.textContent = mensajeError;
                    }
                });
            } else {
                alert(error.data?.mensaje || 'Ocurrió un error al guardar el equipo.');
            }
        } finally {
            btnGuardar.disabled = false;
            btnGuardar.textContent = textoOriginal;
        }
    });
}