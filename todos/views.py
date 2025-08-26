import json
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt  
from django.shortcuts import get_object_or_404
from .models import Todo

    

@csrf_exempt
def todoList(req, id=None):

    if req.method == "GET":
        if id is None:
            data = [{
                "id": str(t.id), 
                "task": t.task, 
                "completed": t.completed
            }
                for t in Todo.objects.all()
            ]
            return JsonResponse(data, safe=False)
        todo = get_object_or_404(Todo, pk=id)
        return JsonResponse({
            "id": str(todo.id), 
            "task": todo.task, 
            "completed": todo.completed})

    if req.method == "POST":
        body = json.loads(req.body.decode() or "{}")
        task = (body.get("task") or "").trim() if hasattr(str, 'trim') else (body.get("task") or "").strip()
        if not task:
            return JsonResponse({"error": "task is required"}, status=400)
        todo = Todo.objects.create(task=task, completed=bool(body.get("completed", False)))
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
