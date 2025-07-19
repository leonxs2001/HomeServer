# 1. Basis-Image mit Python
FROM python:3.8-slim

# 2. Arbeitsverzeichnis im Container
WORKDIR /app

# 3. Requirements installieren
COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# 4. Projektdateien kopieren
COPY . .

# 5. Collectstatic & Migrate werden über entrypoint oder docker-compose ausgeführt

# 6. Port (Gunicorn nutzt 8000)
EXPOSE 8000

# 7. Start über Bash → Migration, Staticfiles, Gunicorn
CMD ["bash", "-c", "python manage.py migrate && python manage.py collectstatic --noinput && gunicorn HomeServer.wsgi:application --bind 0.0.0.0:8000"]
