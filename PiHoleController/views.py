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
        if "inactive" in subprocess.check_output("systemctl status pihole-FTL", shell=True, text=True):
            context["active"] = False
        else:
            context["active"] = True
        return context


class PiHoleManageView(View):
    def put(self, request):
        data = json.loads(request.body.decode("utf-8"))
        active = data["active"]

        if active:
            subprocess.call("systemctl start pihole-FTL", shell=True)
        else:
            subprocess.call("systemctl stop pihole-FTL", shell=True)
        return HttpResponse(status=200)