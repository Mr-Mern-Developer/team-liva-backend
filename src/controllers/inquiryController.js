const Inquiry = require('../models/Inquiry');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/** POST /api/inquiries — public, fed by the 3-step quote modal. */
const createInquiry = asyncHandler(async (req, res) => {
  const { name, email, company, phone, service, teamSize, message, interestedTalent } = req.body;

  const inquiry = await Inquiry.create({
    name,
    email,
    company,
    phone,
    service,
    teamSize,
    message,
    interestedTalent: interestedTalent || null,
  });

  res.status(201).json({
    success: true,
    message: 'Inquiry received. Our operations desk will reach out shortly.',
    data: { id: inquiry._id, createdAt: inquiry.createdAt },
  });
});

/** GET /api/inquiries — protected. Supports ?status=&page=&limit= */
const listInquiries = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const [items, total] = await Promise.all([
    Inquiry.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('interestedTalent', 'name role')
      .lean(),
    Inquiry.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: { items, total, page, pages: Math.ceil(total / limit) || 1 },
  });
});

/** PATCH /api/inquiries/:id — protected, moves the pipeline status. */
const updateInquiryStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowed = ['new', 'contacted', 'qualified', 'won', 'closed'];

  if (!allowed.includes(status)) {
    throw ApiError.badRequest(`status must be one of: ${allowed.join(', ')}`);
  }

  const inquiry = await Inquiry.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );
  if (!inquiry) throw ApiError.notFound('Inquiry not found');

  res.json({ success: true, message: 'Status updated', data: inquiry });
});

/** DELETE /api/inquiries/:id — protected. */
const deleteInquiry = asyncHandler(async (req, res) => {
  const inquiry = await Inquiry.findByIdAndDelete(req.params.id);
  if (!inquiry) throw ApiError.notFound('Inquiry not found');
  res.json({ success: true, message: 'Inquiry deleted' });
});

module.exports = { createInquiry, listInquiries, updateInquiryStatus, deleteInquiry };
