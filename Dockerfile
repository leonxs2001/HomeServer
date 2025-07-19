FROM python:3.8-slim

# Install system dependencies needed for mysqlclient
RUN apt-get update && \
    apt-get install -y gcc default-libmysqlclient-dev pkg-config && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Copy project files
COPY . .

# Expose Gunicorn port
EXPOSE 8000

# Run migrations, collectstatic, and start Gunicorn
CMD ["bash", "-c", "python manage.py migrate && python manage.py collectstatic --noinput && gunicorn HomeServer.wsgi:application --bind 0.0.0.0:8000"]
