# Basis-Image
FROM python:3.8-slim

# Python-Einstellungen
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Arbeitsverzeichnis
WORKDIR /app

# Systemabhängigkeiten installieren (optional, falls du z. B. Pillow nutzt)
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    libjpeg-dev \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

# Abhängigkeiten installieren
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Projektcode kopieren
COPY . .

# Kein collectstatic, kein migrate hier!

# Startbefehl (wird ggf. durch docker-compose überschrieben)
CMD ["gunicorn", "HomeServer.wsgi:application", "--bind", "0.0.0.0:8000"]
