document.addEventListener("DOMContentLoaded", async () => {
    const metricsContainer = document.getElementById("metrics-container");
    const chartTitle = document.getElementById("chart-title");
    const tableTitle = document.getElementById("table-title");
    const tableHeaders = document.getElementById("table-headers");
    const tableBody = document.getElementById("recent-table-body");

    const rol = window.currentUserRol;

    try {
        const response = await fetch("/api/dashboard/stats").then(res => res.json());
        if (!response.success) {
            metricsContainer.innerHTML = `<div class="greeting" style="color: red;">Error: ${response.message}</div>`;
            return;
        }

        const stats = response.stats;

        // Validar si el auditor no tiene departamento asignado
        if (stats.noDepartment) {
            metricsContainer.innerHTML = `
                <div class="greeting">
                    <div class="metric-icon" style="background-color: var(--primary-color-accent); border: none; padding: 12px; display: flex; align-items: center; justify-content: center; border-radius: 12px;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-building-skyscraper"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M3 21l18 0" /><path d="M5 21v-14l8 -4v18" /><path d="M19 21v-10l-6 -4" /><path d="M9 9l0 .01" /><path d="M9 12l0 .01" /><path d="M9 15l0 .01" /><path d="M9 18l0 .01" /></svg>
                    </div>
                    <div class="metric-info" style="display: flex; flex-direction: column; align-items: flex-start;">
                        <div class="metric-label" style="color: var(--primary-color); font-weight: bold; font-size: 1.1rem; text-align: left;">Sin Departamento Asignado</div>
                        <div class="metric-value" style="font-size: 1rem; color: var(--text-dark); font-family: var(--font); font-weight: normal; margin-top: 5px; letter-spacing: 0; text-align: left; line-height: 1.4;">
                            ${stats.message}
                        </div>
                    </div>
                </div>
            `;
            const middleSection = document.querySelector(".dashboard-middle");
            if (middleSection) {
                middleSection.style.display = "none";
            }
            return;
        }

        // 1. Renderizar Tarjetas según el rol
        metricsContainer.innerHTML = "";
        let cardData = [];
        if (rol === 1) {
            cardData = [
                { label: "Departamentos", value: stats.cards.totalDepts, icon: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-building-skyscraper"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M3 21l18 0" /><path d="M5 21v-14l8 -4v18" /><path d="M19 21v-10l-6 -4" /><path d="M9 9l0 .01" /><path d="M9 12l0 .01" /><path d="M9 15l0 .01" /><path d="M9 18l0 .01" /></svg>` },
                { label: "Usuarios Activos", value: stats.cards.totalUsers, icon: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-user-share"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" /><path d="M6 21v-2a4 4 0 0 1 4 -4h3" /><path d="M16 22l5 -5" /><path d="M21 21.5v-4.5h-4.5" /></svg>` },
                { label: "Expedientes Totales", value: stats.cards.totalDocs, icon: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-file-invoice"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2" /><path d="M9 7l1 0" /><path d="M9 13l6 0" /><path d="M13 17l2 0" /></svg>` }
            ];
        } else if (rol === 2) {
            cardData = [
                { label: "Colaboradores", value: stats.cards.totalUsers, icon: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-users"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M5 7a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" /><path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /><path d="M21 21v-2a4 4 0 0 0 -3 -3.85" /></svg>` },
                { label: "Expedientes del Depto.", value: stats.cards.totalDocs, icon: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-file-description"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2" /><path d="M9 17h6" /><path d="M9 13h6" /></svg>` },
                { label: "Subidas del Mes", value: stats.cards.docsThisMonth, icon: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-calendar-check"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M11.5 21h-5.5a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v6" /><path d="M16 3v4" /><path d="M8 3v4" /><path d="M4 11h16" /><path d="M15 19l2 2l4 -4" /></svg>` }
            ];
        } else if (rol === 3) {
            cardData = [
                { label: "Mis Expedientes", value: stats.cards.myDocs, icon: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-user-share"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" /><path d="M6 21v-2a4 4 0 0 1 4 -4h3" /><path d="M16 22l5 -5" /><path d="M21 21.5v-4.5h-4.5" /></svg>` },
                { label: "Total Departamento", value: stats.cards.totalDeptDocs, icon: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-folder-open"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M5 19l2.757 -7.351a1 1 0 0 1 .936 -.649h12.307a1 1 0 0 1 .986 1.164l-.996 5.211a2 2 0 0 1 -1.964 1.625h-14.026a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2h4l3 3h7a2 2 0 0 1 2 2v2" /></svg>` },
                { label: "Agregados esta Semana", value: stats.cards.docsThisWeek, icon: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-calendar-week"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12" /><path d="M16 3v4" /><path d="M8 3v4" /><path d="M4 11h16" /><path d="M7 14h.013" /><path d="M10.01 14h.005" /><path d="M13.01 14h.005" /><path d="M16.015 14h.005" /><path d="M13.015 17h.005" /><path d="M7.01 17h.005" /><path d="M10.01 17h.005" /></svg>` }
            ];
        } else if (rol === 4) {
            cardData = [
                { label: "Expedientes a Auditar", value: stats.cards.totalDocs, icon: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-clipboard-check"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2" /><path d="M9 5a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2" /><path d="M9 14l2 2l4 -4" /></svg>` },
                { label: "Modificados Reciente", value: stats.cards.docsModifiedRecently, icon: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-clock"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" /><path d="M12 7v5l3 3" /></svg>` },
                { label: "Colaboradores Activos", value: stats.cards.totalUsers, icon: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-user-share"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" /><path d="M6 21v-2a4 4 0 0 1 4 -4h3" /><path d="M16 22l5 -5" /><path d="M21 21.5v-4.5h-4.5" /></svg>` }
            ];
        }

        cardData.forEach(card => {
            const cardHtml = `
                <div class="greeting">
                    <div class="metric-icon">
                        ${card.icon}
                    </div>
                    <div class="metric-info">
                        <div class="metric-label">${card.label}</div>
                        <div class="metric-value">${card.value}</div>
                    </div>
                </div>
            `;
            metricsContainer.insertAdjacentHTML("beforeend", cardHtml);
        });

        // 2. Renderizar Historial Reciente (Tabla)
        tableBody.innerHTML = "";
        if (rol === 1) {
            tableTitle.textContent = "Últimos Departamentos Creados";
            tableHeaders.innerHTML = `
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Fecha de Creación</th>
            `;
            if (stats.recentData.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="3" style="text-align: center; padding: 20px;">No hay departamentos registrados.</td></tr>`;
            } else {
                stats.recentData.forEach(dept => {
                    const row = `
                        <tr>
                            <td><strong>${dept.nombre}</strong></td>
                            <td>${dept.descripcion}</td>
                            <td>${new Date(dept.fecha_creacion).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                        </tr>
                    `;
                    tableBody.insertAdjacentHTML("beforeend", row);
                });
            }
        } else {
            tableTitle.textContent = rol === 3 ? "Mis Últimos Expedientes" : (rol === 2 ? "Últimos Expedientes del Depto." : "Últimos Movimientos del Depto.");
            tableHeaders.innerHTML = `
                <th>Nombre</th>
                <th>Subido Por</th>
                <th>Fecha</th>
            `;
            if (stats.recentData.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="3" style="text-align: center; padding: 20px;">No hay expedientes cargados.</td></tr>`;
            } else {
                stats.recentData.forEach(doc => {
                    const row = `
                        <tr>
                            <td><strong>${doc.nombre}</strong></td>
                            <td>${doc.subido_por}</td>
                            <td>${new Date(doc.fecha_creacion).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                        </tr>
                    `;
                    tableBody.insertAdjacentHTML("beforeend", row);
                });
            }
        }

        // 3. Renderizar Gráfico
        const chartElement = document.getElementById("dashboardChart");
        if (!chartElement) return;

        const ctx = chartElement.getContext("2d");
        let chartConfig = {};

        if (rol === 1) {
            chartTitle.textContent = "Distribución de Expedientes por Departamento";
            const labels = stats.chartData.map(d => d.departamento);
            const data = stats.chartData.map(d => d.total);
            chartConfig = {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        data: data,
                        backgroundColor: ['#023059', '#033E8C', '#0433BF', '#0455BF', '#8FBDD9', '#8FBDD9', '#D5E6F3'],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom' }
                    }
                }
            };
        } else if (rol === 2) {
            chartTitle.textContent = "Historial Carga de Archivos (Últimos 6 Meses)";
            const labels = stats.chartData.map(d => d.mes);
            const data = stats.chartData.map(d => d.total);
            chartConfig = {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Archivos Cargados',
                        data: data,
                        borderColor: '#0455BF',
                        backgroundColor: 'rgba(106, 29, 51, 0.1)',
                        fill: true,
                        tension: 0.3
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: { beginAtZero: true, ticks: { stepSize: 1 } }
                    }
                }
            };
        } else if (rol === 3) {
            chartTitle.textContent = "Distribución por Tipo de Archivo";
            const labels = stats.chartData.map(d => d.ext.toUpperCase());
            const data = stats.chartData.map(d => d.total);
            chartConfig = {
                type: 'pie',
                data: {
                    labels: labels,
                    datasets: [{
                        data: data,
                        backgroundColor: ['#033E8C', '#0433BF', '#0455BF', '#8FBDD9', '#8FBDD9', '#D5E6F3'],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom' }
                    }
                }
            };
        } else if (rol === 4) {
            chartTitle.textContent = "Cargas por Colaborador";
            const labels = stats.chartData.map(d => d.usuario);
            const data = stats.chartData.map(d => d.total);
            chartConfig = {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Cargas Realizadas',
                        data: data,
                        backgroundColor: '#0455BF',
                        borderRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: { beginAtZero: true, ticks: { stepSize: 1 } }
                    }
                }
            };
        }

        new Chart(ctx, chartConfig);

    } catch (error) {
        console.error("Error al cargar estadísticas:", error);
        metricsContainer.innerHTML = `<div class="greeting" style="color: red; justify-content: center; width: 100%;">Error de conexión con el servidor.</div>`;
    }
});
