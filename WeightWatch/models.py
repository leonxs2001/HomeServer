from django.contrib.auth.models import User
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from WeightWatch.querysets import DishAmountQuerySet, FoodQuerySet, UserMacrosQuerySet


class StatisticChoices(models.TextChoices):
    KCAL = "kcal", _("kcal")
    FAT = "fat", _("Fett")
    CARBOHYDRATES = "carbohydrates", _("Kohlenhydrate")
    SUGAR = "sugar", _("Zucker")
    PROTEINS = "proteins", _("Proteine")


class Food(models.Model):
    objects = FoodQuerySet.as_manager()

    name = models.CharField(max_length=32)
    kcal = models.IntegerField()
    fat = models.FloatField()
    carbohydrates = models.FloatField()
    sugar = models.FloatField()
    proteins = models.FloatField()


class Category(models.Model):
    name = models.CharField(max_length=32)
    color = models.CharField(max_length=8, default="#ffff90")
    food = models.ManyToManyField(Food)


class Dish(models.Model):
    name = models.CharField(max_length=32)
    date_of_creation = models.DateTimeField()
    foods = models.ManyToManyField(Food, through='DishFoodAmount')


class DishFoodAmount(models.Model):
    dish = models.ForeignKey(Dish, on_delete=models.CASCADE)
    food = models.ForeignKey(Food, on_delete=models.CASCADE)
    amount = models.FloatField()


class UserDishAmount(models.Model):
    objects = DishAmountQuerySet.as_manager()

    dish = models.ForeignKey(Dish, models.CASCADE)
    user = models.ForeignKey(User, models.CASCADE)

    amount = models.FloatField()  # in Prozent
    eaten = models.DateTimeField()

    class Meta:
        ordering = ["-eaten"]


class UserMacros(models.Model):
    objects = UserMacrosQuerySet.as_manager()

    user = models.ForeignKey(User, models.CASCADE)

    kcal = models.IntegerField(default=0)
    fat = models.FloatField(default=0)
    carbohydrates = models.FloatField(default=0)
    sugar = models.FloatField(default=0)
    proteins = models.FloatField(default=0)
    date = models.DateField(default=timezone.now)
