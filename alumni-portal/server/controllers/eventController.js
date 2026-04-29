const Event = require('../models/Event');

// GET /api/events
exports.getAllEvents = async (req, res) => {
  try {
    const { category, upcoming, page = 1, limit = 9 } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (upcoming === 'true') filter.date = { $gte: new Date() };

    const total = await Event.countDocuments(filter);
    const events = await Event.find(filter)
      .populate('postedBy', 'name avatar')
      .sort({ date: 1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    res.json({ success: true, events, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/events/:id
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('postedBy', 'name avatar')
      .populate('registrations', 'name avatar');
    if (!event) return res.status(404).json({ message: 'Event not found.' });
    res.json({ success: true, event });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/events
exports.createEvent = async (req, res) => {
  try {
    const { title, description, date, time, venue, isOnline, meetLink, maxAttendees, category } = req.body;
    if (!title || !description || !date)
      return res.status(400).json({ message: 'Title, description and date are required.' });

    const event = await Event.create({
      title, description, date, time, venue, isOnline, meetLink, maxAttendees, category,
      banner: req.file?.path || '',
      postedBy: req.user.id,
    });
    res.status(201).json({ success: true, event });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/events/:id
exports.deleteEvent = async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Event deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/events/:id/register
exports.registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found.' });

    if (event.maxAttendees && event.registrations.length >= event.maxAttendees)
      return res.status(400).json({ message: 'Event is fully booked.' });

    if (event.registrations.includes(req.user.id))
      return res.status(400).json({ message: 'Already registered.' });

    event.registrations.push(req.user.id);
    await event.save();
    res.json({ success: true, message: 'Registered successfully!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
