const Contact = require('../models/Contact');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/** POST /api/contacts — public. */
const createContact = asyncHandler(async (req, res) => {
  const { name, email, company, phone, subject, message } = req.body;

  const contact = await Contact.create({ name, email, company, phone, subject, message });

  res.status(201).json({
    success: true,
    message: 'Message sent. We reply to every inquiry within 2 business hours.',
    data: { id: contact._id, createdAt: contact.createdAt },
  });
});

/** GET /api/contacts — protected. */
const listContacts = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const [items, total] = await Promise.all([
    Contact.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Contact.countDocuments(filter),
  ]);

  res.json({ success: true, data: { items, total, page, pages: Math.ceil(total / limit) || 1 } });
});

/** PATCH /api/contacts/:id — protected. */
const updateContactStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowed = ['new', 'read', 'replied', 'archived'];

  if (!allowed.includes(status)) {
    throw ApiError.badRequest(`status must be one of: ${allowed.join(', ')}`);
  }

  const contact = await Contact.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );
  if (!contact) throw ApiError.notFound('Message not found');

  res.json({ success: true, message: 'Status updated', data: contact });
});

/** DELETE /api/contacts/:id — protected. */
const deleteContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findByIdAndDelete(req.params.id);
  if (!contact) throw ApiError.notFound('Message not found');
  res.json({ success: true, message: 'Message deleted' });
});

module.exports = { createContact, listContacts, updateContactStatus, deleteContact };
