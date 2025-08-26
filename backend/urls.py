from django.urls import path
from todos import views

urlpatterns = [
    path('api/todos/', views.todoList),             
    path('api/todos/<str:id>/', views.todoList),  
]
