/**
 * Muestra una notificación emergente (Toast) en la pantalla.
 * @param {string} message - Mensaje a mostrar.
 * @param {string} type - Tipo de toast: 'success' | 'error'. Por defecto 'error'.
 */
function showToast(message, type = 'error') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    `;
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.style.cssText = `
    padding: 12px 24px;
    border-radius: 8px;
    color: #fff;
    font-family: "Hanken Grotesk Regular", sans-serif;
    font-size: 14px;
    font-weight: 600;
    box-shadow: 0 8px 16px rgba(0,0,0,0.15);
    opacity: 0;
    transform: translateY(-20px);
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
    background-color: ${type === 'success' ? '#23ae28' : '#ec4d4d'};
    pointer-events: auto;
    display: flex;
    align-items: center;
    gap: 8px;
    border-left: 5px solid ${type === 'success' ? '#0d450f' : '#d62929'};
  `;

  // Añadir un icono simple según el tipo
  const icon = type === 'success' 
    ? '<i class="fas fa-check-circle"></i>' 
    : '<i class="fas fa-exclamation-circle"></i>';

  toast.innerHTML = `${icon} <span>${message}</span>`;
  container.appendChild(toast);

  // Animación de entrada
  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  }, 50);

  // Animación de salida
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-20px)';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 4000);
}

window.showToast = showToast;
