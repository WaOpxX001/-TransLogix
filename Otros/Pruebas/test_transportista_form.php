<?php
/**
 * Archivo de prueba para verificar el formulario mejorado de transportistas
 */
header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Prueba - Formulario de Transportistas</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
</head>
<body>
    <div class="container mt-4">
        <h2>📋 Prueba del Formulario Mejorado de Transportistas</h2>
        
        <div class="row">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header">
                        <h5>👥 Nuevo Transportista - Formulario Mejorado</h5>
                    </div>
                    <div class="card-body">
                        <form id="testForm">
                            <div class="mb-3">
                                <label class="form-label">Nombre Completo *</label>
                                <input type="text" class="form-control" name="nombre" value="Juan Pérez" required 
                                       oninput="validateNameInput(this)" 
                                       placeholder="Ej: Juan Pérez, María González">
                                <small class="text-muted">Solo letras, espacios, comas y puntos permitidos</small>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Email *</label>
                                <input type="email" class="form-control" name="email" value="juan@example.com" required>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Teléfono</label>
                                <div class="row">
                                    <div class="col-md-4">
                                        <select class="form-select" id="countryCode" name="country_code" onchange="updatePhoneValidation()" style="font-size: 14px;">
                                            <option value="+52|10">🇲🇽 México (+52)</option>
                                            <option value="+1|10|US">🇺🇸 Estados Unidos (+1)</option>
                                            <option value="+1|10|CA">🇨🇦 Canadá (+1)</option>
                                            <option value="+86|11">🇨🇳 China (+86)</option>
                                            <option value="+81|10">🇯🇵 Japón (+81)</option>
                                            <option value="+49|11">🇩🇪 Alemania (+49)</option>
                                            <option value="+33|10">🇫🇷 Francia (+33)</option>
                                            <option value="+44|10">🇬🇧 Reino Unido (+44)</option>
                                            <option value="+39|10">🇮🇹 Italia (+39)</option>
                                            <option value="+34|9">🇪🇸 España (+34)</option>
                                            <option value="+55|11">🇧🇷 Brasil (+55)</option>
                                            <option value="+54|10">🇦🇷 Argentina (+54)</option>
                                            <option value="+57|10">🇨🇴 Colombia (+57)</option>
                                            <option value="+51|9">🇵🇪 Perú (+51)</option>
                                            <option value="+56|9">🇨🇱 Chile (+56)</option>
                                            <option value="+58|10">🇻🇪 Venezuela (+58)</option>
                                            <option value="+593|9">🇪🇨 Ecuador (+593)</option>
                                            <option value="+591|8">🇧🇴 Bolivia (+591)</option>
                                            <option value="+595|9">🇵🇾 Paraguay (+595)</option>
                                            <option value="+598|8">🇺🇾 Uruguay (+598)</option>
                                        </select>
                                    </div>
                                    <div class="col-md-8">
                                        <input type="tel" class="form-control" id="phoneNumber" name="telefono" 
                                               placeholder="Ingresa el número telefónico" 
                                               maxlength="11" 
                                               oninput="validatePhoneInput(this)">
                                        <small class="text-muted" id="phoneHelp">México: 10 dígitos (ej: 5551234567)</small>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Número de Licencia</label>
                                <input type="text" class="form-control" name="licencia" value="LIC123456">
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Contraseña Inicial *</label>
                                <div class="input-group">
                                    <input type="password" class="form-control" id="password" name="password" value="123456" required>
                                    <button class="btn btn-outline-secondary" type="button" onclick="togglePasswordVisibility('password', this)">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                </div>
                                <small class="text-muted">Mínimo 6 caracteres</small>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Confirmar Contraseña *</label>
                                <div class="input-group">
                                    <input type="password" class="form-control" id="confirmPassword" name="confirm_password" required>
                                    <button class="btn btn-outline-secondary" type="button" onclick="togglePasswordVisibility('confirmPassword', this)">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                </div>
                                <div class="invalid-feedback" id="passwordError">Las contraseñas no coinciden</div>
                            </div>
                            
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save"></i> Guardar Transportista
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            
            <div class="col-md-4">
                <div class="card">
                    <div class="card-header">
                        <h6>🧪 Funciones de Prueba</h6>
                    </div>
                    <div class="card-body">
                        <button class="btn btn-info btn-sm mb-2" onclick="testCountryChange()">
                            📞 Probar Países
                        </button>
                        <button class="btn btn-warning btn-sm mb-2" onclick="testPasswordValidation()">
                            🔒 Probar Contraseñas
                        </button>
                        <button class="btn btn-success btn-sm mb-2" onclick="fillSampleData()">
                            📝 Datos de Ejemplo
                        </button>
                        <button class="btn btn-danger btn-sm mb-2" onclick="testNameValidation()">
                            ✏️ Probar Nombres
                        </button>
                    </div>
                </div>
                
                <div class="card mt-3">
                    <div class="card-header">
                        <h6>📋 Características</h6>
                    </div>
                    <div class="card-body">
                        <ul class="list-unstyled">
                            <li>✅ Selector de país con banderas 🇲🇽🇺🇸🇨🇳</li>
                            <li>✅ Validación automática de dígitos</li>
                            <li>✅ Feedback visual en tiempo real</li>
                            <li>✅ Confirmación de contraseña</li>
                            <li>✅ Botones para mostrar/ocultar</li>
                            <li>✅ Validación de nombres (solo letras)</li>
                            <li>✅ Filtrado automático de caracteres</li>
                            <li>✅ 20 países con códigos correctos</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    
    <script>
        // Funciones de validación (copiadas del transportistas.js)
        window.updatePhoneValidation = function() {
            const countrySelect = document.getElementById('countryCode');
            const phoneInput = document.getElementById('phoneNumber');
            const phoneHelp = document.getElementById('phoneHelp');
            
            if (!countrySelect || !phoneInput || !phoneHelp) return;
            
            const [code, digits] = countrySelect.value.split('|');
            const expectedDigits = parseInt(digits);
            
            phoneInput.maxLength = expectedDigits;
            phoneInput.placeholder = `Ingresa ${expectedDigits} dígitos`;
            
            const countryNames = {
                '+52': 'México',
                '+1': 'USA/Canadá', 
                '+86': 'China',
                '+81': 'Japón',
                '+49': 'Alemania',
                '+33': 'Francia',
                '+44': 'Reino Unido',
                '+39': 'Italia',
                '+34': 'España',
                '+55': 'Brasil',
                '+54': 'Argentina',
                '+57': 'Colombia',
                '+51': 'Perú',
                '+56': 'Chile',
                '+58': 'Venezuela',
                '+593': 'Ecuador',
                '+591': 'Bolivia',
                '+595': 'Paraguay',
                '+598': 'Uruguay'
            };
            
            const countryName = countryNames[code] || 'País seleccionado';
            phoneHelp.textContent = `${countryName}: ${expectedDigits} dígitos (ej: ${'1'.repeat(expectedDigits)})`;
            
            phoneInput.classList.remove('is-invalid', 'is-valid');
        };

        window.validatePhoneInput = function(input) {
            const countrySelect = document.getElementById('countryCode');
            if (!countrySelect) return;
            
            input.value = input.value.replace(/\D/g, '');
            
            const [code, digits] = countrySelect.value.split('|');
            const expectedDigits = parseInt(digits);
            const currentLength = input.value.length;
            
            if (currentLength === 0) {
                input.classList.remove('is-invalid', 'is-valid');
            } else if (currentLength === expectedDigits) {
                input.classList.remove('is-invalid');
                input.classList.add('is-valid');
            } else {
                input.classList.remove('is-valid');
                input.classList.add('is-invalid');
            }
        };

        window.togglePasswordVisibility = function(inputId, button) {
            const input = document.getElementById(inputId);
            const icon = button.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
                button.setAttribute('title', 'Ocultar contraseña');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
                button.setAttribute('title', 'Mostrar contraseña');
            }
        };

        window.validateNameInput = function(input) {
            // Solo permitir letras (incluyendo acentos), espacios, comas y puntos
            const allowedPattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s,\.]*$/;
            
            // Obtener la posición del cursor antes de la validación
            const cursorPosition = input.selectionStart;
            
            // Filtrar caracteres no permitidos
            const originalValue = input.value;
            const filteredValue = originalValue.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s,\.]/g, '');
            
            // Si el valor cambió, actualizar el input
            if (originalValue !== filteredValue) {
                input.value = filteredValue;
                
                // Restaurar la posición del cursor (ajustada por caracteres eliminados)
                const removedChars = originalValue.length - filteredValue.length;
                const newCursorPosition = Math.max(0, cursorPosition - removedChars);
                input.setSelectionRange(newCursorPosition, newCursorPosition);
                
                // Mostrar feedback visual temporal
                input.style.borderColor = '#f59e0b';
                input.style.boxShadow = '0 0 0 0.2rem rgba(245, 158, 11, 0.25)';
                setTimeout(() => {
                    input.style.borderColor = '';
                    input.style.boxShadow = '';
                }, 500);
            }
            
            // Validación visual para nombres válidos
            if (filteredValue.length >= 2 && /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s,\.]+$/.test(filteredValue)) {
                input.classList.remove('is-invalid');
                input.classList.add('is-valid');
            } else if (filteredValue.length > 0) {
                input.classList.remove('is-valid');
                input.classList.add('is-invalid');
            } else {
                input.classList.remove('is-valid', 'is-invalid');
            }
        };

        // Funciones de prueba
        function testCountryChange() {
            const select = document.getElementById('countryCode');
            const countries = ['+52|10', '+86|11', '+1|10', '+34|9'];
            let index = 0;
            
            const interval = setInterval(() => {
                select.value = countries[index];
                updatePhoneValidation();
                index++;
                if (index >= countries.length) clearInterval(interval);
            }, 1000);
        }

        function testPasswordValidation() {
            const password = document.getElementById('password');
            const confirm = document.getElementById('confirmPassword');
            
            password.value = 'test123';
            confirm.value = 'different';
            confirm.dispatchEvent(new Event('input'));
        }

        function fillSampleData() {
            document.getElementById('phoneNumber').value = '5551234567';
            validatePhoneInput(document.getElementById('phoneNumber'));
            document.getElementById('confirmPassword').value = '123456';
        }

        function testNameValidation() {
            const nameInput = document.querySelector('input[name="nombre"]');
            const testNames = [
                'Juan123Pérez',  // Contiene números
                'María@González', // Contiene símbolos
                'José Luis, Ana María', // Válido con coma
                'Pedro-Pablo', // Contiene guión
                'Ana Sofía'  // Válido
            ];
            
            let index = 0;
            const interval = setInterval(() => {
                if (index < testNames.length) {
                    nameInput.value = testNames[index];
                    validateNameInput(nameInput);
                    console.log(`Probando: "${testNames[index]}"`);
                    index++;
                } else {
                    clearInterval(interval);
                }
            }, 1500);
        }

        // Setup password validation
        document.addEventListener('DOMContentLoaded', function() {
            const password = document.getElementById('password');
            const confirmPassword = document.getElementById('confirmPassword');
            const passwordError = document.getElementById('passwordError');

            const validatePasswords = () => {
                if (confirmPassword.value && password.value !== confirmPassword.value) {
                    confirmPassword.classList.add('is-invalid');
                    passwordError.style.display = 'block';
                } else {
                    confirmPassword.classList.remove('is-invalid');
                    passwordError.style.display = 'none';
                }
            };

            password.addEventListener('input', validatePasswords);
            confirmPassword.addEventListener('input', validatePasswords);
        });
    </script>
</body>
</html>
