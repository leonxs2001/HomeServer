from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.shortcuts import render, redirect
from django.views import View


class LoginView(View):
    """View for the login of a user."""

    def get(self, request):
        """Returns the templates with the login form."""

        return render(request, "login.html", {
            "form": AuthenticationForm()
        })

    def post(self, request):
        """Gets the login data from the form validates it authenticates login the user."""

        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get("username")
            password = form.cleaned_data.get("password")
            user = authenticate(username=username, password=password)
            login(request, user)
            return redirect("home")

        # redirect to the login if the form is not valid
        return render(request, "login.html", {
            "form": form
        })


class LogoutView(View):
    """View for the logout of a user."""

    def get(self, request):
        """Logs out a user."""

        logout(request)

        return redirect("login")