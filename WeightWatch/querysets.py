import datetime

from django.contrib.auth.models import User
from django.db.models import QuerySet, Sum, F, Count
from django.db.models.functions import Coalesce


class DishAmountQuerySet(QuerySet):
    def filter_for_day(self, time: datetime.datetime):
        return self.filter(
            eaten__month=time.month,
            eaten__year=time.year,
            eaten__day=time.day
        )

    def generate_macro_sum_up(self, user: User, time: datetime.datetime):
        result = self.filter(
            user=user
        ).filter_for_day(time).annotate(
            single_kcal=Sum(F("dish__foods__kcal") * F("dish__dishfoodamount__amount")) / 100,
            single_fat=Sum(F("dish__foods__fat") * F("dish__dishfoodamount__amount")) / 100,
            single_carbohydrates=Sum(F("dish__foods__carbohydrates") * F("dish__dishfoodamount__amount")) / 100,
            single_sugar=Sum(F("dish__foods__sugar") * F("dish__dishfoodamount__amount")) / 100,
            single_proteins=Sum(F("dish__foods__proteins") * F("dish__dishfoodamount__amount")) / 100,
        ).aggregate(
            kcal=Coalesce(Sum(F("single_kcal") * F("amount")) / 100, 0.0),
            fat=Coalesce(Sum(F("single_fat") * F("amount")) / 100, 0.0),
            carbohydrates=Coalesce(Sum(F("single_carbohydrates") * F("amount")) / 100, 0.0),
            sugar=Coalesce(Sum(F("single_sugar") * F("amount")) / 100, 0.0),
            proteins=Coalesce(Sum(F("single_proteins") * F("amount")) / 100, 0.0),
        )
        return result


class FoodQuerySet(QuerySet):
    def all_with_number_of_dishes(self):
        return self.all().order_by("-pk").annotate(
            number_of_dishes=Count(F("dishfoodamount"))
        )
