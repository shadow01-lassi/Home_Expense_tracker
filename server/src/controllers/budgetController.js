const { Budget, Expense } = require('../models');

exports.getBudget = async (req, res) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const m = month ? Number(month) : now.getMonth() + 1;
    const y = year ? Number(year) : now.getFullYear();

    let budget = await Budget.findOne({ familyId: req.user.familyId, month: m, year: y });
    const startOfMonth = new Date(y, m - 1, 1);
    const endOfMonth = new Date(y, m, 0, 23, 59, 59);

    const categorySpending = await Expense.aggregate([
      { $match: { familyId: req.user.familyId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);
    const totalSpent = categorySpending.reduce((sum, cat) => sum + cat.total, 0);

    if (budget) {
      budget.categoryBudgets.forEach(cb => {
        const s = categorySpending.find(cs => cs._id === cb.category);
        cb.spent = s ? s.total : 0;
      });
      await budget.save();
    }

    res.json({ budget, spending: { total: totalSpent, byCategory: categorySpending } });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.setBudget = async (req, res) => {
  try {
    const { month, year, totalBudget, categoryBudgets } = req.body;
    const now = new Date();
    const m = month || now.getMonth() + 1;
    const y = year || now.getFullYear();

    let budget = await Budget.findOne({ familyId: req.user.familyId, month: m, year: y });

    if (budget) {
      budget.totalBudget = totalBudget;
      if (categoryBudgets) budget.categoryBudgets = categoryBudgets;
      await budget.save();
    } else {
      budget = await Budget.create({
        familyId: req.user.familyId, month: m, year: y,
        totalBudget, categoryBudgets: categoryBudgets || [], createdBy: req.user._id,
      });
    }
    res.json({ budget });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.getBudgetStatus = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const budget = await Budget.findOne({
      familyId: req.user.familyId, month: now.getMonth() + 1, year: now.getFullYear(),
    });

    const totalSpent = await Expense.aggregate([
      { $match: { familyId: req.user.familyId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const spent = totalSpent[0]?.total || 0;
    const budgetAmount = budget?.totalBudget || 0;
    const remaining = budgetAmount - spent;
    const percentageUsed = budgetAmount > 0 ? Math.round((spent / budgetAmount) * 100) : 0;
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysRemaining = daysInMonth - now.getDate();
    const dailyBudget = daysRemaining > 0 ? Math.round(remaining / daysRemaining) : 0;

    res.json({
      budget: budgetAmount, spent, remaining, percentageUsed, daysRemaining, dailyBudget,
      status: percentageUsed >= 100 ? 'exceeded' : percentageUsed >= 80 ? 'warning' : 'good',
      alerts: budget?.alerts?.filter(a => !a.isRead) || [],
    });
  } catch (error) { res.status(500).json({ error: error.message }); }
};
