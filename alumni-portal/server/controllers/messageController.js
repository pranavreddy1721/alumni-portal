const Message = require('../models/Message');
const User    = require('../models/User');

// GET /api/messages/contacts
// Returns list of users the current user has chatted with,
// plus recent users to start new conversations
exports.getContacts = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all users this person has exchanged messages with
    const msgs = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    }).sort({ createdAt: -1 });

    // Build unique contact set with last message info
    const contactMap = new Map();
    msgs.forEach(m => {
      const otherId = m.senderId.toString() === userId
        ? m.receiverId.toString()
        : m.senderId.toString();
      if (!contactMap.has(otherId)) {
        contactMap.set(otherId, {
          contactId: otherId,
          lastMsg:   m.message,
          lastTime:  m.createdAt,
          unread:    m.receiverId.toString() === userId && !m.isRead ? 1 : 0,
        });
      } else {
        // Count unread
        if (m.receiverId.toString() === userId && !m.isRead) {
          contactMap.get(otherId).unread += 1;
        }
      }
    });

    // Fetch user details for contacts
    const contactIds  = [...contactMap.keys()];
    const contactUsers = await User.find({ _id: { $in: contactIds } })
      .select('name email avatar role isActive');

    // Also fetch recent active users who haven't chatted yet (for new conversations)
    const recentUsers = await User.find({
      _id:             { $nin: [userId, ...contactIds] },
      isActive:        true,
      isEmailVerified: true,
    }).select('name email avatar role').limit(20);

    // Merge
    const contacts = [
      ...contactUsers.map(u => ({
        _id:      u._id,
        name:     u.name,
        email:    u.email,
        avatar:   u.avatar,
        role:     u.role,
        isActive: u.isActive,
        ...(contactMap.get(u._id.toString()) || {}),
      })),
      ...recentUsers.map(u => ({
        _id:     u._id,
        name:    u.name,
        email:   u.email,
        avatar:  u.avatar,
        role:    u.role,
        lastMsg: '',
        lastTime: null,
        unread:   0,
      })),
    ];

    res.json({ success: true, contacts });
  } catch (err) {
    console.error('getContacts:', err.message);
    res.status(500).json({ message: err.message });
  }
};

// GET /api/messages/:userId  — conversation history
exports.getMessages = async (req, res) => {
  try {
    const me    = req.user.id;
    const other = req.params.userId;
    const { page = 1, limit = 50 } = req.query;

    const messages = await Message.find({
      $or: [
        { senderId: me,    receiverId: other },
        { senderId: other, receiverId: me    },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    // Mark as read
    await Message.updateMany(
      { senderId: other, receiverId: me, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({ success: true, messages: messages.reverse() });
  } catch (err) {
    console.error('getMessages:', err.message);
    res.status(500).json({ message: err.message });
  }
};

// POST /api/messages  — send a message
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    if (!receiverId || !message?.trim())
      return res.status(400).json({ message: 'Receiver and message are required.' });

    const receiver = await User.findById(receiverId);
    if (!receiver || !receiver.isActive)
      return res.status(404).json({ message: 'Receiver not found.' });

    const msg = await Message.create({
      senderId:    req.user.id,
      receiverId,
      message:     message.trim(),
      isRead:      false,
      messageType: 'text',
    });

    res.status(201).json({ success: true, message: msg });
  } catch (err) {
    console.error('sendMessage:', err.message);
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/messages/:id
exports.deleteMessage = async (req, res) => {
  try {
    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ message: 'Message not found.' });
    if (msg.senderId.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not authorized.' });

    await Message.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Message deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
