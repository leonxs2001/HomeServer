#!/bin/bash

echo "⏳ Warten auf MySQL (${DATABASE_HOST}:${DATABASE_PORT})..."

until nc -z "$DATABASE_HOST" "$DATABASE_PORT"; do
  sleep 1
done

echo "✅ MySQL ist bereit. Starte Django..."

python manage.py collectstatic --noinput
python manage.py makemigrations
python manage.py migrate

exec python manage.py runserver 0.0.0.0:8000
