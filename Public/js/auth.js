document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const submitBtn = loginForm.querySelector("button[type='submit']");
            if (submitBtn) submitBtn.disabled = true;

            const formData = new FormData(loginForm);
            const data = {
                correo: formData.get("correo"),
                contraseña: formData.get("contraseña"),
            };

            try {
                const response = await fetch("/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                });
                const responseData = await response.json();

                if (responseData.success) {
                    showToast(responseData.message || "Inicio de sesión exitoso", "success");
                    setTimeout(() => {
                        window.location.href = "/";
                    }, 500);
                } else {
                    showToast(responseData.message || "Error al iniciar sesión", "error");
                }
            } catch (err) {
                console.error("Error en login:", err);
                showToast("Error al conectar con el servidor", "error");
            } finally {
                if (submitBtn) submitBtn.disabled = false;
            }
        });
    }

    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const submitBtn = registerForm.querySelector("button[type='submit']");
            if (submitBtn) submitBtn.disabled = true;

            const formData = new FormData(registerForm);
            const data = {
                nombres: formData.get("nombres"),
                apellidoPaterno: formData.get("apellidoPaterno"),
                apellidoMaterno: formData.get("apellidoMaterno"),
                correo: formData.get("correo"),
                contraseña: formData.get("contraseña"),
            };

            try {
                const response = await fetch("/api/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                });
                const responseData = await response.json();

                if (responseData.success) {
                    showToast(responseData.message || "Usuario registrado correctamente", "success");
                    setTimeout(() => {
                        window.location.href = "/login";
                    }, 1200);
                } else {
                    showToast(responseData.message || "Error en el registro", "error");
                }
            } catch (err) {
                console.error("Error en registro:", err);
                showToast("Error de conexión con el servidor", "error");
            } finally {
                if (submitBtn) submitBtn.disabled = false;
            }
        });
    }

    const updatePasswordForm = document.getElementById("updatePasswordForm");
    if (updatePasswordForm) {
        updatePasswordForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const submitBtn = updatePasswordForm.querySelector("button[type='submit']");
            if (submitBtn) submitBtn.disabled = true;

            const formData = new FormData(updatePasswordForm);
            const currentPassword = formData.get("currentPassword");
            const newPassword = formData.get("newPassword");
            const newPasswordConfirm = formData.get("newPasswordConfirm");

            if (newPassword !== newPasswordConfirm) {
                showToast("Las nuevas contraseñas no coinciden", "error");
                if (submitBtn) submitBtn.disabled = false;
                return;
            }

            try {
                const response = await fetch("/api/auth/update-password", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ currentPassword, newPassword, newPasswordConfirm }),
                });
                const responseData = await response.json();

                if (responseData.success) {
                    showToast(responseData.message || "Contraseña actualizada correctamente", "success");
                    setTimeout(() => {
                        window.location.href = "/profile";
                    }, 1200);
                } else {
                    showToast(responseData.message || "No se pudo actualizar la contraseña", "error");
                }
            } catch (err) {
                console.error("Error en update-password:", err);
                showToast("Error de comunicación con el servidor", "error");
            } finally {
                if (submitBtn) submitBtn.disabled = false;
            }
        });
    }

    const forgotPasswordForm = document.getElementById("forgotPasswordForm");
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const submitBtn = forgotPasswordForm.querySelector("button[type='submit']");
            if (submitBtn) submitBtn.disabled = true;

            const formData = new FormData(forgotPasswordForm);
            const email = formData.get("correo");

            try {
                const response = await fetch("/api/auth/forgot-password", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email }),
                });
                const responseData = await response.json();

                if (responseData.success) {
                    showToast(responseData.message || "Enlace enviado", "success");

                    const resultBox = document.getElementById("recoveryResultBox");
                    const resultMsg = document.getElementById("recoveryResultMessage");
                    const actionLink = document.getElementById("recoveryActionLink");

                    if (resultBox && resultMsg) {
                        resultBox.style.display = "block";
                        resultMsg.innerText = responseData.message;

                        if (responseData.token && actionLink) {
                            actionLink.href = `/reset-password?token=${responseData.token}`;
                            actionLink.style.display = "inline-block";
                        }
                    }
                } else {
                    showToast(responseData.message || "Error al procesar la solicitud", "error");
                }
            } catch (err) {
                console.error("Error en forgot-password:", err);
                showToast("Error al conectar con el servidor", "error");
            } finally {
                if (submitBtn) submitBtn.disabled = false;
            }
        });
    }

    const resetPasswordForm = document.getElementById("resetPasswordForm");
    if (resetPasswordForm) {
        // Extraer token de la URL si el campo oculto estuviera vacío
        const tokenInput = document.getElementById("resetToken");
        if (tokenInput && !tokenInput.value) {
            const urlParams = new URLSearchParams(window.location.search);
            const queryToken = urlParams.get("token");
            if (queryToken) {
                tokenInput.value = queryToken;
            }
        }

        resetPasswordForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const submitBtn = resetPasswordForm.querySelector("button[type='submit']");
            if (submitBtn) submitBtn.disabled = true;

            const formData = new FormData(resetPasswordForm);
            const token = formData.get("token");
            const password = formData.get("password");
            const verifyPassword = formData.get("verifyPassword");

            if (!token) {
                showToast("Token de recuperación no proporcionado o inválido", "error");
                if (submitBtn) submitBtn.disabled = false;
                return;
            }

            if (password !== verifyPassword) {
                showToast("Las contraseñas no coinciden", "error");
                if (submitBtn) submitBtn.disabled = false;
                return;
            }

            try {
                const response = await fetch("/api/auth/reset-password", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token, password, verifyPassword }),
                });
                const responseData = await response.json();

                if (responseData.success) {
                    showToast(responseData.message || "Contraseña restablecida correctamente", "success");
                    setTimeout(() => {
                        window.location.href = "/login";
                    }, 1200);
                } else {
                    showToast(responseData.message || "Error al restablecer la contraseña", "error");
                }
            } catch (err) {
                console.error("Error en reset-password:", err);
                showToast("Error de comunicación con el servidor", "error");
            } finally {
                if (submitBtn) submitBtn.disabled = false;
            }
        });
    }
});

// -------------------------------------------------------------
// Funciones globales para alternar visibilidad de contraseñas
// -------------------------------------------------------------
function togglePasswordVisibility(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;

    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';

    if (btn) {
        btn.innerHTML = isPassword
            ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="icon icon-tabler icons-tabler-outline icon-tabler-eye-off" viewBox="0 0 24 24"><path fill="none" stroke="none" d="M0 0h24v24H0z"/><path d="M10.585 10.587a2 2 0 0 0 2.829 2.828"/><path d="M16.681 16.673A8.7 8.7 0 0 1 12 18q-5.4 0-9-6 1.908-3.18 4.32-4.674m2.86-1.146A9 9 0 0 1 12 6q5.4 0 9 6-1 1.665-2.138 2.87M3 3l18 18"/></svg>'
            : '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="icon icon-tabler icons-tabler-outline icon-tabler-eye" viewBox="0 0 24 24"><path fill="none" stroke="none" d="M0 0h24v24H0z"/><path d="M10 12a2 2 0 1 0 4 0 2 2 0 0 0-4 0"/><path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6"/></svg>';
    }
}

// Compatibilidad heredada
function toggleAllPasswords() {
    togglePasswordVisibility('password', document.getElementById('toggleAll'));
}