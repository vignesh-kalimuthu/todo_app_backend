const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../models/db");

exports.register = (req, res) => {
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
};

exports.login = (req, res) => {
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
};
