FROM python:3.8

WORKDIR /app

# System-Abhängigkeiten (inkl. netcat & MySQL-Header)
RUN apt-get update && apt-get install -y \
    netcat-openbsd \
    build-essential \
    default-libmysqlclient-dev \
    && rm -rf /var/lib/apt/lists/*

# Anforderungen installieren
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Projektdateien kopieren
COPY . .

# entrypoint.sh kopieren und ausführbar machen
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Standard-Einstiegspunkt
ENTRYPOINT ["/entrypoint.sh"]

# Django-Port freigeben
EXPOSE 8000
