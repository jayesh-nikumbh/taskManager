const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },

    challenge: {
      type: String,
      default: '',
    },
    userName: {
      type: String,
      default: 'Unknown User',
    },
    userEmail: {
      type: String,
      default: 'unknown@example.com',
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    ipAddress: {
      type: String,
      default: 'Unknown IP',
    },

  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
