const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const port = 3000;

let todos = [
  { id: 1, title: "Task 1", completed: false },
  { id: 2, title: "Task 2", completed: false },
  { id: 3, title: "Task 3", completed: false },
];

app.use(bodyParser.json());

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "Invalid JSON" });
  }
  next();
});

//get all todos
app.get("/api/todos", (req, res) => {
  res.json(todos);
});

//get a single todo
app.get("/api/todos/:todoId", (req, res) => {
  const todoId = parseInt(req.params.todoId);
  if (isNaN(todoId)) {
    return res.status(400).json({ error: "Invalid ID format" });
  }
  const todo = todos.find((todo) => todo.id === todoId);
  if (!todo) {
    return res.status(404).json({ error: "Todo not found" });
  }
  res.json(todo);
});

//create a new todo
app.post("/api/todos", (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: "Request body cannot be empty" });
  }

  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ error: "The new todo must have a title" });
  }
  if (typeof title !== "string" || title.length < 3 || title.length > 100) {
    return res
      .status(400)
      .json({ error: "Title must be a string between 3 and 100 characters" });
  }
  if (todos.some((todo) => todo.title === title)) {
    return res
      .status(400)
      .json({ error: "A todo with this title already exists" });
  }
  const newTodo = {
    id: todos.length > 0 ? todos[todos.length - 1].id + 1 : 1,
    title: title,
    completed: false,
  };
  todos.push(newTodo);
  res.status(201).json(newTodo);
});

//update a todo
app.put("/api/todos/:todoId", (req, res) => {
  const todoId = parseInt(req.params.todoId);
  if (isNaN(todoId)) {
    return res.status(400).json({ error: "Invalid ID format" });
  }
  const todoIndex = todos.findIndex((todo) => todo.id === todoId);
  if (todoIndex === -1) {
    return res.status(404).json({ error: "Todo not found" });
  }
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: "Request body cannot be empty" });
  }

  const { title, completed } = req.body;
  if (title === undefined && completed === undefined) {
    return res.status(400).json({ error: "No fields to update" });
  }
  if (title !== undefined) {
    if (typeof title !== "string" || title.length < 3 || title.length > 100) {
      return res
        .status(400)
        .json({ error: "Title must be a string between 3 and 100 characters" });
    }
    if (todos.some((todo) => todo.title === title && todo.id !== todoId)) {
      return res
        .status(400)
        .json({ error: "A todo with this title already exists" });
    }
    todos[todoIndex].title = title;
  }
  if (completed !== undefined) {
    if (typeof completed !== "boolean") {
      return res.status(400).json({ error: "Completed must be a boolean" });
    }
    todos[todoIndex].completed = completed;
  }
  res.json(todos[todoIndex]);
});

//delete a todo
app.delete("/api/todos/:todoId", (req, res) => {
  const todoId = parseInt(req.params.todoId);
  if (isNaN(todoId)) {
    return res.status(400).json({ error: "Invalid ID format" });
  }
  const todoIndex = todos.findIndex((todo) => todo.id === todoId);
  if (todoIndex === -1) {
    return res.status(404).json({ error: "Todo not found" });
  }
  todos = todos.filter((todo) => todo.id !== todoId);
  res.json({ result: true });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
