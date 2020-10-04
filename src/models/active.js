const mongoose = require('mongoose')
const Chat = require('./chat');
const Waifu = require('./waifu');

const Schema = mongoose.Schema;

const activeSchema = Schema({
  chatId: { type: String, unique: true, require: true },
  attempts: { type: Number, require: true, default: 10 },
  waifu: { type: Schema.Types.ObjectId, ref: 'Waifu', require: true }
},
{
  timestamps:
  {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
});

module.exports = mongoose.model('Active', activeSchema);