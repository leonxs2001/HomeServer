FROM python:3.8

WORKDIR /app

# MySQL-Abhängigkeiten (optional, je nach Paket)
RUN apt-get update && apt-get install -y netcat

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

# entrypoint.sh hinzufügen
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]

EXPOSE 8000
