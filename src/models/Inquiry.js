const mongoose = require('mongoose');

/**
 * The 3-step "Enterprise Solution Inquiry" modal on the site posts here.
 */
const inquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: 120,
    },
    email: {
      type: String,
      required: [true, 'Work email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    company: { type: String, trim: true, maxlength: 160, default: '' },
    phone: { type: String, trim: true, maxlength: 40, default: '' },
    service: {
      type: String,
      required: [true, 'Service category is required'],
      enum: [
        'Web Development',
        'Graphic Design',
        'Healthcare Staffing',
        'Medical Billing (RCM)',
        'Customer Support BPO',
        'Back-Office Pods',
      ],
    },
    teamSize: {
      type: String,
      required: [true, 'Scope / team size is required'],
      enum: [
        'Single Project / Sprint',
        '1 - 3 Dedicated Professionals',
        '4 - 10 Members Managed Pod',
        '10+ Enterprise Scaled Unit',
      ],
    },
    message: { type: String, trim: true, maxlength: 2000, default: '' },
    // Set when the inquiry starts from a specific roster card.
    interestedTalent: { type: mongoose.Schema.Types.ObjectId, ref: 'Talent', default: null },
    status: {
      type: String,
      enum: ['new', 'contacted', 'qualified', 'won', 'closed'],
      default: 'new',
      index: true,
    },
    source: { type: String, default: 'website' },
  },
  { timestamps: true }
);

inquirySchema.index({ createdAt: -1 });

module.exports = mongoose.model('Inquiry', inquirySchema);
