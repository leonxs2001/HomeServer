import datetime

from django.contrib.auth.models import User
from django.db.models import QuerySet, Sum, F, Count, Min, Q
from django.db.models.functions import Coalesce, Round


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
            kcal=Round(Coalesce(Sum(F("single_kcal") * F("amount")) / 100, 0.0), 2),
            fat=Round(Coalesce(Sum(F("single_fat") * F("amount")) / 100, 0.0), 2),
            carbohydrates=Round(Coalesce(Sum(F("single_carbohydrates") * F("amount")) / 100, 0.0), 2),
            sugar=Round(Coalesce(Sum(F("single_sugar") * F("amount")) / 100, 0.0), 2),
            proteins=Round(Coalesce(Sum(F("single_proteins") * F("amount")) / 100, 0.0), 2),
        )
        return result


class FoodQuerySet(QuerySet):
    def all_with_number_of_dishes(self):
        return self.all().order_by("-pk").annotate(
            number_of_dishes=Count(F("dishfoodamount"), distinct=False)
        )


class UserMacrosQuerySet(QuerySet):

    def get_with_previous_for_period(self, user, start, end):
        result = [element for element in self.filter(user=user, date__range=(start, end))]
        if len(result) > 0:
            if result[0].date != start:
                first_element = self.filter(date__lt=start).last()
                if first_element:
                    first_element.date = start
                    result = [first_element, ] + result

            result[-1].date = end

        return result
