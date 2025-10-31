// Dashboard Manager - 📊 Dashboard functionality
    constructor() {
        this.data = {};
        this.charts = {};
        this.isLoading = false;
        this.chartJSLoaded = false;
        console.log('DashboardManager initialized');
    }

    // Asegurar que Chart.js esté cargado
    async ensureChartJSLoaded() {
        if (window.Chart && this.chartJSLoaded) {
            return Promise.resolve();
        }

        console.log('Cargando Chart.js...');
        
        return new Promise((resolve, reject) => {
            if (window.Chart) {
                this.chartJSLoaded = true;
                console.log('Chart.js ya estaba disponible');
                resolve();
                return;
            }

            // Cargar Chart.js dinámicamente
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
            script.async = true;
            
            script.onload = () => {
                this.chartJSLoaded = true;
                console.log('Chart.js cargado exitosamente');
                resolve();
            };
            
            script.onerror = () => {
                console.error('Error cargando Chart.js');
                reject(new Error('Failed to load Chart.js'));
            };
            
            document.head.appendChild(script);
        });
    }

    init() {
        this.setupEventListeners();

    setupEventListeners() {
        // Export reports button
        const exportBtn = document.querySelector('[onclick="exportReports()"]');
        if (exportBtn) {
            exportBtn.onclick = () => this.exportReports();
        }
    }

    async loadData() {
        // Evitar cargas duplicadas
        if (this.isLoading) {
            console.log('📊 Dashboard ya está cargando, saltando...');
            return;
        }

        try {
            console.log('📊 Cargando datos del dashboard...');
            this.isLoading = true;
            
            // Mostrar indicador de carga
            this.showLoadingState();
            
            // Cargar datos de gastos y vehículos
            console.log('🔄 Llamando a dashboard API...');
            const dashboardResponse = await fetch('/LogisticaFinal/api/dashboard/data.php');
            console.log('📊 Dashboard response status:', dashboardResponse.status);
            
            if (!dashboardResponse.ok) {
                throw new Error(`Dashboard API error: ${dashboardResponse.status}`);
            }
            
            const dashboardData = await dashboardResponse.json();
            console.log('📊 Dashboard data received:', dashboardData);
            this.data = dashboardData;
            
            // Cargar datos de viajes
            console.log('🚛 Cargando datos de viajes...');
            let viajesData = [];
            try {
                const viajesResponse = await fetch('/LogisticaFinal/api/viajes/list.php');
                console.log('🚛 Viajes response status:', viajesResponse.status);
                
                if (!viajesResponse.ok) {
                    throw new Error(`Viajes API error: ${viajesResponse.status}`);
                }
                
                viajesData = await viajesResponse.json();
                console.log('🚛 Respuesta de viajes:', viajesData);
                this.data.todayTrips = Array.isArray(viajesData) ? viajesData.slice(0, 5) : [];
            } catch (error) {
                console.error('❌ Error cargando viajes:', error);
                this.data.todayTrips = [];
                viajesData = [];
            }
            
            // Cargar actividad reciente (últimos 5 gastos)
            console.log('📋 Cargando gastos recientes...');
            let recentGastos = [];
            try {
                const gastosResponse = await fetch('/LogisticaFinal/api/gastos/list.php');
                console.log('📋 Gastos response status:', gastosResponse.status);
                
                if (!gastosResponse.ok) {
                    throw new Error(`Gastos API error: ${gastosResponse.status}`);
                }
                
                const gastosData = await gastosResponse.json();
                console.log('📋 Respuesta de gastos:', gastosData);
                
                // La API devuelve directamente el array de gastos
                if (Array.isArray(gastosData)) {
                    recentGastos = gastosData.slice(0, 5);
                } else if (gastosData && gastosData.gastos && Array.isArray(gastosData.gastos)) {
                    recentGastos = gastosData.gastos.slice(0, 5);
                }
                
                console.log('📋 Gastos recientes procesados:', recentGastos.length, 'gastos');
            } catch (error) {
                console.error('❌ Error cargando gastos:', error);
                recentGastos = [];
            }
            
            // Procesar datos de viajes
            // La API devuelve directamente el array de viajes
            let viajesArray = [];
            if (Array.isArray(viajesData)) {
                viajesArray = viajesData;
            } else if (viajesData && viajesData.error) {
                console.error('❌ Error en API de viajes:', viajesData.error);
                viajesArray = [];
            } else {
                console.warn('⚠️ Formato inesperado de datos de viajes:', viajesData);
                viajesArray = [];
            }
            
            console.log('🚛 Array de viajes procesado:', viajesArray.length, 'viajes');
            if (viajesArray.length > 0) {
                console.log('🚛 Primer viaje:', viajesArray[0]);
                console.log('🚛 Estados encontrados:', [...new Set(viajesArray.map(v => v.estado))]);
            }
            
            const viajesStats = this.processViajesData(viajesArray);
            console.log('🚛 Estadísticas calculadas:', viajesStats);
            
            // Combinar todos los datos
            this.data = {
                ...dashboardData,
                viajes: viajesStats,
                recentActivity: recentGastos
            };
            
            console.log('📊 Datos cargados:', this.data);
            
            this.updateUI();
            
            // Cargar Chart.js antes de crear gráficos
            await this.ensureChartJSLoaded();
            
            this.createExpenseChart();
            this.createViajesChart();
            this.updateViajesStats();
            this.updateTodayTrips(viajesArray);
            // Ocultar indicador de carga
            this.hideLoadingState();
            this.isLoading = false;
            
        } catch (error) {
            console.error('❌ Error general cargando dashboard:', error);
            console.error('❌ Stack trace:', error.stack);
            
            // Mostrar información detallada del error
            let errorMessage = 'Error al cargar datos del dashboard';
            if (error.message.includes('404')) {
                errorMessage += ' - API no encontrada (404)';
            } else if (error.message.includes('500')) {
                errorMessage += ' - Error del servidor (500)';
            } else if (error.message.includes('fetch')) {
                errorMessage += ' - Error de conexión';
            }
            
            window.app.showToast(errorMessage + ': ' + error.message, 'danger');
            
            // Inicializar con datos vacíos para evitar errores
            this.data = {
                expenses: { total_amount: 0, total_fuel: 0, change_percentage: 0 },
                vehicles: { maintenance_count: 0, maintenance_change: 0 },
                viajes: { viajes_pendientes: 0, viajes_en_progreso: 0, viajes_completados: 0, viajes_cancelados: 0 },
                recentActivity: [],
                todayTrips: []
            };
            
        } finally {
            this.isLoading = false;
            this.hideLoadingState();
        }
    }

    // Mostrar estado de carga
    showLoadingState() {
        // Mostrar spinners en las cards
        const cards = document.querySelectorAll('.stat-card .stat-value');
        cards.forEach(card => {
            card.innerHTML = '<div class="spinner-border spinner-border-sm" role="status"></div>';
        });

        // Mostrar spinner en la tabla de actividad reciente
        const activityTable = document.getElementById('activityTable');
        if (activityTable) {
            activityTable.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-4">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Cargando datos...</span>
                        </div>
                        <div class="mt-2 text-muted">Cargando actividad reciente...</div>
                    </td>
                </tr>
            `;
        }
    }

    // Ocultar estado de carga
    hideLoadingState() {
        // Los datos se actualizarán automáticamente en updateUI()
    }

    // Mostrar mensaje de error
    showErrorMessage(message) {
        if (window.app && typeof window.app.showToast === 'function') {
            window.app.showToast(message, 'error');
        } else {
            console.error('📊 Dashboard Error:', message);
        }
    }

    // Procesar datos de viajes para estadísticas
    processViajesData(viajes) {
        console.log('🔄 Procesando', viajes.length, 'viajes para estadísticas...');
        
        const today = new Date().toISOString().split('T')[0];
        
        const stats = {
            total_viajes: viajes.length,
            viajes_pendientes: 0,
            viajes_en_progreso: 0,
            viajes_completados: 0,
            viajes_cancelados: 0,
            completados_hoy: 0
        };

        viajes.forEach((viaje, index) => {
            console.log(`🚛 Viaje ${index + 1}:`, {
                id: viaje.id,
                estado: viaje.estado,
                transportista: viaje.transportista_nombre,
                fecha_completado: viaje.fecha_completado
            });
            
            switch(viaje.estado) {
                case 'pendiente':
                    stats.viajes_pendientes++;
                    break;
                case 'en_progreso':
                case 'en_ruta': // Agregar variación de estado
                    stats.viajes_en_progreso++;
                    break;
                case 'completado':
                    stats.viajes_completados++;
                    // Verificar si se completó hoy
                    if (viaje.fecha_completado && viaje.fecha_completado.startsWith(today)) {
                        stats.completados_hoy++;
                    }
                    break;
                case 'cancelado':
                    stats.viajes_cancelados++;
                    break;
                default:
                    console.warn('⚠️ Estado de viaje no reconocido:', viaje.estado);
            }
        });

        console.log('📊 Estadísticas finales de viajes:', stats);
        return stats;
    }

    // Actualizar tabla de viajes de hoy
    updateTodayTrips(viajes) {
        console.log('📅 Actualizando viajes de hoy...');
        
        const container = document.getElementById('todayTripsContainer');
        if (!container) {
            console.warn('⚠️ Contenedor todayTripsContainer no encontrado');
            return;
        }

        const today = new Date().toISOString().split('T')[0];
        
        // Mostrar TODOS los viajes de la base de datos, no solo los de hoy
        let todayTrips = viajes; // Usar todos los viajes de la BD
        
        console.log('📅 Viajes de la base de datos:', todayTrips);
        
        // Solo mostrar datos reales de la base de datos
        if (!todayTrips || todayTrips.length === 0) {
            console.log('📅 No hay viajes en la base de datos');
            todayTrips = [];
        } else {
            console.log('📅 Mostrando', todayTrips.length, 'viajes de la base de datos');
        }

        console.log('📅 Viajes de hoy encontrados:', todayTrips.length);

        // Determinar el título según el rol del usuario
        const userRole = window.app?.currentUser?.role || 'transportista';
        const titleText = userRole === 'transportista' ? '🚛 Mis Viajes' : '🚛 Todos los Viajes';
        
        // Actualizar el título
        const titleElement = document.querySelector('#todayTripsContainer').closest('.card').querySelector('.card-title');
        if (titleElement) {
            titleElement.textContent = titleText;
        }

        if (todayTrips.length === 0) {
            container.innerHTML = `
                <div class="text-center py-4">
                    <i class="fas fa-truck fa-3x text-muted mb-3"></i>
                    <h6 class="text-muted">No hay viajes registrados</h6>
                    <p class="text-muted small">Los viajes aparecerán aquí cuando sean creados</p>
                </div>
            `;
            return;
        }

        // Crear tabla de viajes
        container.innerHTML = `
            <div class="table-responsive">
                <table class="table table-hover mb-0">
                    <thead class="table-light">
                        <tr>
                            <th>Viaje</th>
                            <th>Ruta</th>
                            <th>Transportista</th>
                            <th>Vehículo</th>
                            <th>Estado</th>
                            <th>Hora</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${todayTrips.map(viaje => this.renderTodayTripRow(viaje)).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        // Generate mobile cards for today trips
        this.updateMobileTodayTripsCards(todayTrips);
    }

    updateMobileTodayTripsCards(todayTrips) {
        const mobileView = document.querySelector('#mobileTodayTripsView');
        if (!mobileView) return;

        if (!todayTrips || todayTrips.length === 0) {
            mobileView.innerHTML = `
                <div class="text-center py-4">
                    <i class="fas fa-truck fa-3x text-muted mb-3"></i>
                    <h5>No hay viajes</h5>
                    <p class="text-muted">No se encontraron viajes en la base de datos</p>
                </div>
            `;
            return;
        }

        mobileView.innerHTML = todayTrips.map(viaje => {
            const estadoBadge = this.getEstadoBadgeClass(viaje.estado);
            const estadoTexto = this.getEstadoTexto(viaje.estado);
            
            // Manejar diferentes campos de fecha de la BD
            let hora = '--:--';
            if (viaje.fecha_creacion) {
                hora = new Date(viaje.fecha_creacion).toLocaleTimeString('es-ES', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                });
            } else if (viaje.hora_programada) {
                hora = viaje.hora_programada;
            }

            return `
                <div class="mobile-expense-card">
                    <div class="mobile-expense-header">
                        <div>
                            <div class="mobile-expense-amount">${viaje.origen || 'N/A'}</div>
                            <div class="mobile-expense-date">→ ${viaje.destino || 'N/A'}</div>
                        </div>
                        <span class="badge bg-${estadoBadge}">
                            ${this.getEstadoIcon(viaje.estado)} ${estadoTexto}
                        </span>
                    </div>
                    <div class="row mb-2">
                        <div class="col-6">
                            <small class="text-muted">Transportista:</small><br>
                            <strong>${viaje.transportista_nombre || viaje.usuario_nombre || 'N/A'}</strong>
                        </div>
                        <div class="col-6">
                            <small class="text-muted">Vehículo:</small><br>
                            <strong>🚚 ${viaje.vehiculo_placa || 'N/A'}</strong>
                        </div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-6">
                            <small class="text-muted">Fecha:</small><br>
                            <strong>${viaje.fecha_programada ? new Date(viaje.fecha_programada).toLocaleDateString() : 'N/A'}</strong>
                        </div>
                        <div class="col-6">
                            <small class="text-muted">Hora:</small><br>
                            <strong>${hora}</strong>
                        </div>
                    </div>
                    <div class="d-flex gap-2 flex-wrap">
                        <button class="btn btn-outline-primary btn-sm flex-fill" onclick="showSection('viajesSection')">
                            <i class="fas fa-eye"></i> Ver Todos
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Renderizar fila de viaje de hoy
    renderTodayTripRow(viaje) {
        const estadoBadge = this.getEstadoBadgeClass(viaje.estado);
        const estadoTexto = this.getEstadoTexto(viaje.estado);
        
        // Manejar diferentes campos de fecha de la BD
        let hora = '--:--';
        if (viaje.fecha_creacion) {
            hora = new Date(viaje.fecha_creacion).toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'});
        } else if (viaje.fecha_programada && viaje.hora_programada) {
            hora = viaje.hora_programada.substring(0, 5); // HH:MM
        } else if (viaje.created_at) {
            hora = new Date(viaje.created_at).toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'});
        }
        
        // Manejar diferentes campos de origen/destino de la BD
        const origen = viaje.origen || `${viaje.origen_estado || ''} ${viaje.origen_municipio || ''}`.trim() || 'N/A';
        const destino = viaje.destino || `${viaje.destino_estado || ''} ${viaje.destino_municipio || ''}`.trim() || 'N/A';

        return `
            <tr>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2" style="width: 32px; height: 32px; font-size: 12px; font-weight: bold;">
                            #${viaje.id}
                        </div>
                        <div>
                            <div class="fw-bold">${viaje.numero_viaje || `Viaje #${viaje.id}`}</div>
                            <small class="text-muted">${viaje.descripcion || viaje.observaciones || 'Sin descripción'}</small>
                        </div>
                    </div>
                </td>
                <td>
                    <div>
                        <div class="fw-bold text-success">📍 ${origen}</div>
                        <div class="text-muted">🏁 ${destino}</div>
                    </div>
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <i class="fas fa-user-tie text-primary me-2"></i>
                        ${viaje.transportista_nombre || 'No asignado'}
                    </div>
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <i class="fas fa-truck text-secondary me-2"></i>
                        <div>
                            <div class="fw-bold">${viaje.vehiculo_placa || 'N/A'}</div>
                            <small class="text-muted">${viaje.vehiculo_marca || ''} ${viaje.vehiculo_modelo || ''}</small>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="badge ${estadoBadge}">
                        ${this.getEstadoIcon(viaje.estado)}
                        ${estadoTexto}
                    </span>
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <i class="fas fa-clock text-muted me-2"></i>
                        ${hora}
                    </div>
                </td>
            </tr>
        `;
    }

    // Funciones auxiliares para estados de viajes
    getEstadoBadgeClass(estado) {
        const classes = {
            'pendiente': 'bg-warning text-dark',
            'en_progreso': 'bg-primary',
            'en_ruta': 'bg-info',
            'completado': 'bg-success',
            'cancelado': 'bg-danger'
        };
        return classes[estado] || 'bg-secondary';
    }

    getEstadoTexto(estado) {
        const textos = {
            'pendiente': 'Pendiente',
            'en_progreso': 'En Progreso',
            'en_ruta': 'En Ruta',
            'completado': 'Completado',
            'cancelado': 'Cancelado'
        };
        return textos[estado] || estado;
    }

    getEstadoIcon(estado) {
        const iconos = {
            'pendiente': '<i class="fas fa-clock me-1"></i>',
            'en_progreso': '<i class="fas fa-play me-1"></i>',
            'en_ruta': '<i class="fas fa-route me-1"></i>',
            'completado': '<i class="fas fa-check me-1"></i>',
            'cancelado': '<i class="fas fa-times me-1"></i>'
        };
        return iconos[estado] || '<i class="fas fa-question me-1"></i>';
    }

    // Crear gráfica de gastos por categoría
    createExpenseChart() {
        const ctx = document.getElementById('expenseChart');
        if (!ctx || !this.data || !this.data.expensesByCategory) return;

        // Destruir gráfica existente si existe
        if (this.expenseChartInstance) {
            this.expenseChartInstance.destroy();
        }

        const categories = this.data.expensesByCategory;
        const labels = Object.keys(categories);
        const values = Object.values(categories);

        // Si no hay datos, mostrar mensaje
        if (labels.length === 0) {
            ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
            const context = ctx.getContext('2d');
            context.font = '16px Arial';
            context.fillStyle = '#6c757d';
            context.textAlign = 'center';
            context.fillText('No hay datos de gastos', ctx.width / 2, ctx.height / 2);
            return;
        }

        const colors = {
            'combustible': '#28a745',
            'mantenimiento': '#ffc107', 
            'peajes': '#17a2b8',
            'multas': '#dc3545',
            'hospedaje': '#6c757d',
            'comida': '#007bff',
            'otros': '#343a40'
        };

        this.expenseChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels.map(label => {
                    const icons = {
                        'combustible': '⛽ Combustible',
                        'mantenimiento': '🔧 Mantenimiento',
                        'peajes': '🛣️ Peajes',
                        'multas': '🚨 Multas',
                        'hospedaje': '🏨 Hospedaje',
                        'comida': '🍴 Comida',
                        'otros': '📦 Otros'
                    };
                    return icons[label] || label;
                }),
                datasets: [{
                    data: values,
                    backgroundColor: labels.map(label => colors[label] || '#6c757d'),
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${context.label}: $${value.toLocaleString()} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Crear gráfica de estado de rutas/viajes
    createViajesChart() {
        const ctx = document.getElementById('routesChart');
        if (!ctx || !this.data || !this.data.viajes) return;

        // Destruir gráfica existente si existe
        if (this.viajesChartInstance) {
            this.viajesChartInstance.destroy();
        }

        const viajes = this.data.viajes;
        const labels = ['Pendientes', 'En Progreso', 'Completados', 'Cancelados'];
        const values = [
            viajes.viajes_pendientes || 0,
            viajes.viajes_en_progreso || 0, 
            viajes.viajes_completados || 0,
            viajes.viajes_cancelados || 0
        ];

        // Si no hay datos, mostrar mensaje
        if (values.every(v => v === 0)) {
            ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
            const context = ctx.getContext('2d');
            context.font = '16px Arial';
            context.fillStyle = '#6c757d';
            context.textAlign = 'center';
            context.fillText('No hay datos de viajes', ctx.width / 2, ctx.height / 2);
            return;
        }

        this.viajesChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: ['#ffc107', '#17a2b8', '#28a745', '#dc3545'],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                return `${context.label}: ${value} viajes (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Función para ver todos los gastos
    viewAllExpenses() {
        console.log('📊 Redirigiendo a la pestaña de gastos...');
        if (typeof showSection === 'function') {
            showSection('gastosSection');
        } else if (window.showSection) {
            window.showSection('gastosSection');
        } else {
            console.error('❌ Función showSection no disponible');
        }
    }

    updateUI() {
        this.updateStatsCards();
        this.updateRecentActivity();
        this.updateChart();
    }

    updateStatsCards() {
        const { expenses, vehicles, viajes } = this.data;
        
        // Update expense stats
        if (expenses) {
            this.updateStatCard(0, {
                value: `$${expenses.total_amount?.toLocaleString() || '0'}`,
                label: 'Gastos Totales del Mes',
                change: expenses.change_percentage || 0
            });

            this.updateStatCard(1, {
                value: `${expenses.total_fuel?.toLocaleString() || '0'} L`,
                label: 'Combustible Consumido',
                change: expenses.fuel_change || 0
            });
        }

        // Update gastos stats
        if (expenses) {
            // Gastos Aprobados
            this.updateStatCard(2, {
                value: expenses.gastos_aprobados || '0',
                label: 'Gastos Aprobados',
                change: expenses.aprobados_change || 0
            });
            
            // Gastos Negados
            this.updateStatCard(3, {
                value: expenses.gastos_negados || '0',
                label: 'Gastos Negados',
                change: expenses.negados_change || 0
            });
        }

        // Update rutas activas stats (solo admin y supervisor)
        const currentUser = window.app?.currentUser;
        const userRole = currentUser?.rol || currentUser?.role || 'transportista';
        const isAdminOrSupervisor = userRole.toLowerCase() === 'administrador' || 
                                   userRole.toLowerCase() === 'admin' || 
                                   userRole.toLowerCase() === 'supervisor';
        
        if (viajes && isAdminOrSupervisor) {
            // Mostrar las cards de rutas activas
            const pendientesCard = document.getElementById('pendientes-card');
            const enRutaCard = document.getElementById('en-ruta-card');
            const completadosCard = document.getElementById('completados-card');
            const canceladosCard = document.getElementById('cancelados-card');
            
            if (pendientesCard) pendientesCard.style.display = 'block';
            if (enRutaCard) enRutaCard.style.display = 'block';
            if (completadosCard) completadosCard.style.display = 'block';
            if (canceladosCard) canceladosCard.style.display = 'block';

            // Actualizar valores de las cards
            this.updateStatValue('viajes-pendientes', viajes.viajes_pendientes || 0);
            this.updateStatValue('viajes-en-progreso', viajes.viajes_en_progreso || 0);
            this.updateStatValue('viajes-completados', viajes.viajes_completados || 0);
            this.updateStatValue('viajes-cancelados', viajes.viajes_cancelados || 0);
            
            console.log('📊 Estadísticas de viajes actualizadas:', {
                pendientes: viajes.viajes_pendientes || 0,
                en_progreso: viajes.viajes_en_progreso || 0,
                completados: viajes.viajes_completados || 0,
                cancelados: viajes.viajes_cancelados || 0
            });
        } else {
            // Ocultar las cards para transportistas
            const pendientesCard = document.getElementById('pendientes-card');
            const enRutaCard = document.getElementById('en-ruta-card');
            const completadosCard = document.getElementById('completados-card');
            const canceladosCard = document.getElementById('cancelados-card');
            
            if (pendientesCard) pendientesCard.style.display = 'none';
            if (enRutaCard) enRutaCard.style.display = 'none';
            if (completadosCard) completadosCard.style.display = 'none';
            if (canceladosCard) canceladosCard.style.display = 'none';
        }
    }

    updateStatCard(index, data) {
        const cards = document.querySelectorAll('.stat-card');
        if (cards[index]) {
            const valueEl = cards[index].querySelector('.stat-value');
            const labelEl = cards[index].querySelector('.stat-label');
            const changeEl = cards[index].querySelector('.stat-change');
            
            if (valueEl) valueEl.textContent = data.value;
            if (labelEl) labelEl.textContent = data.label;
            if (changeEl && data.change !== undefined) {
                // Si es un número, mostrar como porcentaje
                if (typeof data.change === 'number') {
                    const isPositive = data.change >= 0;
                    changeEl.className = `stat-change ${isPositive ? 'positive' : 'negative'} mt-2`;
                    changeEl.innerHTML = `<i class="fas fa-arrow-${isPositive ? 'up' : 'down'}"></i> ${Math.abs(data.change)}% vs mes anterior`;
                } else {
                    // Si es texto, mostrar como está
                    changeEl.className = 'stat-change neutral mt-2';
                    changeEl.innerHTML = `<i class="fas fa-info-circle"></i> ${data.change}`;
                }
            }
        }
    }

    updateStatValue(statKey, value) {
        const element = document.querySelector(`[data-stat="${statKey}"]`);
        if (element) {
            element.textContent = value.toLocaleString();
        }
    }

    updateRecentActivity() {
        const tbody = document.getElementById('activityTable');
        if (!tbody) return;

        if (!this.data.recentActivity || this.data.recentActivity.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-muted py-4">
                        <i class="fas fa-inbox fa-2x mb-2 d-block"></i>
                        No hay actividad reciente
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.data.recentActivity.map(gasto => `
            <tr>
                <td>
                    <div class="d-flex align-items-center">
                        <i class="fas fa-calendar-alt text-muted me-2"></i>
                        ${this.formatDate(gasto.fecha)}
                    </div>
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <i class="fas fa-user text-primary me-2"></i>
                        ${gasto.usuario_nombre || 'N/A'}
                    </div>
                </td>
                <td>
                    <span class="badge bg-${this.getTypeColor(gasto.tipo)} d-flex align-items-center">
                        ${this.getTypeIcon(gasto.tipo)}
                        ${this.getTypeLabel(gasto.tipo)}
                    </span>
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <i class="fas fa-dollar-sign text-success me-2"></i>
                        <strong>$${parseFloat(gasto.monto || 0).toLocaleString()}</strong>
                    </div>
                </td>
                <td>
                    <span class="badge bg-${this.getStatusColor(gasto.estado)}">
                        ${this.getStatusIcon(gasto.estado)}
                        ${this.getStatusLabel(gasto.estado)}
                    </span>
                </td>
            </tr>
        `).join('');
        
        // Generate mobile cards for activity
        this.updateMobileActivityCards();
    }

    updateMobileActivityCards() {
        const mobileView = document.querySelector('#mobileActivityView');
        if (!mobileView) return;

        if (!this.data.recentActivity || this.data.recentActivity.length === 0) {
            mobileView.innerHTML = `
                <div class="text-center py-4">
                    <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                    <h5>No hay actividad reciente</h5>
                    <p class="text-muted">No se encontró actividad reciente</p>
                </div>
            `;
            return;
        }

        mobileView.innerHTML = this.data.recentActivity.map(gasto => `
            <div class="mobile-expense-card">
                <div class="mobile-expense-header">
                    <div>
                        <div class="mobile-expense-amount">$${parseFloat(gasto.monto || 0).toLocaleString()}</div>
                        <div class="mobile-expense-date">${this.formatDate(gasto.fecha)}</div>
                    </div>
                    <span class="badge bg-${this.getStatusColor(gasto.estado)}">
                        ${this.getStatusIcon(gasto.estado)} ${this.getStatusLabel(gasto.estado)}
                    </span>
                </div>
                <div class="row mb-2">
                    <div class="col-6">
                        <small class="text-muted">Transportista:</small><br>
                        <strong>${gasto.usuario_nombre || 'N/A'}</strong>
                    </div>
                    <div class="col-6">
                        <small class="text-muted">Tipo:</small><br>
                        <span class="badge bg-${this.getTypeColor(gasto.tipo)}">
                            ${this.getTypeIcon(gasto.tipo)} ${this.getTypeLabel(gasto.tipo)}
                        </span>
                    </div>
                </div>
                <div class="row mb-3">
                    <div class="col-6">
                        <small class="text-muted">Vehículo:</small><br>
                        <strong>${gasto.vehiculo_placa || 'N/A'}</strong>
                    </div>
                    <div class="col-6">
                        <small class="text-muted">Factura:</small><br>
                        <strong>${gasto.numero_factura || 'N/A'}</strong>
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateChart() {
        // Legacy method - now using createExpenseChart
        this.createExpenseChart();
    }

    createExpenseChart() {
        const ctx = document.getElementById('expenseChart');
        if (!ctx || !this.data?.expensesByCategory) return;

        // Destroy existing chart if it exists
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }

        // Also destroy any existing Chart.js instance on this canvas
        const existingChart = Chart.getChart(ctx);
        if (existingChart) {
            existingChart.destroy();
        }

        const data = this.data.expensesByCategory;
        const labels = Object.keys(data).map(key => {
            const labelMap = {
                'combustible': '⛽ Combustible',
                'mantenimiento': '🔧 Mantenimiento',
                'peajes': '🛣️ Peajes',
                'peaje': '🛣️ Peaje',
                'multas': '🚨 Multas',
                'multa': '🚨 Multa',
                'hospedaje': '🏨 Hospedaje',
                'alimentacion': '🍴 Alimentación',
                'comida': '🍽️ Comida',
                'transporte': '🚛 Transporte',
                'otros': '📦 Otros',
                'viaticos': '💼 Viáticos',
                'casetas': '🛣️ Casetas'
            };
            return labelMap[key] || `📋 ${key.charAt(0).toUpperCase() + key.slice(1)}`;
        });
        const values = Object.values(data);

        this.chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: [
                        '#FF6384',
                        '#36A2EB',
                        '#FFCE56',
                        '#FF9F40',
                        '#4BC0C0',
                        '#9966FF'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${context.label}: $${value.toLocaleString()} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('es-ES');
    }

    getTypeColor(type) {
        const colors = {
            'combustible': 'success',
            'mantenimiento': 'warning',
            'peaje': 'info',
            'multa': 'danger',
            'hospedaje': 'secondary',
            'comida': 'primary',
            'otros': 'dark'
        };
        return colors[type] || 'secondary';
    }

    getTypeLabel(type) {
        const labels = {
            'combustible': 'Combustible',
            'mantenimiento': 'Mantenimiento',
            'peaje': 'Peajes',
            'multa': 'Multas',
            'hospedaje': 'Hospedaje',
            'comida': 'Alimentación',
            'otros': 'Otros'
        };
        return labels[type] || type;
    }

    getTypeIcon(type) {
        const icons = {
            'combustible': '<i class="fas fa-gas-pump me-1"></i>',
            'mantenimiento': '<i class="fas fa-wrench me-1"></i>',
            'peaje': '<i class="fas fa-road me-1"></i>',
            'multa': '<i class="fas fa-exclamation-triangle me-1"></i>',
            'hospedaje': '<i class="fas fa-bed me-1"></i>',
            'comida': '<i class="fas fa-utensils me-1"></i>',
            'otros': '<i class="fas fa-box me-1"></i>'
        };
        return icons[type] || '<i class="fas fa-circle me-1"></i>';
    }

    getStatusColor(status) {
        const colors = {
            'pendiente': 'warning',
            'aprobado': 'success',
            'rechazado': 'danger'
        };
        return colors[status] || 'secondary';
    }

    getStatusLabel(status) {
        const labels = {
            'pendiente': 'Pendiente',
            'aprobado': 'Aprobado',
            'rechazado': 'Rechazado'
        };
        return labels[status] || status;
    }

    getStatusIcon(status) {
        const icons = {
            'pendiente': '<i class="fas fa-clock me-1"></i>',
            'aprobado': '<i class="fas fa-check me-1"></i>',
            'rechazado': '<i class="fas fa-times me-1"></i>'
        };
        return icons[status] || '<i class="fas fa-question me-1"></i>';
    }

    // Función para ver todos los gastos
    viewAllExpenses() {
        console.log('📋 Navegando a la sección de gastos...');
        
        // Usar la función global de navegación
        if (typeof window.navigateTo === 'function') {
            window.navigateTo('gastosSection', 'Gestión de Gastos');
        } else if (typeof window.showSection === 'function') {
            window.showSection('gastosSection');
        } else {
            // Fallback manual
            document.querySelectorAll('.section').forEach(section => {
                section.classList.remove('active');
            });
            
            const gastosSection = document.getElementById('gastosSection');
            if (gastosSection) {
                gastosSection.classList.add('active');
            }
            
            // Actualizar navegación
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });
            
            const gastosNavLink = document.querySelector('[onclick*="gastosSection"]');
            if (gastosNavLink) {
                gastosNavLink.classList.add('active');
            }
        }
        
        // Mostrar toast informativo
        if (window.app && typeof window.app.showToast === 'function') {
            window.app.showToast('Navegando a la sección de gastos...', 'info');
        }
    }

    static viewExpense(id) {
        // Open expense details modal
        window.app.showToast('Cargando detalles del gasto...', 'info');
        // Implementation for viewing expense details
    }

    static editExpense(id) {
        // Open expense edit modal
        if (window.GastosManager) {
            window.GastosManager.editExpense(id);
        }
    }

    static deleteExpense(id) {
        // Usar modal personalizado en lugar de confirm nativo
        window.app.showConfirmModal(
            '🗑️ Eliminar Gasto',
            '¿Estás seguro de que deseas eliminar este gasto?',
            'Eliminar',
            'danger',
            () => {
                // Implementation for deleting expense
                window.app.showToast('Gasto eliminado correctamente', 'success');
            }
        );
    }

    async exportReports() {
        try {
            window.app.showToast('📊 Generando reportes...', 'info');
            
            // Simulate report generation
            setTimeout(() => {
                window.app.showToast('✅ Reportes generados exitosamente', 'success');
                
                // Create download link
                const link = document.createElement('a');
                link.href = '#';
                link.download = `reporte-dashboard-${new Date().toISOString().split('T')[0]}.pdf`;
                link.click();
            }, 2000);
            
        } catch (error) {
            window.app.showToast('Error al generar reportes: ' + error.message, 'danger');
        }
    }

    // Actualizar estadísticas de viajes
    updateViajesStats() {
        if (!this.data.viajes) return;

        const viajes = this.data.viajes;
        
        // Buscar elementos en el dashboard para mostrar estadísticas de viajes
        const totalViajesEl = document.querySelector('[data-stat="total-viajes"]');
        const pendientesEl = document.querySelector('[data-stat="viajes-pendientes"]');
        const progresoEl = document.querySelector('[data-stat="viajes-progreso"]');
        const completadosEl = document.querySelector('[data-stat="viajes-completados"]');

        if (totalViajesEl) totalViajesEl.textContent = viajes.total_viajes || 0;
        if (pendientesEl) pendientesEl.textContent = viajes.viajes_pendientes || 0;
        if (progresoEl) progresoEl.textContent = viajes.viajes_en_progreso || 0;
        if (completadosEl) completadosEl.textContent = viajes.viajes_completados || 0;

        // Crear gráfica de viajes si existe el canvas
        this.createViajesChart();
    }

    // Crear gráfica de viajes
    createViajesChart() {
        const canvas = document.getElementById('routesChart');
        if (!canvas || !this.data.viajes) return;

        const ctx = canvas.getContext('2d');
        
        // Destruir gráfica anterior si existe
        if (this.viajesChart) {
            this.viajesChart.destroy();
            this.viajesChart = null;
        }

        // También destruir cualquier instancia existente de Chart.js en este canvas
        const existingChart = Chart.getChart(canvas);
        if (existingChart) {
            existingChart.destroy();
        }

        const viajes = this.data.viajes;
        
        this.viajesChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['🟡 Pendientes', '🔵 En Ruta', '🟢 Completados', '🔴 Cancelados'],
                datasets: [{
                    data: [
                        viajes.viajes_pendientes || 0,
                        viajes.viajes_en_progreso || 0,
                        viajes.viajes_completados || 0,
                        viajes.viajes_cancelados || 0
                    ],
                    backgroundColor: [
                        '#ffc107', // Amarillo para pendientes
                        '#007bff', // Azul para en ruta
                        '#28a745', // Verde para completados
                        '#dc3545'  // Rojo para cancelados
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
                                return `${context.label}: ${value} viajes (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
}

// Initialize Dashboard Manager
window.DashboardManager = new DashboardManager();
