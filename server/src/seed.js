require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/database');
const { User, Family, Expense, Category, Budget, Notification } = require('./models');
const { DEFAULT_CATEGORIES } = require('./models/Category');
const { v4: uuidv4 } = require('uuid');

const USERS = [
  { firebaseUid: 'seed_user_a', displayName: 'Aarav Sharma', email: 'aarav@family.com', photoURL: '' },
  { firebaseUid: 'seed_user_b', displayName: 'Bhavna Patel', email: 'bhavna@family.com', photoURL: '' },
  { firebaseUid: 'seed_user_c', displayName: 'Chirag Verma', email: 'chirag@family.com', photoURL: '' },
  { firebaseUid: 'seed_user_d', displayName: 'Diya Gupta', email: 'diya@family.com', photoURL: '' },
  { firebaseUid: 'seed_user_e', displayName: 'Eshan Kumar', email: 'eshan@family.com', photoURL: '' },
];

const EXPENSES_DATA = [
  { amount: 2500, category: 'Groceries', productName: 'Weekly groceries from D-Mart', paymentMethod: 'UPI', notes: 'Rice, dal, oil, spices' },
  { amount: 450, category: 'Vegetables & Fruits', productName: 'Fresh vegetables', paymentMethod: 'Cash', notes: 'Tomato, onion, potato, green veggies' },
  { amount: 1200, category: 'Fuel', productName: 'Petrol - Honda Activa', paymentMethod: 'UPI', notes: 'Full tank' },
  { amount: 350, category: 'Snacks / Naasta', productName: 'Evening snacks & chai', paymentMethod: 'Cash', notes: 'Samosa, chai, biscuits' },
  { amount: 15000, category: 'Rent', productName: 'Monthly house rent', paymentMethod: 'Bank Transfer', notes: 'May 2026 rent' },
  { amount: 2200, category: 'Electricity Bill', productName: 'Electricity bill - May', paymentMethod: 'UPI', notes: 'State electricity board' },
  { amount: 500, category: 'Water Bill', productName: 'Monthly water bill', paymentMethod: 'UPI', notes: '' },
  { amount: 899, category: 'Internet/WiFi', productName: 'Jio Fiber monthly plan', paymentMethod: 'Credit Card', notes: '100 Mbps plan' },
  { amount: 750, category: 'Soap & Toiletries', productName: 'Bathroom essentials', paymentMethod: 'UPI', notes: 'Shampoo, soap, toothpaste, detergent' },
  { amount: 3500, category: 'Medical', productName: 'Doctor visit & medicines', paymentMethod: 'Cash', notes: 'General checkup + BP medicine' },
  { amount: 1800, category: 'Shopping', productName: 'New bed sheets', paymentMethod: 'Credit Card', notes: 'Amazon order' },
  { amount: 2000, category: 'Guest Expenses', productName: 'Dinner for guests', paymentMethod: 'UPI', notes: 'Ordered from Swiggy for 8 people' },
  { amount: 5000, category: 'Education', productName: 'Online course subscription', paymentMethod: 'Credit Card', notes: 'Udemy annual plan' },
  { amount: 1500, category: 'Entertainment', productName: 'Movie & dinner outing', paymentMethod: 'Debit Card', notes: 'PVR cinema + food court' },
  { amount: 800, category: 'Maintenance', productName: 'Plumber visit', paymentMethod: 'Cash', notes: 'Kitchen tap repair' },
  { amount: 3200, category: 'Groceries', productName: 'Monthly grocery stock', paymentMethod: 'UPI', notes: 'Big Bazaar shopping' },
  { amount: 650, category: 'Travel', productName: 'Auto rickshaw rides', paymentMethod: 'Cash', notes: 'Week commute' },
  { amount: 1100, category: 'Vegetables & Fruits', productName: 'Fruits - weekly', paymentMethod: 'Cash', notes: 'Mangoes, apples, bananas' },
  { amount: 4500, category: 'Shopping', productName: 'Kitchen appliance', paymentMethod: 'Credit Card', notes: 'Mixer grinder from Flipkart' },
  { amount: 200, category: 'Miscellaneous', productName: 'Newspaper subscription', paymentMethod: 'Cash', notes: 'Monthly newspaper bill' },
  { amount: 1500, category: 'Household Items', productName: 'Cleaning supplies', paymentMethod: 'UPI', notes: 'Broom, mop, dustbin' },
  { amount: 7500, category: 'Emergency', productName: 'Car repair', paymentMethod: 'Debit Card', notes: 'Brake pad replacement' },
  { amount: 300, category: 'Snacks / Naasta', productName: 'Bakery items', paymentMethod: 'Cash', notes: 'Bread, cake, cookies' },
  { amount: 950, category: 'Fuel', productName: 'CNG refill', paymentMethod: 'UPI', notes: 'Car CNG tank' },
  { amount: 2800, category: 'Groceries', productName: 'Cooking oil & dry fruits', paymentMethod: 'UPI', notes: 'Mustard oil, almonds, cashews' },
  { amount: 400, category: 'Vegetables & Fruits', productName: 'Sabzi mandi shopping', paymentMethod: 'Cash', notes: 'Weekly vegetables' },
  { amount: 1000, category: 'Guest Expenses', productName: 'Tea & snacks for visitors', paymentMethod: 'Cash', notes: 'Relatives visited on weekend' },
  { amount: 3000, category: 'Travel', productName: 'Train tickets', paymentMethod: 'UPI', notes: 'Delhi to Jaipur round trip' },
  { amount: 600, category: 'Entertainment', productName: 'Netflix subscription', paymentMethod: 'Credit Card', notes: 'Monthly plan' },
  { amount: 1200, category: 'Medical', productName: 'Pharmacy medicines', paymentMethod: 'Cash', notes: 'Monthly prescription refill' },
  { amount: 850, category: 'Household Items', productName: 'Light bulbs & fittings', paymentMethod: 'UPI', notes: 'LED bulbs replacement' },
  { amount: 2000, category: 'Maintenance', productName: 'AC service', paymentMethod: 'UPI', notes: 'Annual AC maintenance' },
  { amount: 550, category: 'Soap & Toiletries', productName: 'Personal care items', paymentMethod: 'Cash', notes: 'Face wash, cream, razor' },
  { amount: 1800, category: 'Education', productName: 'Books & stationery', paymentMethod: 'Debit Card', notes: 'School books for new term' },
  { amount: 3500, category: 'Shopping', productName: 'Clothes shopping', paymentMethod: 'Credit Card', notes: 'Myntra order' },
  { amount: 700, category: 'Fuel', productName: 'Petrol - Bike', paymentMethod: 'UPI', notes: '' },
  { amount: 450, category: 'Snacks / Naasta', productName: 'Street food outing', paymentMethod: 'Cash', notes: 'Golgappa, chaat, momos' },
  { amount: 1600, category: 'Groceries', productName: 'Dairy products', paymentMethod: 'UPI', notes: 'Milk, curd, paneer, ghee' },
  { amount: 5500, category: 'Travel', productName: 'Uber rides - monthly', paymentMethod: 'UPI', notes: 'Office commute' },
  { amount: 250, category: 'Miscellaneous', productName: 'Temple donation', paymentMethod: 'Cash', notes: '' },
];

async function seed() {
  try {
    await connectDB();
    console.log('🌱 Seeding database...\n');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}), Family.deleteMany({}), Expense.deleteMany({}),
      Category.deleteMany({}), Budget.deleteMany({}), Notification.deleteMany({}),
    ]);
    console.log('   Cleared existing data');

    // Create users
    const users = await User.insertMany(USERS);
    console.log(`   Created ${users.length} users`);

    // Create family
    const family = await Family.create({
      name: 'Sharma Family',
      admin: users[0]._id,
      inviteCode: 'SHARMA01',
      monthlyBudget: 50000,
      members: users.map((u, i) => ({
        user: u._id,
        role: i === 0 ? 'admin' : 'member',
        status: 'active',
      })),
    });
    console.log('   Created family: Sharma Family');

    // Update users with familyId
    await User.updateMany(
      { _id: { $in: users.map(u => u._id) } },
      { familyId: family._id }
    );
    await User.findByIdAndUpdate(users[0]._id, { role: 'admin' });

    // Seed categories
    const categories = DEFAULT_CATEGORIES.map(cat => ({ ...cat, familyId: family._id }));
    await Category.insertMany(categories);
    console.log(`   Created ${categories.length} categories`);

    // Create expenses spread over last 60 days
    const expenses = EXPENSES_DATA.map((exp, i) => {
      const daysAgo = Math.floor(Math.random() * 60);
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      date.setHours(Math.floor(Math.random() * 12) + 8, Math.floor(Math.random() * 60));

      const cat = categories.find(c => c.name === exp.category);
      return {
        ...exp,
        date,
        addedBy: users[i % users.length]._id,
        familyId: family._id,
        categoryColor: cat?.color || '#6366f1',
        categoryIcon: cat?.icon || 'receipt',
      };
    });
    await Expense.insertMany(expenses);
    console.log(`   Created ${expenses.length} expenses`);

    // Create budget
    const now = new Date();
    await Budget.create({
      familyId: family._id,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      totalBudget: 50000,
      categoryBudgets: [
        { category: 'Groceries', amount: 8000, spent: 0 },
        { category: 'Rent', amount: 15000, spent: 0 },
        { category: 'Fuel', amount: 3000, spent: 0 },
        { category: 'Shopping', amount: 5000, spent: 0 },
        { category: 'Medical', amount: 3000, spent: 0 },
        { category: 'Entertainment', amount: 2000, spent: 0 },
        { category: 'Education', amount: 5000, spent: 0 },
      ],
      createdBy: users[0]._id,
    });
    console.log('   Created monthly budget');

    // Sample notifications
    await Notification.insertMany([
      { userId: users[0]._id, familyId: family._id, type: 'budget_warning', title: 'Budget Alert', message: 'Groceries spending is at 75% of budget', icon: 'alert-triangle', color: '#F59E0B' },
      { userId: users[0]._id, familyId: family._id, type: 'insight', title: 'Smart Insight', message: 'Travel expenses increased by 25% this month', icon: 'trending-up', color: '#6366F1' },
      { userId: users[1]._id, familyId: family._id, type: 'expense_added', title: 'New Expense', message: 'Aarav added ₹2500 for Weekly groceries', icon: 'plus-circle', color: '#10B981' },
    ]);
    console.log('   Created sample notifications');

    console.log('\n✅ Database seeded successfully!');
    console.log(`\n📋 Login credentials (dev mode):`);
    users.forEach(u => console.log(`   ${u.displayName}: ID ${u._id}`));
    console.log(`\n🏠 Family invite code: SHARMA01`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seed();
