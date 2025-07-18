#!/bin/bash

echo "🔧 Running migrations..."
python manage.py migrate --noinput

echo "🎯 Collecting static files..."
python manage.py collectstatic --noinput

echo "👤 Creating initial users..."
python manage.py shell << EOF
from django.contrib.auth import get_user_model
import os, json
users = json.loads(os.environ.get("INITIAL_USERS", "[]"))
User = get_user_model()
for u in users:
    if not User.objects.filter(username=u['username']).exists():
        User.objects.create_user(**u)
EOF

exec "$@"
