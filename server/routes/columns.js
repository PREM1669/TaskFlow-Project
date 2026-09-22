const express = require('express');
const Board = require('../models/Board');
const Column = require('../models/Column');
const requireAuth = require('../middleware/auth');

const router = express.Router();

const getMemberBoard = async (boardId, userId) => {
  const board = await Board.findById(boardId);
  if (!board || !board.memberIds.some((memberId) => memberId.equals(userId))) return null;
  return board;
};

router.post('/', requireAuth, async (req, res) => {
  const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
  if (!req.body.boardId || !title) {
    return res.status(400).json({ message: 'Board and title required' });
  }

  const board = await getMemberBoard(req.body.boardId, req.user._id);
  if (!board) return res.status(403).json({ message: 'Forbidden' });

  const order = await Column.countDocuments({ boardId: board._id });
  const column = await Column.create({ boardId: board._id, title, order });
  res.status(201).json(column);
});

router.patch('/:id', requireAuth, async (req, res) => {
  const column = await Column.findById(req.params.id);
  if (!column) return res.status(404).json({ message: 'Column not found' });

  const board = await getMemberBoard(column.boardId, req.user._id);
  if (!board) return res.status(403).json({ message: 'Forbidden' });

  const update = {};
  if (typeof req.body.title === 'string' && req.body.title.trim()) {
    update.title = req.body.title.trim();
  }
  if (req.body.order !== undefined) update.order = req.body.order;
  const updatedColumn = await Column.findByIdAndUpdate(req.params.id, update, { new: true });
  res.json(updatedColumn);
});

router.delete('/:id', requireAuth, async (req, res) => {
  const column = await Column.findById(req.params.id);
  if (!column) return res.status(404).json({ message: 'Column not found' });

  const board = await getMemberBoard(column.boardId, req.user._id);
  if (!board) return res.status(403).json({ message: 'Forbidden' });

  await column.deleteOne();
  await Column.updateMany(
    { boardId: board._id, order: { $gt: column.order } },
    { $inc: { order: -1 } },
  );
  res.json({ message: 'Column deleted' });
});

module.exports = router;

