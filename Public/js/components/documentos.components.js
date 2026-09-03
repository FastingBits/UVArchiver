document.addEventListener('DOMContentLoaded', () => {
    window.verPDF = (url) => {
        const pdfFrame = document.getElementById('pdfFrame');
        if (pdfFrame) {
            pdfFrame.src = url;
        }
        const modal = document.getElementById('modal-container-2');
        if (modal) {
            modal.classList.add('show');
            window.scrollTo(0, 0);
        }
    };

    window.cerrarPDF = () => {
        const pdfFrame = document.getElementById('pdfFrame');
        if (pdfFrame) {
            pdfFrame.src = '';
        }
    };

    window.deleteDocumento = (id) => {
        if (!confirm('¿Está seguro de que desea eliminar este documento?')) return;
        fetch(`/api/documentos/${id}`, {
            method: 'DELETE'
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    showToast('Documento eliminado correctamente', 'success');
                    setTimeout(() => location.reload(), 1500);
                } else {
                    showToast(data.message || 'No se pudo eliminar el documento', 'error');
                }
            })
            .catch(err => {
                console.error(err);
                showToast('Error de conexión con el servidor', 'error');
            });
    };

    window.openEditDocModal = (id, nombre, privado) => {
        const idInput = document.getElementById('edit-doc-id');
        const nombreInput = document.getElementById('edit-doc-nombre');
        const privadoCheckbox = document.getElementById('edit-doc-privado');

        if (idInput) idInput.value = id;
        if (nombreInput) nombreInput.value = nombre;
        if (privadoCheckbox) privadoCheckbox.checked = (privado === 1 || privado === true || privado === '1');

        const modal = document.getElementById('modal-container-edit-doc');
        if (modal) {
            modal.classList.add('show');
            window.scrollTo(0, 0);
        }
    };

    const formEditDoc = document.getElementById('form-edit-documento');
    if (formEditDoc) {
        formEditDoc.addEventListener('submit', async function (e) {
            e.preventDefault();
            const id = document.getElementById('edit-doc-id').value;
            const nombre = document.getElementById('edit-doc-nombre').value.trim();
            const privado = document.getElementById('edit-doc-privado').checked ? 1 : 0;

            try {
                const res = await fetch(`/api/documentos/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ nombre, privado })
                });
                const data = await res.json();
                if (data.success) {
                    showToast(data.message || 'Documento actualizado correctamente', 'success');
                    if (typeof closeModal === 'function') closeModal();
                    setTimeout(() => location.reload(), 1200);
                } else {
                    showToast(data.message || 'Error al actualizar documento', 'error');
                }
            } catch (err) {
                console.error(err);
                showToast('Error de conexión con el servidor', 'error');
            }
        });
    }

    // Filtro de búsqueda y calendario del listado combinados
    const searchInput = document.getElementById('searchInput');
    const filterDate = document.getElementById('filter-date');

    const filterDocuments = () => {
        const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const selectedDate = filterDate ? filterDate.value : '';
        const rows = document.querySelectorAll('#documentTableBody tr');

        rows.forEach(row => {
            const fileNameEl = row.querySelector('.file-name');
            const ownerEl = row.querySelector('.owner-cell');
            if (!fileNameEl || !ownerEl) return;

            const text = (fileNameEl.textContent + ' ' + ownerEl.textContent).toLowerCase();
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
        searchInput.addEventListener('input', filterDocuments);
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