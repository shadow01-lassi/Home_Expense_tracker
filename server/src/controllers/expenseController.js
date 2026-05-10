const { Expense, Budget, Notification, ActivityLog } = require('../models');

// Get expenses with filters
exports.getExpenses = async (req, res) => {
  try {
    const {
      page = 1, limit = 20, category, addedBy, paymentMethod,
      startDate, endDate, minAmount, maxAmount, search, sortBy = 'date', sortOrder = 'desc'
    } = req.query;

    const query = { familyId: req.user.familyId };

    if (category) query.category = category;
    if (addedBy) query.addedBy = addedBy;
    if (paymentMethod) query.paymentMethod = paymentMethod;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    if (minAmount || maxAmount) {
      query.amount = {};
      if (minAmount) query.amount.$gte = Number(minAmount);
      if (maxAmount) query.amount.$lte = Number(maxAmount);
    }
    if (search) {
      query.$text = { $search: search };
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const total = await Expense.countDocuments(query);
    const expenses = await Expense.find(query)
      .populate('addedBy', 'displayName email photoURL initials')
      .populate('splitDetails.paidBy', 'displayName email photoURL initials')
      .populate('splitDetails.splitWith.user', 'displayName email photoURL initials')
      .sort(sort)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({
      expenses,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add new expense
exports.addExpense = async (req, res) => {
  try {
    const {
      amount, category, categoryColor, categoryIcon, productName,
      notes, date, paymentMethod, receiptUrl, isRecurring, recurringFrequency, tags,
      isSplit, splitDetails
    } = req.body;

    const expense = await Expense.create({
      amount,
      category,
      categoryColor: categoryColor || '#6366f1',
      categoryIcon: categoryIcon || 'receipt',
      productName,
      notes: notes || '',
      date: date || new Date(),
      paymentMethod: paymentMethod || 'Cash',
      addedBy: req.user._id,
      familyId: req.user.familyId,
      receiptUrl: receiptUrl || '',
      isRecurring: isRecurring || false,
      recurringFrequency: recurringFrequency || null,
      tags: tags || [],
      isSplit: isSplit || false,
      splitDetails: splitDetails || undefined,
    });

    const populated = await Expense.findById(expense._id)
      .populate('addedBy', 'displayName email photoURL')
      .populate('splitDetails.paidBy', 'displayName email photoURL')
      .populate('splitDetails.splitWith.user', 'displayName email photoURL');

    // Check budget alerts
    await checkBudgetAlert(req.user.familyId, category, amount);

    // Log activity
    await ActivityLog.create({
      userId: req.user._id,
      familyId: req.user.familyId,
      action: 'expense_added',
      details: `Added ₹${amount} for ${productName} (${category})`,
      metadata: { expenseId: expense._id, amount, category },
    });

    res.status(201).json({ expense: populated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update expense
exports.updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      familyId: req.user.familyId,
    });

    if (!expense) return res.status(404).json({ error: 'Expense not found' });

    const allowedUpdates = [
      'amount', 'category', 'categoryColor', 'categoryIcon', 'productName',
      'notes', 'date', 'paymentMethod', 'receiptUrl', 'isRecurring', 'recurringFrequency', 'tags',
      'isSplit', 'splitDetails'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        expense[field] = req.body[field];
      }
    });

    await expense.save();
    const populated = await Expense.findById(expense._id)
      .populate('addedBy', 'displayName email photoURL')
      .populate('splitDetails.paidBy', 'displayName email photoURL')
      .populate('splitDetails.splitWith.user', 'displayName email photoURL');

    // Log activity
    await ActivityLog.create({
      userId: req.user._id,
      familyId: req.user.familyId,
      action: 'expense_updated',
      details: `Updated expense: ${expense.productName}`,
      metadata: { expenseId: expense._id },
    });

    res.json({ expense: populated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete expense
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      familyId: req.user.familyId,
    });

    if (!expense) return res.status(404).json({ error: 'Expense not found' });

    // Log activity
    await ActivityLog.create({
      userId: req.user._id,
      familyId: req.user.familyId,
      action: 'expense_deleted',
      details: `Deleted expense: ${expense.productName} (₹${expense.amount})`,
      metadata: { amount: expense.amount, category: expense.category },
    });

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single expense
exports.getExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      familyId: req.user.familyId,
    }).populate('addedBy', 'displayName email photoURL')
      .populate('splitDetails.paidBy', 'displayName email photoURL')
      .populate('splitDetails.splitWith.user', 'displayName email photoURL');

    if (!expense) return res.status(404).json({ error: 'Expense not found' });
    res.json({ expense });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Helper: Check and create budget alerts
async function checkBudgetAlert(familyId, category, amount) {
  try {
    const now = new Date();
    const budget = await Budget.findOne({
      familyId,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    });

    if (!budget) return;

    // Calculate total spending this month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const totalSpent = await Expense.aggregate([
      {
        $match: {
          familyId,
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const spent = totalSpent[0]?.total || 0;
    const percentage = Math.round((spent / budget.totalBudget) * 100);

    // Total budget alerts
    if (percentage >= 100) {
      budget.alerts.push({
        type: 'exceeded',
        message: `Monthly budget exceeded! Spent ₹${spent} of ₹${budget.totalBudget}`,
        percentage,
      });
    } else if (percentage >= 80) {
      budget.alerts.push({
        type: 'warning',
        message: `${percentage}% of monthly budget used. ₹${budget.totalBudget - spent} remaining`,
        percentage,
      });
    }

    // Category-specific alerts
    const categoryBudget = budget.categoryBudgets.find(cb => cb.category === category);
    if (categoryBudget) {
      const categorySpent = await Expense.aggregate([
        {
          $match: {
            familyId,
            category,
            date: { $gte: startOfMonth, $lte: endOfMonth },
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);

      const catSpent = categorySpent[0]?.total || 0;
      categoryBudget.spent = catSpent;
      const catPercentage = Math.round((catSpent / categoryBudget.amount) * 100);

      if (catPercentage >= 100) {
        budget.alerts.push({
          type: 'exceeded',
          message: `${category} budget exceeded!`,
          category,
          percentage: catPercentage,
        });
      }
    }

    await budget.save();
  } catch (error) {
    console.error('Budget alert check failed:', error);
  }
}
