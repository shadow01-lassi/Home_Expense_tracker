const { Expense, User } = require('../models');
const mongoose = require('mongoose');

exports.getSummary = async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;
    const familyId = req.user.familyId;
    const now = new Date();

    let startDate, endDate, prevStartDate, prevEndDate;

    if (period === 'daily') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      prevStartDate = new Date(startDate); prevStartDate.setDate(prevStartDate.getDate() - 1);
      prevEndDate = new Date(endDate); prevEndDate.setDate(prevEndDate.getDate() - 1);
    } else if (period === 'weekly') {
      const dayOfWeek = now.getDay();
      startDate = new Date(now); startDate.setDate(now.getDate() - dayOfWeek); startDate.setHours(0,0,0,0);
      endDate = new Date(now); endDate.setHours(23,59,59,999);
      prevStartDate = new Date(startDate); prevStartDate.setDate(prevStartDate.getDate() - 7);
      prevEndDate = new Date(startDate); prevEndDate.setDate(prevEndDate.getDate() - 1); prevEndDate.setHours(23,59,59);
    } else if (period === 'yearly') {
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
      prevStartDate = new Date(now.getFullYear() - 1, 0, 1);
      prevEndDate = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      prevStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      prevEndDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    }

    const [currentSpending, previousSpending, todaySpending, categoryBreakdown, memberBreakdown, recentExpenses] = await Promise.all([
      Expense.aggregate([
        { $match: { familyId, date: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 }, avg: { $avg: '$amount' } } },
      ]),
      Expense.aggregate([
        { $match: { familyId, date: { $gte: prevStartDate, $lte: prevEndDate } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Expense.aggregate([
        { $match: { familyId, date: { $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()), $lte: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59) } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Expense.aggregate([
        { $match: { familyId, date: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { total: -1 } },
      ]),
      Expense.aggregate([
        { $match: { familyId, date: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: '$addedBy', total: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { total: -1 } },
      ]),
      Expense.find({ familyId }).populate('addedBy', 'displayName photoURL').sort('-date').limit(10),
    ]);

    const current = currentSpending[0] || { total: 0, count: 0, avg: 0 };
    const previous = previousSpending[0]?.total || 0;
    const changePercent = previous > 0 ? Math.round(((current.total - previous) / previous) * 100) : 0;

    // Populate member names
    const memberIds = memberBreakdown.map(m => m._id);
    const members = await User.find({ _id: { $in: memberIds } }, 'displayName photoURL');
    const memberData = memberBreakdown.map(m => {
      const user = members.find(u => u._id.toString() === m._id.toString());
      return { ...m, name: user?.displayName || 'Unknown', photoURL: user?.photoURL || '' };
    });

    // Daily average
    const daysPassed = period === 'monthly' ? now.getDate() : period === 'yearly' ? Math.ceil((now - startDate) / 86400000) : 1;
    const dailyAverage = daysPassed > 0 ? Math.round(current.total / daysPassed) : 0;

    res.json({
      totalSpending: current.total,
      expenseCount: current.count,
      averageExpense: Math.round(current.avg || 0),
      dailyAverage,
      todaySpending: todaySpending[0]?.total || 0,
      previousPeriodTotal: previous,
      changePercent,
      highestCategory: categoryBreakdown[0] || null,
      categoryBreakdown,
      memberBreakdown: memberData,
      recentExpenses,
      period,
    });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.getTrends = async (req, res) => {
  try {
    const familyId = req.user.familyId;
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const monthlyTrends = await Expense.aggregate([
      { $match: { familyId, date: { $gte: sixMonthsAgo } } },
      { $group: { _id: { month: { $month: '$date' }, year: { $year: '$date' } }, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trends = monthlyTrends.map(t => ({
      month: monthNames[t._id.month - 1],
      year: t._id.year,
      total: t.total,
      count: t.count,
      label: `${monthNames[t._id.month - 1]} ${t._id.year}`,
    }));

    res.json({ trends });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.getInsights = async (req, res) => {
  try {
    const { generateInsights } = require('../services/insightsEngine');
    const insights = await generateInsights(req.user.familyId);
    res.json({ insights });
  } catch (error) { res.status(500).json({ error: error.message }); }
};
