// Eliminar ViajesManager existente si ya está definido
if (window.ViajesManager && typeof window.ViajesManager === 'object' && !window.ViajesManager.constructor) {
    delete window.ViajesManager;
}

class ViajesManager {
    constructor() {
        this.viajes = [];
        this.filteredViajes = [];
        this.currentUser = null;
        this.init();
    }

    init() {
        this.currentUser = window.app?.currentUser;
        this.transportistas = [];
        this.vehiculos = [];
        this.loadTransportistas();
        this.loadVehiculos();
        this.loadViajes();
        this.setupEventListeners();
        this.setupModalListeners();
    }

    setupEventListeners() {
        // Event listeners para filtros
        document.addEventListener('DOMContentLoaded', () => {
            this.loadViajes();
        });

        // Setup form submission when form exists
        setTimeout(() => {
            const form = document.getElementById('nuevoViajeForm');
            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.guardarViaje();
                });
            }
        }, 100);
    }

    setupModalListeners() {
        const modal = document.getElementById('nuevoViajeModal');
        if (modal) {
            modal.addEventListener('show.bs.modal', () => {
                this.cargarTransportistasEnSelect();
                this.cargarVehiculosEnSelect();
            });
        }
    }

    async loadTransportistas() {
        try {
            console.log('🚛 Cargando transportistas...');
            const response = await fetch('/LogisticaFinal/api/transportistas/list.php', {
                method: 'GET',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('📡 Response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Response error:', errorText);
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }
            
            const data = await response.json();
            console.log('📋 Transportistas recibidos:', data);
            
            if (Array.isArray(data)) {
                // Usar todos los transportistas (sin filtrar por estado ya que simplificamos la consulta)
                this.transportistas = data;
                console.log('✅ Transportistas cargados:', this.transportistas.length);
            } else if (data && data.error) {
                console.error('❌ Error de API:', data.error);
                this.transportistas = [];
            } else {
                console.error('❌ Datos no son un array:', data);
                this.transportistas = [];
            }
            
            return this.transportistas;
        } catch (error) {
            console.error('❌ Error cargando transportistas:', error);
            this.transportistas = [];
            throw error;
        }
    }

    async loadVehiculos() {
        try {
            console.log('🚚 Cargando vehículos...');
            const response = await fetch('/LogisticaFinal/api/vehiculos/list.php', {
                method: 'GET',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('📡 Response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Response error:', errorText);
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }
            
            const data = await response.json();
            console.log('📋 Vehículos recibidos:', data);
            
            if (Array.isArray(data)) {
                // Filtrar solo vehículos disponibles
                this.vehiculos = data.filter(v => v.estado === 'disponible' || v.estado === 'operativo' || v.activo == 1);
                console.log('✅ Vehículos disponibles:', this.vehiculos.length);
            } else {
                console.error('❌ Datos no son un array:', data);
                this.vehiculos = [];
            }
            
            return this.vehiculos;
        } catch (error) {
            console.error('❌ Error cargando vehículos:', error);
            this.vehiculos = [];
            throw error;
        }
    }

    cargarTransportistasEnSelect() {
        console.log('🔄 Poblando select de transportistas...');
        const select = document.getElementById('transportista');
        if (!select) {
            console.error('❌ Select transportista no encontrado');
            return;
        }

        // Limpiar opciones existentes
        select.innerHTML = '<option value="">Seleccionar transportista...</option>';

        console.log('📋 Transportistas disponibles:', this.transportistas);

        // Verificar si hay transportistas
        if (!this.transportistas || this.transportistas.length === 0) {
            console.warn('⚠️ No hay transportistas disponibles');
            select.innerHTML = '<option value="">No hay transportistas disponibles</option>';
            return;
        }

        // Agregar transportistas
        this.transportistas.forEach(transportista => {
            const option = document.createElement('option');
            option.value = transportista.id;
            
            // Usar nombre_completo si está disponible, sino construir el nombre
            const nombre = transportista.nombre_completo || 
                          `${transportista.nombre} ${transportista.apellido || ''}`.trim();
            
            option.textContent = nombre;
            select.appendChild(option);
            console.log(`➕ Agregado: ${nombre} (ID: ${transportista.id})`);
        });

        console.log(`✅ ${this.transportistas.length} transportistas cargados en select`);
    }

    cargarVehiculosEnSelect() {
        console.log('🔄 Poblando select de vehículos...');
        const select = document.getElementById('vehiculo');
        if (!select) {
            console.error('❌ Select vehículo no encontrado');
            return;
        }

        // Limpiar opciones existentes
        select.innerHTML = '<option value="">Seleccionar vehículo...</option>';

        console.log('📋 Vehículos disponibles:', this.vehiculos);

        // Verificar si hay vehículos
        if (!this.vehiculos || this.vehiculos.length === 0) {
            console.warn('⚠️ No hay vehículos disponibles');
            select.innerHTML = '<option value="">No hay vehículos disponibles</option>';
            return;
        }

        // Agregar vehículos
        this.vehiculos.forEach(vehiculo => {
            const option = document.createElement('option');
            option.value = vehiculo.id;
            
            // Usar descripción si está disponible, sino construir la descripción
            const descripcion = vehiculo.descripcion || 
                               `${vehiculo.marca} ${vehiculo.modelo} (${vehiculo.placa})`;
            
            option.textContent = descripcion;
            select.appendChild(option);
            console.log(`➕ Agregado: ${descripcion} (ID: ${vehiculo.id})`);
        });

        console.log(`✅ ${this.vehiculos.length} vehículos cargados en select`);
    }

    async loadViajes() {
        try {
            console.log('🚛 Cargando viajes desde API...');
            const response = await fetch('/LogisticaFinal/api/viajes/list.php', {
                method: 'GET',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('📡 Response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Response error:', errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('📋 Viajes recibidos:', data);
            
            if (Array.isArray(data)) {
                this.viajes = data;
                console.log('✅ Viajes cargados:', this.viajes.length);
            } else if (data && data.error) {
                console.error('❌ Error de API:', data.error);
                this.viajes = [];
            } else {
                console.error('❌ Datos no son un array:', data);
                this.viajes = [];
            }
            
            this.filteredViajes = [...this.viajes];
            this.renderViajes();
            this.updateTodayTrips();
            this.updateDashboardStats();
            
        } catch (error) {
            console.error('❌ Error cargando viajes:', error);
            this.viajes = [];
            this.filteredViajes = [];
            this.renderViajes();
            
            // Mostrar mensaje de error
            if (window.app && window.app.showToast) {
                window.app.showToast('Error al cargar viajes', 'error');
            }
        }
    }

    renderViajes() {
        const container = document.getElementById('viajesContainer');
        if (!container) return;

        if (this.filteredViajes.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-route fa-3x text-muted mb-3"></i>
                    <h5 class="text-muted">No hay viajes disponibles</h5>
                    <p class="text-muted">Los viajes aparecerán aquí una vez que sean asignados.</p>
                </div>
            `;
            return;
        }

        const viajesHtml = this.filteredViajes.map(viaje => this.createViajeCard(viaje)).join('');
        container.innerHTML = viajesHtml;
    }

    createViajeCard(viaje) {
        const statusConfig = this.getStatusConfig(viaje.estado);
        const canEdit = this.currentUser?.role !== 'transportista';
        const isAssigned = viaje.transportista_id === this.currentUser?.id || this.currentUser?.role !== 'transportista';

        return `
            <div class="trip-card card">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <div>
                            <h6 class="card-title mb-1">🚛 ${viaje.numero}</h6>
                            <span class="trip-status ${viaje.estado}">${statusConfig.label}</span>
                        </div>
                        <div class="text-end">
                            <small class="text-muted">${viaje.fecha_programada} - ${viaje.hora_programada}</small>
                        </div>
                    </div>
                    
                    <div class="trip-route">
                        📍 ${viaje.origen_municipio}, ${viaje.origen_estado} → 
                        🎯 ${viaje.destino_municipio}, ${viaje.destino_estado}
                    </div>
                    
                    <div class="trip-details">
                        <strong>Transportista:</strong> ${viaje.transportista_nombre || 'Sin asignar'}
                    </div>
                    <div class="trip-details">
                        <strong>Vehículo:</strong> ${viaje.vehiculo_placa || 'Sin asignar'}
                    </div>
                    <div class="trip-details">
                        <strong>Carga:</strong> ${viaje.carga_peso}kg - ${viaje.carga_tipo}
                    </div>
                    <div class="trip-details">
                        <strong>Cliente:</strong> ${viaje.cliente}
                    </div>
                    
                    ${viaje.observaciones ? `
                        <div class="trip-details mt-2">
                            <strong>Observaciones:</strong> ${viaje.observaciones}
                        </div>
                    ` : ''}
                    
                    <div class="trip-actions">
                        ${this.getActionButtons(viaje, isAssigned, canEdit)}
                    </div>
                </div>
            </div>
        `;
    }

    getStatusConfig(estado) {
        const configs = {
            'pendiente': { label: 'Pendiente', color: 'warning' },
            'en_ruta': { label: 'En Ruta', color: 'success' },
            'completado': { label: 'Completado', color: 'primary' }
        };
        return configs[estado] || configs['pendiente'];
    }

    getActionButtons(viaje, isAssigned, canEdit) {
        let buttons = [];

        // Botones según el estado y rol
        if (viaje.estado === 'pendiente') {
            if (isAssigned) {
                buttons.push(`<button class="btn btn-success btn-sm" onclick="ViajesManager.startTrip(${viaje.id})">
                    <i class="fas fa-play me-1"></i>Iniciar Viaje
                </button>`);
            }
            if (canEdit) {
                buttons.push(`<button class="btn btn-warning btn-sm" onclick="ViajesManager.editTrip(${viaje.id})">
                    <i class="fas fa-edit me-1"></i>Editar
                </button>`);
            }
        } else if (viaje.estado === 'en_ruta') {
            if (isAssigned) {
                buttons.push(`<button class="btn btn-primary btn-sm" onclick="ViajesManager.completeTrip(${viaje.id})">
                    <i class="fas fa-check me-1"></i>Completar Viaje
                </button>`);
                buttons.push(`<button class="btn btn-info btn-sm" onclick="ViajesManager.updateStatus(${viaje.id})">
                    <i class="fas fa-map-marker-alt me-1"></i>Actualizar Estado
                </button>`);
            }
        }

        // Botones comunes
        buttons.push(`<button class="btn btn-outline-primary btn-sm" onclick="ViajesManager.viewDetails(${viaje.id})">
            <i class="fas fa-eye me-1"></i>Ver Detalles
        </button>`);

        if (viaje.estado !== 'completado' && isAssigned) {
            buttons.push(`<button class="btn btn-outline-danger btn-sm" onclick="ViajesManager.reportProblem(${viaje.id})">
                <i class="fas fa-exclamation-triangle me-1"></i>Reportar Problema
            </button>`);
        }

        return buttons.join(' ');
    }

    updateTodayTrips() {
        const container = document.getElementById('todayTripsContainer');
        if (!container) return;

        const today = new Date().toISOString().split('T')[0];
        const todayTrips = this.viajes.filter(viaje => viaje.fecha_programada === today);

        if (todayTrips.length === 0) {
            container.innerHTML = `
                <div class="text-center py-3">
                    <i class="fas fa-calendar-check text-muted mb-2"></i>
                    <p class="text-muted mb-0">No hay viajes programados para hoy</p>
                </div>
            `;
            return;
        }

        const tripsHtml = todayTrips.slice(0, 3).map(viaje => {
            const statusConfig = this.getStatusConfig(viaje.estado);
            const statusIcon = viaje.estado === 'completado' ? '✅' : 
                              viaje.estado === 'en_ruta' ? '🟢' : 
                              viaje.estado === 'pendiente' ? '🟡' : '🔴';
            
            return `
                <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <div class="flex-grow-1">
                        <div class="fw-semibold">
                            ${statusIcon} ${viaje.origen_municipio} → ${viaje.destino_municipio}
                        </div>
                        <small class="text-muted">
                            ${viaje.estado === 'en_ruta' ? `En Ruta - ${viaje.hora_programada}` :
                              viaje.estado === 'completado' ? `Completado - ${viaje.fecha_completado?.split(' ')[1]?.substring(0,5) || ''}` :
                              `Pendiente - ${viaje.hora_programada}`}
                        </small>
                    </div>
                    <div class="text-end">
                        ${viaje.estado === 'pendiente' ? 
                            `<button class="btn btn-success btn-sm" onclick="ViajesManager.startTrip(${viaje.id})">Iniciar</button>` :
                          viaje.estado === 'en_ruta' ? 
                            `<button class="btn btn-primary btn-sm" onclick="ViajesManager.completeTrip(${viaje.id})">Completar</button>` :
                            `<span class="badge bg-success">Entregado</span>`
                        }
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = tripsHtml;
    }

    updateDashboardStats() {
        // Actualizar estadísticas en las cards del dashboard
        const totalTrips = this.viajes.length;
        const activeTrips = this.viajes.filter(v => v.estado === 'en_ruta').length;
        const completedToday = this.viajes.filter(v => {
            const today = new Date().toISOString().split('T')[0];
            return v.estado === 'completado' && v.fecha_completado?.startsWith(today);
        }).length;

        // Actualizar cards
        this.updateStatCard('Viajes Totales', totalTrips);
        this.updateStatCard('En Operación', activeTrips);
        this.updateStatCard('Completados Hoy', completedToday);

        // Actualizar gráfico de rutas
        this.updateRoutesChart();
    }

    updateStatCard(label, value) {
        const cards = document.querySelectorAll('.stat-card');
        cards.forEach(card => {
            const labelElement = card.querySelector('.stat-label');
            if (labelElement && labelElement.textContent.includes(label)) {
                const valueElement = card.querySelector('.stat-value');
                if (valueElement) {
                    valueElement.textContent = value;
                }
            }
        });
    }

    // Método para mostrar el modal de nuevo viaje
    async showCreateModal() {
        try {
            console.log('🚀 Abriendo modal de nuevo viaje...');
            
            const modalEl = document.getElementById('nuevoViajeModal');
            if (!modalEl) {
                console.error('❌ nuevoViajeModal element not found');
                return false;
            }
            
            // Resetear el formulario
            const form = document.getElementById('nuevoViajeForm');
            if (form) form.reset();
            
            // Cargar datos ANTES de mostrar el modal
            console.log('📋 Cargando datos para el modal...');
            
            // 1. Cargar estados mexicanos inmediatamente
            this.cargarEstadosMexicanos();
            console.log('✅ Estados mexicanos cargados');
            
            // 2. Cargar transportistas y vehículos
            try {
                console.log('🚛 Iniciando carga de transportistas...');
                await this.loadTransportistas();
                this.cargarTransportistasEnSelect();
                console.log('✅ Transportistas cargados en select');
                
                console.log('🚚 Iniciando carga de vehículos...');
                await this.loadVehiculos();
                this.cargarVehiculosEnSelect();
                console.log('✅ Vehículos cargados en select');
                
            } catch (error) {
                console.error('❌ Error cargando APIs:', error);
                console.log('🔧 Cargando datos de prueba...');
                this.cargarDatosDePrueba();
            }
            
            // 3. Mostrar el modal después de cargar datos
            const modal = new bootstrap.Modal(modalEl);
            modal.show();
            console.log('✅ Modal mostrado con datos cargados');
            
            return true;
            
        } catch (error) {
            console.error('❌ Error in showCreateModal:', error);
            return false;
        }
    }

    // Prevenir interferencia de extensiones del navegador
    preventExtensionInterference() {
        try {
            // Limpiar selección de texto que puede causar problemas con extensiones
            if (window.getSelection) {
                const selection = window.getSelection();
                if (selection.rangeCount > 0) {
                    selection.removeAllRanges();
                }
            }
            
            // Desactivar temporalmente eventos que pueden interferir
            document.body.style.userSelect = 'none';
            
            // Restaurar después de un momento
            setTimeout(() => {
                document.body.style.userSelect = '';
            }, 1000);
            
        } catch (e) {
            // Ignorar errores de extensiones
            console.log('🛡️ Protección contra extensiones aplicada');
        }
    }

    // Método de fallback con datos de prueba
    cargarDatosDePrueba() {
        console.log('🔧 Cargando datos de prueba...');
        
        // Datos de prueba para transportistas
        this.transportistas = [
            { id: 1, nombre: 'Juan', apellido: 'Pérez', estado: 'activo' },
            { id: 2, nombre: 'María', apellido: 'González', estado: 'activo' },
            { id: 3, nombre: 'Carlos', apellido: 'López', estado: 'activo' }
        ];
        
        // Datos de prueba para vehículos
        this.vehiculos = [
            { id: 1, marca: 'Volvo', modelo: 'FH16', placa: 'ABC-123', estado: 'disponible' },
            { id: 2, marca: 'Scania', modelo: 'R450', placa: 'DEF-456', estado: 'disponible' },
            { id: 3, marca: 'Mercedes', modelo: 'Actros', placa: 'GHI-789', estado: 'disponible' }
        ];
        
        this.cargarTransportistasEnSelect();
        this.cargarVehiculosEnSelect();
        this.cargarEstadosMexicanos();
    }

    // Cargar estados mexicanos en los selectores
    cargarEstadosMexicanos() {
        console.log('🇲🇽 Cargando estados mexicanos...');
        
        const estadosMexico = [
            'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche',
            'Chiapas', 'Chihuahua', 'Ciudad de México', 'Coahuila', 'Colima',
            'Durango', 'Estado de México', 'Guanajuato', 'Guerrero', 'Hidalgo',
            'Jalisco', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca',
            'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa',
            'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas'
        ];

        // Cargar estados en selector de origen
        const origenEstadoSelect = document.getElementById('origenEstado');
        if (origenEstadoSelect) {
            origenEstadoSelect.innerHTML = '<option value="">Seleccionar estado...</option>';
            estadosMexico.forEach(estado => {
                const option = document.createElement('option');
                option.value = estado;
                option.textContent = estado;
                origenEstadoSelect.appendChild(option);
            });
            console.log('✅ Estados cargados en selector de origen');
        }

        // Cargar estados en selector de destino
        const destinoEstadoSelect = document.getElementById('destinoEstado');
        if (destinoEstadoSelect) {
            destinoEstadoSelect.innerHTML = '<option value="">Seleccionar estado...</option>';
            estadosMexico.forEach(estado => {
                const option = document.createElement('option');
                option.value = estado;
                option.textContent = estado;
                destinoEstadoSelect.appendChild(option);
            });
            console.log('✅ Estados cargados en selector de destino');
        }
    }

    // Guardar un nuevo viaje
    async guardarViaje() {
        try {
            // Validar formulario
            const form = document.getElementById('nuevoViajeForm');
            if (!form.checkValidity()) {
                form.classList.add('was-validated');
                return;
            }

            // Obtener datos del formulario con nuevos campos de ubicación
            const origenCompleto = `${document.getElementById('origenEstado').value}, ${document.getElementById('origenMunicipio').value}${document.getElementById('origenLugar').value ? ', ' + document.getElementById('origenLugar').value : ''}`;
            const destinoCompleto = `${document.getElementById('destinoEstado').value}, ${document.getElementById('destinoMunicipio').value}${document.getElementById('destinoLugar').value ? ', ' + document.getElementById('destinoLugar').value : ''}`;
            
            const viajeData = {
                // Campos de ubicación actualizados
                origen_estado: document.getElementById('origenEstado').value,
                origen_municipio: document.getElementById('origenMunicipio').value,
                origen_lugar: document.getElementById('origenLugar').value,
                origen: origenCompleto,
                
                destino_estado: document.getElementById('destinoEstado').value,
                destino_municipio: document.getElementById('destinoMunicipio').value,
                destino_lugar: document.getElementById('destinoLugar').value,
                destino: destinoCompleto,
                
                // Campos existentes
                fecha_salida: document.getElementById('fechaSalida').value,
                fecha_llegada_estimada: document.getElementById('fechaLlegada').value,
                transportista_id: document.getElementById('transportista').value,
                vehiculo_id: document.getElementById('vehiculo').value,
                descripcion: document.getElementById('descripcion').value,
                estado: 'pendiente' // Estado inicial
            };

            console.log('Guardando viaje:', viajeData);

            // Aquí iría la llamada a la API para guardar el viaje
            const response = await fetch('api/viajes/create.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(viajeData)
            });

            if (!response.ok) throw new Error('Error al guardar el viaje');

            const result = await response.json();
            console.log('Viaje guardado:', result);

            // Mostrar mensaje de éxito
            if (window.app && window.app.showToast) {
                window.app.showToast('Viaje creado exitosamente', 'success');
            }

            // Cerrar el modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('nuevoViajeModal'));
            if (modal) modal.hide();

            // Recargar la lista de viajes
            this.loadViajes();

        } catch (error) {
            console.error('Error al guardar el viaje:', error);
            if (window.app && window.app.showToast) {
                window.app.showToast('Error al guardar el viaje: ' + error.message, 'error');
            }
        }
    }

    updateRoutesChart() {
        const canvas = document.getElementById('routesChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        // Calcular datos para el gráfico
        const enRuta = this.viajes.filter(v => v.estado === 'en_ruta').length;
        const pendientes = this.viajes.filter(v => v.estado === 'pendiente').length;
        const retrasados = 0; // Por ahora 0, se puede calcular basado en tiempo

        if (window.routesChart) {
            window.routesChart.destroy();
        }

        window.routesChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['En Ruta', 'En Espera', 'Con Retraso'],
                datasets: [{
                    data: [enRuta, pendientes, retrasados],
                    backgroundColor: [
                        '#22c55e',
                        '#f59e0b', 
                        '#ef4444'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                }
            }
        });
    }

    // Métodos de acción
    startTrip(id) {
        const viaje = this.viajes.find(v => v.id === id);
        if (!viaje) return;

        if (confirm(`¿Iniciar el viaje ${viaje.numero}?`)) {
            viaje.estado = 'en_ruta';
            viaje.fecha_inicio = new Date().toISOString();
            viaje.observaciones = 'Viaje iniciado';
            
            this.renderViajes();
            this.updateTodayTrips();
            this.updateDashboardStats();
            
            window.app?.showToast(`Viaje ${viaje.numero} iniciado exitosamente`, 'success');
        }
    }

    completeTrip(id) {
        const viaje = this.viajes.find(v => v.id === id);
        if (!viaje) return;

        if (confirm(`¿Marcar como completado el viaje ${viaje.numero}?`)) {
            viaje.estado = 'completado';
            viaje.fecha_completado = new Date().toISOString();
            viaje.observaciones = 'Viaje completado exitosamente';
            
            this.renderViajes();
            this.updateTodayTrips();
            this.updateDashboardStats();
            
            window.app?.showToast(`Viaje ${viaje.numero} completado exitosamente`, 'success');
        }
    }

    viewDetails(id) {
        const viaje = this.viajes.find(v => v.id === id);
        if (!viaje) return;

        // Mostrar modal con detalles completos
        window.app?.showToast('Función de detalles en desarrollo', 'info');
    }

    reportProblem(id) {
        const viaje = this.viajes.find(v => v.id === id);
        if (!viaje) return;

        const problema = prompt(`Reportar problema en viaje ${viaje.numero}:`);
        if (problema) {
            viaje.observaciones = `PROBLEMA: ${problema}`;
            this.renderViajes();
            window.app?.showToast('Problema reportado exitosamente', 'warning');
        }
    }

    updateStatus(id) {
        const viaje = this.viajes.find(v => v.id === id);
        if (!viaje) return;

        const status = prompt(`Actualizar estado del viaje ${viaje.numero}:`);
        if (status) {
            viaje.observaciones = `Actualización: ${status}`;
            this.renderViajes();
            window.app?.showToast('Estado actualizado exitosamente', 'info');
        }
    }

    showCreateModal() {
        window.app?.showToast('Función de crear viaje en desarrollo', 'info');
    }

    editTrip(id) {
        window.app?.showToast('Función de editar viaje en desarrollo', 'info');
    }

    filterTrips() {
        const statusFilter = document.getElementById('filterStatus')?.value || '';
        const dateFilter = document.getElementById('filterDate')?.value || '';
        const transportistaFilter = document.getElementById('filterTransportista')?.value || '';

        this.filteredViajes = this.viajes.filter(viaje => {
            const matchStatus = !statusFilter || viaje.estado === statusFilter;
            const matchDate = !dateFilter || viaje.fecha_programada === dateFilter;
            const matchTransportista = !transportistaFilter || viaje.transportista_id.toString() === transportistaFilter;
            
            return matchStatus && matchDate && matchTransportista;
        });

        this.renderViajes();
    }

    clearFilters() {
        document.getElementById('filterStatus').value = '';
        document.getElementById('filterDate').value = '';
        document.getElementById('filterTransportista').value = '';
        
        this.filteredViajes = [...this.viajes];
        this.renderViajes();
    }
}

// Función global para abrir el modal (fallback)
window.abrirModalNuevoViaje = function() {
    console.log('🔧 Función global abrirModalNuevoViaje llamada');
    if (window.ViajesManager && window.ViajesManager.showCreateModal) {
        window.ViajesManager.showCreateModal();
    } else {
        console.error('❌ ViajesManager no disponible');
        alert('Error: Sistema de viajes no inicializado');
    }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM cargado, inicializando ViajesManager...');
    
    // Crear instancia global
    window.ViajesManager = new ViajesManager();
    console.log('✅ ViajesManager creado globalmente');
    
    // Configurar botón con múltiples intentos
    const setupButton = () => {
        const btnNuevoViaje = document.getElementById('btnNuevoViaje');
        console.log('🔍 Buscando botón btnNuevoViaje...', btnNuevoViaje);
        
        if (btnNuevoViaje) {
            // Limpiar eventos anteriores
            btnNuevoViaje.onclick = null;
            btnNuevoViaje.removeEventListener('click', window.handleNuevoViajeClick);
            
            // Función manejadora
            window.handleNuevoViajeClick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('🎯 Botón Nuevo Viaje clickeado');
                
                if (window.ViajesManager && window.ViajesManager.showCreateModal) {
                    window.ViajesManager.showCreateModal();
                } else {
                    console.error('❌ ViajesManager no disponible');
                    alert('Error: Sistema de viajes no inicializado');
                }
            };
            
            // Asignar evento
            btnNuevoViaje.addEventListener('click', window.handleNuevoViajeClick);
            console.log('✅ Event listener configurado para btnNuevoViaje');
            return true;
        } else {
            console.warn('⚠️ Botón btnNuevoViaje no encontrado, reintentando...');
            return false;
        }
    };
    
    // Intentar configurar el botón múltiples veces
    setupButton();
    setTimeout(setupButton, 100);
    setTimeout(setupButton, 500);
    setTimeout(setupButton, 1000);
    setTimeout(setupButton, 2000);
});
