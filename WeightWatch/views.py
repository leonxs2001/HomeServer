import json

from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist
from django.core.serializers.json import DjangoJSONEncoder
from django.db import IntegrityError
from django.db.models import QuerySet, Model, F
from django.forms import model_to_dict
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
from django.utils import timezone
from django.views import View
from django.views.generic import TemplateView

INPUT_TIME_FORMAT = "%Y-%m-%d"

from WeightWatch.models import UserDishAmount, Food, Dish, DishFoodAmount, Category, UserMacros, StatisticChoices
from WeightWatch.utils import ModelJSONEncoder, DATE_FORMAT


class WeightWatchView(TemplateView):
    template_name = "weight-watch.html"

    def get_context_data(self, **kwargs):
        user = self.request.user
        context = UserDishAmount.objects.generate_macro_sum_up(user, timezone.now())
        context["user"] = user
        context["user_macros"] = UserMacros.objects.filter(user=user).last()
        context["user_dish_amounts"] = UserDishAmount.objects.filter(user=user).select_related("dish")
        context["food"] = Food.objects.all()
        context["categories"] = Category.objects.all()
        context["other_users"] = User.objects.exclude(id=user.id)
        return context


class WeightWatchFoodView(TemplateView):
    template_name = "weight-watch-food.html"

    def get_context_data(self, **kwargs):
        context = dict()
        context["categories"] = Category.objects.all()
        context["food"] = Food.objects.all_with_number_of_dishes()
        return context


class WeightWatchStatisticsView(TemplateView):
    template_name = "weight-watch-statistics.html"

    def get_context_data(self, **kwargs):
        context = dict()
        context["statistic_types"] = StatisticChoices.choices
        context["start_date"] = (timezone.now() - timezone.timedelta(days=6)).strftime(INPUT_TIME_FORMAT)
        context["end_date"] = timezone.now().strftime(INPUT_TIME_FORMAT)
        return context


class ManageUserDishAmountView(View):
    def get(self, request):
        try:
            user_dish_amount = UserDishAmount.objects.get(id=int(request.GET["id"]))
            user = self.request.user

            if user != user_dish_amount.user:
                return HttpResponse(status=403)

            context = dict()

            dish = user_dish_amount.dish

            context["amount"] = user_dish_amount.amount
            context["dishName"] = dish.name
            context["userDishAmountId"] = user_dish_amount.id
            context["eaten"] = user_dish_amount.eaten
            context["dishFoodAmounts"] = DishFoodAmount.objects.filter(dish=dish).annotate(
                name=F("food__name")
            ).values("amount", "name")

            return JsonResponse(context, ModelJSONEncoder, safe=False)

        except ObjectDoesNotExist:
            return HttpResponse(status=400)

    def delete(self, request):
        user = self.request.user
        data = json.loads(request.body.decode("utf-8"))
        user_dish_amount_id = int(data["id"])

        try:
            user_dish_amount = UserDishAmount.objects.get(id=user_dish_amount_id)

            user_dish_amount.dish.delete()
            user_dish_amount.delete()

            context = UserDishAmount.objects.generate_macro_sum_up(user, timezone.now())

            return JsonResponse(context, ModelJSONEncoder)
        except ObjectDoesNotExist:
            return HttpResponse(status=400)

    def post(self, request):
        user = self.request.user
        data = json.loads(request.body.decode("utf-8"))

        dish = Dish.objects.create(name=data["name"], date_of_creation=timezone.now())

        for food_amount_dict in data["dishFoodAmounts"]:
            try:
                DishFoodAmount.objects.create(dish=dish,
                                              food_id=int(food_amount_dict["id"]),
                                              amount=float(food_amount_dict["amount"]))
            except IntegrityError as e:
                print(e)

        user_dish_amount = UserDishAmount.objects.create(dish=dish, user=user, amount=float(data["amount"]),
                                                         eaten=timezone.datetime.strptime(data["date"], DATE_FORMAT))

        context = UserDishAmount.objects.generate_macro_sum_up(user, timezone.now())

        context["id"] = user_dish_amount.id
        return JsonResponse(context, ModelJSONEncoder)

    def put(self, request):
        user = self.request.user
        data = json.loads(request.body.decode("utf-8"))

        try:
            user_dish_amount = UserDishAmount.objects.get(id=int(data["id"]))
            user_dish_amount.amount = float(data["amount"])

            dish = user_dish_amount.dish
            dish.name = data["name"]

            user_dish_amount.eaten = timezone.datetime.strptime(data["date"], DATE_FORMAT)

            if user != user_dish_amount.user:
                return HttpResponse(status=403)

            DishFoodAmount.objects.filter(dish=dish).delete()

            for food_amount_dict in data["dishFoodAmounts"]:
                try:
                    DishFoodAmount.objects.create(dish=dish,
                                                  food_id=int(food_amount_dict["id"]),
                                                  amount=float(food_amount_dict["amount"]))
                except IntegrityError as e:
                    print(e)

            user_dish_amount.save()
            dish.save()

            context = UserDishAmount.objects.generate_macro_sum_up(user, timezone.now())

            context["id"] = user_dish_amount.id
            return JsonResponse(context, ModelJSONEncoder)
        except ObjectDoesNotExist:
            return HttpResponse(status=400)


class ShareUserDishAmountView(View):
    def put(self, request):
        user = self.request.user
        data = json.loads(request.body.decode("utf-8"))

        try:
            user_dish_amount = UserDishAmount.objects.get(user=user, id=int(data["dishId"]))
            other_user = User.objects.get(id=int(data["userId"]))

            UserDishAmount.objects.create(user=other_user, dish_id=user_dish_amount.dish_id,
                                          amount=0, eaten=user_dish_amount.eaten)

            return HttpResponse(status=200)
        except ObjectDoesNotExist:
            return HttpResponse(status=400)


class ManageFoodView(View):
    def get(self, request):
        try:
            food = Food.objects.get(id=int(request.GET["id"]))
            context = {
                "food": food,
                "categories": food.category_set.all()
            }
            return JsonResponse(context, ModelJSONEncoder)
        except ObjectDoesNotExist:
            return HttpResponse(status=400)

    def post(self, request):
        data = json.loads(request.body.decode("utf-8"))

        new_food = Food.objects.create(name=data["name"],
                                       kcal=float(data["kcal"]),
                                       fat=float(data["fat"]),
                                       carbohydrates=float(data["carbohydrates"]),
                                       sugar=float(data["sugar"]),
                                       proteins=float(data["proteins"]))

        for category_id in data["categories"]:
            try:
                category = Category.objects.get(id=int(category_id))
                category.food.add(new_food)
            except ObjectDoesNotExist as e:
                print(e)

        return JsonResponse({"id": new_food.id}, ModelJSONEncoder)

    def put(self, request):
        data = json.loads(request.body.decode("utf-8"))

        try:
            food = Food.objects.get(id=int(data["id"]))
            food.name = data["name"]
            food.kcal = float(data["kcal"])
            food.fat = float(data["fat"])
            food.carbohydrates = float(data["carbohydrates"])
            food.sugar = float(data["sugar"])
            food.proteins = float(data["proteins"])

            food.save()

            categories = []
            for category_id in data["categories"]:
                try:
                    categories.append(Category.objects.get(id=int(category_id)))
                except ObjectDoesNotExist as e:
                    print(e)

            food.category_set.set(categories)

            return JsonResponse({"id": food.id}, ModelJSONEncoder)
        except ObjectDoesNotExist:
            return HttpResponse(status=400)

    def delete(self, request):
        data = json.loads(request.body.decode("utf-8"))
        Food.objects.filter(id=int(data["id"])).delete()
        return HttpResponse(status=200)


class ManageCategoryView(View):
    def post(self, request):
        data = json.loads(request.body.decode("utf-8"))

        category = Category.objects.create(name=data["name"], color=data["color"])

        return JsonResponse({
            "id": category.id
        }, ModelJSONEncoder)

    def put(self, request):
        data = json.loads(request.body.decode("utf-8"))

        queryset = Category.objects.filter(id=int(data["id"]))
        if queryset.count() > 0:
            queryset.update(name=data["name"], color=data["color"])

            return HttpResponse(status=200)
        else:
            return HttpResponse(status=400)


class UserMacrosView(View):
    def post(self, request):
        user = self.request.user

        data = json.loads(request.body.decode("utf-8"))
        kcal = data["kcal"]
        sugar = data["sugar"]
        fat = data["fat"]
        proteins = data["proteins"]
        carbohydrates = data["carbohydrates"]

        try:
            kcal = int(kcal)
        except ValueError:
            kcal = 0
        try:
            sugar = float(sugar)
        except ValueError:
            sugar = 0
        try:
            fat = float(fat)
        except ValueError:
            fat = 0
        try:
            proteins = float(proteins)
        except ValueError:
            proteins = 0
        try:
            carbohydrates = float(carbohydrates)
        except ValueError:
            carbohydrates = 0
        defaults = {
            "kcal": kcal,
            "fat": fat,
            "proteins": proteins,
            "sugar": sugar,
            "carbohydrates": carbohydrates
        }
        UserMacros.objects.update_or_create(user=user, date=timezone.now(), defaults=defaults)

        return HttpResponse(status=200)


class WeightWatchGetStatisticData(View):
    def get(self, request):
        user = self.request.user
        start_date_string = request.GET["start_date"]
        end_date_string = request.GET["end_date"]
        type_string = request.GET["type"]

        start_date = timezone.datetime.strptime(start_date_string, INPUT_TIME_FORMAT)
        end_date = timezone.datetime.strptime(end_date_string, INPUT_TIME_FORMAT)

        dates = [start_date + timezone.timedelta(days=i) for i in range((end_date - start_date).days + 1)]

        dish_amounts = []
        for time in dates:
            dish_amounts.append({
                "date": time,
                "dish_amount": UserDishAmount.objects.generate_macro_sum_up(user, time)
            })

        context = dict()
        context["user_macros"] = UserMacros.objects.get_with_previous_for_period(user, start_date, end_date)
        context["dish_amounts"] = dish_amounts

        return JsonResponse(context, ModelJSONEncoder)
