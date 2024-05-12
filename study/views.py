from django.http import HttpResponse
from django.views import View
import json


class StudyView(View):

    def get(self, request):
        print(request.body.decode("utf-8"))
        return HttpResponse(status=200)

    def post(self, request):
        print(request.body.decode("utf-8"))
        return HttpResponse(status=200)

    def put(self, request):
        print(request.body.decode("utf-8"))
        return HttpResponse(status=200)

    def delete(self, request):
        print(request.body.decode("utf-8"))
        return HttpResponse(status=200)
