const { Family, User, Category, ActivityLog, Notification } = require('../models');

// Create a new family
exports.createFamily = async (req, res) => {
  try {
    const { name, monthlyBudget } = req.body;

    // Check if user already has a family
    if (req.user.familyId) {
      return res.status(400).json({ error: 'You already belong to a family' });
    }

    const family = await Family.create({
      name,
      admin: req.user._id,
      monthlyBudget: monthlyBudget || 0,
      members: [{
        user: req.user._id,
        role: 'admin',
        status: 'active',
      }],
    });

    // Update user
    req.user.familyId = family._id;
    req.user.role = 'admin';
    await req.user.save();

    // Seed default categories for this family
    await Category.seedDefaults(family._id);

    // Log activity
    await ActivityLog.create({
      userId: req.user._id,
      familyId: family._id,
      action: 'family_created',
      details: `Family "${name}" created`,
    });

    const populated = await Family.findById(family._id)
      .populate('admin', 'displayName email photoURL')
      .populate('members.user', 'displayName email photoURL');

    res.status(201).json({ family: populated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Join a family via invite code
exports.joinFamily = async (req, res) => {
  try {
    const { inviteCode } = req.body;

    if (req.user.familyId) {
      return res.status(400).json({ error: 'You already belong to a family. Leave current family first.' });
    }

    const family = await Family.findOne({ inviteCode: inviteCode.toUpperCase() });
    if (!family) {
      return res.status(404).json({ error: 'Invalid invite code' });
    }

    // Check if already a member
    const existingMember = family.members.find(
      m => m.user.toString() === req.user._id.toString()
    );
    if (existingMember) {
      return res.status(400).json({ error: 'You are already a member of this family' });
    }

    // Add to family
    family.members.push({
      user: req.user._id,
      role: 'member',
      status: family.settings.requireApproval ? 'pending' : 'active',
    });
    await family.save();

    // Update user
    req.user.familyId = family._id;
    req.user.role = 'member';
    await req.user.save();

    // Log activity
    await ActivityLog.create({
      userId: req.user._id,
      familyId: family._id,
      action: 'member_joined',
      details: `${req.user.displayName} joined the family`,
    });

    // Notify family members
    const memberIds = family.members
      .filter(m => m.user.toString() !== req.user._id.toString() && m.status === 'active')
      .map(m => m.user);

    const notifications = memberIds.map(userId => ({
      userId,
      familyId: family._id,
      type: 'member_joined',
      title: 'New Member',
      message: `${req.user.displayName} joined your family`,
      icon: 'user-plus',
      color: '#10B981',
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    const populated = await Family.findById(family._id)
      .populate('admin', 'displayName email photoURL')
      .populate('members.user', 'displayName email photoURL');

    res.json({ family: populated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get family details
exports.getFamily = async (req, res) => {
  try {
    const family = await Family.findById(req.user.familyId)
      .populate('admin', 'displayName email photoURL')
      .populate('members.user', 'displayName email photoURL');

    if (!family) {
      return res.status(404).json({ error: 'Family not found' });
    }

    res.json({ family });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update family settings
exports.updateFamily = async (req, res) => {
  try {
    const { name, monthlyBudget, settings, currency } = req.body;
    const family = await Family.findById(req.user.familyId);

    if (!family) return res.status(404).json({ error: 'Family not found' });

    if (name) family.name = name;
    if (monthlyBudget !== undefined) family.monthlyBudget = monthlyBudget;
    if (currency) family.currency = currency;
    if (settings) family.settings = { ...family.settings, ...settings };

    await family.save();

    const populated = await Family.findById(family._id)
      .populate('admin', 'displayName email photoURL')
      .populate('members.user', 'displayName email photoURL');

    res.json({ family: populated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Remove a member (admin only)
exports.removeMember = async (req, res) => {
  try {
    const { userId } = req.params;
    const family = await Family.findById(req.user.familyId);

    if (!family) return res.status(404).json({ error: 'Family not found' });

    // Can't remove self if admin
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ error: 'Admin cannot remove themselves' });
    }

    const memberIndex = family.members.findIndex(
      m => m.user.toString() === userId
    );

    if (memberIndex === -1) {
      return res.status(404).json({ error: 'Member not found in family' });
    }

    family.members[memberIndex].status = 'removed';
    await family.save();

    // Update user
    await User.findByIdAndUpdate(userId, { familyId: null, role: 'member' });

    // Log activity
    const removedUser = await User.findById(userId);
    await ActivityLog.create({
      userId: req.user._id,
      familyId: family._id,
      action: 'member_removed',
      details: `${removedUser?.displayName || 'User'} was removed from the family`,
    });

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Leave family
exports.leaveFamily = async (req, res) => {
  try {
    const family = await Family.findById(req.user.familyId);
    if (!family) return res.status(404).json({ error: 'Family not found' });

    // Admin can't leave without transferring
    if (family.admin.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: 'Transfer admin role before leaving' });
    }

    const memberIndex = family.members.findIndex(
      m => m.user.toString() === req.user._id.toString()
    );

    if (memberIndex !== -1) {
      family.members[memberIndex].status = 'removed';
      await family.save();
    }

    req.user.familyId = null;
    req.user.role = 'member';
    await req.user.save();

    res.json({ message: 'Left family successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Regenerate invite code
exports.regenerateInviteCode = async (req, res) => {
  try {
    const family = await Family.findById(req.user.familyId);
    if (!family) return res.status(404).json({ error: 'Family not found' });

    await family.regenerateInviteCode();
    res.json({ inviteCode: family.inviteCode });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
