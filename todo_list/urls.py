"""URLS for ToDo App"""
# pylint: disable=E1101
from django.urls import path, include
from . import views

urlpatterns = [
    path("register/", views.RegisterForm.as_view(), name="register"),
    path("login/", views.LoginForm.as_view(), name="login"),
    path("logout/", views.LogoutForm.as_view(), name="logout"),
    path("", views.todo_home, name="todo-home"),
    path("add-update-task/", views.add_update_task, name="add_update_task"),
    path("delete-task", views.delete_task, name='delete_task'),
    path("", include("social_django.urls", namespace="social")),
]
