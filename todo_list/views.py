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

User = get_user_model()


class RegisterForm(generic.CreateView):
    """Registration Form"""

    form_class = UserRegistration
    template_name = "register.html"
    success_url = "/login/"

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
                messages.error(request, "Invalid Credentials!",
                               extra_tags='login')
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


# @login_required
# def add_update_task(request):
#     """For Various Form Operations"""
#     user = request.user
#     is_ajax_post = request.META.get(
#         'HTTP_X_REQUESTED_WITH') == 'XMLHttpRequest'
#     if is_ajax_post:
#         client_todo_obj = json.load(request)["taskObj"]
#         print(client_todo_obj)
#         record_found = False
#         for server_todo_obj in user.todo["toDos"]:
#             if client_todo_obj["toDoListID"] == server_todo_obj["toDoListID"]:
#                 server_todo_obj["taskDescription"] = client_todo_obj["taskDescription"]
#                 server_todo_obj["isCompleted"] = client_todo_obj["isCompleted"]
#                 server_todo_obj["isDeleted"] = client_todo_obj["isDeleted"]
#                 record_found = True
#                 break
#         if not record_found:
#             user.todo["toDos"].append(client_todo_obj)
#         user.save()
#     return HttpResponse(
#         json.dumps(user.todo["toDos"]),
#         content_type="application/json",
#     )


@login_required
def add_update_task(request):
    """For Various Form Operations"""
    user = request.user
    is_ajax_post = request.META.get(
        'HTTP_X_REQUESTED_WITH') == 'XMLHttpRequest'
    if is_ajax_post:
        client_todo_obj = json.load(request)["todoObj"]
        task_found = False
        list_found = False
        print(client_todo_obj)

        # For List/Task Changes
        for server_list_obj in user.todo["toDos"]:
            if server_list_obj["toDoListID"] == client_todo_obj["toDoListID"]:
                if 'toDoList' not in client_todo_obj:
                    server_list_obj["listName"] = client_todo_obj["listName"]
                    print("List Found")
                    if "listDeleted" in client_todo_obj:
                        server_list_obj["listDeleted"] = True
                        print('List Delete')
                    list_found = True
                    break
                print('Add/Update Task')
                list_found = True
                for server_task_obj in server_list_obj["toDoList"]:
                    for client_task_obj in client_todo_obj["toDoList"]:
                        if server_task_obj["taskID"] == client_task_obj["taskID"]:
                            print('Update Task!')
                            server_task_obj["taskDescription"] = client_task_obj["taskDescription"]
                            server_task_obj["isCompleted"] = client_task_obj["isCompleted"]
                            task_found = True
                            break
                if not task_found:
                    print('Add Task')
                    server_list_obj["toDoList"].append(
                        client_todo_obj["toDoList"][0])
        if not list_found:
            print('List Not Found!')
            user.todo["toDos"].append(client_todo_obj)
        user.save()
    return HttpResponse(
        json.dumps(user.todo["toDos"]),
        content_type="application/json",
    )


@login_required
def delete_task(request):
    """For Delete List/Task"""
    user = request.user
    is_ajax_post = request.META.get(
        'HTTP_X_REQUESTED_WITH') == 'XMLHttpRequest'
    if is_ajax_post:
        client_todo_obj = json.load(request)["listObj"]
        print(client_todo_obj)
        for server_list_obj in user.todo["toDos"]:
            if server_list_obj["toDoListID"] == client_todo_obj["toDoListID"]:
                if 'toDoList' not in client_todo_obj:
                    print('List Found & Deleted')
                    user.todo["toDos"].remove(server_list_obj)
                    break
                print('Tasks Found')
                for server_task_obj in server_list_obj["toDoList"]:
                    for client_task_obj in client_todo_obj["toDoList"]:
                        if server_task_obj["taskID"] == client_task_obj["taskID"]:
                            print('Task Deleted')
                            server_list_obj["toDoList"].remove(
                                server_task_obj)
        user.save()
    return HttpResponse(
        json.dumps(user.todo["toDos"]),
        content_type="application/json",
    )
