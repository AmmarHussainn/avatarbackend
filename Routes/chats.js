

const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const { v4: uuidv4 } = require('uuid');


// Save chat session
router.post('/', async (req, res) => {
  try {
    const { chats } = req.body;
   
    // Validate input
    if (!Array.isArray(chats) || chats.length === 0) {
      return res.status(400).json({ error: 'Chats array is required and cannot be empty' });
    }


    // Validate chat objects
    for (const chat of chats) {
      if (!chat.message || !chat.type || !chat.mode || !chat.timestamp) {
        return res.status(400).json({ error: 'Invalid chat object format' });
      }
      if (!['user', 'avatar'].includes(chat.type)) {
        return res.status(400).json({ error: 'Invalid chat type' });
      }
      if (!['text', 'voice'].includes(chat.mode)) {
        return res.status(400).json({ error: 'Invalid chat mode' });
      }
    }


    const chatSession = new Chat({
      sessionId: uuidv4(),
      chats: chats.map(chat => ({
        ...chat,
        timestamp: new Date(chat.timestamp)
      }))
    });


    await chatSession.save();
    res.status(201).json({ message: 'Chat session saved successfully', sessionId: chatSession.sessionId });
  } catch (error) {
    console.error('Error saving chat session:', error);
    res.status(500).json({ error: 'Failed to save chat session' });
  }
});


// Get chat session by sessionId
router.get('/:sessionId', async (req, res) => {
  try {
    const chatSession = await Chat.findOne({ sessionId: req.params.sessionId });
    if (!chatSession) {
      return res.status(404).json({ error: 'Chat session not found' });
    }
    res.json(chatSession);
  } catch (error) {
    console.error('Error retrieving chat session:', error);
    res.status(500).json({ error: 'Failed to retrieve chat session' });
  }
});


// Get all chat sessions
router.get('/', async (req, res) => {
  try {
    const chatSessions = await Chat.find().sort({ createdAt: -1 });
    res.json(chatSessions);
  } catch (error) {
    console.error('Error retrieving chat sessions:', error);
    res.status(500).json({ error: 'Failed to retrieve chat sessions' });
  }
});


// Update chat session by sessionId
router.put('/:sessionId', async (req, res) => {
  try {
    const { chats } = req.body;
   
    // Validate input
    if (!Array.isArray(chats) || chats.length === 0) {
      return res.status(400).json({ error: 'Chats array is required and cannot be empty' });
    }


    // Validate chat objects
    for (const chat of chats) {
      if (!chat.message || !chat.type || !chat.mode || !chat.timestamp) {
        return res.status(400).json({ error: 'Invalid chat object format' });
      }
      if (!['user', 'avatar'].includes(chat.type)) {
        return res.status(400).json({ error: 'Invalid chat type' });
      }
      if (!['text', 'voice'].includes(chat.mode)) {
        return res.status(400).json({ error: 'Invalid chat mode' });
      }
    }


    const chatSession = await Chat.findOneAndUpdate(
      { sessionId: req.params.sessionId },
      {
        chats: chats.map(chat => ({
          ...chat,
          timestamp: new Date(chat.timestamp)
        })),
        updatedAt: new Date()
      },
      { new: true }
    );


    if (!chatSession) {
      return res.status(404).json({ error: 'Chat session not found' });
    }


    res.json({ message: 'Chat session updated successfully', sessionId: chatSession.sessionId });
  } catch (error) {
    console.error('Error updating chat session:', error);
    res.status(500).json({ error: 'Failed to update chat session' });
  }
});


module.exports = router;