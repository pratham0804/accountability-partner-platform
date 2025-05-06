const asyncHandler = require('express-async-handler');
const Proof = require('../models/proofModel');
const Task = require('../models/taskModel');
const User = require('../models/userModel');
const Partnership = require('../models/partnershipModel');

// @desc    Submit proof for a task
// @route   POST /api/proofs
// @access  Private
const submitProof = asyncHandler(async (req, res) => {
  const { taskId, proofType, content, additionalNotes } = req.body;

  if (!taskId || !proofType || !content) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  // Validate proof type
  const validProofTypes = ['text', 'image', 'link', 'file'];
  if (!validProofTypes.includes(proofType)) {
    res.status(400);
    throw new Error('Invalid proof type');
  }

  // Get the task
  const task = await Task.findById(taskId);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  // Check if the user is the assignee of the task
  if (task.assignee.toString() !== req.user.id) {
    res.status(403);
    throw new Error('You can only submit proof for tasks assigned to you');
  }

  // Check if the task is not already completed or verified
  if (task.status === 'verified' || task.status === 'failed') {
    res.status(400);
    throw new Error(`Cannot submit proof for a task that is already ${task.status}`);
  }

  // Check if proof already exists for this task
  const existingProof = await Proof.findOne({ task: taskId, submitter: req.user.id });
  
  if (existingProof) {
    // Update existing proof instead of creating a new one
    existingProof.proofType = proofType;
    existingProof.content = content;
    existingProof.additionalNotes = additionalNotes || '';
    existingProof.verificationStatus = 'pending'; // Reset to pending if resubmitting
    existingProof.verificationComment = '';
    existingProof.rejected = false;
    existingProof.rejectionReason = '';

    await existingProof.save();

    // Also update the task status if it's not already completed
    if (task.status !== 'completed') {
      task.status = 'completed';
      task.completedAt = new Date();
      await task.save();
    }

    return res.status(200).json(existingProof);
  }

  // Create new proof
  const proof = await Proof.create({
    task: taskId,
    submitter: req.user.id,
    proofType,
    content,
    additionalNotes: additionalNotes || ''
  });

  // Update task status to completed
  task.status = 'completed';
  task.completedAt = new Date();
  await task.save();

  res.status(201).json(proof);
});

// @desc    Get proofs for a task
// @route   GET /api/proofs/task/:taskId
// @access  Private
const getProofsByTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  // Get the task
  const task = await Task.findById(taskId);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  // Check if the user is the creator or assignee of the task
  if (task.creator.toString() !== req.user.id && task.assignee.toString() !== req.user.id) {
    res.status(403);
    throw new Error('You can only view proofs for tasks you created or are assigned to you');
  }

  const proofs = await Proof.find({ task: taskId })
    .populate('submitter', 'name email')
    .populate('verifier', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json(proofs);
});

// @desc    Get proofs submitted by the user
// @route   GET /api/proofs/submitted
// @access  Private
const getSubmittedProofs = asyncHandler(async (req, res) => {
  const proofs = await Proof.find({ submitter: req.user.id })
    .populate('task', 'title description status')
    .populate('verifier', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json(proofs);
});

// @desc    Get proofs pending verification for the user
// @route   GET /api/proofs/pending
// @access  Private
const getPendingVerificationProofs = asyncHandler(async (req, res) => {
  // Find tasks where the user is the creator (removing the restriction on self-assigned tasks)
  const tasks = await Task.find({ 
    creator: req.user.id,
    status: 'completed'
  });

  const taskIds = tasks.map(task => task._id);

  // Find proofs for these tasks with pending verification
  const proofs = await Proof.find({ 
    task: { $in: taskIds },
    verificationStatus: 'pending'
  })
    .populate('task', 'title description')
    .populate('submitter', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json(proofs);
});

// @desc    Verify a proof
// @route   PUT /api/proofs/:id/verify
// @access  Private
const verifyProof = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { verificationComment } = req.body;

  const proof = await Proof.findById(id);

  if (!proof) {
    res.status(404);
    throw new Error('Proof not found');
  }

  // Get the task
  const task = await Task.findById(proof.task);

  if (!task) {
    res.status(404);
    throw new Error('Associated task not found');
  }

  // Check if the user is the creator of the task (no longer restricting self-verification)
  if (task.creator.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Only the task creator can verify proofs');
  }

  // Check if proof is already verified or rejected
  if (proof.verificationStatus !== 'pending') {
    res.status(400);
    throw new Error(`Proof is already ${proof.verificationStatus}`);
  }

  // Update proof
  proof.verificationStatus = 'approved';
  proof.verifier = req.user.id;
  proof.verificationComment = verificationComment || '';
  proof.verifiedAt = new Date();
  proof.rejected = false;
  proof.rejectionReason = '';

  await proof.save();

  // Update task status to verified
  task.status = 'verified';
  task.verifiedAt = new Date();
  await task.save();

  res.status(200).json(proof);
});

// @desc    Reject a proof
// @route   PUT /api/proofs/:id/reject
// @access  Private
const rejectProof = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rejectionReason } = req.body;

  if (!rejectionReason) {
    res.status(400);
    throw new Error('Please provide a reason for rejection');
  }

  const proof = await Proof.findById(id);

  if (!proof) {
    res.status(404);
    throw new Error('Proof not found');
  }

  // Get the task
  const task = await Task.findById(proof.task);

  if (!task) {
    res.status(404);
    throw new Error('Associated task not found');
  }

  // Check if the user is the creator of the task (no longer restricting self-rejection)
  if (task.creator.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Only the task creator can reject proofs');
  }

  // Check if proof is already verified or rejected
  if (proof.verificationStatus !== 'pending') {
    res.status(400);
    throw new Error(`Proof is already ${proof.verificationStatus}`);
  }

  // Update proof
  proof.verificationStatus = 'rejected';
  proof.verifier = req.user.id;
  proof.rejected = true;
  proof.rejectionReason = rejectionReason;
  proof.verifiedAt = new Date();

  await proof.save();

  // Reset task status to in_progress
  task.status = 'in_progress';
  task.completedAt = null;
  await task.save();

  res.status(200).json(proof);
});

// @desc    Get a proof by ID
// @route   GET /api/proofs/:id
// @access  Private
const getProofById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const proof = await Proof.findById(id)
    .populate('task', 'title description status')
    .populate('submitter', 'name email')
    .populate('verifier', 'name email');

  if (!proof) {
    res.status(404);
    throw new Error('Proof not found');
  }

  // Get the task
  const task = await Task.findById(proof.task);

  // Check if the user is the creator or assignee of the task
  if (task.creator.toString() !== req.user.id && task.assignee.toString() !== req.user.id) {
    res.status(403);
    throw new Error('You can only view proofs for tasks you created or are assigned to you');
  }

  res.status(200).json(proof);
});

module.exports = {
  submitProof,
  getProofsByTask,
  getSubmittedProofs,
  getPendingVerificationProofs,
  verifyProof,
  rejectProof,
  getProofById
}; 