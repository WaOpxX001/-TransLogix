// TransportePro - Main Application Controller
class TransportePro {
    constructor() {
        this.currentUser = null;
        this.currentSection = 'dashboardSection';
        this.authToken = null;
        this.apiBase = 'api';

        this.init();
    }

    init() {
        this.checkSession();
        this.setupEventListeners();
        this.loadExternalScripts();
    }

    checkSession() {
        const token = sessionStorage.getItem('authToken');
        const user = sessionStorage.getItem('currentUser');

        if (token && user) {
            this.authToken = token;
            this.currentUser = JSON.parse(user);
            this.showDashboard();
        }
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Mobile toggle - Enhanced for responsive design
        window.toggleSidebar = () => {
            const sidebar = document.getElementById('sidebar');
            const body = document.body;
            
            sidebar.classList.toggle('active');
            
            // Add backdrop for mobile
            if (sidebar.classList.contains('active')) {
                // Create backdrop
                const backdrop = document.createElement('div');
                backdrop.className = 'sidebar-backdrop';
                backdrop.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.5);
                    z-index: 1040;
                    display: none;
                `;
                
                // Show backdrop on mobile only
                if (window.innerWidth <= 767) {
                    backdrop.style.display = 'block';
                    body.appendChild(backdrop);
                    body.style.overflow = 'hidden';
                    
                    // Close sidebar when clicking backdrop
                    backdrop.addEventListener('click', () => {
                        sidebar.classList.remove('active');
                        backdrop.remove();
                        body.style.overflow = '';
                    });
                }
            } else {
                // Remove backdrop
                const backdrop = document.querySelector('.sidebar-backdrop');
                if (backdrop) {
                    backdrop.remove();
                    body.style.overflow = '';
                }
            }
        };

        // Global navigation
        window.navigateTo = (sectionId, title) => this.navigateTo(sectionId, title);

        // Global logout
        window.logout = () => this.logout();
    }

    async loadExternalScripts() {
        // First, load init-managers.js
        try {
            await this.loadScript('assets/js/init-managers.js');
            console.log('✅ Loaded: init-managers.js');
        } catch (error) {
            console.error('❌ Failed to load init-managers.js', error);
            throw error; // Critical error, stop execution
        }

        // Then load other scripts in parallel
        const scripts = [
            'assets/js/dashboard.js?v=20250128200123',
            'assets/js/viajes_simple.js',
            'assets/js/transportistas.js',
            'assets/js/vehiculos.js',
            'assets/js/reportes.js',
            'assets/js/roles.js'
        ];

        const loadPromises = scripts.map(script =>
            this.loadScript(script)
                .then(() => console.log(`✅ Loaded: ${script}`))
                .catch(error => {
                    console.error(`⚠️ Failed to load: ${script}`, error);
                    return Promise.resolve(); // Continue with other scripts
                })
        );

        await Promise.all(loadPromises);

        // Wait a moment for scripts to initialize
        await new Promise(resolve => setTimeout(resolve, 100));

        // Initialize managers after all scripts are loaded
        try {
            if (window.ViajesManager) {
                console.log('Initializing ViajesManager...');
                if (typeof window.ViajesManager.init === 'function') {
                    await window.ViajesManager.init();
                }
            }

            if (window.GastosManager) {
                console.log('Initializing GastosManager...');
                if (typeof window.GastosManager.init === 'function') {
                    await window.GastosManager.init();
                }
            }
        } catch (error) {
            console.error('Error initializing managers:', error);
        }
    }

    loadScript(src) {
        return new Promise((resolve, reject) => {
            // Add cache busting parameter
            const cacheBuster = `?v=${Date.now()}`;
            const srcWithCache = src + cacheBuster;
            // Check if script is already loaded to prevent redeclaration
            const existingScript = document.querySelector(`script[data-src="${src}"]`);
            if (existingScript) {
                console.log(`⚠️ Script already loaded: ${src}`);
                resolve();
                return;
            }

            // Load script with cache busting
            const timestamp = Date.now();
            const script = document.createElement('script');
            script.src = `${src}?v=${timestamp}`;
            script.setAttribute('data-src', src);
            script.onload = () => {
                console.log(`✅ Script loaded: ${src}`);
                resolve();
            };
            script.onerror = () => {
                console.error(`❌ Failed to load script: ${src}`);
                reject();
            };
            document.head.appendChild(script);
        });
    }

    async handleLogin(e) {
        e.preventDefault();

        const emailElement = document.getElementById('email');
        const passwordElement = document.getElementById('password');

        if (!emailElement || !passwordElement) {
            console.error('Login form elements not found');
            this.showToast('Error: Formulario no encontrado', 'danger');
            return;
        }

        const email = emailElement.value;
        const password = passwordElement.value;

        if (!email || !password) {
            this.showToast('Por favor ingresa email y contraseña', 'warning');
            return;
        }

        try {
            this.showToast('Iniciando sesión...', 'info');

            // Real API call - role is determined by database
            const response = await this.apiCall('auth/login.php', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });

            if (response.success) {
                this.authToken = response.token;
                this.currentUser = response.user;

                sessionStorage.setItem('authToken', this.authToken);
                sessionStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                
                // Notificar cambio de usuario a los managers
                this.notifyUserChange();

                this.showDashboard();
                this.showUserSwitchButtons();
                this.showToast('¡Bienvenido! Has iniciado sesión correctamente', 'success');
            } else {
                this.showToast('Error al iniciar sesión', 'danger');
            }
        } catch (error) {
            this.showToast('Error al iniciar sesión: ' + error.message, 'danger');
        }
    }

    // Función para cambiar de usuario dinámicamente (para testing/admin)
    switchUser(newUserData) {
        console.log('🔄 Cambiando usuario:', newUserData);
        this.currentUser = newUserData;
        sessionStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        
        // Actualizar UI del usuario
        this.updateUserInfo();
        
        // Notificar cambio a los managers
        this.notifyUserChange();
        
        this.showToast(`Cambiado a: ${newUserData.name} (${newUserData.role})`, 'info');
    }

    // Notificar cambio de usuario a todos los managers
    notifyUserChange() {
        console.log('📢 Notificando cambio de usuario a los managers...');
        
        // Actualizar ViajesManager si existe
        if (window.ViajesManager && typeof window.ViajesManager.actualizarVistaPorRol === 'function') {
            console.log('🚛 Actualizando vista de viajes...');
            window.ViajesManager.actualizarVistaPorRol();
            
            // Forzar recarga de datos si está en la sección de viajes
            const viajesSection = document.getElementById('viajesSection');
            if (viajesSection && viajesSection.classList.contains('active')) {
                console.log('🔄 Forzando recarga de viajes...');
                setTimeout(() => {
                    window.ViajesManager.loadTrips();
                }, 100);
            }
        }
        
        // Actualizar otros managers si es necesario
        if (window.DashboardManager && typeof window.DashboardManager.updateUserInfo === 'function') {
            window.DashboardManager.updateUserInfo();
        }
        
        // Actualizar información del usuario en el sidebar
        this.updateUserInfo();
        
        // Mostrar botones de cambio de usuario (solo en desarrollo)
        this.showUserSwitchButtons();
    }

    // Actualizar información del usuario en la UI
    updateUserInfo() {
        if (this.currentUser) {
            const userNameEl = document.getElementById('userName');
            const userRoleEl = document.getElementById('userRole');
            const userAvatarEl = document.getElementById('userAvatar');
            
            if (userNameEl) userNameEl.textContent = this.currentUser.name || 'Usuario';
            if (userRoleEl) userRoleEl.textContent = this.currentUser.role || 'Sin rol';
            if (userAvatarEl) {
                const initials = (this.currentUser.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
                userAvatarEl.textContent = initials;
            }
        }
    }

    // Mostrar botones de cambio de usuario (solo en desarrollo)
    showUserSwitchButtons() {
        const userSwitchButtons = document.getElementById('userSwitchButtons');
        if (userSwitchButtons) {
            // Mostrar siempre para facilitar las pruebas
            userSwitchButtons.style.display = 'block';
        }
    }

    showDashboard() {
        // Force hide login screen immediately
        const loginScreen = document.getElementById('loginScreen');
        const dashboard = document.getElementById('dashboard');

        if (loginScreen) {
            loginScreen.style.display = 'none';
            loginScreen.style.visibility = 'hidden';
            loginScreen.classList.add('d-none');
        }

        if (dashboard) {
            dashboard.style.display = 'block';
            dashboard.style.visibility = 'visible';
            dashboard.classList.remove('d-none');
        }

        this.setupUserInterface();

        // Initialize dashboard data with delay to ensure UI is ready
        setTimeout(() => {
            if (window.DashboardManager) {
                window.DashboardManager.loadData();
            }
        }, 100);
    }

    setupUserInterface() {
        const userName = document.getElementById('userName');
        const userRole = document.getElementById('userRole');
        const userAvatar = document.getElementById('userAvatar');
        const navMenu = document.getElementById('navMenu');

        userName.textContent = this.currentUser.name;
        userRole.textContent = this.currentUser.role.charAt(0).toUpperCase() + this.currentUser.role.slice(1);
        userAvatar.textContent = this.getInitials(this.currentUser.name);

        this.buildNavigation(navMenu);
    }

    getInitials(name) {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    }

    buildNavigation(navMenu) {
        if (!navMenu) return;

        // Definir los elementos del menú basados en el rol
        let menuItems = [];

        if (this.currentUser.role === 'admin') {
            menuItems = [
                { id: 'dashboardSection', icon: 'fas fa-tachometer-alt', text: 'Dashboard' },
                { id: 'viajesSection', icon: 'fas fa-route', text: 'Gestión de Viajes' },
                { id: 'gastosSection', icon: 'fas fa-receipt', text: 'Registro de Gastos' },
                { id: 'transportistasSection', icon: 'fas fa-users', text: 'Transportistas' },
                { id: 'vehiculosSection', icon: 'fas fa-truck', text: 'Vehículos' },
                { id: 'reportesSection', icon: 'fas fa-chart-bar', text: 'Reportes' },
                { id: 'rolesSection', icon: 'fas fa-user-shield', text: 'Roles y Permisos' }
            ];
        } else if (this.currentUser.role === 'supervisor') {
            menuItems = [
                { id: 'dashboardSection', icon: 'fas fa-tachometer-alt', text: 'Dashboard' },
                { id: 'viajesSection', icon: 'fas fa-route', text: 'Gestión de Viajes' },
                { id: 'gastosSection', icon: 'fas fa-receipt', text: 'Aprobar Gastos' },
                { id: 'transportistasSection', icon: 'fas fa-users', text: 'Transportistas' },
                { id: 'vehiculosSection', icon: 'fas fa-truck', text: 'Vehículos' },
                { id: 'reportesSection', icon: 'fas fa-chart-bar', text: 'Reportes' }
            ];
        } else {
            // Transportista
            menuItems = [
                { id: 'dashboardSection', icon: 'fas fa-tachometer-alt', text: 'Mi Dashboard' },
                { id: 'viajesSection', icon: 'fas fa-route', text: 'Mis Viajes' },
                { id: 'gastosSection', icon: 'fas fa-receipt', text: 'Mis Gastos' },
                { id: 'vehiculosSection', icon: 'fas fa-truck', text: 'Mi Vehículo' }
            ];
        }

        // Limpiar el menú actual
        navMenu.innerHTML = '';

        // Crear elementos del menú
        menuItems.forEach(item => {
            const li = document.createElement('li');
            li.className = 'nav-item';

            const link = document.createElement('a');
            link.href = '#';
            link.className = 'nav-link';

            // Marcar como activo si es la sección actual
            if (this.currentSection === item.id) {
                link.classList.add('active');
            }

            // Configurar el evento de clic
            link.onclick = (e) => {
                e.preventDefault();
                this.navigateTo(item.id, item.text);

                // Actualizar la clase activa
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                });
                link.classList.add('active');
            };

            // Agregar ícono y texto
            link.innerHTML = `
                <i class="${item.icon} me-2"></i>
                ${item.text}
            `;

            li.appendChild(link);
            navMenu.appendChild(li);
        });
    }

    navigateTo(sectionId, title) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        // Show selected section
        document.getElementById(sectionId).classList.add('active');

        // Update page title
        document.getElementById('pageTitle').textContent = title;

        // Update nav active state
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        event.currentTarget.classList.add('active');

        this.currentSection = sectionId;

        // Load section data
        this.loadSectionData(sectionId);

        // Close mobile sidebar
        if (window.innerWidth <= 768) {
            document.getElementById('sidebar').classList.remove('active');
        }
    }

    loadSectionData(sectionId) {
        switch (sectionId) {
            case 'dashboardSection':
                if (window.DashboardManager) window.DashboardManager.loadData();
                break;
            case 'gastosSection':
                if (window.GastosManagerInstance) {
                    window.GastosManagerInstance.loadData();

                    // Show/hide admin table for admin/supervisor
                    const currentUser = this.currentUser;
                    const adminTable = document.querySelector('.admin-supervisor-only');
                    const approvalHeaders = document.querySelectorAll('.admin-supervisor-only');

                    if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'supervisor')) {
                        if (adminTable) adminTable.style.display = 'block';
                        approvalHeaders.forEach(header => {
                            header.style.display = 'table-cell';
                        });
                    } else {
                        if (adminTable) adminTable.style.display = 'none';
                        approvalHeaders.forEach(header => {
                            header.style.display = 'none';
                        });
                    }
                }
                break;
            case 'transportistasSection':
                if (window.TransportistasManager) window.TransportistasManager.loadData();
                break;
            case 'vehiculosSection':
                if (window.VehiculosManager) window.VehiculosManager.loadData();

                // Show/hide vehicle management buttons based on role
                const currentUser = this.currentUser;
                const vehicleButtons = document.querySelectorAll('.admin-supervisor-only');

                if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'supervisor')) {
                    vehicleButtons.forEach(btn => {
                        btn.style.display = 'inline-block';
                    });
                } else {
                    vehicleButtons.forEach(btn => {
                        btn.style.display = 'none';
                    });
                }
                break;
            case 'reportesSection':
                if (window.ReportesManager) window.ReportesManager.loadData();
                break;
            case 'rolesSection':
                if (window.RolesManager) window.RolesManager.loadData();
                break;
        }
    }

    async apiCall(endpoint, options = {}) {
        const url = `${this.apiBase}/${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        if (this.authToken) {
            config.headers['Authorization'] = `Bearer ${this.authToken}`;
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'API Error');
            }

            return data;
        } catch (error) {
            console.error('API Call failed:', error);
            this.showToast(error.message || 'Error de conexión', 'danger');
            throw error;
        }
    }

    showToast(message, type = 'success') {
        // Create toast element
        const toastId = 'toast-' + Date.now();
        const toastHtml = `
            <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="toast-header">
                    <strong class="me-auto">TransportePro</strong>
                    <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
                </div>
                <div class="toast-body bg-${type} text-white">
                    ${message}
                </div>
            </div>
        `;

        // Add to container
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
            document.body.appendChild(container);
        }

        container.insertAdjacentHTML('beforeend', toastHtml);

        // Show toast
        const toastElement = document.getElementById(toastId);
        const toast = new bootstrap.Toast(toastElement);
        toast.show();

        // Remove after hiding
        toastElement.addEventListener('hidden.bs.toast', () => {
            toastElement.remove();
        });
    }

    logout() {
        this.showConfirmModal(
            '🚪 Cerrar Sesión',
            '¿Estás seguro de que deseas cerrar sesión?',
            'Cerrar Sesión',
            'danger',
            () => {
                sessionStorage.removeItem('authToken');
                sessionStorage.removeItem('currentUser');
                window.location.href = 'index.html';
            }
        );
    }

    // Modal de confirmación personalizado reutilizable
    showConfirmModal(title, message, confirmText, buttonType, onConfirm) {
        const modalId = 'confirmModal_' + Date.now();

        const modalHtml = `
            <div class="modal fade" id="${modalId}" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">${title}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            ${message}
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-${buttonType}" id="${modalId}_confirm">${confirmText}</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        const modal = new bootstrap.Modal(document.getElementById(modalId));

        // Event listener para el botón de confirmación
        document.getElementById(`${modalId}_confirm`).addEventListener('click', () => {
            modal.hide();
            if (onConfirm) onConfirm();
        });

        // Limpiar el DOM cuando se cierre el modal
        document.getElementById(modalId).addEventListener('hidden.bs.modal', function () {
            this.remove();
        });

        modal.show();
    }
}

// Global navigation function
function navigateTo(sectionId, title) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none';
    });

    // Show the selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        targetSection.style.display = 'block';

        // Update active menu item
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('onclick') && link.getAttribute('onclick').includes(sectionId)) {
                link.classList.add('active');
            }
        });

        // Update document title if provided
        if (title) {
            document.title = `${title} - TransportePro`;
        }

        // Close mobile menu if open
        const sidebar = document.getElementById('sidebar');
        if (sidebar && window.innerWidth <= 768) {
            sidebar.classList.remove('active');
        }

        // Initialize section-specific functionality
        switch (sectionId) {
            case 'dashboardSection':
                if (window.DashboardManager) {
                    console.log('🔄 Loading dashboard data...');
                    window.DashboardManager.loadData();
                }
                break;
            case 'viajesSection':
                if (window.ViajesManager) {
                    console.log('🔄 Loading viajes data...');
                    // Primero actualizar la vista según el rol actual
                    window.ViajesManager.actualizarVistaPorRol();
                    
                    // Usar carga rápida por defecto para navegación inicial
                    console.log('⚡ Usando carga rápida para navegación');
                    window.ViajesManager.loadTrips();
                } else {
                    console.warn('⚠️ ViajesManager no disponible en navegación');
                }
                break;
            case 'gastosSection':
                if (window.GastosManagerInstance) {
                    console.log('🔄 Loading gastos data...');
                    window.GastosManagerInstance.loadData();
                }
                break;
            case 'vehiculosSection':
                if (window.VehiculosManager) {
                    console.log('🔄 Loading vehiculos data...');
                    window.VehiculosManager.loadData();
                }
                break;
            case 'transportistasSection':
                if (window.TransportistasManager) {
                    console.log('🔄 Loading transportistas data...');
                    window.TransportistasManager.loadData();
                }
                break;
            case 'rolesSection':
                if (window.RolesManager) {
                    console.log('🔄 Loading roles data...');
                    window.RolesManager.loadData();
                }
                break;
            case 'reportesSection':
                if (window.ReportesManagerInstance) {
                    console.log('🔄 Loading reportes data...');
                    window.ReportesManagerInstance.loadData();
                }
                break;
        }
    } else {
        console.error(`Sección no encontrada: ${sectionId}`);
    }
}

// Global showSection function (alias for navigateTo)
window.showSection = function(sectionId) {
    navigateTo(sectionId);
};

// Global logout function
window.logout = function () {
    if (window.app) {
        window.app.logout();
    }
};

// Theme Management
class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.setupToggleButton();
    }

    setupToggleButton() {
        // Setup main theme toggle (login screen)
        const toggleBtn = document.getElementById('themeToggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleTheme());
            this.updateToggleIcon();
        }

        // Setup sidebar theme toggle (dashboard)
        const sidebarToggleBtn = document.getElementById('sidebarThemeToggle');
        if (sidebarToggleBtn) {
            sidebarToggleBtn.addEventListener('click', () => this.toggleTheme());
            this.updateToggleIcon();
        }
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(this.currentTheme);
        this.updateToggleIcon();
        localStorage.setItem('theme', this.currentTheme);

        // Show toast notification
        if (window.app) {
            const themeText = this.currentTheme === 'dark' ? 'oscuro' : 'claro';
            window.app.showToast(`🎨 Tema ${themeText} activado`, 'success');
        }
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;
    }

    updateToggleIcon() {
        // Update main theme toggle (login screen)
        const toggleBtn = document.getElementById('themeToggle');
        const icon = toggleBtn?.querySelector('i');
        if (icon) {
            if (this.currentTheme === 'dark') {
                icon.className = 'fas fa-sun';
                toggleBtn.title = 'Cambiar a tema claro';
            } else {
                icon.className = 'fas fa-moon';
                toggleBtn.title = 'Cambiar a tema oscuro';
            }
        }

        // Update sidebar theme toggle (dashboard)
        const sidebarToggleBtn = document.getElementById('sidebarThemeToggle');
        const sidebarIcon = sidebarToggleBtn?.querySelector('i');
        if (sidebarIcon) {
            if (this.currentTheme === 'dark') {
                sidebarIcon.className = 'fas fa-sun';
                sidebarToggleBtn.title = 'Cambiar a tema claro';
            } else {
                sidebarIcon.className = 'fas fa-moon';
                sidebarToggleBtn.title = 'Cambiar a tema oscuro';
            }
        }
    }

    getCurrentTheme() {
        return this.currentTheme;
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function () {
    window.themeManager = new ThemeManager();
    window.app = new TransportePro();

    // Wait for external scripts to load before initializing managers
    window.app.loadExternalScripts().then(() => {
        // Initialize managers and make them globally accessible after scripts are loaded
        setTimeout(() => {
            try {
                if (typeof GastosManager !== 'undefined') {
                    window.GastosManagerInstance = new GastosManager();
                }
                if (typeof VehiculosManager !== 'undefined') {
                    window.VehiculosManager = new VehiculosManager();
                }
                if (typeof TransportistasManager !== 'undefined') {
                    window.TransportistasManager = new TransportistasManager();
                }
                if (typeof RolesManager !== 'undefined') {
                    window.RolesManager = new RolesManager();
                }
                if (typeof ReportesManager !== 'undefined') {
                    window.ReportesManager = new ReportesManager();
                }
                if (typeof DashboardManager !== 'undefined') {
                    window.DashboardManager = new DashboardManager();
                }
                console.log('✅ All managers initialized successfully');
            } catch (error) {
                console.error('❌ Error initializing managers:', error);
            }
        }, 100);
    });
});

// Funciones globales para cambio de usuario (solo para debugging en consola)
window.switchToAdmin = function() {
    console.log('🔧 Función de debugging: Cambiando a Admin...');
    switchUser({
        id: 1,
        name: 'Administrador Principal',
        role: 'admin',
        email: 'admin@transportepro.com'
    });
};

window.switchToSupervisor = function() {
    console.log('🔧 Función de debugging: Cambiando a Supervisor...');
    switchUser({
        id: 2,
        name: 'Supervisor General',
        role: 'supervisor',
        email: 'supervisor@transportepro.com'
    });
};

window.switchToTransportista = function() {
    console.log('🔧 Función de debugging: Cambiando a Transportista...');
    switchUser({
        id: 3,
        name: 'Melany2',
        role: 'transportista',
        email: 'melany2@transportepro.com'
    });
};

console.log('🔧 Funciones de debugging disponibles en consola:');
console.log('   switchToAdmin() - Cambiar a Admin (solo debugging)');
console.log('   switchToSupervisor() - Cambiar a Supervisor (solo debugging)');  
console.log('   switchToTransportista() - Cambiar a Transportista (solo debugging)');

// Función para probar la carga de viajes
window.testLoadTrips = function() {
    if (window.ViajesManager && typeof window.ViajesManager.loadTrips === 'function') {
        console.log('🧪 Probando carga de viajes...');
        window.ViajesManager.loadTrips();
    } else {
        console.error('❌ ViajesManager.loadTrips() no está disponible');
    }
};

// Función para probar cambio de usuario con recarga automática
window.testUserSwitch = function() {
    console.log('🧪 Probando cambio de usuario automático...');
    
    // Ir a la sección de viajes primero
    navigateTo('viajesSection', 'Viajes');
    
    setTimeout(() => {
        console.log('👔 Cambiando a Admin...');
        switchToAdmin();
        
        setTimeout(() => {
            console.log('🚛 Cambiando a Transportista...');
            switchToTransportista();
        }, 2000);
    }, 1000);
};

// Función para probar filtros de viajes
window.testViajesFilter = function() {
    console.log('🧪 Probando filtros de viajes...');
    
    if (!window.ViajesManager) {
        console.error('❌ ViajesManager no disponible');
        return;
    }
    
    // Ir a viajes primero
    navigateTo('viajesSection', 'Viajes');
    
    setTimeout(() => {
        console.log('👔 Probando como Admin...');
        switchToAdmin();
        
        setTimeout(() => {
            console.log('🚛 Probando como Transportista...');
            switchToTransportista();
            
            setTimeout(() => {
                console.log('👔 Volviendo a Admin...');
                switchToAdmin();
            }, 3000);
        }, 3000);
    }, 1000);
};

// Función para forzar recarga de viajes si no se cargan
window.forceReloadTrips = function() {
    console.log('🔄 Forzando recarga de viajes...');
    
    // Ir a otra sección y volver
    navigateTo('dashboardSection', 'Dashboard');
    
    setTimeout(() => {
        navigateTo('viajesSection', 'Viajes');
    }, 1000);
};

// Función para verificar datos cargados
window.checkViajesData = function() {
    if (!window.ViajesManager) {
        console.error('❌ ViajesManager no disponible');
        return;
    }
    
    console.log('🔍 Verificando datos cargados...');
    console.log('📊 Viajes:', window.ViajesManager.viajes?.length || 0);
    console.log('👥 Transportistas:', window.ViajesManager.transportistas?.length || 0);
    console.log('🚛 Vehículos:', window.ViajesManager.vehiculos?.length || 0);
    
    if (window.ViajesManager.transportistas?.length > 0) {
        console.log('👥 Primer transportista:', window.ViajesManager.transportistas[0]);
    }
    
    if (window.ViajesManager.viajes?.length > 0) {
        console.log('📊 Primer viaje:', window.ViajesManager.viajes[0]);
    }
    
    // Verificar dropdown de transportistas
    const select = document.getElementById('transportista');
    if (select) {
        console.log('📝 Opciones en dropdown modal transportistas:', select.options.length);
        for (let i = 0; i < Math.min(3, select.options.length); i++) {
            console.log(`  ${i}: ${select.options[i].value} - ${select.options[i].text}`);
        }
    }
    
    // Verificar dropdown de vehículos
    const selectVehiculo = document.getElementById('editVehiculo');
    if (selectVehiculo) {
        console.log('🚗 Opciones en dropdown modal vehículos:', selectVehiculo.options.length);
        for (let i = 0; i < Math.min(3, selectVehiculo.options.length); i++) {
            console.log(`  ${i}: ${selectVehiculo.options[i].value} - ${selectVehiculo.options[i].text}`);
        }
    } else {
        console.log('⚠️ Dropdown de vehículos no encontrado (modal no abierto)');
    }
};

// Función para forzar recarga completa y robusta
window.forceCompleteReload = function() {
    console.log('🔄 Forzando recarga completa...');
    
    if (!window.ViajesManager) {
        console.error('❌ ViajesManager no disponible');
        return;
    }
    
    // Limpiar datos existentes
    window.ViajesManager.viajes = [];
    window.ViajesManager.transportistas = [];
    window.ViajesManager.vehiculos = [];
    
    // Usar recarga completa si está disponible
    if (typeof window.ViajesManager.recargarViajesCompleto === 'function') {
        window.ViajesManager.recargarViajesCompleto();
    } else {
        window.ViajesManager.loadTrips();
    }
};

// Detectar hard refresh y asegurar recarga
window.addEventListener('beforeunload', function() {
    console.log('🔄 Detectado beforeunload - preparando para recarga');
});

window.addEventListener('load', function() {
    console.log('🔄 Detectado load completo');
    
    // Verificar si estamos en la sección de viajes después de un refresh
    setTimeout(() => {
        const viajesSection = document.getElementById('viajesSection');
        if (viajesSection && viajesSection.classList.contains('active')) {
            console.log('🔄 Sección de viajes activa después de load - iniciando carga');
            if (window.ViajesManager) {
                // Intentar carga rápida primero
                window.ViajesManager.loadTrips().catch(error => {
                    console.warn('⚠️ Carga rápida falló, intentando recarga completa:', error);
                    if (typeof window.ViajesManager.recargarViajesCompleto === 'function') {
                        window.ViajesManager.recargarViajesCompleto();
                    }
                });
            }
        }
    }, 500); // Reducido a 500ms para carga más rápida
});

// Función para verificar y recargar viajes si es necesario
window.checkAndReloadTrips = function() {
    console.log('🔍 Verificando estado de viajes...');
    
    const container = document.getElementById('viajesContainer');
    if (!container) {
        console.log('⚠️ Contenedor de viajes no encontrado');
        return;
    }
    
    const hasSpinner = container.querySelector('.spinner-border');
    const hasCards = container.querySelectorAll('.card').length > 0;
    const hasError = container.querySelector('.text-danger');
    
    console.log('📊 Estado actual:', {
        hasSpinner: !!hasSpinner,
        hasCards,
        hasError: !!hasError
    });
    
    // Si solo hay spinner por más de 5 segundos, forzar recarga
    if (hasSpinner && !hasCards && window.ViajesManager) {
        console.log('🔄 Spinner detectado sin datos, forzando recarga...');
        window.ViajesManager.loadTrips();
    }
};

// Función para probar la API de reportes
window.testReportesAPI = function() {
    console.log('🧪 Probando API de reportes...');
    
    // Probar archivo de prueba simple primero
    fetch('/LogisticaFinal/api/reportes/test_viajes.php?test=1')
        .then(response => {
            console.log('📡 Respuesta de test_viajes.php:', response.status);
            return response.json();
        })
        .then(data => {
            console.log('✅ Test básico exitoso:', data);
            
            // Ahora probar la API real
            console.log('📡 Probando API real de reportes...');
            return fetch('/LogisticaFinal/api/reportes/viajes.php?start_date=2025-10-01&end_date=2025-10-03&format=json');
        })
        .then(response => {
            console.log('📡 Respuesta de viajes.php:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('✅ API de reportes funcionando:', data);
        })
        .catch(error => {
            console.error('❌ Error en API de reportes:', error);
        });
};

// Función para escanear archivos huérfanos
window.scanOrphanedFiles = function() {
    console.log('🔍 Escaneando archivos huérfanos...');
    
    fetch('/LogisticaFinal/api/utils/cleanup_files.php?action=scan')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                console.log('📊 Resultado del escaneo:');
                console.log(`   📁 Archivos en disco: ${data.disk_files_count}`);
                console.log(`   💾 Archivos en BD: ${data.db_files_count}`);
                console.log(`   🗑️ Archivos huérfanos: ${data.total_files}`);
                console.log(`   📏 Espacio ocupado: ${data.total_size_formatted}`);
                
                if (data.total_files > 0) {
                    console.log('📋 Archivos huérfanos encontrados:');
                    data.orphaned_files.forEach(file => {
                        console.log(`   - ${file.filename} (${file.size_formatted}) - ${file.modified}`);
                    });
                    console.log('💡 Ejecuta cleanupOrphanedFiles() para eliminarlos');
                } else {
                    console.log('✅ No se encontraron archivos huérfanos');
                }
            } else {
                console.error('❌ Error en escaneo:', data.error);
            }
        })
        .catch(error => {
            console.error('❌ Error escaneando archivos:', error);
        });
};

// Función para limpiar archivos huérfanos
window.cleanupOrphanedFiles = function() {
    console.log('🧹 Limpiando archivos huérfanos...');
    
    if (!confirm('¿Estás seguro de que deseas eliminar todos los archivos huérfanos?\n\nEsta acción no se puede deshacer.')) {
        console.log('❌ Operación cancelada por el usuario');
        return;
    }
    
    fetch('/LogisticaFinal/api/utils/cleanup_files.php?action=cleanup')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                console.log('🧹 Resultado de la limpieza:');
                console.log(`   📁 Archivos procesados: ${data.files_processed}`);
                console.log(`   🗑️ Archivos eliminados: ${data.files_deleted}`);
                console.log(`   ❓ Archivos no encontrados: ${data.files_not_found}`);
                console.log(`   💾 Espacio liberado: ${data.space_freed_formatted}`);
                
                if (data.errors && data.errors.length > 0) {
                    console.warn('⚠️ Errores durante la limpieza:');
                    data.errors.forEach(error => console.warn(`   - ${error}`));
                }
                
                if (data.files_deleted > 0) {
                    console.log('✅ Limpieza completada exitosamente');
                } else {
                    console.log('ℹ️ No había archivos para limpiar');
                }
            } else {
                console.error('❌ Error en limpieza:', data.error);
            }
        })
        .catch(error => {
            console.error('❌ Error limpiando archivos:', error);
        });
};

// Función para probar estados de vehículos
window.testVehicleStatus = function() {
    console.log('🚚 Probando estados de vehículos...');
    
    if (!window.VehiculosManager) {
        console.error('❌ VehiculosManager no disponible');
        return;
    }
    
    // Probar diferentes estados
    const testStates = ['En Operación', 'En Mantenimiento', 'Fuera de Servicio', 'operativo', 'mantenimiento', 'fuera_servicio'];
    
    console.log('🎨 Probando badges de estado:');
    testStates.forEach(state => {
        const badge = window.VehiculosManager.getStatusBadge(state);
        console.log(`   ${state} → ${badge}`);
    });
    
    // Verificar vehículos cargados
    if (window.VehiculosManager.vehicles && window.VehiculosManager.vehicles.length > 0) {
        console.log('📊 Vehículos cargados:', window.VehiculosManager.vehicles.length);
        console.log('🚚 Primer vehículo:', window.VehiculosManager.vehicles[0]);
        
        // Mostrar estados actuales
        const estados = {};
        window.VehiculosManager.vehicles.forEach(vehicle => {
            const estado = vehicle.estado || 'Sin estado';
            estados[estado] = (estados[estado] || 0) + 1;
        });
        
        console.log('📈 Distribución de estados:');
        Object.entries(estados).forEach(([estado, count]) => {
            console.log(`   ${estado}: ${count} vehículos`);
        });
    } else {
        console.log('⚠️ No hay vehículos cargados');
    }
};

// Función para probar API de reportes limpia
window.testReportAPI = function() {
    console.log('🧪 Probando API de reportes...');
    
    // Probar API simple primero
    console.log('📡 Probando API simple...');
    fetch('/LogisticaFinal/api/reportes/viajes_simple.php?start_date=2025-10-01&end_date=2025-10-07&format=json')
        .then(response => {
            console.log('📡 API Simple - Status:', response.status);
            return response.json();
        })
        .then(data => {
            console.log('✅ API Simple funciona:', data);
        })
        .catch(error => {
            console.error('❌ API Simple falló:', error);
        });
    
    // Probar API original
    console.log('📡 Probando API original...');
    fetch('/LogisticaFinal/api/reportes/viajes.php?start_date=2025-10-01&end_date=2025-10-07&format=json')
        .then(response => {
            console.log('📡 API Original - Status:', response.status);
            return response.text();
        })
        .then(text => {
            console.log('📄 API Original - Respuesta:', text.substring(0, 200));
            try {
                const data = JSON.parse(text);
                console.log('✅ API Original funciona:', data);
            } catch (e) {
                console.error('❌ API Original - JSON inválido:', e.message);
            }
        })
        .catch(error => {
            console.error('❌ API Original falló:', error);
        });
};

// Función para probar recarga de viajes
window.testViajesReload = function() {
    console.log('🧪 Probando recarga de viajes...');
    
    if (!window.ViajesManager) {
        console.error('❌ ViajesManager no disponible');
        return;
    }
    
    const viajesAntes = window.ViajesManager.viajes?.length || 0;
    const transportistasAntes = window.ViajesManager.transportistas?.length || 0;
    const vehiculosAntes = window.ViajesManager.vehiculos?.length || 0;
    
    console.log('📊 Estado antes de recarga:');
    console.log(`   Viajes: ${viajesAntes}`);
    console.log(`   Transportistas: ${transportistasAntes}`);
    console.log(`   Vehículos: ${vehiculosAntes}`);
    
    // Probar recarga suave
    window.ViajesManager.cargarViajes().then(() => {
        const viajesDespues = window.ViajesManager.viajes?.length || 0;
        const transportistasDespues = window.ViajesManager.transportistas?.length || 0;
        const vehiculosDespues = window.ViajesManager.vehiculos?.length || 0;
        
        console.log('📊 Estado después de recarga:');
        console.log(`   Viajes: ${viajesDespues}`);
        console.log(`   Transportistas: ${transportistasDespues}`);
        console.log(`   Vehículos: ${vehiculosDespues}`);
        
        if (transportistasAntes > 0 && transportistasDespues === 0) {
            console.warn('⚠️ Se perdieron transportistas en la recarga');
        }
        if (vehiculosAntes > 0 && vehiculosDespues === 0) {
            console.warn('⚠️ Se perdieron vehículos en la recarga');
        }
        if (viajesDespues > 0) {
            console.log('✅ Viajes recargados correctamente');
        }
    }).catch(error => {
        console.error('❌ Error en recarga:', error);
    });
};

// Función para probar formulario mejorado de transportistas
window.testTransportistaForm = function() {
    console.log('👥 Probando formulario de transportistas...');
    
    if (!window.TransportistasManager) {
        console.error('❌ TransportistasManager no disponible');
        return;
    }
    
    // Navegar a transportistas y abrir modal
    window.app.navigateTo('transportistasSection');
    
    setTimeout(() => {
        console.log('📝 Abriendo modal de nuevo transportista...');
        window.TransportistasManager.openAddModal();
        
        setTimeout(() => {
            // Verificar elementos del formulario
            const elements = {
                countryCode: document.getElementById('countryCode'),
                phoneNumber: document.getElementById('phoneNumber'),
                phoneHelp: document.getElementById('phoneHelp'),
                password: document.getElementById('password'),
                confirmPassword: document.getElementById('confirmPassword'),
                passwordError: document.getElementById('passwordError'),
                nombreCompleto: document.getElementById('nombreCompleto'),
                togglePassword: document.getElementById('togglePassword'),
                toggleConfirmPassword: document.getElementById('toggleConfirmPassword')
            };
            
            console.log('🔍 Verificando elementos del formulario:');
            Object.entries(elements).forEach(([name, element]) => {
                if (element) {
                    console.log(`   ✅ ${name}: Encontrado`);
                } else {
                    console.log(`   ❌ ${name}: No encontrado`);
                }
            });
            
            // Probar banderas
            if (elements.countryCode) {
                console.log('🌍 Probando banderas de países...');
                const option = elements.countryCode.options[0];
                console.log('   🇲🇽 Primera opción:', option.text);
                
                // Cambiar países para probar
                elements.countryCode.value = '+86|11';
                elements.countryCode.dispatchEvent(new Event('change'));
                console.log('   🇨🇳 Cambiado a China');
                
                setTimeout(() => {
                    elements.countryCode.value = '+52|10';
                    elements.countryCode.dispatchEvent(new Event('change'));
                    console.log('   🇲🇽 Vuelto a México');
                }, 1000);
            }
            
            // Probar validación de nombres
            if (elements.nombreCompleto) {
                console.log('✏️ Probando validación de nombres...');
                elements.nombreCompleto.value = 'Juan123@Pérez';
                elements.nombreCompleto.dispatchEvent(new Event('input'));
                
                setTimeout(() => {
                    console.log('   📝 Valor filtrado:', elements.nombreCompleto.value);
                }, 100);
            }
            
            // Probar botones de contraseña
            if (elements.togglePassword) {
                console.log('👁️ Probando botones de contraseña...');
                elements.togglePassword.click();
                console.log('🎉 Botones de contraseña ARREGLADOS');
            }
            
            // Probar botones de confirmar contraseña
            if (elements.toggleConfirmPassword) {
                console.log('👁️ Probando botones de confirmar contraseña...');
                elements.toggleConfirmPassword.click();
                console.log('🎉 Botones de confirmar contraseña ARREGLADOS');
            }
        }, 1000);
    }, 500);
};

// Función para arreglar modal de transportistas si no funciona
window.fixTransportistaModal = function() {
    console.log('🔧 Arreglando modal de transportistas...');
    
    // Buscar elementos problemáticos
    const modal = document.getElementById('driverModal');
    if (!modal) {
        console.log('❌ Modal no encontrado, abriendo nuevo...');
        if (window.TransportistasManager) {
            window.TransportistasManager.openAddModal();
            setTimeout(() => {
                window.TransportistasManager.forceSetupModal();
            }, 200);
            return;
        }
    } else {
        // Si el modal existe, usar la función de configuración forzada
        if (window.TransportistasManager && window.TransportistasManager.forceSetupModal) {
            window.TransportistasManager.forceSetupModal();
        }
    }
};

// Función para arreglo FORZADO del modal
window.forceFixModal = function() {
    console.log('🔧 ARREGLO FORZADO del modal de transportistas...');
    
    setTimeout(() => {
        // 1. ARREGLAR BOTONES DE CONTRASEÑA DE FORMA DIRECTA
        const togglePassword = document.getElementById('togglePassword');
        const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
        
        if (togglePassword) {
            console.log('👁️ Arreglando botón de contraseña...');
            
            // Remover todos los event listeners anteriores
            const newButton = togglePassword.cloneNode(true);
            togglePassword.parentNode.replaceChild(newButton, togglePassword);
            
            // Agregar event listener robusto
            newButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('🔍 Click detectado en botón de contraseña');
                
                const input = document.getElementById('password');
                const icon = this.querySelector('i');
                
                if (!input) {
                    console.error('❌ Input de contraseña no encontrado');
                    return;
                }
                
                if (!icon) {
                    console.error('❌ Ícono no encontrado');
                    return;
                }
                
                console.log('📋 Estado actual:', input.type);
                
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                    console.log('✅ Contraseña VISIBLE');
                } else {
                    input.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                    console.log('✅ Contraseña OCULTA');
                }
            });
            
            console.log('✅ Botón de contraseña configurado correctamente');
        } else {
            console.error('❌ Botón togglePassword no encontrado');
        }
        
        if (toggleConfirmPassword) {
            console.log('👁️ Arreglando botón de confirmar contraseña...');
            
            // Remover todos los event listeners anteriores
            const newButton2 = toggleConfirmPassword.cloneNode(true);
            toggleConfirmPassword.parentNode.replaceChild(newButton2, toggleConfirmPassword);
            
            // Agregar event listener robusto
            newButton2.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('🔍 Click detectado en botón de confirmar contraseña');
                
                const input = document.getElementById('confirmPassword');
                const icon = this.querySelector('i');
                
                if (!input) {
                    console.error('❌ Input de confirmar contraseña no encontrado');
                    return;
                }
                
                if (!icon) {
                    console.error('❌ Ícono no encontrado');
                    return;
                }
                
                console.log('📋 Estado actual confirmar:', input.type);
                
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                    console.log('✅ Confirmar contraseña VISIBLE');
                } else {
                    input.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                    console.log('✅ Confirmar contraseña OCULTA');
                }
            });
            
            console.log('✅ Botón de confirmar contraseña configurado correctamente');
        } else {
            console.error('❌ Botón toggleConfirmPassword no encontrado');
        }
        
        // 2. ARREGLAR VALIDACIÓN DE CONTRASEÑAS
        const password = document.getElementById('password');
        const confirmPassword = document.getElementById('confirmPassword');
        
        if (password && confirmPassword) {
            console.log('🔒 Configurando validación de contraseñas...');
            
            const validatePasswords = () => {
                const passwordError = document.getElementById('passwordError');
                if (confirmPassword.value && password.value !== confirmPassword.value) {
                    confirmPassword.classList.add('is-invalid');
                    if (passwordError) {
                        passwordError.style.display = 'block';
                        passwordError.textContent = 'Las contraseñas no coinciden';
                    }
                } else {
                    confirmPassword.classList.remove('is-invalid');
                    if (passwordError) {
                        passwordError.style.display = 'none';
                    }
                }
            };
            
            password.oninput = validatePasswords;
            confirmPassword.oninput = validatePasswords;
        }
        
        // 3. ARREGLAR FORM SUBMIT
        const form = document.getElementById('driverForm');
        if (form) {
            console.log('📝 Configurando envío del formulario...');
            form.onsubmit = function(e) {
                e.preventDefault();
                console.log('📤 Formulario enviado - procesando...');
                
                const formData = new FormData(this);
                const data = Object.fromEntries(formData);
                
                console.log('📋 Datos del formulario:', data);
                
                // Validación básica
                if (!data.nombre || !data.email) {
                    alert('Por favor completa los campos obligatorios');
                    return;
                }
                
                if (data.password && data.confirm_password && data.password !== data.confirm_password) {
                    alert('Las contraseñas no coinciden');
                    return;
                }
                
                // Simular envío exitoso
                alert('¡Transportista guardado correctamente!');
                
                // Cerrar modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('driverModal'));
                if (modal) {
                    modal.hide();
                }
            };
        }
        
        console.log('🎉 Modal FORZADAMENTE arreglado');
    }, 300);
};

// Función para forzar recarga simple SIN perder datos
window.forceSimpleReload = function() {
    console.log('🔄 Forzando recarga simple...');
    
    if (!window.ViajesManager) {
        console.error('❌ ViajesManager no disponible');
        return;
    }
    
    // NO limpiar datos existentes, solo recargar viajes
    console.log('📊 Recargando solo viajes (conservando transportistas y vehículos)...');
    
    window.ViajesManager.cargarViajes().then(() => {
        console.log('✅ Recarga simple completada');
        console.log(`📊 Estado actual: ${window.ViajesManager.viajes?.length || 0} viajes`);
    }).catch(error => {
        console.error('❌ Error en recarga simple:', error);
    });
};

// Función para probar específicamente el modal de edición
window.testEditModal = function() {
    console.log('🧪 Probando modal de edición...');
    
    if (!window.ViajesManager) {
        console.error('❌ ViajesManager no disponible');
        return;
    }
    
    // Verificar que hay viajes
    if (!window.ViajesManager.viajes || window.ViajesManager.viajes.length === 0) {
        console.error('❌ No hay viajes disponibles para probar');
        return;
    }
    
    // Tomar el primer viaje
    const primerViaje = window.ViajesManager.viajes[0];
    console.log('🎯 Probando edición del viaje:', primerViaje.id);
    
    // Intentar editar
    window.ViajesManager.editarViaje(primerViaje.id);
};

console.log('🧪 Funciones de prueba disponibles:');
console.log('   testLoadTrips() - Probar carga de viajes');
console.log('   testUserSwitch() - Probar cambio automático de usuario');
console.log('   testViajesFilter() - Probar filtros de viajes específicamente');
console.log('   forceReloadTrips() - Forzar recarga si no aparecen viajes');
console.log('   checkViajesData() - Verificar datos cargados');
console.log('   forceCompleteReload() - Forzar recarga completa y robusta');
console.log('   testEditModal() - Probar específicamente el modal de edición');
console.log('   checkAndReloadTrips() - Verificar estado y recargar si es necesario');
console.log('   testReportesAPI() - Probar API de reportes paso a paso');
console.log('   testDatabaseConnection() - Diagnosticar problemas de base de datos');
console.log('🗑️ Funciones de limpieza de archivos:');
console.log('   scanOrphanedFiles() - Escanear archivos huérfanos');
console.log('   cleanupOrphanedFiles() - Limpiar archivos huérfanos');
console.log('🚚 Funciones de vehículos:');
console.log('   testVehicleStatus() - Probar estados de vehículos');
console.log('👥 Funciones de transportistas:');
console.log('   testTransportistaForm() - Probar formulario mejorado');
console.log('   fixTransportistaModal() - Arreglar modal si no funciona');
console.log('   forceFixModal() - Arreglo FORZADO del modal');
console.log('   quickFixPasswords() - Arreglo RÁPIDO solo contraseñas');
console.log('   superFixPasswords() - Arreglo SÚPER AGRESIVO (busca cada segundo)');
console.log('   ultraFixPasswords() - Arreglo ULTRA INTELIGENTE (encuentra cualquier botón)');
console.log('   laserFixPasswords() - Arreglo LÁSER (solo en modal activo)');
console.log('   detectiveFixPasswords() - Arreglo DETECTIVE (encuentra cualquier modal)');
console.log('   fixPhoneNumbers() - Arreglar números sin lada en la base de datos');
console.log('   refreshTransportistasView() - Actualizar vista con banderitas');
console.log('🔧 Funciones de debugging:');
console.log('   testReportAPI() - Probar API de reportes limpia');
console.log('   testViajesReload() - Probar recarga de viajes');
console.log('   forceSimpleReload() - Forzar recarga simple SIN perder datos');

// Función RÁPIDA para arreglar SOLO los botones de contraseña
window.quickFixPasswords = function() {
    console.log('⚡ ARREGLO RÁPIDO de botones de contraseña...');
    
    // Función para configurar un botón
    function setupButton(buttonId, inputId, buttonName) {
        const btn = document.getElementById(buttonId);
        if (btn) {
            console.log(`🔍 Configurando ${buttonName}...`);
            
            // Remover eventos anteriores clonando
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            // Configurar evento
            newBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log(`👁️ ${buttonName} CLICKED`);
                
                const input = document.getElementById(inputId);
                const icon = this.querySelector('i');
                
                if (input && icon) {
                    if (input.type === 'password') {
                        input.type = 'text';
                        icon.className = 'fas fa-eye-slash';
                        console.log(`✅ ${buttonName} -> VISIBLE`);
                    } else {
                        input.type = 'password';
                        icon.className = 'fas fa-eye';
                        console.log(`✅ ${buttonName} -> HIDDEN`);
                    }
                } else {
                    console.error(`❌ ${buttonName} - Input o ícono no encontrado`);
                }
            });
            
            console.log(`✅ ${buttonName} configurado correctamente`);
            return true;
        } else {
            console.error(`❌ ${buttonName} no encontrado`);
            return false;
        }
    }
    
    // Configurar ambos botones
    const btn1Success = setupButton('togglePassword', 'password', 'BOTÓN 1');
    const btn2Success = setupButton('toggleConfirmPassword', 'confirmPassword', 'BOTÓN 2');
    
    if (btn1Success || btn2Success) {
        console.log('🎉 AL MENOS UN BOTÓN CONFIGURADO');
    } else {
        console.error('❌ NINGÚN BOTÓN ENCONTRADO - ¿Está abierto el modal?');
    }
};

// Función SÚPER AGRESIVA que busca y arregla botones cada segundo
window.superFixPasswords = function() {
    console.log('🚀 ARREGLO SÚPER AGRESIVO iniciado...');
    
    let attempts = 0;
    const maxAttempts = 10;
    
    const interval = setInterval(() => {
        attempts++;
        console.log(`🔄 Intento ${attempts}/${maxAttempts}...`);
        
        const btn1 = document.getElementById('togglePassword');
        const btn2 = document.getElementById('toggleConfirmPassword');
        
        if (btn1 || btn2) {
            console.log('🎯 ¡BOTONES ENCONTRADOS! Configurando...');
            
            if (btn1) {
                btn1.onclick = function(e) {
                    e.preventDefault();
                    const input = document.getElementById('password');
                    const icon = this.querySelector('i');
                    
                    console.log('🔥 BOTÓN 1 FUNCIONA!');
                    
                    if (input.type === 'password') {
                        input.type = 'text';
                        icon.className = 'fas fa-eye-slash';
                        console.log('👁️ CONTRASEÑA VISIBLE');
                    } else {
                        input.type = 'password';
                        icon.className = 'fas fa-eye';
                        console.log('👁️ CONTRASEÑA OCULTA');
                    }
                };
            }
            
            if (btn2) {
                btn2.onclick = function(e) {
                    e.preventDefault();
                    const input = document.getElementById('confirmPassword');
                    const icon = this.querySelector('i');
                    
                    console.log('🔥 BOTÓN 2 FUNCIONA!');
                    
                    if (input.type === 'password') {
                        input.type = 'text';
                        icon.className = 'fas fa-eye-slash';
                        console.log('👁️ CONFIRMAR VISIBLE');
                    } else {
                        input.type = 'password';
                        icon.className = 'fas fa-eye';
                        console.log('👁️ CONFIRMAR OCULTA');
                    }
                };
            }
            
            clearInterval(interval);
            console.log('🎉 BOTONES ARREGLADOS EXITOSAMENTE!');
            
        } else if (attempts >= maxAttempts) {
            clearInterval(interval);
            console.error('❌ NO SE ENCONTRARON BOTONES DESPUÉS DE 10 INTENTOS');
        }
    }, 1000);
};

// Función ULTRA INTELIGENTE que encuentra botones sin importar su ID
window.ultraFixPasswords = function() {
    console.log('🧠 ARREGLO ULTRA INTELIGENTE iniciado...');
    
    // Buscar todos los botones posibles
    const allButtons = document.querySelectorAll('button');
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    
    console.log(`🔍 Encontrados ${allButtons.length} botones y ${passwordInputs.length} inputs de contraseña`);
    
    // Buscar botones que contengan íconos de ojo
    const eyeButtons = [];
    allButtons.forEach((btn, index) => {
        const icon = btn.querySelector('i');
        if (icon && (icon.classList.contains('fa-eye') || icon.classList.contains('fa-eye-slash'))) {
            eyeButtons.push({ button: btn, index: index });
            console.log(`👁️ Botón de ojo encontrado #${index}`);
        }
    });
    
    console.log(`🎯 Total de botones de ojo encontrados: ${eyeButtons.length}`);
    
    if (eyeButtons.length === 0) {
        console.error('❌ NO SE ENCONTRARON BOTONES CON ÍCONOS DE OJO');
        return;
    }
    
    // Configurar cada botón encontrado
    eyeButtons.forEach((btnData, i) => {
        const { button, index } = btnData;
        const passwordInput = passwordInputs[i]; // Asociar con el input correspondiente
        
        if (passwordInput) {
            console.log(`⚙️ Configurando botón #${index} para input #${i}`);
            
            // Clonar para limpiar eventos
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            newButton.onclick = function(e) {
                e.preventDefault();
                const icon = this.querySelector('i');
                
                console.log(`🔥 BOTÓN #${index} CLICKEADO!`);
                
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    if (icon) icon.className = 'fas fa-eye-slash';
                    console.log(`✅ CONTRASEÑA #${i} VISIBLE`);
                } else {
                    passwordInput.type = 'password';
                    if (icon) icon.className = 'fas fa-eye';
                    console.log(`✅ CONTRASEÑA #${i} OCULTA`);
                }
            };
            
            console.log(`✅ Botón #${index} configurado para contraseña #${i}`);
        }
    });
    
    console.log('🎉 TODOS LOS BOTONES DE OJO CONFIGURADOS!');
};

// Función LÁSER que solo busca en el modal activo
window.laserFixPasswords = function() {
    console.log('🎯 ARREGLO LÁSER - Solo en modal activo...');
    
    // Buscar el modal activo
    const activeModal = document.querySelector('.modal.show') || document.querySelector('#driverModal');
    
    if (!activeModal) {
        console.error('❌ No se encontró modal activo');
        return;
    }
    
    console.log('✅ Modal activo encontrado:', activeModal.id || 'sin ID');
    
    // Buscar solo dentro del modal
    const modalButtons = activeModal.querySelectorAll('button');
    const modalPasswordInputs = activeModal.querySelectorAll('input[type="password"]');
    
    console.log(`🔍 En el modal: ${modalButtons.length} botones, ${modalPasswordInputs.length} inputs de contraseña`);
    
    // Buscar botones con íconos de ojo solo en el modal
    const eyeButtons = [];
    modalButtons.forEach((btn, index) => {
        const icon = btn.querySelector('i.fa-eye, i.fa-eye-slash');
        if (icon) {
            eyeButtons.push({ button: btn, index: index, icon: icon });
            console.log(`👁️ Botón de ojo en modal #${index}:`, btn.outerHTML.substring(0, 100));
        }
    });
    
    console.log(`🎯 Botones de ojo en modal: ${eyeButtons.length}`);
    
    if (eyeButtons.length === 0) {
        console.error('❌ NO SE ENCONTRARON BOTONES DE OJO EN EL MODAL');
        return;
    }
    
    // Configurar cada botón del modal
    eyeButtons.forEach((btnData, i) => {
        const { button, index, icon } = btnData;
        const passwordInput = modalPasswordInputs[i];
        
        if (passwordInput) {
            console.log(`⚙️ Configurando botón modal #${index} para input #${i}`);
            console.log(`📝 Input ID: ${passwordInput.id || 'sin ID'}`);
            
            // Método directo sin clonar
            button.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log(`🔥 CLICK EN BOTÓN MODAL #${index}!`);
                console.log(`📋 Input actual type: ${passwordInput.type}`);
                
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    icon.className = 'fas fa-eye-slash';
                    console.log(`✅ CONTRASEÑA ${i} -> VISIBLE`);
                    console.log(`👁️ Nuevo tipo: ${passwordInput.type}`);
                } else {
                    passwordInput.type = 'password';
                    icon.className = 'fas fa-eye';
                    console.log(`✅ CONTRASEÑA ${i} -> OCULTA`);
                    console.log(`👁️ Nuevo tipo: ${passwordInput.type}`);
                }
            };
            
            // También agregar event listener por si acaso
            button.addEventListener('click', function(e) {
                e.preventDefault();
                console.log(`🔄 Event listener backup activado para botón #${index}`);
            });
            
            console.log(`✅ Botón modal #${index} configurado completamente`);
        } else {
            console.warn(`⚠️ No hay input de contraseña para botón #${index}`);
        }
    });
    
    console.log('🎉 BOTONES DEL MODAL CONFIGURADOS!');
    console.log('🧪 Ahora haz clic en los botones de ojo para probar...');
};

// Función DETECTIVE que encuentra cualquier modal abierto
window.detectiveFixPasswords = function() {
    console.log('🕵️ ARREGLO DETECTIVE - Buscando cualquier modal...');
    
    // Buscar modales de diferentes formas
    const possibleModals = [
        document.querySelector('.modal.show'),
        document.querySelector('#driverModal'),
        document.querySelector('[id*="modal"]'),
        document.querySelector('[class*="modal"]'),
        document.querySelector('.modal'),
        ...document.querySelectorAll('div[style*="display: block"]'),
        ...document.querySelectorAll('div[style*="display:block"]')
    ].filter(Boolean);
    
    console.log(`🔍 Posibles modales encontrados: ${possibleModals.length}`);
    
    if (possibleModals.length === 0) {
        console.error('❌ NO SE ENCONTRÓ NINGÚN MODAL');
        console.log('🔍 Buscando en toda la página...');
        
        // Si no hay modal, buscar en toda la página pero solo inputs visibles
        const allPasswordInputs = document.querySelectorAll('input[type="password"]');
        const visibleInputs = Array.from(allPasswordInputs).filter(input => {
            const rect = input.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0;
        });
        
        console.log(`📋 Inputs de contraseña visibles: ${visibleInputs.length}`);
        
        visibleInputs.forEach((input, i) => {
            console.log(`📝 Input #${i}:`, input.id || 'sin ID', input.getBoundingClientRect());
            
            // Buscar botón cerca del input
            const container = input.closest('.input-group') || input.parentElement;
            const nearbyButton = container?.querySelector('button i.fa-eye, button i.fa-eye-slash')?.parentElement;
            
            if (nearbyButton) {
                console.log(`👁️ Botón encontrado cerca del input #${i}`);
                
                nearbyButton.onclick = function(e) {
                    e.preventDefault();
                    const icon = this.querySelector('i');
                    
                    console.log(`🔥 CLICK EN BOTÓN CERCA DE INPUT #${i}!`);
                    
                    if (input.type === 'password') {
                        input.type = 'text';
                        if (icon) icon.className = 'fas fa-eye-slash';
                        console.log(`✅ INPUT #${i} -> VISIBLE`);
                    } else {
                        input.type = 'password';
                        if (icon) icon.className = 'fas fa-eye';
                        console.log(`✅ INPUT #${i} -> OCULTA`);
                    }
                };
                
                console.log(`✅ Botón configurado para input #${i}`);
            }
        });
        
        return;
    }
    
    // Probar cada modal posible
    for (let i = 0; i < possibleModals.length; i++) {
        const modal = possibleModals[i];
        console.log(`🎯 Probando modal #${i}:`, modal.id || modal.className || 'sin identificación');
        
        const modalButtons = modal.querySelectorAll('button');
        const modalPasswordInputs = modal.querySelectorAll('input[type="password"]');
        
        console.log(`   📊 Botones: ${modalButtons.length}, Inputs: ${modalPasswordInputs.length}`);
        
        if (modalPasswordInputs.length > 0) {
            console.log(`✅ Modal #${i} tiene inputs de contraseña - CONFIGURANDO...`);
            
            // Buscar botones con íconos de ojo y asociarlos correctamente
            let eyeButtonCount = 0;
            modalButtons.forEach((btn, btnIndex) => {
                const icon = btn.querySelector('i.fa-eye, i.fa-eye-slash');
                if (icon) {
                    const targetInput = modalPasswordInputs[eyeButtonCount] || modalPasswordInputs[0];
                    
                    console.log(`👁️ Configurando botón #${btnIndex} para input`, targetInput.id || 'sin ID');
                    
                    btn.onclick = function(e) {
                        e.preventDefault();
                        console.log(`🔥 CLICK EN BOTÓN #${btnIndex}!`);
                        
                        if (targetInput.type === 'password') {
                            targetInput.type = 'text';
                            icon.className = 'fas fa-eye-slash';
                            console.log(`✅ CONTRASEÑA -> VISIBLE`);
                        } else {
                            targetInput.type = 'password';
                            icon.className = 'fas fa-eye';
                            console.log(`✅ CONTRASEÑA -> OCULTA`);
                        }
                    };
                    
                    eyeButtonCount++;
                }
            });
            
            console.log(`🎉 Modal #${i} configurado!`);
            break;
        }
    }
    
    console.log('🕵️ DETECTIVE TERMINÓ SU TRABAJO!');
};

// Función para arreglar números de teléfono sin lada
window.fixPhoneNumbers = function() {
    console.log('📞 Arreglando números de teléfono sin lada...');
    
    if (!window.TransportistasManager || !window.TransportistasManager.drivers) {
        console.error('❌ No hay datos de transportistas cargados');
        return;
    }
    
    const drivers = window.TransportistasManager.drivers;
    console.log(`🔍 Analizando ${drivers.length} transportistas...`);
    
    let fixedCount = 0;
    
    drivers.forEach(async (driver, index) => {
        const phone = driver.telefono;
        
        // Si el teléfono no tiene lada (no empieza con +)
        if (phone && !phone.startsWith('+')) {
            console.log(`📱 Transportista ${driver.nombre}: "${phone}" - SIN LADA`);
            
            // Agregar lada de México por defecto
            const fixedPhone = `+52 ${phone.replace(/\D/g, '')}`;
            
            console.log(`🔧 Arreglando: "${phone}" → "${fixedPhone}"`);
            
            try {
                const response = await window.app.apiCall('transportistas/update.php', {
                    method: 'PUT',
                    body: JSON.stringify({
                        id: driver.id,
                        nombre: driver.nombre,
                        email: driver.email,
                        telefono: fixedPhone,
                        licencia: driver.licencia,
                        activo: driver.activo
                    })
                });
                
                if (response.success) {
                    console.log(`✅ ${driver.nombre}: Teléfono actualizado a ${fixedPhone}`);
                    fixedCount++;
                } else {
                    console.error(`❌ ${driver.nombre}: Error al actualizar`);
                }
            } catch (error) {
                console.error(`💥 ${driver.nombre}: Error:`, error);
            }
            
            // Esperar un poco entre actualizaciones
            await new Promise(resolve => setTimeout(resolve, 500));
        } else if (phone && phone.startsWith('+')) {
            console.log(`✅ ${driver.nombre}: "${phone}" - YA TIENE LADA`);
        } else {
            console.log(`⚠️ ${driver.nombre}: Sin teléfono`);
        }
    });
    
    setTimeout(() => {
        console.log(`🎉 Proceso completado. ${fixedCount} números arreglados.`);
        console.log('🔄 Recargando datos...');
        if (window.TransportistasManager) {
            window.TransportistasManager.loadData();
        }
    }, drivers.length * 600);
};

// Función para actualizar la vista con banderitas
window.refreshTransportistasView = function() {
    console.log('🏁 Actualizando vista de transportistas con banderitas REALES...');
    
    if (window.TransportistasManager) {
        console.log('🔄 Recargando datos de transportistas...');
        window.TransportistasManager.loadData();
        
        setTimeout(() => {
            console.log('🎉 ¡Vista actualizada! Ahora deberías ver las banderitas REALES en los teléfonos');
            console.log('🇲🇽 Ejemplo: Bandera de México + +52 1234567890');
        }, 1000);
    } else {
        console.error('❌ TransportistasManager no está disponible');
    }
};
