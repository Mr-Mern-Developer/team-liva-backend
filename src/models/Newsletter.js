const mongoose = require('mongoose');

/** Footer email capture. */
const newsletterSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    isSubscribed: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Newsletter', newsletterSchema);
