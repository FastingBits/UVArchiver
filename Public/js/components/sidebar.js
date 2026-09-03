const sidebar = document.getElementById("sidebar");
const toggleBtn = document.getElementById("toggleBtn");
const overlay = document.getElementById("sidebarOverlay");
const main = document.querySelector(".container-user");
const mobileQuery = window.matchMedia("(max-width: 768px)");

const iconDefault = `<img src="/img/logo-uv.svg" alt="logo-uv" class="img-fluid">`;
const iconOpen =
  '<svg class="icon-svg" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-layout-sidebar-left-expand"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M4 6a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2l0 -12" /><path d="M9 4v16" /><path d="M14 10l2 2l-2 2" /></svg>';
const iconClose =
  '<svg class="icon-svg" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="icon icon-tabler icons-tabler-filled icon-tabler-layout-sidebar-left-collapse"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M18 3a3 3 0 0 1 2.995 2.824l.005 .176v12a3 3 0 0 1 -2.824 2.995l-.176 .005h-12a3 3 0 0 1 -2.995 -2.824l-.005 -.176v-12a3 3 0 0 1 2.824 -2.995l.176 -.005h12zm0 2h-9v14h9a1 1 0 0 0 .993 -.883l.007 -.117v-12a1 1 0 0 0 -.883 -.993l-.117 -.007zm-2.293 4.293a1 1 0 0 1 .083 1.32l-.083 .094l-1.292 1.293l1.292 1.293a1 1 0 0 1 .083 1.32l-.083 .094a1 1 0 0 1 -1.32 .083l-.094 -.083l-2 -2a1 1 0 0 1 -.083 -1.32l.083 -.094l2 -2a1 1 0 0 1 1.414 0z" /></svg>';

// Indicadores visuales para móvil - logo con indicador sutil
const iconMobileClose = `<div style="position:relative; display:flex; align-items:center; width:30px; height:30px;"><svg class="icon-svg" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-layout-sidebar-left-expand"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M4 6a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2l0 -12" /><path d="M9 4v16" /><path d="M14 10l2 2l-2 2" /></svg></div>`;
const iconMobileOpen = `<div style="position:relative; display:flex; align-items:center; width:30px; height:30px;"><img src="/img/logo-uv.svg" alt="logo-uv" style="width:100%;height:100%;object-fit:contain;"><svg style="position: absolute; right: -17px; z-index:10; border-radius: 50%; backdrop-filter: blur(6px);" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-chevron-left"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M15 6l-6 6l6 6" /></svg></div>`;
function setButtonState(isExpanded) {
  if (!toggleBtn) return;
  toggleBtn.setAttribute("aria-expanded", String(isExpanded));

  if (mobileQuery.matches) {
    // En móvil: mostrar logo con indicador visual sutil
    toggleBtn.innerHTML = isExpanded ? iconMobileOpen : iconMobileClose;
  } else {
    // En desktop: logo por defecto, cambiar a expandir/contraer en hover
    toggleBtn.innerHTML = iconDefault;
    toggleBtn.onmouseenter = () => {
      toggleBtn.innerHTML = isExpanded ? iconClose : iconOpen;
    };
    toggleBtn.onmouseleave = () => {
      toggleBtn.innerHTML = iconDefault;
    };
    toggleBtn.classList.toggle("collapsed", isExpanded);
  }
}

function closeMobileMenu() {
  if (!sidebar || !mobileQuery.matches) return;
  sidebar.classList.remove("open");
  if (overlay) overlay.classList.remove("active");
  setButtonState(false);
}

function handleToggle() {
  if (!sidebar) return;
  if (mobileQuery.matches) {
    const isOpen = sidebar.classList.toggle("open");
    if (overlay) overlay.classList.toggle("active", isOpen);
    setButtonState(isOpen);
    return;
  }
  sidebar.classList.toggle("collapsed");
  if (main) main.classList.toggle("expanded");
  setButtonState(!sidebar.classList.contains("collapsed"));
}

if (toggleBtn) {
  toggleBtn.addEventListener("click", handleToggle);
}

if (overlay) {
  overlay.addEventListener("click", closeMobileMenu);
}

document.querySelectorAll("#sidebar .nav a").forEach((link) => {
  link.addEventListener("click", () => {
    if (mobileQuery.matches) {
      closeMobileMenu();
    }
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMobileMenu();
  }
});

mobileQuery.addEventListener("change", () => {
  if (!sidebar) return;

  if (mobileQuery.matches) {
    sidebar.classList.remove("open");
    if (overlay) overlay.classList.remove("active");
    setButtonState(false);
  } else {
    if (overlay) overlay.classList.remove("active");
    sidebar.classList.remove("open");
    setButtonState(!sidebar.classList.contains("collapsed"));
  }
});

// Initialize state on load
if (sidebar) {
  if (mobileQuery.matches) {
    setButtonState(sidebar.classList.contains("open"));
  } else {
    setButtonState(!sidebar.classList.contains("collapsed"));
  }
}

// Marcar el enlace activo según la URL actual
function setActiveLink() {
  const currentPath = window.location.pathname;
  document.querySelectorAll("#sidebar .nav a").forEach((link) => {
    link.classList.remove("active");
    const href = link.getAttribute("href");

    // Comparar la ruta actual con el href del enlace
    if (href === currentPath || (currentPath === "/" && href === "/")) {
      link.classList.add("active");
    }
  });
}

// Ejecutar al cargar la página
setActiveLink();

// Actualizar si cambia la ruta (útil para navegación sin recargar)
window.addEventListener("hashchange", setActiveLink);
document.addEventListener("DOMContentLoaded", setActiveLink);
