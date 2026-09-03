document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.form-documento').addEventListener('submit', async function (e) {
        e.preventDefault();
        const formData = new FormData(this);
        try {
            const res = await fetch('/api/documentos', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                showToast(data.message, 'success');
                this.reset();
                setTimeout(() => location.reload(), 1500);
            } else {
                showToast(data.message || 'No se pudo guardar el documento', 'error');
            }
        } catch (err) {
            showToast('Error de conexión con el servidor', 'error');
        }
    });

    // Drag and Drop Logic
    const fileInput = document.getElementById('documento');
    const dropZone = document.getElementById('dropZone');
    const fileNameSpan = document.getElementById('fileName');

    if (dropZone && fileInput) {
        // Drag over states
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drop-zone--over');
        });

        ['dragleave', 'dragend'].forEach(type => {
            dropZone.addEventListener(type, () => {
                dropZone.classList.remove('drop-zone--over');
            });
        });

        // Handle dropped files
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drop-zone--over');

            if (e.dataTransfer.files.length) {
                fileInput.files = e.dataTransfer.files;
                updateFileName(e.dataTransfer.files[0].name);
            }
        });

        // Handle manual selection
        fileInput.addEventListener('change', () => {
            if (fileInput.files.length) {
                updateFileName(fileInput.files[0].name);
            } else {
                updateFileName('Ningún archivo seleccionado');
            }
        });

        function updateFileName(name) {
            if (fileNameSpan) {
                fileNameSpan.textContent = name;
            }
            dropZone.classList.add('drop-zone--has-file');
        }

        // Handle form reset
        const form = document.querySelector('.form-documento');
        if (form) {
            form.addEventListener('reset', () => {
                if (fileNameSpan) {
                    fileNameSpan.textContent = 'Ningún archivo seleccionado';
                }
                dropZone.classList.remove('drop-zone--has-file');
            });
        }
    }
});