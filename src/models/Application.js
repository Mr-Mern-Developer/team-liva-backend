const mongoose = require('mongoose');

/** Candidate applications submitted from /careers. */
const applicationSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: 120,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    phone: { type: String, trim: true, maxlength: 40, default: '' },
    position: {
      type: String,
      required: [true, 'Position is required'],
      enum: [
        'Healthcare / Clinical Ops',
        'Medical Billing (RCM)',
        'Customer Support / BPO',
        'Web Developer',
        'Graphic / UI-UX Designer',
        'Other',
      ],
    },
    experience: {
      type: String,
      required: [true, 'Experience level is required'],
      enum: ['0 - 1 years', '1 - 3 years', '3 - 5 years', '5 - 8 years', '8+ years'],
    },
    portfolio: { type: String, trim: true, maxlength: 400, default: '' },
    resumeUrl: { type: String, trim: true, maxlength: 400, default: '' },
    coverNote: { type: String, trim: true, maxlength: 3000, default: '' },
    status: {
      type: String,
      enum: ['new', 'screening', 'interview', 'hired', 'rejected'],
      default: 'new',
      index: true,
    },
  },
  { timestamps: true }
);

applicationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Application', applicationSchema);
