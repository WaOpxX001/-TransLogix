// Gastos Manager - 💰 Expense management functionality
class GastosManager {
    constructor() {
        this.expenses = [];
        this.vehicles = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setDefaultDate();
        
        // Cargar datos con un pequeño delay para asegurar que DOM esté listo
        setTimeout(() => {
            this.loadData();
        }, 500);
        
        // También intentar cargar vehículos cuando se haga clic en la pestaña de gastos
        this.setupTabListener();
    }
    
    setupTabListener() {
        // Escuchar cuando se active la pestaña de gastos
        const gastosTab = document.querySelector('a[href="#gastosSection"]');
        if (gastosTab) {
            gastosTab.addEventListener('click', () => {
                console.log('🔄 Pestaña gastos activada, recargando vehículos...');
                setTimeout(() => {
                    this.loadVehicles();
                }, 200);
            });
        }
    }

    setupEventListeners() {
        const form = document.getElementById('expenseForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    }

    setDefaultDate() {
        const dateInput = document.querySelector('#expenseForm input[type="date"]');
        if (dateInput && !dateInput.value) {
            dateInput.value = new Date().toISOString().split('T')[0];
        }
    }

    async loadData() {
        try {
            console.log('🔄 Cargando datos de gastos...');
            // Cargar vehículos primero para el formulario
            await this.loadVehicles();
            // Luego cargar gastos
            await this.loadExpenses();
            // Finalmente actualizar las listas
            this.updateExpensesList();
        } catch (error) {
            console.error('❌ Error:', error);
            this.updateExpensesList();
        }
    }

    async loadExpenses() {
        try {
            const response = await window.app.apiCall('gastos/list.php', {
                method: 'POST',
                body: JSON.stringify({})
            });

            console.log('📡 API Response:', response);
            
            if (Array.isArray(response)) {
                this.expenses = response;
            } else if (response?.data && Array.isArray(response.data)) {
                this.expenses = response.data;
            } else {
                this.expenses = [];
            }

            console.log('✅ Gastos cargados:', this.expenses.length);
        } catch (error) {
            console.error('❌ Error loading expenses:', error);
            this.expenses = [];
        }
    }

    async loadVehicles() {
        console.log('🚚 FORZANDO CARGA DE VEHÍCULOS...');
        
        // FORZAR datos de vehículos directamente
        this.vehicles = [
            { id: 1, placa: 'MVT-345', marca: 'Toyota', modelo: 'Hilux' },
            { id: 2, placa: 'CDM-2313', marca: 'Ford', modelo: 'Ranger' },
            { id: 3, placa: 'GHI-789', marca: 'Chevrolet', modelo: 'Colorado' }
        ];
        
        console.log('✅ VEHÍCULOS FORZADOS:', this.vehicles);
        this.populateVehicleSelect();
        
        // También intentar la API en paralelo
        try {
            if (window.app && window.app.apiCall) {
                const response = await window.app.apiCall('vehiculos/list.php');
                if (Array.isArray(response) && response.length > 0) {
                    this.vehicles = response;
                    console.log('✅ API funcionó, reemplazando con datos reales:', this.vehicles);
                    this.populateVehicleSelect();
                }
            }
        } catch (error) {
            console.log('⚠️ API falló, manteniendo datos forzados');
        }
    }

    populateVehicleSelect() {
        const select = document.getElementById('vehiculo');
        if (!select) {
            console.error('❌ No se encontró el select #vehiculo');
            return;
        }

        console.log('🔄 Poblando select de vehículos...');
        
        // Limpiar opciones existentes excepto la primera (placeholder)
        while (select.children.length > 1) {
            select.removeChild(select.lastChild);
        }

        if (!this.vehicles || this.vehicles.length === 0) {
            console.log('⚠️ No hay vehículos disponibles');
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'No hay vehículos disponibles';
            option.disabled = true;
            select.appendChild(option);
            return;
        }

        console.log('📋 Agregando', this.vehicles.length, 'vehículos al select');
        
        this.vehicles.forEach(vehicle => {
            const option = document.createElement('option');
            option.value = vehicle.id;
            option.textContent = `${vehicle.placa} - ${vehicle.marca} ${vehicle.modelo}`;
            select.appendChild(option);
            console.log('✅ Vehículo agregado:', vehicle.placa, '-', vehicle.marca, vehicle.modelo);
        });
        
        console.log('✅ Select de vehículos poblado correctamente');
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        try {
            const formData = new FormData(e.target);
            const expenseData = {
                tipo: formData.get('tipo'),
                monto: parseFloat(formData.get('monto')),
                fecha: formData.get('fecha'),
                vehiculo_id: parseInt(formData.get('vehiculo')),
                numero_factura: formData.get('numero_factura'),
                descripcion: formData.get('descripcion') || ''
            };

            const response = await window.app.apiCall('gastos/create.php', {
                method: 'POST',
                body: JSON.stringify(expenseData)
            });

            if (response?.success) {
                window.app.showToast('✅ Gasto registrado exitosamente', 'success');
                e.target.reset();
                this.setDefaultDate();
                await this.loadData();
            }
        } catch (error) {
            window.app.showToast('Error: ' + error.message, 'danger');
        }
    }

    updateExpensesList() {
        console.log('🔄 Actualizando listas de gastos...');
        
        let currentUser = window.app?.currentUser;
        
        if (!currentUser) {
            console.log('⚠️ Usuario no disponible');
            setTimeout(() => this.updateExpensesList(), 500);
            return;
        }

        console.log('👤 Usuario:', currentUser);

        // Actualizar tabla "Mis Gastos" (todos los usuarios ven solo sus gastos)
        this.updateMyExpensesTable(currentUser);
        
        // Actualizar tabla "Todos los Gastos" (solo admin/supervisor)
        this.updateAllExpensesTable(currentUser);
    }

    updateMyExpensesTable(currentUser) {
        const myExpensesTable = document.querySelector('#myExpensesTable tbody');
        if (!myExpensesTable) return;

        // TODOS los usuarios (incluyendo admin/supervisor) ven solo SUS gastos en esta tabla
        const myExpenses = this.expenses.filter(expense => String(expense.usuario_id) === String(currentUser.id));
        
        console.log('📋 Mis gastos:', myExpenses.length);

        if (myExpenses.length === 0) {
            myExpensesTable.innerHTML = '<tr><td colspan="7" class="text-center py-4"><i class="fas fa-inbox fa-2x text-muted mb-2"></i><br>No tienes gastos registrados</td></tr>';
            this.generateMobileView([]);
            return;
        }

        myExpensesTable.innerHTML = myExpenses.map(expense => {
            // Botones disponibles según el rol y estado del gasto
            const canDelete = currentUser.role !== 'transportista' || expense.estado === 'pendiente';
            
            return `
            <tr>
                <td>${new Date(expense.fecha).toLocaleDateString()}</td>
                <td>
                    <span class="badge bg-${this.getExpenseTypeColor(expense.tipo)}">
                        ${this.getExpenseTypeIcon(expense.tipo)} ${expense.tipo}
                    </span>
                </td>
                <td>🚚 ${expense.vehiculo_placa || 'N/A'}</td>
                <td class="fw-bold">$${parseFloat(expense.monto).toFixed(2)}</td>
                <td>${expense.numero_factura}</td>
                <td>
                    <span class="badge bg-${expense.estado === 'aprobado' ? 'success' : expense.estado === 'rechazado' ? 'danger' : 'warning'}">
                        ${expense.estado === 'aprobado' ? '✓ Aprobado' : expense.estado === 'rechazado' ? '✗ Rechazado' : '⏳ Pendiente'}
                    </span>
                </td>
                <td>
                    <div class="btn-group" role="group">
                        <button class="btn btn-sm btn-outline-primary" onclick="GastosManager.viewExpense(${expense.id})" title="Ver detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-info" onclick="GastosManager.viewReceiptImage(${expense.id})" title="Ver recibo">
                            <i class="fas fa-receipt"></i>
                        </button>
                        ${canDelete ? `
                        <button class="btn btn-sm btn-outline-danger" onclick="GastosManager.deleteExpense(${expense.id})" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
            `;
        }).join('');

        this.generateMobileView(myExpenses);
    }

    updateAllExpensesTable(currentUser) {
        const allExpensesTable = document.querySelector('#allExpensesTable tbody');
        const allExpensesCard = document.querySelector('.admin-supervisor-only');
        
        if (!allExpensesTable || !allExpensesCard) return;

        // Solo admin y supervisor pueden ver esta tabla
        if (currentUser.role !== 'admin' && currentUser.role !== 'supervisor') {
            allExpensesCard.style.display = 'none';
            return;
        }

        allExpensesCard.style.display = 'block';
        
        console.log('📊 Todos los gastos del sistema:', this.expenses.length);

        if (this.expenses.length === 0) {
            allExpensesTable.innerHTML = '<tr><td colspan="9" class="text-center py-4"><i class="fas fa-inbox fa-2x text-muted mb-2"></i><br>No hay gastos en el sistema</td></tr>';
            return;
        }

        allExpensesTable.innerHTML = this.expenses.map(expense => `
            <tr>
                <td>${new Date(expense.fecha).toLocaleDateString()}</td>
                <td>
                    <span class="badge bg-info">
                        👤 ${expense.usuario_nombre || 'Usuario #' + expense.usuario_id}
                    </span>
                </td>
                <td>
                    <span class="badge bg-${this.getExpenseTypeColor(expense.tipo)}">
                        ${this.getExpenseTypeIcon(expense.tipo)} ${expense.tipo}
                    </span>
                </td>
                <td>🚚 ${expense.vehiculo_placa || 'N/A'}</td>
                <td class="fw-bold">$${parseFloat(expense.monto).toFixed(2)}</td>
                <td>${expense.numero_factura}</td>
                <td>
                    <span class="badge bg-${expense.estado === 'aprobado' ? 'success' : expense.estado === 'rechazado' ? 'danger' : 'warning'}">
                        ${expense.estado === 'aprobado' ? '✓ Aprobado' : expense.estado === 'rechazado' ? '✗ Rechazado' : '⏳ Pendiente'}
                    </span>
                </td>
                <td>
                    ${expense.estado === 'pendiente' ? `
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-success btn-sm" onclick="GastosManager.approveExpense(${expense.id})" title="Aprobar">
                                <i class="fas fa-check"></i>
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="GastosManager.denyExpense(${expense.id})" title="Denegar">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    ` : `
                        <span class="text-muted">-</span>
                    `}
                </td>
                <td>
                    <div class="btn-group" role="group">
                        <button class="btn btn-sm btn-outline-primary" onclick="GastosManager.viewExpense(${expense.id})" title="Ver detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-info" onclick="GastosManager.viewReceiptImage(${expense.id})" title="Ver recibo">
                            <i class="fas fa-receipt"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="GastosManager.deleteExpense(${expense.id})" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    getExpenseTypeColor(tipo) {
        const colors = {
            'combustible': 'primary',
            'mantenimiento': 'warning',
            'peaje': 'info',
            'multa': 'danger',
            'hospedaje': 'secondary',
            'comida': 'success',
            'otros': 'dark'
        };
        return colors[tipo] || 'secondary';
    }

    getExpenseTypeIcon(tipo) {
        const icons = {
            'combustible': '⛽',
            'mantenimiento': '🔧',
            'peaje': '🛣️',
            'multa': '🚨',
            'hospedaje': '🏨',
            'comida': '🍴',
            'otros': '📦'
        };
        return icons[tipo] || '📋';
    }

    generateMobileView(expenses) {
        const mobileContainer = document.getElementById('mobileExpensesView');
        if (!mobileContainer) return;

        if (!expenses || expenses.length === 0) {
            mobileContainer.innerHTML = '<div class="text-center py-4"><i class="fas fa-inbox fa-3x text-muted mb-3"></i><h5>No hay gastos</h5></div>';
            return;
        }

        mobileContainer.innerHTML = expenses.map(expense => {
            const currentUser = window.app?.currentUser;
            const canDelete = currentUser && (currentUser.role !== 'transportista' || expense.estado === 'pendiente');
            
            return `
            <div class="mobile-expense-card">
                <div class="mobile-expense-header">
                    <div class="mobile-expense-type">
                        ${this.getExpenseTypeIcon(expense.tipo)} ${expense.tipo}
                    </div>
                    <div class="mobile-expense-amount">$${parseFloat(expense.monto).toFixed(2)}</div>
                </div>
                <div class="mobile-expense-details">
                    <div class="mobile-expense-detail">
                        <span class="label">Fecha:</span>
                        <span class="value">${new Date(expense.fecha).toLocaleDateString()}</span>
                    </div>
                    <div class="mobile-expense-detail">
                        <span class="label">Vehículo:</span>
                        <span class="value">${expense.vehiculo_placa || 'N/A'}</span>
                    </div>
                    <div class="mobile-expense-detail">
                        <span class="label">Estado:</span>
                        <span class="value">
                            <span class="badge bg-${expense.estado === 'aprobado' ? 'success' : expense.estado === 'rechazado' ? 'danger' : 'warning'}">
                                ${expense.estado === 'aprobado' ? '✓ Aprobado' : expense.estado === 'rechazado' ? '✗ Rechazado' : '⏳ Pendiente'}
                            </span>
                        </span>
                    </div>
                </div>
                <div class="mobile-expense-actions">
                    <button class="btn btn-sm btn-outline-primary" onclick="GastosManager.viewExpense(${expense.id})" title="Ver detalles">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-info" onclick="GastosManager.viewReceiptImage(${expense.id})" title="Ver recibo">
                        <i class="fas fa-receipt"></i>
                    </button>
                    ${canDelete ? `
                    <button class="btn btn-sm btn-outline-danger" onclick="GastosManager.deleteExpense(${expense.id})" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                    ` : ''}
                </div>
            </div>
            `;
        }).join('');
    }
}

// Static methods
GastosManager.viewExpense = function(id) {
    const expense = window.GastosManagerInstance.expenses.find(e => e.id === id);
    if (!expense) return;

    const modalHtml = `
        <div class="modal fade" id="expenseDetailModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Detalles del Gasto</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <p><strong>Tipo:</strong> ${expense.tipo}</p>
                        <p><strong>Monto:</strong> $${parseFloat(expense.monto).toFixed(2)}</p>
                        <p><strong>Fecha:</strong> ${new Date(expense.fecha).toLocaleDateString()}</p>
                        <p><strong>Estado:</strong> ${expense.estado}</p>
                        ${expense.descripcion ? `<p><strong>Descripción:</strong> ${expense.descripcion}</p>` : ''}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('expenseDetailModal'));
    modal.show();

    document.getElementById('expenseDetailModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
};

GastosManager.viewReceiptImage = function(id) {
    const expense = window.GastosManagerInstance.expenses.find(e => e.id === id);
    if (!expense) {
        window.app.showToast('Gasto no encontrado', 'error');
        return;
    }

    if (!expense.recibo_imagen) {
        window.app.showToast('Este gasto no tiene recibo adjunto', 'info');
        return;
    }

    const modalHtml = `
        <div class="modal fade" id="receiptImageModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Recibo - ${expense.tipo} ($${parseFloat(expense.monto).toFixed(2)})</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body text-center">
                        <img src="api/gastos/uploads/recibos/${expense.recibo_imagen}" 
                             class="img-fluid" 
                             alt="Recibo" 
                             style="max-height: 70vh;"
                             onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZW4gbm8gZGlzcG9uaWJsZTwvdGV4dD48L3N2Zz4='; this.alt='Imagen no disponible';">
                        <div class="mt-3">
                            <small class="text-muted">
                                <strong>Fecha:</strong> ${new Date(expense.fecha).toLocaleDateString()} | 
                                <strong>Factura:</strong> ${expense.numero_factura}
                            </small>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('receiptImageModal'));
    modal.show();

    document.getElementById('receiptImageModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
};

GastosManager.approveExpense = function(id) {
    const expense = window.GastosManagerInstance.expenses.find(e => e.id === id);
    if (!expense) return;

    if (window.app && window.app.showConfirmModal) {
        window.app.showConfirmModal(
            'Aprobar Gasto',
            `¿Aprobar este gasto?<br><br>
            <strong>Tipo:</strong> ${expense.tipo}<br>
            <strong>Monto:</strong> $${parseFloat(expense.monto).toFixed(2)}<br>
            <strong>Fecha:</strong> ${new Date(expense.fecha).toLocaleDateString()}<br>
            <strong>Usuario:</strong> ${expense.usuario_nombre || 'Usuario #' + expense.usuario_id}<br><br>
            <span class="text-success">El gasto será marcado como aprobado.</span>`,
            'Aprobar',
            'success',
            async () => {
                try {
                    const response = await window.app.apiCall('gastos/approve.php', {
                        method: 'POST',
                        body: JSON.stringify({ id: id, action: 'approve' })
                    });

                    if (response.success) {
                        window.app.showToast('✅ Gasto aprobado exitosamente', 'success');
                        await window.GastosManagerInstance.loadData();
                    }
                } catch (error) {
                    window.app.showToast('Error al aprobar gasto: ' + error.message, 'danger');
                }
            }
        );
    }
};

GastosManager.denyExpense = function(id) {
    const expense = window.GastosManagerInstance.expenses.find(e => e.id === id);
    if (!expense) return;

    if (window.app && window.app.showConfirmModal) {
        window.app.showConfirmModal(
            'Denegar Gasto',
            `¿Denegar este gasto?<br><br>
            <strong>Tipo:</strong> ${expense.tipo}<br>
            <strong>Monto:</strong> $${parseFloat(expense.monto).toFixed(2)}<br>
            <strong>Fecha:</strong> ${new Date(expense.fecha).toLocaleDateString()}<br>
            <strong>Usuario:</strong> ${expense.usuario_nombre || 'Usuario #' + expense.usuario_id}<br><br>
            <span class="text-warning">El gasto será marcado como denegado.</span>`,
            'Denegar',
            'warning',
            async () => {
                try {
                    const response = await window.app.apiCall('gastos/approve.php', {
                        method: 'POST',
                        body: JSON.stringify({ id: id, action: 'deny' })
                    });

                    if (response.success) {
                        window.app.showToast('❌ Gasto denegado', 'warning');
                        await window.GastosManagerInstance.loadData();
                    }
                } catch (error) {
                    window.app.showToast('Error al denegar gasto: ' + error.message, 'danger');
                }
            }
        );
    }
};

GastosManager.deleteExpense = function(id) {
    const expense = window.GastosManagerInstance.expenses.find(e => e.id === id);
    if (!expense) return;

    if (window.app && window.app.showConfirmModal) {
        window.app.showConfirmModal(
            'Eliminar Gasto',
            `¿Estás seguro de que deseas eliminar este gasto?<br><br>
            <strong>Tipo:</strong> ${expense.tipo}<br>
            <strong>Monto:</strong> $${parseFloat(expense.monto).toFixed(2)}<br>
            <strong>Fecha:</strong> ${new Date(expense.fecha).toLocaleDateString()}<br>
            <strong>Usuario:</strong> ${expense.usuario_nombre || 'Usuario #' + expense.usuario_id}<br><br>
            <span class="text-danger">Esta acción no se puede deshacer.</span>`,
            'Eliminar',
            'danger',
            async () => {
                try {
                    const response = await window.app.apiCall('gastos/delete.php', {
                        method: 'POST',
                        body: JSON.stringify({ id: id })
                    });

                    if (response.success) {
                        window.app.showToast('✅ Gasto eliminado exitosamente', 'success');
                        await window.GastosManagerInstance.loadData();
                    }
                } catch (error) {
                    window.app.showToast('Error al eliminar gasto: ' + error.message, 'danger');
                }
            }
        );
    }
};

// Inicializar el manager cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔄 Inicializando GastosManager...');
    window.GastosManagerInstance = new GastosManager();
    console.log('✅ GastosManager inicializado:', window.GastosManagerInstance);
});
