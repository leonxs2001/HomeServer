FROM python:3.8

WORKDIR /app

RUN apt-get update && apt-get install -y \
    netcat-openbsd \
    default-libmysqlclient-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV DJANGO_SETTINGS_MODULE=HomeServer.settings

CMD bash -c "\
  echo '⏳ Warten auf MySQL (${DATABASE_HOST}:${DATABASE_PORT})...' && \
  until nc -z \"$DATABASE_HOST\" \"$DATABASE_PORT\"; do sleep 1; done && \
  echo '✅ MySQL ist bereit – starte Django mit Gunicorn...' && \
  python manage.py collectstatic --noinput && \
  python manage.py makemigrations && \
  python manage.py migrate && \
  exec gunicorn HomeServer.wsgi:application --bind 0.0.0.0:8000 --workers 3"

