FROM python:3.8

WORKDIR /app

COPY requirements.txt .

RUN pip install -r requirements.txt

COPY . .

CMD ["bash", "-c", "telnet localhost 3306 && python manage.py makemigrations && python manage.py migrate && python manage.py runserver 0.0.0.0:8000"]

EXPOSE 8000