const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const Ticket = require('../../models/tickets/Ticket');

// Helper function to generate unique ticket ID
const generateTicketId = () => {
  return `TKT-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
};

// @desc    Get user tickets
// @route   GET /api/tickets
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const tickets = await Ticket.find({ userId: req.user.id })
      .populate('assignedTo', 'username email')
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get ticket by ID
// @route   GET /api/tickets/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const ticket = await Ticket.findOne({ 
      ticketId: req.params.id,
      userId: req.user.id 
    }).populate('assignedTo', 'username email');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    res.json(ticket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Create new ticket
// @route   POST /api/tickets
// @access  Private
router.post('/', protect, async (req, res) => {
  const { subject, description, category, priority } = req.body;

  try {
    // Validate required fields
    if (!subject || !description || !category) {
      return res.status(400).json({ message: 'Subject, description, and category are required' });
    }

    // Create new ticket
    const newTicket = new Ticket({
      ticketId: generateTicketId(),
      userId: req.user.id,
      subject,
      description,
      category,
      priority: priority || 'medium'
    });

    const ticket = await newTicket.save();

    // Populate the assigned user info for response
    await ticket.populate('assignedTo', 'username email');

    res.status(201).json(ticket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Update ticket
// @route   PUT /api/tickets/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  const { subject, description, category, priority, status, assignedTo } = req.body;

  try {
    const ticket = await Ticket.findOne({ 
      ticketId: req.params.id,
      userId: req.user.id 
    });

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Only allow certain updates for regular users (admins can update more fields)
    if (req.user.role === 'user') {
      ticket.subject = subject || ticket.subject;
      ticket.description = description || ticket.description;
      ticket.category = category || ticket.category;
      ticket.priority = priority || ticket.priority;
      // Users can't change status or assignedTo directly
    } else {
      // Admins can update all fields
      ticket.subject = subject || ticket.subject;
      ticket.description = description || ticket.description;
      ticket.category = category || ticket.category;
      ticket.priority = priority || ticket.priority;
      ticket.status = status || ticket.status;
      ticket.assignedTo = assignedTo || ticket.assignedTo;
    }

    const updatedTicket = await ticket.save();
    await updatedTicket.populate('assignedTo', 'username email');

    res.json(updatedTicket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Add message to ticket
// @route   POST /api/tickets/:id/message
// @access  Private
router.post('/:id/message', protect, async (req, res) => {
  const { content } = req.body;

  try {
    const ticket = await Ticket.findOne({ 
      ticketId: req.params.id,
      userId: req.user.id 
    });

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (!content) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    const newMessage = {
      sender: req.user.id,
      senderType: req.user.role === 'admin' ? 'admin' : 'user',
      content
    };

    ticket.messages.push(newMessage);
    
    // If user adds a message to a resolved ticket, change status back to open
    if (ticket.status === 'resolved' && req.user.role !== 'admin') {
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

// @desc    Close ticket
// @route   PUT /api/tickets/:id/close
// @access  Private
router.put('/:id/close', protect, async (req, res) => {
  try {
    const ticket = await Ticket.findOne({ 
      ticketId: req.params.id,
      userId: req.user.id 
    });

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    ticket.status = 'closed';
    const updatedTicket = await ticket.save();
    await updatedTicket.populate('assignedTo', 'username email');

    res.json(updatedTicket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;