from django.contrib.auth.models import User
from django.db import models

# Create your models here.
from django.utils import timezone


class TankFilling(models.Model):
    date = models.DateTimeField(null=True)
    money = models.FloatField(null=True)


class Ride(models.Model):
    date = models.DateTimeField(default=timezone.now)
    distance = models.FloatField()

    tank_filling = models.ForeignKey(TankFilling, models.CASCADE)
    user = models.ForeignKey(User, models.CASCADE, null=True)
    name = models.CharField(max_length=32, default="")

    @property
    def formatted_date(self):
        return self.date.strftime("%d.%m.%Y %H:%M")

    class Meta:
        ordering = ["-date"]
