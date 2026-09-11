const Inquiry = require('../models/Inquiry');
const Contact = require('../models/Contact');
const Application = require('../models/Application');
const Newsletter = require('../models/Newsletter');
const Talent = require('../models/Talent');
const asyncHandler = require('../utils/asyncHandler');

/** GET /api/stats — protected. Counters for the admin dashboard tiles. */
const getStats = asyncHandler(async (req, res) => {
  const [
    inquiries,
    newInquiries,
    contacts,
    newContacts,
    applications,
    newApplications,
    subscribers,
    talents,
  ] = await Promise.all([
    Inquiry.countDocuments(),
    Inquiry.countDocuments({ status: 'new' }),
    Contact.countDocuments(),
    Contact.countDocuments({ status: 'new' }),
    Application.countDocuments(),
    Application.countDocuments({ status: 'new' }),
    Newsletter.countDocuments({ isSubscribed: true }),
    Talent.countDocuments({ isActive: true }),
  ]);

  res.json({
    success: true,
    data: {
      inquiries: { total: inquiries, new: newInquiries },
      contacts: { total: contacts, new: newContacts },
      applications: { total: applications, new: newApplications },
      subscribers,
      talents,
    },
  });
});

module.exports = { getStats };
