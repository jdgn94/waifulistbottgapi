const mongoose = require('mongoose');
const Waifu = require('./waifu');

const Schema = mongoose.Schema

const userSchema = Schema({
  chatId: { type: String, require: true, unique: true },
  userId: { type: String, require: true, unique: true },
  waifuList: [{
    waifu: { type: Schema.Types.ObjectId, ref: 'Waifu' },
    quantity: { type: Number }
  }],
  favoriteWaifu: { type: Schema.Types.ObjectId, ref: 'Waifu' }
},
{
  timestamps:
  {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
});

module.exports = mongoose.model('User', userSchema);