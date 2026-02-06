const express = require('express');
const router = express.Router();
const { protect, admin } = require('../../middleware/auth');
const User = require('../../models/User');
const Ticket = require('../../models/tickets/Ticket');
const Chat = require('../../models/Chat');
const Faq = require('../../models/admin/Faq');

// @desc    Get dashboard analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
router.get('/analytics', protect, admin, async (req, res) => {
  try {
    // Total users
    const totalUsers = await User.countDocuments();
    
    // Active users (users who have logged in within the last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const activeUsers = await User.countDocuments({
      lastSeen: { $gte: yesterday }
    });
    
    // Total chats
    const totalChats = await Chat.countDocuments();
    
    // Active chats (chats with messages in the last 24 hours)
    const activeChats = await Chat.countDocuments({
      updatedAt: { $gte: yesterday }
    });
    
    // Tickets by status
    const ticketsByStatus = await Ticket.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Tickets by priority
    const ticketsByPriority = await Ticket.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // AI resolution rate (calculated as resolved tickets without admin messages)
    const resolvedTickets = await Ticket.countDocuments({ status: 'resolved' });
    const totalTickets = await Ticket.countDocuments();
    const aiResolutionRate = totalTickets > 0 ? (resolvedTickets / totalTickets) * 100 : 0;
    
    res.json({
      totalUsers,
      activeUsers,
      totalChats,
      activeChats,
      ticketsByStatus,
      ticketsByPriority,
      aiResolutionRate: parseFloat(aiResolutionRate.toFixed(2))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get all tickets (admin)
// @route   GET /api/admin/tickets
// @access  Private/Admin
router.get('/tickets', protect, admin, async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate('userId', 'username email')
      .populate('assignedTo', 'username email')
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Assign ticket to agent
// @route   PUT /api/admin/tickets/:id/assign
// @access  Private/Admin
router.put('/tickets/:id/assign', protect, admin, async (req, res) => {
  const { agentId } = req.body;

  try {
    const ticket = await Ticket.findOne({ ticketId: req.params.id });

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    ticket.assignedTo = agentId;
    ticket.status = 'in-progress'; // Change status to in-progress when assigned
    
    const updatedTicket = await ticket.save();
    await updatedTicket.populate('assignedTo', 'username email');

    res.json(updatedTicket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Update ticket status
// @route   PUT /api/admin/tickets/:id/status
// @access  Private/Admin
router.put('/tickets/:id/status', protect, admin, async (req, res) => {
  const { status } = req.body;

  try {
    const ticket = await Ticket.findOne({ ticketId: req.params.id });

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    ticket.status = status;
    
    // If resolved, update resolution details
    if (status === 'resolved') {
      ticket.resolutionDetails = {
        resolvedBy: req.user.id,
        resolvedAt: new Date()
      };
    }
    
    const updatedTicket = await ticket.save();
    await updatedTicket.populate('assignedTo', 'username email');

    res.json(updatedTicket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Add message to ticket (admin response)
// @route   POST /api/admin/tickets/:id/message
// @access  Private/Admin
router.post('/tickets/:id/message', protect, admin, async (req, res) => {
  const { content } = req.body;

  try {
    const ticket = await Ticket.findOne({ ticketId: req.params.id });

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (!content) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    const newMessage = {
      sender: req.user.id,
      senderType: 'admin',
      content
    };

    ticket.messages.push(newMessage);
    
    // If admin adds a message to a closed ticket, change status back to open
    if (ticket.status === 'closed') {
      ticket.status = 'open';
    }

    const updatedTicket = await ticket.save();
    await updatedTicket.populate('assignedTo', 'username email');

    res.status(201).json(updatedTicket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get all FAQs
// @route   GET /api/admin/faqs
// @access  Private/Admin
router.get('/faqs', protect, admin, async (req, res) => {
  try {
    const faqs = await Faq.find()
      .populate('createdBy', 'username email')
      .populate('updatedBy', 'username email')
      .sort({ createdAt: -1 });

    res.json(faqs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Create new FAQ
// @route   POST /api/admin/faqs
// @access  Private/Admin
router.post('/faqs', protect, admin, async (req, res) => {
  const { question, answer, category, tags, aiConfidenceScore } = req.body;

  try {
    const newFaq = new Faq({
      question,
      answer,
      category,
      tags: tags || [],
      createdBy: req.user.id,
      aiConfidenceScore: aiConfidenceScore || 0.8
    });

    const faq = await newFaq.save();
    await faq.populate('createdBy', 'username email');

    res.status(201).json(faq);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Update FAQ
// @route   PUT /api/admin/faqs/:id
// @access  Private/Admin
router.put('/faqs/:id', protect, admin, async (req, res) => {
  const { question, answer, category, tags, isActive, aiConfidenceScore } = req.body;

  try {
    const faq = await Faq.findById(req.params.id);

    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }

    faq.question = question || faq.question;
    faq.answer = answer || faq.answer;
    faq.category = category || faq.category;
    faq.tags = tags !== undefined ? tags : faq.tags;
    faq.isActive = isActive !== undefined ? isActive : faq.isActive;
    faq.aiConfidenceScore = aiConfidenceScore !== undefined ? aiConfidenceScore : faq.aiConfidenceScore;
    faq.updatedBy = req.user.id;

    const updatedFaq = await faq.save();
    await updatedFaq.populate('createdBy', 'username email')
                  .populate('updatedBy', 'username email');

    res.json(updatedFaq);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Delete FAQ
// @route   DELETE /api/admin/faqs/:id
// @access  Private/Admin
router.delete('/faqs/:id', protect, admin, async (req, res) => {
  try {
    const faq = await Faq.findById(req.params.id);

    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }

    await Faq.findByIdAndDelete(req.params.id);

    res.json({ message: 'FAQ deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', protect, admin, async (req, res) => {
  try {
    const users = await User.find({}, '-password') // Exclude password
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Update user (block/unblock)
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
router.put('/users/:id', protect, admin, async (req, res) => {
  const { isActive, isBlocked } = req.body;

  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (isActive !== undefined) user.isActive = isActive;
    if (isBlocked !== undefined) user.isBlocked = isBlocked;

    const updatedUser = await user.save();

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get user chat logs
// @route   GET /api/admin/users/:id/chats
// @access  Private/Admin
router.get('/users/:id/chats', protect, admin, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Find chats that include this user
    const chats = await Chat.find({
      participants: userId
    })
    .populate('participants', 'username email')
    .populate('messages.sender', 'username');

    res.json(chats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;