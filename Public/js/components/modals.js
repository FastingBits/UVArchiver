const openModalButtons = document.querySelectorAll('.open-modal-button');
const closeModalButton = document.querySelector('.close-modal-button');

// Función para cerrar un modal
const closeModal = () => {
    const selectedModalId = document.querySelector('.modal.show');
    if (selectedModalId) {
        selectedModalId.classList.remove('show'); // Ocultar el modal
    }
};

// Abrir modal con fade-in animation
openModalButtons.forEach(button => {
    button.addEventListener('click', () => {
        const targetModalId = button.dataset.target;
        const modalContainer = document.getElementById(targetModalId);
        if (modalContainer) {
            modalContainer.classList.add('show'); // Mostrar el modal
            window.scrollTo(0, 0); // Evitar scroll en la página después de abrir el modal
        }
    });
});

// Cerrar modal con fade-out animation
if (closeModalButton) {
    closeModalButton.addEventListener('click', closeModal);
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});