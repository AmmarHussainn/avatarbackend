const mongoose = require('mongoose');


const chatSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  chats: [{
    message: { type: String, required: true },
    type: { type: String, enum: ['user', 'avatar'], required: true },
    mode: { type: String, enum: ['text', 'voice'], required: true },
    timestamp: { type: Date, required: true }
  }],
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });


module.exports = mongoose.model('Chat', chatSchema);
