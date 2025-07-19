FROM python:3.8

WORKDIR /app

# Systemabhängigkeiten für MySQL + netcat
RUN apt-get update && apt-get install -y \
    netcat-openbsd \
    default-libmysqlclient-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Installiere Python-Abhängigkeiten
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Kopiere Projektdateien
COPY . .

# Startbefehl direkt im CMD (wartet auf DB + startet Django)
CMD bash -c "\
  echo '⏳ Warten auf MySQL (${DATABASE_HOST}:${DATABASE_PORT})...' && \
  until nc -z \"$DATABASE_HOST\" \"$DATABASE_PORT\"; do sleep 1; done && \
  echo '✅ MySQL ist bereit – starte Django...' && \
  python manage.py collectstatic --noinput && \
  python manage.py makemigrations && \
  python manage.py migrate && \
  exec python manage.py runserver 0.0.0.0:8000"
