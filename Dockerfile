# Verwende offizielles Python-Image
FROM python:3.8

# Empfohlene Umgebungsvariablen für Containerbetrieb
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Arbeitsverzeichnis im Container
WORKDIR /app

# Installiere Python-Abhängigkeiten
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Kopiere gesamten Projektcode ins Image
COPY . .

# Entrypoint-Skript kopieren (wird beim Containerstart ausgeführt)
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Setze Entrypoint für Startbefehle (Migration, Static, User-Erstellung etc.)
ENTRYPOINT ["/entrypoint.sh"]

# Starte Gunicorn als Application Server
CMD ["gunicorn", "HomeServer.wsgi:application", "--bind", "0.0.0.0:8000"]
