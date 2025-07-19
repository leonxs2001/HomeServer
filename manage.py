#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys
import django  # 👈 wichtig für manuelles Setup

def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'HomeServer.settings')

    # ❗ Django initialisieren (Apps, Settings, Models)
    django.setup()

    from HomeServer.initial_data import initialize
    initialize()

    from django.core.management import execute_from_command_line
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()
