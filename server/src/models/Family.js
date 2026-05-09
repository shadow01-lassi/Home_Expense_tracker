const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const familySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  inviteCode: {
    type: String,
    unique: true,
    default: () => uuidv4().slice(0, 8).toUpperCase(),
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['active', 'pending', 'removed'],
      default: 'active',
    },
  }],
  pendingInvites: [{
    email: String,
    invitedAt: { type: Date, default: Date.now },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  }],
  monthlyBudget: {
    type: Number,
    default: 0,
  },
  currency: {
    type: String,
    default: '₹',
  },
  settings: {
    allowMemberBudgetEdit: { type: Boolean, default: false },
    allowMemberInvite: { type: Boolean, default: true },
    requireApproval: { type: Boolean, default: false },
  },
}, {
  timestamps: true,
});

// Generate a new invite code
familySchema.methods.regenerateInviteCode = function() {
  this.inviteCode = uuidv4().slice(0, 8).toUpperCase();
  return this.save();
};

// Get active members count
familySchema.virtual('activeMemberCount').get(function() {
  return this.members.filter(m => m.status === 'active').length;
});

familySchema.set('toJSON', { virtuals: true });
familySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Family', familySchema);
