const express = require('express');

const { protect, restrictTo } = require('../middleware/auth');
const auth = require('../controllers/authController');
const inquiry = require('../controllers/inquiryController');
const contact = require('../controllers/contactController');
const talent = require('../controllers/talentController');
const service = require('../controllers/serviceController');
const application = require('../controllers/applicationController');
const newsletter = require('../controllers/newsletterController');
const stats = require('../controllers/statsController');

const router = express.Router();

/* ---------------------------------- auth --------------------------------- */
router.post('/auth/register', auth.register);
router.post('/auth/login', auth.login);
router.get('/auth/me', protect, auth.me);

/* -------------------------------- inquiries ------------------------------- */
router.post('/inquiries', inquiry.createInquiry);
router.get('/inquiries', protect, inquiry.listInquiries);
router.patch('/inquiries/:id', protect, inquiry.updateInquiryStatus);
router.delete('/inquiries/:id', protect, restrictTo('admin'), inquiry.deleteInquiry);

/* -------------------------------- contacts -------------------------------- */
router.post('/contacts', contact.createContact);
router.get('/contacts', protect, contact.listContacts);
router.patch('/contacts/:id', protect, contact.updateContactStatus);
router.delete('/contacts/:id', protect, restrictTo('admin'), contact.deleteContact);

/* --------------------------------- talents -------------------------------- */
router.get('/talents', talent.listTalents);
router.get('/talents/:id', talent.getTalent);
router.post('/talents', protect, talent.createTalent);
router.put('/talents/:id', protect, talent.updateTalent);
router.delete('/talents/:id', protect, restrictTo('admin'), talent.deleteTalent);

/* -------------------------------- services -------------------------------- */
router.get('/services', service.listServices);
router.get('/services/:slug', service.getService);
router.post('/services', protect, service.createService);
router.put('/services/:id', protect, service.updateService);
router.delete('/services/:id', protect, restrictTo('admin'), service.deleteService);

/* ------------------------------ applications ------------------------------ */
router.post('/applications', application.createApplication);
router.get('/applications', protect, application.listApplications);
router.patch('/applications/:id', protect, application.updateApplicationStatus);
router.delete('/applications/:id', protect, restrictTo('admin'), application.deleteApplication);

/* ------------------------------- newsletter ------------------------------- */
router.post('/newsletter', newsletter.subscribe);
router.get('/newsletter', protect, newsletter.listSubscribers);

/* ---------------------------------- stats --------------------------------- */
router.get('/stats', protect, stats.getStats);

module.exports = router;
