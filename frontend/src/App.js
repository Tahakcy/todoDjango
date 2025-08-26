import { useEffect, useState } from 'react';
import './App.css';

const URL = "http://127.0.0.1:8000/api/todos/";

export default function App() {
  const [todos, setTodos] = useState([]);
  const [editID, setEditID] = useState(null);
  const [editTask, setEditTask] = useState('');

  function loadTodos(){
    fetch(URL)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(setTodos)
      .catch((err) => console.error("görevler yüklenemedi:", err));
  }

  useEffect(() => { loadTodos(); }, []);

  function handleAdd(event){
    event.preventDefault();
    const formData = new FormData(event.target);
    const taskText = (formData.get("taskInput") || "").toString().trim();
    if(!taskText) return;

    fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task: taskText, completed: false }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      })
      .then(() => {
        event.target.reset();
        loadTodos();
      })
      .catch((err) => console.error("Ekleme hatası:", err));
  }

  function handleDelete(todo){
    fetch(`${URL}${todo.id}/`, { method: "DELETE" })
      .then(() => loadTodos())
      .catch((err) => console.error("Silme hatası:", err));
  }

  function handleToggle(todo){
    fetch(`${URL}${todo.id}/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !todo.completed }),
    })
      .then(() => loadTodos())
      .catch((err) => console.error("Toggle hatası:", err));
  }

  function handleEdit(todo){
    setEditID(todo.id);
    setEditTask(todo.task);
  }

  function handleCancel(){
    setEditID(null);
    setEditTask("");
  }

  function handleSave(todo){
    const newTask = editTask.trim();
    if(!newTask) return;

    fetch(`${URL}${todo.id}/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task: newTask }),
    })
      .then(() => {
        setEditID(null);
        setEditTask("");
        loadTodos();
      })
      .catch((err) => console.error("Save error:", err));
  }

  return (
    <div>
      <h1>TO-DO</h1>
      <hr/>
      <form onSubmit={handleAdd}>
        <input type='text' name='taskInput' placeholder='Add new task...' />
        <button type='submit'>ADD</button>
      </form>

      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            {editID === todo.id ? (
              <form onSubmit={(e) => { e.preventDefault(); handleSave(todo); }}>
                <input
                  type="text"
                  value={editTask}
                  onChange={(e) => setEditTask(e.target.value)}
                />
                <button type="button" onClick={() => handleSave(todo)}>Save</button>
                <button type="button" onClick={handleCancel}>Cancel</button>
              </form>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); handleSave(todo); }}>
                <input
                  type="checkbox"
                  checked={!!todo.completed}
                  onChange={() => handleToggle(todo)}
                />
                <span style={{ textDecoration: todo.completed ? "line-through" : "none" }}>
                  {todo.task}
                </span>
                <button type="button" onClick={() => handleEdit(todo)}>Edit</button>
                <button type="button" onClick={() => handleDelete(todo)}>Delete</button>
              </form>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}