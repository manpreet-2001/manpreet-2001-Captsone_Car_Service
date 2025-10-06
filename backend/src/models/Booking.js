const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belong to an owner']
  },
  mechanic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Booking must have a mechanic']
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Booking must have a vehicle']
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: [true, 'Booking must have a service']
  },
  bookingDate: {
    type: Date,
    required: [true, 'Booking date is required']
  },
  bookingTime: {
    type: String,
    required: [true, 'Booking time is required'],
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
  },
  estimatedDuration: {
    type: Number, // in minutes
    required: true,
    min: [15, 'Minimum booking duration is 15 minutes']
  },
  status: {
    type: String,
    enum: [
      'pending',
      'confirmed',
      'in_progress',
      'completed',
      'cancelled',
      'no_show',
      'rescheduled'
    ],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  serviceLocation: {
    type: String,
    enum: ['at_garage', 'mobile', 'pickup_delivery', 'roadside'],
    required: [true, 'Service location is required']
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  contactInfo: {
    phone: String,
    alternatePhone: String,
    email: String
  },
  specialInstructions: {
    type: String,
    maxlength: [500, 'Special instructions cannot exceed 500 characters']
  },
  estimatedCost: {
    type: Number,
    required: true,
    min: [0, 'Cost cannot be negative']
  },
  actualCost: {
    type: Number,
    min: [0, 'Cost cannot be negative']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'partially_paid', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'credit_card', 'debit_card', 'paypal', 'stripe', 'other']
  },
  workPerformed: [{
    description: String,
    partsUsed: [{
      name: String,
      quantity: Number,
      cost: Number
    }],
    laborHours: Number,
    cost: Number,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  beforeImages: [{
    url: String,
    description: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  afterImages: [{
    url: String,
    description: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  notes: {
    customer: String,
    mechanic: String,
    admin: String
  },
  cancellationReason: {
    type: String,
    maxlength: [200, 'Cancellation reason cannot exceed 200 characters']
  },
  rescheduleHistory: [{
    originalDate: Date,
    originalTime: String,
    newDate: Date,
    newTime: String,
    reason: String,
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    changedAt: {
      type: Date,
      default: Date.now
    }
  }],
  reminderSent: {
    type: Boolean,
    default: false
  },
  reminderSentAt: Date,
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: Date,
  customerSatisfaction: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: String,
    submittedAt: Date
  }
}, {
  timestamps: true
});

// Index for efficient queries
bookingSchema.index({ owner: 1, status: 1 });
bookingSchema.index({ mechanic: 1, bookingDate: 1 });
bookingSchema.index({ bookingDate: 1, bookingTime: 1 });
bookingSchema.index({ status: 1, bookingDate: 1 });

// Virtual for full booking datetime
bookingSchema.virtual('bookingDateTime').get(function() {
  const date = new Date(this.bookingDate);
  const [hours, minutes] = this.bookingTime.split(':');
  date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  return date;
});

// Virtual for end time
bookingSchema.virtual('endDateTime').get(function() {
  const startDateTime = this.bookingDateTime;
  const endDateTime = new Date(startDateTime.getTime() + (this.estimatedDuration * 60000));
  return endDateTime;
});

// Virtual for formatted booking time
bookingSchema.virtual('formattedTime').get(function() {
  const [hours, minutes] = this.bookingTime.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
});

// Virtual for status color (for UI)
bookingSchema.virtual('statusColor').get(function() {
  const colors = {
    pending: 'warning',
    confirmed: 'info',
    in_progress: 'primary',
    completed: 'success',
    cancelled: 'danger',
    no_show: 'secondary',
    rescheduled: 'warning'
  };
  return colors[this.status] || 'secondary';
});

// Ensure virtual fields are serialized
bookingSchema.set('toJSON', { virtuals: true });

// Pre-save middleware to validate booking date
bookingSchema.pre('save', function(next) {
  const now = new Date();
  const bookingDateTime = this.bookingDateTime;
  
  // Check if booking is in the past (allow for existing bookings)
  if (bookingDateTime < now && this.isNew) {
    return next(new Error('Cannot book appointments in the past'));
  }
  
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
