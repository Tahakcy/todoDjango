from django.urls import path
from todos.views import register, login, todoList

urlpatterns = [
    path('api/register/', register),
    path('api/login/', login),
    path('api/todos/', todoList),
    path('api/todos/<uuid:id>/', todoList),
]
