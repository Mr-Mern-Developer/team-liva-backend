const Newsletter = require('../models/Newsletter');
const asyncHandler = require('../utils/asyncHandler');

/**
 * POST /api/newsletter — public.
 * Re-subscribing an existing address is a success, not a duplicate-key error.
 */
const subscribe = asyncHandler(async (req, res) => {
  const email = String(req.body.email || '').toLowerCase().trim();

  const existing = await Newsletter.findOne({ email });
  if (existing) {
    if (!existing.isSubscribed) {
      existing.isSubscribed = true;
      await existing.save();
    }
    return res.status(200).json({ success: true, message: "You're on the list." });
  }

  await Newsletter.create({ email });
  res.status(201).json({ success: true, message: 'Subscribed. Welcome aboard.' });
});

/** GET /api/newsletter — protected. */
const listSubscribers = asyncHandler(async (req, res) => {
  const items = await Newsletter.find({ isSubscribed: true }).sort({ createdAt: -1 }).lean();
  res.json({ success: true, data: { items, total: items.length } });
});

module.exports = { subscribe, listSubscribers };
