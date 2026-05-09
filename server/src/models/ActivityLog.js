const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  familyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Family',
    required: true,
    index: true,
  },
  action: {
    type: String,
    enum: [
      'expense_added', 'expense_updated', 'expense_deleted',
      'budget_set', 'budget_updated',
      'member_joined', 'member_removed', 'member_invited',
      'family_created', 'family_updated',
      'category_added', 'category_deleted',
      'settings_updated', 'profile_updated',
    ],
    required: true,
  },
  details: {
    type: String,
    default: '',
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
});

activityLogSchema.index({ familyId: 1, createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
