from django.contrib.auth.models import User
from django.db import models


class PayedMoney(models.Model):
    user = models.ForeignKey(User, models.CASCADE)

    amount = models.FloatField()
    date = models.DateField()
