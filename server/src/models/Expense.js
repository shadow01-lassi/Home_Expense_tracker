const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  categoryColor: {
    type: String,
    default: '#6366f1',
  },
  categoryIcon: {
    type: String,
    default: 'receipt',
  },
  productName: {
    type: String,
    required: true,
    trim: true,
  },
  notes: {
    type: String,
    trim: true,
    default: '',
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'UPI', 'Credit Card', 'Debit Card', 'Bank Transfer'],
    default: 'Cash',
  },
  addedBy: {
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
  receiptUrl: {
    type: String,
    default: '',
  },
  isRecurring: {
    type: Boolean,
    default: false,
  },
  recurringFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly', null],
    default: null,
  },
  tags: [{
    type: String,
    trim: true,
  }],
}, {
  timestamps: true,
});

// Compound index for efficient queries
expenseSchema.index({ familyId: 1, date: -1 });
expenseSchema.index({ familyId: 1, category: 1 });
expenseSchema.index({ familyId: 1, addedBy: 1 });
expenseSchema.index({ productName: 'text', notes: 'text' });

module.exports = mongoose.model('Expense', expenseSchema);
