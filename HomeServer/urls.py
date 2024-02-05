"""
URL configuration for HomeServer project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.contrib.auth.decorators import login_required
from django.urls import path
from django.views.generic import TemplateView

from DriveWatch.views import DriveWatchView, ManageRideView, ManageTankFillingView
from HomeServer.views import LoginView, LogoutView
from PiHoleController.views import PiHoleView, PiHoleManageView
from WeightWatch.views import WeightWatchView, ManageUserDishAmountView, WeightWatchFoodView, ManageFoodView, \
    ManageCategoryView, UserMacrosView, WeightWatchStatisticsView, WeightWatchGetStatisticData, ShareUserDishAmountView, \
    WeightWatchFoodMacros

urlpatterns = [
    # path('admin/', admin.site.urls),

    # login and logout
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view()),

    # WeightWatch
    path("", login_required(TemplateView.as_view(template_name="home.html")), name="home"),

    path("weight-watch/", login_required(WeightWatchView.as_view())),
    path("weight-watch/statistics", login_required(WeightWatchStatisticsView.as_view())),
    path("weight-watch/food", login_required(WeightWatchFoodView.as_view())),

    path("weight-watch/user-dish-amount", login_required(ManageUserDishAmountView.as_view())),
    path("weight-watch/user-dish-amount/share", login_required(ShareUserDishAmountView.as_view())),
    path("weight-watch/food/food", login_required(ManageFoodView.as_view())),
    path("weight-watch/category", login_required(ManageCategoryView.as_view())),
    path("weight-watch/user-macros", login_required(UserMacrosView.as_view())),
    path("weight-watch/statistics/get-data", login_required(WeightWatchGetStatisticData.as_view())),
    path("weight-watch/food-macros", login_required(WeightWatchFoodMacros.as_view())),

    # DriveWatch
    path("drive-watch", login_required(DriveWatchView.as_view())),

    path("drive-watch/ride", login_required(ManageRideView.as_view())),
    path("drive-watch/tank-filling", login_required(ManageTankFillingView.as_view())),

    # PiHoleManager
    path("pi-hole-manager", login_required(PiHoleView.as_view())),
    path("pi-hole-manager/update", login_required(PiHoleManageView.as_view())),
]
