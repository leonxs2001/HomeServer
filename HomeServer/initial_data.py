from django.contrib.auth.models import User


def initialize():
    """Method for initializing all the data of the application."""
    __init_base_users()


def __init_base_users():
    angi, created_1 = User.objects.get_or_create(
        username="angi",
        first_name="Angelina",
        last_name="Tarra"
    )
    if created_1:
        angi.set_password("dragonball20")
        angi.save()

    leon, created_2 = User.objects.get_or_create(
        username="leon",
        first_name="Leon",
        last_name="Schönberg"
    )
    if created_2:
        leon.set_password("dragonball20")
        leon.save()
