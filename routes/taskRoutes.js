const express = require("express");
const router = express.Router();

const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} = require("../controllers/taskControllers");
const authenticateToken = require("../middleware/authenticateToken");
const upload = require("../middleware/upload");

router.get("/", authenticateToken, getTasks);
router.post("/", authenticateToken, upload.single("file"), createTask);
router.put("/:id", authenticateToken, updateTask);
router.delete("/:id", authenticateToken, deleteTask);

module.exports = router;
