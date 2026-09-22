const crypto = require('crypto');
const express = require('express');
const Board = require('../models/Board');
const Column = require('../models/Column');
const Task = require('../models/Task');
const requireAuth = require('../middleware/auth');

const router = express.Router();

const isMember = (board, userId) => (
  board.memberIds.some((memberId) => memberId.equals(userId))
);

router.get('/', requireAuth, async (req, res) => {
  const boards = await Board.find({
    $or: [{ ownerId: req.user._id }, { memberIds: req.user._id }],
  }).sort({ createdAt: -1 });

  res.json(boards);
});

router.post('/', requireAuth, async (req, res) => {
  const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
  if (!title) return res.status(400).json({ message: 'Title required' });

  const board = await Board.create({
    title,
    ownerId: req.user._id,
    memberIds: [req.user._id],
    inviteToken: crypto.randomBytes(8).toString('hex'),
  });

  await Column.insertMany([
    { boardId: board._id, title: 'To Do', order: 0 },
    { boardId: board._id, title: 'In Progress', order: 1 },
    { boardId: board._id, title: 'Done', order: 2 },
  ]);

  res.status(201).json(board);
});

router.get('/:id', requireAuth, async (req, res) => {
  const board = await Board.findById(req.params.id);
  if (!board) return res.status(404).json({ message: 'Board not found' });
  if (!isMember(board, req.user._id)) return res.status(403).json({ message: 'Forbidden' });

  const [columns, tasks] = await Promise.all([
    Column.find({ boardId: board._id }).sort({ order: 1 }),
    Task.find({ boardId: board._id }).sort({ order: 1 }),
  ]);

  res.json({ board, columns, tasks });
});

router.delete('/:id', requireAuth, async (req, res) => {
  const board = await Board.findById(req.params.id);
  if (!board) return res.status(404).json({ message: 'Board not found' });
  if (!board.ownerId.equals(req.user._id)) return res.status(403).json({ message: 'Forbidden' });

  await Promise.all([
    Task.deleteMany({ boardId: board._id }),
    Column.deleteMany({ boardId: board._id }),
    board.deleteOne(),
  ]);

  res.json({ message: 'Board deleted' });
});

module.exports = router;
