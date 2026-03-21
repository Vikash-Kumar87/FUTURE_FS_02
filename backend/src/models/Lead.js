const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true },
    contentType: { type: String, required: true },
    size: { type: Number, required: true },
    storagePath: { type: String, required: true },
    uploadedAt: { type: Date, required: true },
  },
  { _id: false },
);

const leadSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    source: { type: String, required: true, trim: true },
    status: { type: String, required: true, enum: ['New', 'Contacted', 'Converted'], default: 'New' },
    priority: { type: String, required: true, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    notes: { type: String, default: '', trim: true },
    attachment: { type: attachmentSchema, default: null },
  },
  {
    timestamps: true,
  },
);

const leadsCollectionName = (process.env.MONGODB_LEADS_COLLECTION || 'leads').trim();

module.exports = mongoose.model('Lead', leadSchema, leadsCollectionName);
