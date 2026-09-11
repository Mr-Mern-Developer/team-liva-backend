const Service = require('../models/Service');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/** GET /api/services — public. */
const listServices = asyncHandler(async (req, res) => {
  const items = await Service.find({ isActive: true }).sort({ order: 1 }).lean();
  res.json({ success: true, data: { items, total: items.length } });
});

/** GET /api/services/:slug — public. */
const getService = asyncHandler(async (req, res) => {
  const service = await Service.findOne({ slug: req.params.slug.toLowerCase() }).lean();
  if (!service) throw ApiError.notFound('Service not found');
  res.json({ success: true, data: service });
});

/** POST /api/services — protected. */
const createService = asyncHandler(async (req, res) => {
  const service = await Service.create(req.body);
  res.status(201).json({ success: true, message: 'Service created', data: service });
});

/** PUT /api/services/:id — protected. */
const updateService = asyncHandler(async (req, res) => {
  const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!service) throw ApiError.notFound('Service not found');
  res.json({ success: true, message: 'Service updated', data: service });
});

/** DELETE /api/services/:id — protected. */
const deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findByIdAndDelete(req.params.id);
  if (!service) throw ApiError.notFound('Service not found');
  res.json({ success: true, message: 'Service deleted' });
});

module.exports = { listServices, getService, createService, updateService, deleteService };
