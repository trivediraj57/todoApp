"""Views.py"""

import json
from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.contrib.auth import get_user_model, authenticate, login, logout
from django.contrib import messages
from django.urls import reverse, reverse_lazy
from django.views import generic
from django.contrib.auth.decorators import login_required
from .forms import UserRegistration, UserLogin
from django.contrib.messages.views import SuccessMessageMixin

User = get_user_model()


class RegisterForm(SuccessMessageMixin, generic.CreateView):
    """Registration Form"""

    form_class = UserRegistration
    template_name = "register.html"
    success_url = '/login/'

    def get_success_url(self):
        messages.success(
            self.request, '%s has been successfully registered!' % self.object.username, extra_tags='register')
        return reverse_lazy("login")


class LoginForm(generic.View):
    """Class Based Views For Login"""

    form_class = UserLogin
    template_name = "login.html"

    def get(self, request):
        """Get request"""
        form = self.form_class
        return render(request, self.template_name, {"form": form})

    def post(self, request):
        """Post Request"""
        form = UserLogin(request.POST)
        if form.is_valid():
            user = authenticate(
                username=form.cleaned_data["username"],
                password=form.cleaned_data["password"],
            )
            if user:
                login(request, user)
                return redirect(reverse("todo-home"))
            else:
                messages.error(request, "Invalid Credentials!", extra_tags="login")
        return render(request, "login.html", {"form": form})


class LogoutForm(generic.View):
    """Class Based View for Logout"""

    def get(self, request):
        """Get Request"""
        logout(request)
        return redirect("/")


@login_required
def todo_home(request):
    """Main Home Page"""
    return render(request, "todo-home.html")


@login_required
def add_update_task(request):
    """For Various Form Operations"""
    user = request.user
    is_ajax_post = request.META.get(
        'HTTP_X_REQUESTED_WITH') == 'XMLHttpRequest'
    if is_ajax_post:
        client_todo_obj = json.load(request)["taskObj"]
        record_found = False
        for server_todo_obj in user.todo["toDoList"]:
            if client_todo_obj["taskID"] == server_todo_obj["taskID"]:
                server_todo_obj["taskDescription"] = client_todo_obj["taskDescription"]
                server_todo_obj["isCompleted"] = client_todo_obj["isCompleted"]
                server_todo_obj["isDeleted"] = client_todo_obj["isDeleted"]
                record_found = True
                break
        if not record_found:
            user.todo["toDoList"].append(client_todo_obj)
        user.save()
    return HttpResponse(
        json.dumps(user.todo["toDoList"]),
        content_type="application/json",
    )
