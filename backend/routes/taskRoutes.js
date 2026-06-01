const express = require('express');
const router = express.Router();
const {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');

// GET  /api/tasks        → Saare tasks
// GET  /api/tasks/:id    → Ek task
// POST /api/tasks        → Naya task
// PUT  /api/tasks/:id    → Task update
// DELETE /api/tasks/:id  → Task delete

router.get('/', getAllTasks);
router.get('/:id', getTaskById);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
