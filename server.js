const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/tasks", (req, res) => {
  db.query("SELECT * FROM tasks ", (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

app.post("/task", (req, res) => {
  const { title, description } = req.body;
  db.query(
    "INSERT INTO tasks (title, description) VALUES (?,?)",
    [title, description],
    (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json({
        id: results.insertId,
        title,
        description,
        is_completed: false,
      });
    }
  );
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
