const mongoose = require('mongoose');

const DEFAULT_CATEGORIES = [
  { name: 'Groceries', icon: 'shopping-cart', color: '#10B981', isDefault: true },
  { name: 'Household Items', icon: 'home', color: '#6366F1', isDefault: true },
  { name: 'Soap & Toiletries', icon: 'droplets', color: '#06B6D4', isDefault: true },
  { name: 'Travel', icon: 'plane', color: '#F59E0B', isDefault: true },
  { name: 'Fuel', icon: 'fuel', color: '#EF4444', isDefault: true },
  { name: 'Guest Expenses', icon: 'users', color: '#8B5CF6', isDefault: true },
  { name: 'Snacks / Naasta', icon: 'cookie', color: '#F97316', isDefault: true },
  { name: 'Vegetables & Fruits', icon: 'apple', color: '#22C55E', isDefault: true },
  { name: 'Medical', icon: 'heart-pulse', color: '#EF4444', isDefault: true },
  { name: 'Electricity Bill', icon: 'zap', color: '#FACC15', isDefault: true },
  { name: 'Water Bill', icon: 'droplet', color: '#3B82F6', isDefault: true },
  { name: 'Internet/WiFi', icon: 'wifi', color: '#6366F1', isDefault: true },
  { name: 'Rent', icon: 'building', color: '#EC4899', isDefault: true },
  { name: 'Maintenance', icon: 'wrench', color: '#78716C', isDefault: true },
  { name: 'Shopping', icon: 'shopping-bag', color: '#D946EF', isDefault: true },
  { name: 'Emergency', icon: 'alert-triangle', color: '#DC2626', isDefault: true },
  { name: 'Entertainment', icon: 'film', color: '#A855F7', isDefault: true },
  { name: 'Education', icon: 'graduation-cap', color: '#0EA5E9', isDefault: true },
  { name: 'Miscellaneous', icon: 'more-horizontal', color: '#94A3B8', isDefault: true },
];

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  icon: {
    type: String,
    default: 'tag',
  },
  color: {
    type: String,
    default: '#6366F1',
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  isCustom: {
    type: Boolean,
    default: false,
  },
  familyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Family',
    default: null,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
}, {
  timestamps: true,
});

categorySchema.index({ familyId: 1 });

const Category = mongoose.model('Category', categorySchema);

// Static method to seed default categories for a family
Category.seedDefaults = async (familyId) => {
  const existing = await Category.findOne({ familyId, isDefault: true });
  if (!existing) {
    const categories = DEFAULT_CATEGORIES.map(cat => ({
      ...cat,
      familyId,
    }));
    await Category.insertMany(categories);
  }
};

module.exports = Category;
module.exports.DEFAULT_CATEGORIES = DEFAULT_CATEGORIES;
