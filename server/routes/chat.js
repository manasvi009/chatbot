const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Chat = require('../models/Chat');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @desc    Get user chats
// @route   GET /api/chat
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user.id
    })
    .populate('participants', 'username email')
    .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get chat by ID
// @route   GET /api/chat/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate('participants', 'username email')
      .populate('messages.sender', 'username');

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if user is part of the chat
    if (!chat.participants.some(p => p._id.toString() === req.user.id)) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json(chat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Create or get existing chat with user
// @route   POST /api/chat/
// @access  Private
router.post('/', protect, async (req, res) => {
  const { userId } = req.body;

  try {
    // Check if chat already exists
    let chat = await Chat.findOne({
      participants: { $all: [req.user.id, userId] }
    });

    if (chat) {
      return res.json(chat);
    }

    // Create new chat
    chat = new Chat({
      participants: [req.user.id, userId]
    });

    await chat.save();

    res.status(201).json(chat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Send message
// @route   POST /api/chat/:id/message
// @access  Private
router.post('/:id/message', protect, async (req, res) => {
  const { content, sentiment } = req.body;

  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if user is part of the chat
    if (!chat.participants.some(p => p.toString() === req.user.id)) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Create new message
    const newMessage = {
      sender: req.user.id,
      senderType: 'user',
      content,
      sentiment: sentiment || 'neutral'
    };

    chat.messages.push(newMessage);
    await chat.save();

    // Populate the sender info for the response
    await chat.populate('messages.sender', 'username');

    // Emit socket event for real-time update
    // This would be handled by the socket connection in the server file

    res.status(201).json(chat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get chat history
// @route   GET /api/chat/:id/history
// @access  Private
router.get('/:id/history', protect, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate('messages.sender', 'username email profilePicture');

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if user is part of the chat
    if (!chat.participants.some(p => p._id.toString() === req.user.id)) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json(chat.messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;