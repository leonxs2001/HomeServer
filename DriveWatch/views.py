import json

from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
from django.utils import timezone
from django.views import View
from django.views.generic import TemplateView

from DriveWatch.models import Ride, TankFilling
from DriveWatch.utils import get_last_tank_filling_data_summary
from WeightWatch.utils import ModelJSONEncoder


class DriveWatchView(TemplateView):
    template_name = "drive-watch.html"

    def get_context_data(self, **kwargs):
        context = dict()
        context["users"] = User.objects.all()
        context["rides"] = Ride.objects.all()
        return context


class ManageRideView(View):
    def delete(self, request):
        data = json.loads(request.body.decode("utf-8"))
        ride_id = int(data["id"])

        try:
            ride = Ride.objects.get(id=ride_id)
            ride.delete()

            return HttpResponse(status=200)
        except ObjectDoesNotExist:
            return HttpResponse(status=400)

    def post(self, request):
        data = json.loads(request.body.decode("utf-8"))
        user = None

        if data["userId"]:
            user_id = int(data["userId"])
            try:
                user = User.objects.get(id=user_id)
            except ObjectDoesNotExist:
                return HttpResponse(status=400)
        distance = float(data["distance"])

        last_tank_filling = TankFilling.objects.get(date=None)

        new_ride = Ride.objects.create(user=user, distance=distance, tank_filling=last_tank_filling, name=data["name"])

        new_ride_context = {
            "id": new_ride.id,
            "formatted_date": new_ride.formatted_date
        }

        return JsonResponse(new_ride_context, ModelJSONEncoder)


class ManageTankFillingView(View):

    def get(self, request):
        result = get_last_tank_filling_data_summary()

        return JsonResponse(result, ModelJSONEncoder)

    def post(self, request):
        data = json.loads(request.body.decode("utf-8"))
        money = float(data["money"])

        last_tank_filling = TankFilling.objects.get(date=None)
        last_tank_filling.date = timezone.now()
        last_tank_filling.money = money

        last_tank_filling.save()

        TankFilling.objects.create()

        return HttpResponse(status=200)




