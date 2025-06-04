require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  console.log("User authenticated:", req);
  if (!token) return res.status(401).json({ error: "Token missing" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    console.log("Verifying token:", token);

    if (err) return res.status(403).json({ error: "Invalid or expired token" });
    console.log("Verifying user:", user);
    req.user = user;
    next();
  });
}

app.post("/register", (req, res) => {
  const { username, email, password } = req.body;

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) return res.status(500).json({ error: err });

    db.query(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, hashedPassword],
      (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ id: results.insertId, username, email });
      }
    );
  });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (results.length === 0)
      return res.status(401).json({ error: "User not found" });

    const user = results[0];

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) return res.status(500).json({ error: "Encryption error" });

      if (isMatch) {
        const token = jwt.sign(
          { id: user.id, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
        );

        res.status(200).json({
          message: "Login successful",
          token,
          user: {
            id: user.id,
            name: user.username,
            email: user.email,
          },
        });
      } else {
        res.status(401).json({ error: "Invalid credentials" });
      }
    });
  });
});

app.get("/tasks", authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.query(
    "SELECT * FROM tasks WHERE user_id = ?",
    [userId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results);
    }
  );
});

app.post("/task", authenticateToken, (req, res) => {
  const { title, description } = req.body;
  const userId = req.user.id;

  db.query(
    "INSERT INTO tasks (title, description, user_id) VALUES (?, ?, ?)",
    [title, description, userId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err });

      res.json({
        id: results.insertId,
        title,
        description,
        is_completed: false,
        user_id: userId,
      });
    }
  );
});

app.listen(5000, () => {
  console.log("✅ Server running on http://localhost:5000");
});
