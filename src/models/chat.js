const mongoose = require('mongoose');

const Schema = mongoose.Schema

const chatSchema = Schema({
  chatId: { type: String, require: true, unique: true },
  limitMessage: { type: Number, require: true, default: 100 },
  countMessage: { type: Number, require: true, default: 0 }
},
{
  timestamps:
  {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
});

module.exports = mongoose.model('Chat', chatSchema);