import json

from django.http import HttpResponse
from django.shortcuts import render
from django.views import View
from django.views.generic import TemplateView
import subprocess


class PiHoleView(TemplateView):
    template_name = "pi-hole.html"

    def get_context_data(self, **kwargs):
        context = dict()

        # Befehl zum Überprüfen des Status von pihole-FTL
        command = ['sudo', 'systemctl', 'status', 'pihole-FTL']

        # Führen Sie den Befehl aus und erfassen Sie die Ausgabe
        result = subprocess.run(command, check=True, capture_output=True, text=True)

        # Überprüfen Sie, ob pihole-FTL aktiv ist
        if "inactive" in result.stdout:
            context["active"] = False
        else:
            context["active"] = True

        return context


class PiHoleManageView(View):
    def put(self, request):
        data = json.loads(request.body.decode("utf-8"))
        active = data["active"]

        if active:
            subprocess.call("sudo systemctl start pihole-FTL", shell=True)
        else:
            subprocess.call("sudo systemctl stop pihole-FTL", shell=True)
        return HttpResponse(status=200)
