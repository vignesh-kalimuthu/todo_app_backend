const db = require("../db");

// GET /api/tasks/
exports.getTasks = (req, res) => {
  const userId = req.user.id;

  db.query(
    "SELECT * FROM tasks WHERE user_id = ?",
    [userId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results);
    }
  );
};

// POST /api/tasks/
exports.createTask = (req, res) => {
  const { title, description } = req.body;
  const userId = req.user.id;
  const fileUrl = req.file ? req.file.location : null;

  db.query(
    "INSERT INTO tasks (title, description, user_id, file_path) VALUES (?, ?, ?, ?)",
    [title, description, userId, fileUrl],
    (err, results) => {
      if (err) return res.status(500).json({ error: err });

      res.json({
        id: results.insertId,
        title,
        description,
        is_completed: false,
        user_id: userId,
        file_url: fileUrl,
      });
    }
  );
};

// PUT /api/tasks/:id
exports.updateTask = (req, res) => {
  const { id } = req.params;
  const { title, description, is_completed } = req.body;
  const userId = req.user.id;
  console.log(`Updating task with ID: ${id} for user ID: ${userId}`);

  const query = `
    UPDATE tasks 
    SET title = ?, description = ?, is_completed = ?
    WHERE id = ? AND user_id = ?
  `;

  db.query(
    query,
    [title, description, is_completed, id, userId],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ message: "Task not found or not authorized" });
      }
      res.json({ message: "Task updated successfully" });
    }
  );
};

// DELETE /api/tasks/:id
exports.deleteTask = (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  db.query(
    "DELETE FROM tasks WHERE id = ? AND user_id = ?",
    [id, userId],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ message: "Task not found or not authorized" });
      }
      res.json({ message: "Task deleted successfully" });
    }
  );
};
