import { useEffect, useState } from "react";

const API = "http://127.0.0.1:8000/api";
const TODOS_URL = `${API}/todos/`;
const REGISTER_URL = `${API}/register/`;
const LOGIN_URL = `${API}/login/`;

export default function App() {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [userId, setUserId] = useState(null);
  const [authError, setAuthError] = useState("");

  const [todos, setTodos] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [editID, setEditID] = useState(null);
  const [editTask, setEditTask] = useState("");

  async function handleRegister(event) {
    event.preventDefault();
    setAuthError("");
    try {
      const res = await fetch(REGISTER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "register failed");
      setMode("login");
    } catch (err) {
      setAuthError(String(err.message || err));
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    setAuthError("");
    try {
      const res = await fetch(LOGIN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.reason || "login failed");
      setUserId(data.user_id); // en ilkel: sadece user_id tut
    } catch (err) {
      setAuthError(String(err.message || err));
    }
  }

  function handleLogout() {
    setUserId(null);
    setUsername("");
    setPassword("");
    setTodos([]);
    setNewTask("");
    setEditID(null);
    setEditTask("");
    setMode("login");
  }

  // --- TODOS ---
  async function loadTodos() {
    if (!userId) { setTodos([]); return; }
    const res = await fetch(`${TODOS_URL}?user_id=${userId}`);
    const data = await res.json();
    setTodos(Array.isArray(data) ? data : []);
  }
  useEffect(() => { loadTodos(); }, [userId]);

  async function addTodo(event) {
    event.preventDefault();
    if (!userId) return;
    const task = newTask.trim();
    if (!task) return;
    await fetch(TODOS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, task })
    });
    setNewTask("");
    loadTodos();
  }

  async function toggleTodo(todo) {
    await fetch(`${TODOS_URL}${todo.id}/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, completed: !todo.completed })
    });
    loadTodos();
  }

  async function deleteTodo(todo) {
    await fetch(`${TODOS_URL}${todo.id}/`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId })
    });
    loadTodos();
  }

  function startEdit(todo) {
    setEditID(todo.id);
    setEditTask(todo.task);
  }
  function cancelEdit() {
    setEditID(null);
    setEditTask("");
  }
  async function saveEdit(todo) {
    const task = editTask.trim();
    if (!task) return;
    await fetch(`${TODOS_URL}${todo.id}/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, task })
    });
    setEditID(null);
    setEditTask("");
    loadTodos();
  }

  // --- UI ---
  if (!userId) {
    return (
      <div>
        <h2>Auth</h2>
        <div>
          <button onClick={() => setMode("login")} disabled={mode === "login"}>Login</button>
          <button onClick={() => setMode("register")} disabled={mode === "register"}>Register</button>
        </div>

        {mode === "login" ? (
          <form onSubmit={handleLogin}>
            <input placeholder="username" value={username} onChange={event=>setUsername(event.target.value)} />
            <input type="password" placeholder="password" value={password} onChange={event=>setPassword(event.target.value)} />
            <button type="submit">Login</button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <input placeholder="username" value={username} onChange={event=>setUsername(event.target.value)} />
            <input type="password" placeholder="password" value={password} onChange={event=>setPassword(event.target.value)} />
            <button type="submit">Register</button>
          </form>
        )}

        {authError && <p>{authError}</p>}
      </div>
    );
  }

  return (
    <div>
      <h2>Todos (user_id: {userId})</h2>
      <button onClick={handleLogout}>Logout</button>

      <form onSubmit={addTodo}>
        <input
          placeholder="new task"
          value={newTask}
          onChange={event=>setNewTask(event.target.value)}
        />
        <button type="submit">Add</button>
      </form>

      <ul>
        {todos.map(todo => (
          <li key={todo.id}>
            {editID === todo.id ? (
              <>
                <input value={editTask} onChange={event=>setEditTask(event.target.value)} />
                <button onClick={() => saveEdit(todo)}>Save</button>
                <button onClick={cancelEdit}>Cancel</button>
              </>
            ) : (
              <>
                <input type="checkbox" checked={!!todo.completed} onChange={() => toggleTodo(todo)} />
                <span>{todo.task}</span>
                <button onClick={() => startEdit(todo)}>Edit</button>
                <button onClick={() => deleteTodo(todo)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
