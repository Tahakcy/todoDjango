import json
from .models import Todo
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt  
from django.shortcuts import get_object_or_404

@csrf_exempt
@login_required

def registerFunc(req):
    if req.method != 'POST':
        return JsonResponse({"error":"POST required"}, status=405)
    
    data = json.loads(req.body)
    username = data.get("username")
    password = data.get("password") 

    if not username or not password:
        return JsonResponse({"error": "username and password required"}, status=400)
    
    if User.objects.filter(username=username).exists():
        return JsonResponse({"error": "username already taken"}, status=400)
    
    user = User.objects.create_user(username=username, password=password)
    return JsonResponse({"ok": True, "user.id": user.id})

def loginFunc(req):
    if req.method != 'POST':
        return JsonResponse({"error":"POST required"}, status=405)
    
    data = json.loads(req.body)
    username = data.get("username")
    password = data.get("password") 

    user = authenticate(req, username=username, password=password)
    if user is None:
        return JsonResponse({"error": "user does not exist"}, status=401)
    
    login(req,user)
    return JsonResponse({"ok": True})


def logout_view(req):
    if req.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)
    
    logout(req)
    return JsonResponse({"ok": True})

def todoList(req, id=None):
    if req.method == "GET":
        if id is None:
            qs = Todo.objects.filter(user = req.user).order_by("-created_at")
            data = [{
                "id": str(t.id), 
                "task": t.task, 
                "completed": t.completed
            }
                for t in qs
            ]
            return JsonResponse(data, safe=False)
        
        todo = get_object_or_404(Todo, pk=id, user=req.user)
        return JsonResponse({
            "id": str(todo.id), 
            "task": todo.task, 
            "completed": todo.completed})

    if req.method == "POST":
        body = json.loads(req.body.decode() or "{}")

        task = (body.get("task") or "").strip()
        if not task:
            return JsonResponse({"error": "task is required"}, status=400)
        
        todo = Todo.objects.create(
            user = req.user,
            task=task, 
            completed=bool(body.get("completed", False)))
        
        return JsonResponse({
            "id": str(todo.id),
            "task": todo.task, 
            "completed": todo.completed
        }, status=201)

    if req.method == "PUT":
        if id is None:
            return JsonResponse({"error": "id is required"}, status=400)
        
        todo = get_object_or_404(Todo, pk=id)
        body = json.loads(req.body.decode() or "{}")

        if "task" in body:
            todo.task = body["task"]

        if "completed" in body:
            todo.completed = bool(body["completed"])
        todo.save()

        return JsonResponse({
            "id": str(todo.id), 
            "task": todo.task, 
            "completed": todo.completed
        })

    if req.method == "DELETE":
        if id is None:
            return JsonResponse({"error": "id is required"}, status=400)
        todo = get_object_or_404(Todo, pk=id)
        todo.delete()
        return JsonResponse({"deleted": str(id)})

    return JsonResponse({"error": "Method not allowed"}, status=405)
