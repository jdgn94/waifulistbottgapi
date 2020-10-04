const mongoose = require('mongoose');

const Schema = mongoose.Schema

const franchiseSchema = Schema({
  name: { type: String, require: true, unique: true },
  nickname: { type: String },
},
{
  timestamps:
  {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
});

module.exports = mongoose.model('Franchise', franchiseSchema);