# Usar imagen oficial de PHP con Apache
FROM php:8.2-apache

# Instalar extensiones de PHP necesarias
RUN docker-php-ext-install pdo pdo_mysql mysqli

# Habilitar mod_rewrite de Apache
RUN a2enmod rewrite headers

# Configurar Apache para pasar variables de entorno a PHP
RUN echo "PassEnv MYSQLHOST" >> /etc/apache2/apache2.conf && \
    echo "PassEnv MYSQLDATABASE" >> /etc/apache2/apache2.conf && \
    echo "PassEnv MYSQLUSER" >> /etc/apache2/apache2.conf && \
    echo "PassEnv MYSQLPASSWORD" >> /etc/apache2/apache2.conf && \
    echo "PassEnv MYSQLPORT" >> /etc/apache2/apache2.conf && \
    echo "PassEnv JWT_SECRET" >> /etc/apache2/apache2.conf

# Copiar archivos del proyecto al contenedor
COPY . /var/www/html/

# Establecer permisos correctos
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

# Crear directorios necesarios con permisos
RUN mkdir -p /var/www/html/api/gastos/uploads \
    && mkdir -p /var/www/html/temp \
    && mkdir -p /var/www/html/api/cache \
    && chown -R www-data:www-data /var/www/html/api/gastos/uploads \
    && chown -R www-data:www-data /var/www/html/temp \
    && chown -R www-data:www-data /var/www/html/api/cache \
    && chmod -R 777 /var/www/html/api/gastos/uploads \
    && chmod -R 777 /var/www/html/temp \
    && chmod -R 777 /var/www/html/api/cache

# Exponer puerto 80
EXPOSE 80

# Comando para iniciar Apache
CMD ["apache2-foreground"]
