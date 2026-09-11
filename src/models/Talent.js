const mongoose = require('mongoose');

/** A pre-vetted professional shown on the public talent roster. */
const talentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    role: { type: String, required: true, trim: true, maxlength: 160 },
    type: {
      type: String,
      required: true,
      enum: ['Healthcare', 'BPO & RCM', 'Tech & Web', 'Design Solutions'],
      index: true,
    },
    rate: { type: Number, required: true, min: 0 },
    exp: { type: String, default: '' },
    rating: { type: Number, min: 0, max: 5, default: 5 },
    certs: { type: [String], default: [] },
    status: {
      type: String,
      enum: ['Available Now', 'In Demand', 'Engaged'],
      default: 'Available Now',
    },
    avatar: { type: String, default: '' },
    location: { type: String, default: '' },
    // Radar-chart values, 0-100 each.
    skills: {
      ClinicalOps: { type: Number, min: 0, max: 100, default: 0 },
      HIPAA: { type: Number, min: 0, max: 100, default: 0 },
      EHR: { type: Number, min: 0, max: 100, default: 0 },
      Coordination: { type: Number, min: 0, max: 100, default: 0 },
      SLA: { type: Number, min: 0, max: 100, default: 0 },
    },
    isActive: { type: Boolean, default: true, index: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

talentSchema.index({ order: 1, createdAt: 1 });

module.exports = mongoose.model('Talent', talentSchema);
