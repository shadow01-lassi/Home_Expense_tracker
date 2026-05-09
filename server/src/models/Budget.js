const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  familyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Family',
    required: true,
    index: true,
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12,
  },
  year: {
    type: Number,
    required: true,
  },
  totalBudget: {
    type: Number,
    required: true,
    min: 0,
  },
  categoryBudgets: [{
    category: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    spent: { type: Number, default: 0 },
  }],
  alerts: [{
    type: {
      type: String,
      enum: ['warning', 'exceeded', 'info'],
    },
    message: String,
    category: String,
    percentage: Number,
    createdAt: { type: Date, default: Date.now },
    isRead: { type: Boolean, default: false },
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Compound index for month/year lookups
budgetSchema.index({ familyId: 1, month: 1, year: 1 }, { unique: true });

// Virtual for total spent
budgetSchema.virtual('totalSpent').get(function() {
  return this.categoryBudgets.reduce((sum, cb) => sum + cb.spent, 0);
});

// Virtual for remaining
budgetSchema.virtual('remaining').get(function() {
  return this.totalBudget - this.totalSpent;
});

// Virtual for percentage used
budgetSchema.virtual('percentageUsed').get(function() {
  if (this.totalBudget === 0) return 0;
  return Math.round((this.totalSpent / this.totalBudget) * 100);
});

budgetSchema.set('toJSON', { virtuals: true });
budgetSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Budget', budgetSchema);
