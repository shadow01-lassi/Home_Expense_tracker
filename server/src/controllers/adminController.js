const { User, Family, ActivityLog, Expense } = require('../models');

exports.getUsers = async (req, res) => {
  try {
    const family = await Family.findById(req.user.familyId).populate('members.user', 'displayName email photoURL role isActive createdAt');
    if (!family) return res.status(404).json({ error: 'Family not found' });
    res.json({ members: family.members });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.removeUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const family = await Family.findById(req.user.familyId);
    if (!family) return res.status(404).json({ error: 'Family not found' });

    const idx = family.members.findIndex(m => m.user.toString() === userId);
    if (idx === -1) return res.status(404).json({ error: 'Member not found' });
    if (family.admin.toString() === userId) return res.status(400).json({ error: 'Cannot remove admin' });

    family.members[idx].status = 'removed';
    await family.save();
    await User.findByIdAndUpdate(userId, { familyId: null, role: 'member' });

    await ActivityLog.create({
      userId: req.user._id, familyId: family._id,
      action: 'member_removed', details: `Member removed by admin`,
    });

    res.json({ message: 'User removed' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.getActivityLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, action } = req.query;
    const query = { familyId: req.user.familyId };
    if (action) query.action = action;

    const total = await ActivityLog.countDocuments(query);
    const logs = await ActivityLog.find(query)
      .populate('userId', 'displayName email photoURL')
      .sort('-createdAt')
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({ logs, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
  } catch (error) { res.status(500).json({ error: error.message }); }
};
