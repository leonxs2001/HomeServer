from django.contrib.auth.models import User
from django.db.models import Sum, F

from DriveWatch.models import Ride, TankFilling


def get_last_tank_filling_data_summary():
    tank_filling = TankFilling.objects.filter(date__isnull=False).last()
    if tank_filling == None:
        return dict()

    result = dict()
    user_data = list()

    result["total_money"] = tank_filling.money

    users = User.objects.all()

    ride_queryset = Ride.objects.filter(tank_filling=tank_filling)
    total_sum_distance = ride_queryset.aggregate(
        sum=Sum(F("distance"))
    )["sum"]
    total_sum_distance = total_sum_distance if total_sum_distance else 0

    together_sum_distance = ride_queryset.filter(user__isnull=True).aggregate(
        sum=Sum(F("distance"))
    )["sum"]
    together_sum_distance = together_sum_distance if together_sum_distance else 0

    result["together_distance"] = together_sum_distance
    try:
        together_money = (together_sum_distance / total_sum_distance) * tank_filling.money
    except ZeroDivisionError:
        together_money = 0
    result["together_money"] = round(together_money, 2)

    for user in users:
        sum_distance = ride_queryset.filter(user=user).aggregate(
            sum=Sum(F("distance"))
        )["sum"]
        sum_distance = sum_distance if sum_distance else 0

        try:
            money = (sum_distance / total_sum_distance) * tank_filling.money
        except ZeroDivisionError:
            money = 0

        user_data.append(
            {
                "id": user.id,
                "distance": round(sum_distance, 2),
                "money": round(money, 2),
                "calculated_money": round(money + together_money / 2, 2)
            }
        )
    result["user_data"] = user_data
    return result
