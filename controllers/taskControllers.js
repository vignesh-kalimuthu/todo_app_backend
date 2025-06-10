const db = require("../db");
const { s3Client, PutObjectCommand } = require("../config/aws");
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

exports.createTask = async (req, res) => {
  const { title, description } = req.body;
  const userId = req.user.id;
  let fileUrl = null;

  try {
    if (req.file) {
      const fileName = `${Date.now()}_${req.file.originalname}`;
      console.log("Uploading file:", fileName);

      const bucketName = process.env.AWS_S3_BUCKET_NAME;

      const uploadParams = {
        Bucket: bucketName,
        Key: fileName,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      };

      await s3Client.send(new PutObjectCommand(uploadParams));

      fileUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    }

    db.query(
      "INSERT INTO tasks (title, description, user_id, file_url) VALUES (?, ?, ?, ?)",
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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
