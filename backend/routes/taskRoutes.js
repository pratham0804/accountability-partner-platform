const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createTask,
  getPartnershipTasks,
  getAssignedTasks,
  getCreatedTasks,
  getTaskById,
  updateTask,
  deleteTask,
  markTaskComplete,
  verifyTask,
  markTaskFailed
} = require('../controllers/taskController');

// All routes are protected
router.use(protect);

// Task routes
router.route('/')
  .post(createTask);

router.route('/partnership/:partnershipId')
  .get(getPartnershipTasks);

router.route('/assigned')
  .get(getAssignedTasks);

router.route('/created')
  .get(getCreatedTasks);

router.route('/:id')
  .get(getTaskById)
  .put(updateTask)
  .delete(deleteTask);

router.route('/:id/complete')
  .put(markTaskComplete);

router.route('/:id/verify')
  .put(verifyTask);

router.route('/:id/fail')
  .put(markTaskFailed);

module.exports = router; 