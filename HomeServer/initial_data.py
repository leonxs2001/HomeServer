from django.contrib.auth.models import User
from django.conf import settings

def initialize():
    """Method for initializing all the data of the application."""
    __init_base_users()


def __init_base_users():

    for user_dict in settings.INITIAL_USERS:

        user, created = User.objects.get_or_create(
            username=user_dict["username"],
            first_name=user_dict["first_name"],
            last_name=user_dict["last_name"]
        )
        if created:
            user.set_password(user_dict["password"])
            user.save()
