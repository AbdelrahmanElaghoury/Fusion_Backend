const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema({
  cardholderName: { type: String, required: true },
  cardNumber:     { type: String, required: true },    // store only last 4 digits
  expMonth:       { type: Number, required: true },
  expYear:        { type: Number, required: true },
  brand:          { type: String, required: true },    // e.g. 'Visa'
}, { _id: false });

const addressSchema = new mongoose.Schema({
  label:      { type: String },
  line1:      { type: String, required: true },
  line2:      { type: String },
  city:       { type: String, required: true },
  state:      { type: String, required: true },
  postalCode: { type: String, required: true },
  country:    { type: String, required: true },
}, { _id: false });

const profileSchema = new mongoose.Schema({
  user: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'User',
    required: true,
    unique:   true
  },
  addresses:      { type: [addressSchema],      default: [] },
  paymentMethods: { type: [paymentMethodSchema], default: [] },

  // New flag for “started but not finished” flow:
  incompleteVisit: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Virtual getter/setter for convenience
profileSchema.virtual('hasIncompleteVisit')
  .get(function() {
    return this.incompleteVisit;
  })
  .set(function(val) {
    this.incompleteVisit = !!val;
  });

// Helper instance methods
profileSchema.methods.markVisitIncomplete = function() {
  this.incompleteVisit = true;
  return this.save();
};

profileSchema.methods.clearIncompleteVisit = function() {
  this.incompleteVisit = false;
  return this.save();
};

module.exports = mongoose.model('Profile', profileSchema);
