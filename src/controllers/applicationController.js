const Application = require('../models/Application');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/** POST /api/applications — public, from /careers. */
const createApplication = asyncHandler(async (req, res) => {
  const { fullName, email, phone, position, experience, portfolio, resumeUrl, coverNote } = req.body;

  const application = await Application.create({
    fullName,
    email,
    phone,
    position,
    experience,
    portfolio,
    resumeUrl,
    coverNote,
  });

  res.status(201).json({
    success: true,
    message: 'Application received. Our talent team reviews every profile within 5 business days.',
    data: { id: application._id, createdAt: application.createdAt },
  });
});

/** GET /api/applications — protected. */
const listApplications = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.position) filter.position = req.query.position;

  const [items, total] = await Promise.all([
    Application.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Application.countDocuments(filter),
  ]);

  res.json({ success: true, data: { items, total, page, pages: Math.ceil(total / limit) || 1 } });
});

/** PATCH /api/applications/:id — protected. */
const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowed = ['new', 'screening', 'interview', 'hired', 'rejected'];

  if (!allowed.includes(status)) {
    throw ApiError.badRequest(`status must be one of: ${allowed.join(', ')}`);
  }

  const application = await Application.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );
  if (!application) throw ApiError.notFound('Application not found');

  res.json({ success: true, message: 'Status updated', data: application });
});

/** DELETE /api/applications/:id — protected. */
const deleteApplication = asyncHandler(async (req, res) => {
  const application = await Application.findByIdAndDelete(req.params.id);
  if (!application) throw ApiError.notFound('Application not found');
  res.json({ success: true, message: 'Application deleted' });
});

module.exports = {
  createApplication,
  listApplications,
  updateApplicationStatus,
  deleteApplication,
};
