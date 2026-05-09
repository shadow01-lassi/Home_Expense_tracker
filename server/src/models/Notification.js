const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  familyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Family',
    index: true,
  },
  type: {
    type: String,
    enum: ['expense_added', 'budget_warning', 'budget_exceeded', 'member_joined', 'member_left', 'weekly_summary', 'monthly_report', 'reminder', 'insight', 'system'],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  icon: {
    type: String,
    default: 'bell',
  },
  color: {
    type: String,
    default: '#6366F1',
  },
}, {
  timestamps: true,
});

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
