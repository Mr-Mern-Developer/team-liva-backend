const Talent = require('../models/Talent');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/** GET /api/talents — public. Supports ?type= to match the roster filter tabs. */
const listTalents = asyncHandler(async (req, res) => {
  const filter = { isActive: true };
  if (req.query.type && req.query.type !== 'All') filter.type = req.query.type;

  const items = await Talent.find(filter).sort({ order: 1, createdAt: 1 }).lean();
  res.json({ success: true, data: { items, total: items.length } });
});

/** GET /api/talents/:id — public. */
const getTalent = asyncHandler(async (req, res) => {
  const talent = await Talent.findById(req.params.id).lean();
  if (!talent) throw ApiError.notFound('Talent not found');
  res.json({ success: true, data: talent });
});

/** POST /api/talents — protected. */
const createTalent = asyncHandler(async (req, res) => {
  const talent = await Talent.create(req.body);
  res.status(201).json({ success: true, message: 'Talent added', data: talent });
});

/** PUT /api/talents/:id — protected. */
const updateTalent = asyncHandler(async (req, res) => {
  const talent = await Talent.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!talent) throw ApiError.notFound('Talent not found');
  res.json({ success: true, message: 'Talent updated', data: talent });
});

/** DELETE /api/talents/:id — protected. */
const deleteTalent = asyncHandler(async (req, res) => {
  const talent = await Talent.findByIdAndDelete(req.params.id);
  if (!talent) throw ApiError.notFound('Talent not found');
  res.json({ success: true, message: 'Talent deleted' });
});

module.exports = { listTalents, getTalent, createTalent, updateTalent, deleteTalent };
