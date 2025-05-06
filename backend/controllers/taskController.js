const asyncHandler = require('express-async-handler');
const Task = require('../models/taskModel');
const Partnership = require('../models/partnershipModel');

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = asyncHandler(async (req, res) => {
  const { title, description, deadline, assignee, partnership, recurringType, priority, tags } = req.body;

  if (!title || !deadline || !assignee || !partnership) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  // Verify that the partnership exists and user is part of it
  const partnershipDoc = await Partnership.findById(partnership);
  
  if (!partnershipDoc) {
    res.status(404);
    throw new Error('Partnership not found');
  }

  // Check if user is part of the partnership
  if (
    partnershipDoc.requester.toString() !== req.user._id.toString() &&
    partnershipDoc.recipient.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error('Not authorized to create tasks for this partnership');
  }

  // Check if assignee is part of the partnership
  if (
    partnershipDoc.requester.toString() !== assignee &&
    partnershipDoc.recipient.toString() !== assignee
  ) {
    res.status(400);
    throw new Error('Assignee must be a member of the partnership');
  }

  // Create new task
  const task = await Task.create({
    title,
    description: description || '',
    deadline,
    status: 'pending',
    creator: req.user._id,
    assignee,
    partnership,
    recurringType: recurringType || 'none',
    priority: priority || 'medium',
    tags: tags || []
  });

  res.status(201).json(task);
});

// @desc    Get tasks for a partnership
// @route   GET /api/tasks/partnership/:partnershipId
// @access  Private
const getPartnershipTasks = asyncHandler(async (req, res) => {
  const { partnershipId } = req.params;

  // Verify that the partnership exists and user is part of it
  const partnership = await Partnership.findById(partnershipId);
  
  if (!partnership) {
    res.status(404);
    throw new Error('Partnership not found');
  }

  // Check if user is part of the partnership
  if (
    partnership.requester.toString() !== req.user._id.toString() &&
    partnership.recipient.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error('Not authorized to view tasks for this partnership');
  }

  // Get all tasks for the partnership
  const tasks = await Task.find({ partnership: partnershipId })
    .sort({ deadline: 1 })
    .populate('creator', 'name')
    .populate('assignee', 'name');

  res.json(tasks);
});

// @desc    Get tasks assigned to the user
// @route   GET /api/tasks/assigned
// @access  Private
const getAssignedTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ assignee: req.user._id })
    .sort({ deadline: 1 })
    .populate('creator', 'name')
    .populate('partnership', 'status');

  res.json(tasks);
});

// @desc    Get tasks created by the user
// @route   GET /api/tasks/created
// @access  Private
const getCreatedTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ creator: req.user._id })
    .sort({ deadline: 1 })
    .populate('assignee', 'name')
    .populate('partnership', 'status');

  res.json(tasks);
});

// @desc    Get a single task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate('creator', 'name')
    .populate('assignee', 'name')
    .populate('partnership', 'status');

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  // Verify that the user is part of the partnership
  const partnership = await Partnership.findById(task.partnership);
  
  if (
    partnership.requester.toString() !== req.user._id.toString() &&
    partnership.recipient.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error('Not authorized to view this task');
  }

  res.json(task);
});

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = asyncHandler(async (req, res) => {
  const { title, description, deadline, status, recurringType, priority, tags } = req.body;

  // Find the task
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  // Verify that the user is the creator of the task
  if (task.creator.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this task');
  }

  // Update the task
  task.title = title || task.title;
  task.description = description !== undefined ? description : task.description;
  task.deadline = deadline || task.deadline;
  task.status = status || task.status;
  task.recurringType = recurringType || task.recurringType;
  task.priority = priority || task.priority;
  task.tags = tags || task.tags;

  const updatedTask = await task.save();

  res.json(updatedTask);
});

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  // Verify that the user is the creator of the task
  if (task.creator.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this task');
  }

  await task.deleteOne();

  res.json({ message: 'Task removed' });
});

// @desc    Mark a task as completed
// @route   PUT /api/tasks/:id/complete
// @access  Private
const markTaskComplete = asyncHandler(async (req, res) => {
  const { completionNotes } = req.body;

  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  // Verify that the user is the assignee of the task
  if (task.assignee.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Only the assignee can mark a task as complete');
  }

  // Update task status
  task.status = 'completed';
  task.completedAt = new Date();
  task.completionNotes = completionNotes || '';

  const updatedTask = await task.save();

  res.json(updatedTask);
});

// @desc    Mark a task as verified
// @route   PUT /api/tasks/:id/verify
// @access  Private
const verifyTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  // Verify that the user is the creator of the task
  if (task.creator.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Only the creator can verify task completion');
  }

  // Check if task is already completed
  if (task.status !== 'completed') {
    res.status(400);
    throw new Error('Task must be completed before it can be verified');
  }

  // Update task status
  task.status = 'verified';
  task.verifiedAt = new Date();

  const updatedTask = await task.save();

  res.json(updatedTask);
});

// @desc    Mark a task as failed
// @route   PUT /api/tasks/:id/fail
// @access  Private
const markTaskFailed = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  // Verify that the user is the creator of the task
  if (task.creator.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Only the creator can mark a task as failed');
  }

  // Update task status
  task.status = 'failed';

  const updatedTask = await task.save();

  res.json(updatedTask);
});

module.exports = {
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
}; 