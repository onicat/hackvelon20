const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  discordId: String,
  age: Number,
  city: String,
  tags: Array,
  about: String,
  gender: String,
  preference: String,
  inSearch: Boolean
});

const User = mongoose.model('User', userSchema);

module.exports = User;