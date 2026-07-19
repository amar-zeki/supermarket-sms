FROM php:8.3-apache

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libzip-dev \
    libjpeg-dev \
    libfreetype6-dev \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Configure PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Install Redis extension via PECL
RUN pecl install redis && docker-php-ext-enable redis

# Enable Apache rewrite module
RUN a2enmod rewrite ssl headers proxy proxy_http

# Copy Apache vhost configuration
COPY docker/apache/vhost.conf /etc/apache2/sites-available/nexamart.conf
RUN a2ensite nexamart.conf && a2dissite 000-default.conf

# Copy PHP ini configuration
COPY docker/php/php.ini /usr/local/etc/php/conf.d/nexamart.ini

# Set working directory
WORKDIR /var/www/html

# Adjust permissions
RUN chown -R www-data:www-data /var/www/html
