document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const editUserForm = document.getElementById('edit-user-form');

    // Registrar Usuario
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(registerForm);
            const data = {
                nombre: formData.get('nombre'),
                apellido_paterno: formData.get('apellidoPaterno'),
                apellido_materno: formData.get('apellidoMaterno'),
                correo: formData.get('correo'),
                contrasena: formData.get('contraseña'),
                id_departamento: formData.get('departamento'),
                id_rol: formData.get('rol'),
                pertenece_a_institucion: formData.get('perteneceAInstitucion')
            };

            try {
                const result = await usuariosService.addUser(data);
                if (result.success) {
                    showToast('Usuario registrado exitosamente', 'success');
                    registerForm.reset();
                    setTimeout(() => location.reload(), 1500);
                } else {
                    showToast(result.message || 'Error al registrar usuario', 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                showToast('Error al registrar usuario en el servidor', 'error');
            }
        });
    }

    // Editar Usuario
    if (editUserForm) {
        editUserForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('edit-id').value;
            const newRol = parseInt(document.getElementById('edit-rol').value);
            const newDept = parseInt(document.getElementById('edit-departamento').value);
            const pertenece = parseInt(document.getElementById('edit-perteneceAInstitucion').value);

            // Si el administrador se edita a sí mismo
            if (id === window.currentUserId) {
                // Solo advertir si el departamento actual NO es 'Sin departamento' (ID 1)
                if (window.currentUserDept !== 1 && newDept !== window.currentUserDept) {
                    const confirmDept = confirm('¿Está seguro de cambiar su propio departamento? Dejará de ver los expedientes de su departamento actual de forma inmediata.');
                    if (!confirmDept) return;
                }
                if (newRol > window.currentUserRol) {
                    const confirmRol = confirm('¿Está seguro de cambiar su propio rol a uno de menor privilegio? Perderá acceso a esta sección de administración de forma inmediata.');
                    if (!confirmRol) return;
                }
            }

            const data = {
                nombre: document.getElementById('edit-nombre').value,
                apellido_paterno: document.getElementById('edit-paternal').value,
                apellido_materno: document.getElementById('edit-maternal').value,
                correo: document.getElementById('edit-correo').value,
                id_departamento: newDept,
                id_rol: newRol,
                pertenece_a_institucion: pertenece
            };

            try {
                const result = await usuariosService.updateUser(id, data);
                if (result.success) {
                    showToast('Usuario actualizado correctamente', 'success');
                    closeModal();
                    // Si se editó a sí mismo y cambió el rol o departamento, redirigir al dashboard principal tras recargar
                    if (id === window.currentUserId && (newRol > window.currentUserRol || newDept !== window.currentUserDept)) {
                        setTimeout(() => location.href = '/', 1500);
                    } else {
                        setTimeout(() => location.reload(), 1500);
                    }
                } else {
                    showToast(result.message || 'Error al actualizar usuario', 'error');
                }
            } catch (error) {
                console.error('Error al actualizar:', error);
                showToast('Error al actualizar usuario en el servidor', 'error');
            }
        });
    }

    // Función global para abrir el modal de edición
    window.openEditUserModal = (id, nombre, paternal, maternal, correo, departamentoId, rolId, perteneceAInstitucion) => {
        document.getElementById('edit-id').value = id;
        document.getElementById('edit-nombre').value = nombre;
        document.getElementById('edit-paternal').value = paternal;
        document.getElementById('edit-maternal').value = maternal;
        document.getElementById('edit-correo').value = correo;

        const depSelect = document.getElementById('edit-departamento');
        if (depSelect) depSelect.value = departamentoId;

        const rolSelect = document.getElementById('edit-rol');
        if (rolSelect) rolSelect.value = rolId;

        const perteneceSelect = document.getElementById('edit-perteneceAInstitucion');
        if (perteneceSelect) perteneceSelect.value = perteneceAInstitucion;

        // Abrir modal usando la animación definida en modals.js
        const modalContainer = document.getElementById('modal-container-2');
        if (modalContainer) {
            modalContainer.classList.add('show');
            window.scrollTo(0, 0);
        }
    };

    // Función global para eliminar usuario
    window.deleteUser = (id) => {
        if (!confirm('¿Estás seguro de eliminar este usuario de forma lógica?')) return;
        usuariosService.deleteUser(id).then(result => {
            if (result.success) {
                showToast('Usuario eliminado correctamente', 'success');
                setTimeout(() => location.reload(), 1500);
            } else {
                showToast(result.message || 'Error al eliminar usuario', 'error');
            }
        }).catch(err => {
            console.error('Error al eliminar usuario:', err);
            showToast('Error al conectar con el servidor.', 'error');
        });
    };

    const searchInput = document.getElementById('search-input');
    const filterDate = document.getElementById('filter-date');

    const filterUsers = () => {
        const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const selectedDate = filterDate ? filterDate.value : '';
        const rows = document.querySelectorAll('.doc-table tbody tr');

        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            const rowDate = row.getAttribute('data-date');

            const matchesQuery = text.includes(query);
            const matchesDate = !selectedDate || rowDate === selectedDate;

            if (matchesQuery && matchesDate) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    };

    if (searchInput) {
        searchInput.addEventListener('input', filterUsers);
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const query = searchInput.value.trim();
                const url = new URL(window.location.href);
                url.searchParams.set('page', '1');
                if (query) url.searchParams.set('search', query);
                else url.searchParams.delete('search');
                window.location.href = url.toString();
            }
        });
    }

    if (filterDate) {
        filterDate.addEventListener('change', () => {
            const dateVal = filterDate.value.trim();
            const url = new URL(window.location.href);
            url.searchParams.set('page', '1');
            if (dateVal) url.searchParams.set('date', dateVal);
            else url.searchParams.delete('date');
            window.location.href = url.toString();
        });
    }

    // Permitir abrir el selector de fecha nativo al hacer clic en el ícono/label del calendario
    const datePickerLabel = document.querySelector('.date-search .date-picker');
    if (datePickerLabel && filterDate) {
        datePickerLabel.addEventListener('click', (e) => {
            e.preventDefault();
            try {
                filterDate.showPicker();
            } catch (err) {
                console.warn("showPicker no soportado:", err);
                filterDate.focus();
            }
        });
    }
});