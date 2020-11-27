const mongoose = require('mongoose');

const activeUserSchema = new mongoose.Schema({
  discordId: String,
  lastMessageAt: String
});

const ActiveUser = mongoose.model('ActiveUser', activeUserSchema);

module.exports = ActiveUser;