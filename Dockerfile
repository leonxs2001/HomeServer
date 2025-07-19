FROM python:3.11-slim

WORKDIR /app

# Systemabhängigkeiten installieren (wichtig für einige Python-Pakete)
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    libjpeg-dev \
    zlib1g-dev \
    libffi-dev \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Anforderungen installieren
COPY requirements.txt .
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

# Code kopieren
COPY . .

# Standardbefehl zum Starten
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

EXPOSE 8000
