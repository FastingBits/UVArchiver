document.addEventListener('DOMContentLoaded', () => {
    const registerDeptForm = document.getElementById('register-dept-form');
    const editDeptForm = document.getElementById('edit-dept-form');
    const searchInput = document.getElementById('search-input');

    // Registrar Departamento
    if (registerDeptForm) {
        registerDeptForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = {
                name: document.getElementById('dept-nombre').value,
                descripcion: document.getElementById('dept-descripcion').value
            };

            try {
                const result = await departamentosService.addDepartamento(data);
                if (result.success) {
                    showToast('Departamento registrado exitosamente', 'success');
                    registerDeptForm.reset();
                    setTimeout(() => location.reload(), 1500);
                } else {
                    showToast(result.message || 'Error al registrar departamento', 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                showToast('Error al registrar departamento en el servidor', 'error');
            }
        });
    }

    // Editar Departamento
    if (editDeptForm) {
        editDeptForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('edit-dept-id').value;
            const data = {
                name: document.getElementById('edit-dept-nombre').value,
                descripcion: document.getElementById('edit-dept-descripcion').value
            };

            try {
                const result = await departamentosService.updateDepartamento(id, data);
                if (result.success) {
                    showToast('Departamento actualizado correctamente', 'success');
                    closeModal();
                    setTimeout(() => location.reload(), 1500);
                } else {
                    showToast(result.message || 'Error al actualizar departamento', 'error');
                }
            } catch (error) {
                console.error('Error al actualizar departamento:', error);
                showToast('Error al actualizar departamento en el servidor', 'error');
            }
        });
    }

    // Función global para abrir el modal de edición
    window.openEditDeptModal = (id, nombre, descripcion) => {
        document.getElementById('edit-dept-id').value = id;
        document.getElementById('edit-dept-nombre').value = nombre;
        document.getElementById('edit-dept-descripcion').value = descripcion;

        // Abrir modal usando la animación definida en modals.js
        const modalContainer = document.getElementById('modal-container-2');
        if (modalContainer) {
            modalContainer.classList.add('show');
            window.scrollTo(0, 0);
        }
    };

    // Función global para eliminar departamento
    window.deleteDepartamento = (id) => {
        if (!confirm('¿Estás seguro de eliminar este departamento de forma lógica? Esto afectará la visibilidad de sus registros.')) return;
        departamentosService.deleteDepartamento(id).then(result => {
            if (result.success) {
                showToast('Departamento eliminado correctamente', 'success');
                setTimeout(() => location.reload(), 1500);
            } else {
                showToast(result.message || 'Error al eliminar departamento', 'error');
            }
        }).catch(err => {
            console.error('Error al eliminar departamento:', err);
            showToast('Error al conectar con el servidor.', 'error');
        });
    };

    // Buscador de departamentos cliente-side
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            const rows = document.querySelectorAll('.doc-table tbody tr');
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                if (text.includes(query)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }
});
