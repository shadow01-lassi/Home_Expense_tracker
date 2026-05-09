const { Category } = require('../models');

// Get all categories for a family
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({
      $or: [
        { familyId: req.user.familyId },
        { isDefault: true, familyId: null },
      ],
    }).sort('name');

    res.json({ categories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add custom category
exports.addCategory = async (req, res) => {
  try {
    const { name, icon, color } = req.body;

    const existing = await Category.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      familyId: req.user.familyId,
    });

    if (existing) {
      return res.status(400).json({ error: 'Category already exists' });
    }

    const category = await Category.create({
      name,
      icon: icon || 'tag',
      color: color || '#6366F1',
      isCustom: true,
      familyId: req.user.familyId,
      createdBy: req.user._id,
    });

    res.status(201).json({ category });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findOneAndUpdate(
      { _id: req.params.id, familyId: req.user.familyId, isCustom: true },
      req.body,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ error: 'Custom category not found' });
    }

    res.json({ category });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete custom category
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOneAndDelete({
      _id: req.params.id,
      familyId: req.user.familyId,
      isCustom: true,
    });

    if (!category) {
      return res.status(404).json({ error: 'Custom category not found or is a default category' });
    }

    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
