const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  boardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true, index: true },
  columnId: { type: mongoose.Schema.Types.ObjectId, ref: 'Column', required: true, index: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  labels: [{ type: String }],
  order: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);

