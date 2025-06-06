const express = require("express");
const router = express.Router();
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");
const authenticateToken = require("../middleware/authenticateToken");

router.get("/", authenticateToken, getTasks);
router.post("/", authenticateToken, createTask);
router.put("/:id", authenticateToken, updateTask);
router.delete("/:id", authenticateToken, deleteTask);

module.exports = router;
