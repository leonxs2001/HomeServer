from django.http import HttpResponse
from django.views import View
import json


class StudyView(View):

    def get(self, request):
        data = json.loads(request.body.decode("utf-8"))
        print(data)

        return HttpResponse(status=200)

    def post(self, request):
        data = json.loads(request.body.decode("utf-8"))
        print(data)

        return HttpResponse(status=200)

    def put(self, request):
        data = json.loads(request.body.decode("utf-8"))
        print(data)

        return HttpResponse(status=200)

    def delete(self, request):
        data = json.loads(request.body.decode("utf-8"))
        print(data)

        return HttpResponse(status=200)
