from django.urls import path
from todos.views import registerFunc, loginFunc, todoList

urlpatterns = [
    path('api/register/', registerFunc),
    path('api/login/', loginFunc),
    path('api/todos/', todoList),
    path('api/todos/<uuid:id>/', todoList),
]
