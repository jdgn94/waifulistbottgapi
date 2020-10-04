const mongoose = require('mongoose');
const Franchise = require('./franchise');

const Schema = mongoose.Schema

const waifuSchema = Schema({
  name: { type: String, require: true },
  nickname: { type: String, require: false },
  franchise: { type: Schema.Types.ObjectId, ref: 'Franchise', require: true },
  imageId: { type: String, require: true },
  imageURL: { type: String, require: true }
},
{
  timestamps:
  {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
});

module.exports = mongoose.model('Waifu', waifuSchema);