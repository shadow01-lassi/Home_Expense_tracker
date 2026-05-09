const { Expense } = require('../models');

// Smart insights engine that generates actionable financial insights
async function generateInsights(familyId) {
  const now = new Date();
  const insights = [];

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  const prevStartOfMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevEndOfMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  // Current and previous month spending by category
  const [currentMonth, previousMonth, weeklyData] = await Promise.all([
    Expense.aggregate([
      { $match: { familyId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),
    Expense.aggregate([
      { $match: { familyId, date: { $gte: prevStartOfMonth, $lte: prevEndOfMonth } } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),
    Expense.aggregate([
      { $match: { familyId, date: { $gte: new Date(now.getTime() - 7 * 86400000) } } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
    ]),
  ]);

  const currentTotal = currentMonth.reduce((s, c) => s + c.total, 0);
  const previousTotal = previousMonth.reduce((s, c) => s + c.total, 0);

  // Category comparison insights
  currentMonth.forEach(curr => {
    const prev = previousMonth.find(p => p._id === curr._id);
    if (prev) {
      const change = Math.round(((curr.total - prev.total) / prev.total) * 100);
      if (change > 15) {
        insights.push({
          type: 'warning', icon: 'trending-up', color: '#F59E0B',
          message: `${curr._id} spending increased by ${change}% this month`,
          detail: `₹${curr.total} vs ₹${prev.total} last month`,
        });
      } else if (change < -15) {
        insights.push({
          type: 'positive', icon: 'trending-down', color: '#10B981',
          message: `Great! ${curr._id} spending decreased by ${Math.abs(change)}%`,
          detail: `₹${curr.total} vs ₹${prev.total} last month`,
        });
      }
    }
  });

  // Highest spending category
  if (currentMonth.length > 0) {
    const highest = currentMonth.reduce((a, b) => a.total > b.total ? a : b);
    insights.push({
      type: 'info', icon: 'bar-chart', color: '#6366F1',
      message: `${highest._id} is the highest spending category`,
      detail: `₹${highest.total} spent across ${highest.count} expenses`,
    });
  }

  // Savings potential
  if (previousTotal > 0 && currentTotal > previousTotal) {
    const potentialSaving = Math.round((currentTotal - previousTotal) * 0.6);
    insights.push({
      type: 'tip', icon: 'piggy-bank', color: '#10B981',
      message: `You can save approximately ₹${potentialSaving}/month`,
      detail: `By reducing spending to last month's levels in top categories`,
    });
  }

  // Daily average insight
  const daysPassed = now.getDate();
  const dailyAvg = daysPassed > 0 ? Math.round(currentTotal / daysPassed) : 0;
  if (dailyAvg > 0) {
    const projectedMonthly = dailyAvg * new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    insights.push({
      type: 'info', icon: 'calculator', color: '#8B5CF6',
      message: `Daily average spending: ₹${dailyAvg}`,
      detail: `Projected monthly total: ₹${projectedMonthly}`,
    });
  }

  // Weekly high spenders
  const weeklyHigh = weeklyData.reduce((a, b) => (a?.total || 0) > (b?.total || 0) ? a : b, null);
  if (weeklyHigh && weeklyHigh.total > 0) {
    insights.push({
      type: 'info', icon: 'calendar', color: '#06B6D4',
      message: `${weeklyHigh._id} had the highest spending this week`,
      detail: `₹${weeklyHigh.total} spent in the last 7 days`,
    });
  }

  return insights.slice(0, 8);
}

module.exports = { generateInsights };
