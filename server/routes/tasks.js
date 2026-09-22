const express = require('express');
const Board = require('../models/Board');
const Column = require('../models/Column');
const Task = require('../models/Task');
const requireAuth = require('../middleware/auth');

const router = express.Router();

const getMemberBoard = async (boardId, userId) => {
  const board = await Board.findById(boardId);
  if (!board || !board.memberIds.some((memberId) => memberId.equals(userId))) return null;
  return board;
};

router.post('/', requireAuth, async (req, res) => {
  const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
  if (!req.body.boardId || !req.body.columnId || !title) {
    return res.status(400).json({ message: 'Board, column, and title required' });
  }

  const board = await getMemberBoard(req.body.boardId, req.user._id);
  if (!board) return res.status(403).json({ message: 'Forbidden' });

  const column = await Column.findOne({ _id: req.body.columnId, boardId: board._id });
  if (!column) return res.status(400).json({ message: 'Column does not belong to board' });

  const order = await Task.countDocuments({ columnId: column._id });
  const task = await Task.create({
    boardId: board._id,
    columnId: column._id,
    title,
    order,
  });

  res.status(201).json(task);
});

router.patch('/:id', requireAuth, async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found' });

  const board = await getMemberBoard(task.boardId, req.user._id);
  if (!board) return res.status(403).json({ message: 'Forbidden' });

  const { columnId, order, title, description, labels } = req.body;
  if (columnId !== undefined) {
    const column = await Column.findOne({ _id: columnId, boardId: board._id });
    if (!column) return res.status(400).json({ message: 'Column does not belong to board' });
  }

  const update = {};
  if (columnId !== undefined) update.columnId = columnId;
  if (order !== undefined) update.order = order;
  if (typeof title === 'string' && title.trim()) update.title = title.trim();
  if (description !== undefined) update.description = description;
  if (labels !== undefined) update.labels = labels;

  const updatedTask = await Task.findByIdAndUpdate(req.params.id, update, { new: true });
  res.json(updatedTask);
});

router.delete('/:id', requireAuth, async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found' });

  const board = await getMemberBoard(task.boardId, req.user._id);
  if (!board) return res.status(403).json({ message: 'Forbidden' });

  await task.deleteOne();
  res.json({ message: 'Task deleted' });
});

module.exports = router;

