import json
from .models import Todo
from django.http import JsonResponse
from .models import User,Todo
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt  

@csrf_exempt
def register(req):
    if req.method != 'POST':
        return JsonResponse({"error":"POST required"}, status=405)
    
    data = json.loads(req.body)
    username = data.get("username")
    password = data.get("password") 

    if not username or not password:
        return JsonResponse({"error": "username and password required"}, status=400)
    
    if User.objects.filter(username=username).exists():
        return JsonResponse({"error": "username already taken"}, status=400)
    
    user = User.objects.create(username=username, password=password)
    return JsonResponse({"ok": True, "user_id": user.id})

@csrf_exempt
def login(req):
    if req.method != 'POST':
        return JsonResponse({"error":"POST required"}, status=405)
    
    data = json.loads(req.body)
    username = data.get("username").strip()
    password = data.get("password").strip()

    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return JsonResponse({"ok": False, "reason":"wrong credentials"}, status=401)

    if user.password == password:
        return JsonResponse({"ok": True, "user_id": user.id})
    else:
        return JsonResponse({"ok": False, "reason":"wrong credentials"}, status=401)

@csrf_exempt
def logout_view(req):
    if req.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)
    
    return JsonResponse({"ok": True})

@csrf_exempt
def todoList(req, id=None): 
    if req.method == "GET":
        user_id = req.GET.get("user_id")
        
        todos = Todo.objects.filter(user_id = user_id)
        data = [{
            "id": t.id, 
            "task": t.task, 
            "completed": t.completed
        }
        for t in todos
        ]
        return JsonResponse(data, safe=False)

    data = json.loads(req.body or "{}")
    user_id = data.get("user_id")

    if req.method == "POST":
        todo = Todo.objects.create(
            user_id = user_id,
            task= data["task"],
            completed=False
            )
        
        return JsonResponse({
            "id": todo.id,
            "task": todo.task, 
            "completed": todo.completed
        }, status=201)

    if req.method == "PUT":
        
        todo = get_object_or_404(Todo, id=id, user_id=user_id)

        if "task" in data:
            todo.task = data["task"]

        if "completed" in data:
            todo.completed =bool(data["completed"])
        todo.save()

        return JsonResponse({
            "id": todo.id, 
            "task": todo.task, 
            "completed": todo.completed
        })

    if req.method == "DELETE":
        get_object_or_404(Todo, id=id, user_id=user_id).delete()
        return JsonResponse({"deleted": id})

    return JsonResponse({"error": "Method not allowed"}, status=405)
