const mongoose = require('mongoose');

/** A card in the "Enterprise Solutions Matrix". */
const serviceSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    icon: { type: String, default: 'fa-briefcase' },
    desc: { type: String, required: true, trim: true, maxlength: 600 },
    sla: { type: String, default: '99.9%' },
    speed: { type: String, default: '72 Hours' },
    savings: { type: String, default: '55%' },
    banner: { type: String, default: '' },
    isActive: { type: Boolean, default: true, index: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

serviceSchema.index({ order: 1 });

module.exports = mongoose.model('Service', serviceSchema);
