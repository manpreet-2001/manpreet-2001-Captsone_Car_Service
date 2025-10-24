const mongoose = require('mongoose');

const garageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Garage name is required'],
    trim: true,
    maxlength: [100, 'Garage name cannot exceed 100 characters']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Garage must have an owner']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    state: {
      type: String,
      required: [true, 'State is required']
    },
    zipCode: {
      type: String,
      required: [true, 'ZIP code is required']
    },
    country: {
      type: String,
      default: 'USA'
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  contactInfo: {
    phone: {
      type: String,
      required: [true, 'Phone number is required']
    },
    email: {
      type: String,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email'
      ]
    },
    website: String
  },
  services: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  }],
  mechanics: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  operatingHours: {
    monday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    tuesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    wednesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    thursday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    friday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    saturday: { open: String, close: String, isOpen: { type: Boolean, default: false } },
    sunday: { open: String, close: String, isOpen: { type: Boolean, default: false } }
  },
  facilities: [{
    type: String,
    enum: [
      'waiting_area',
      'wifi',
      'coffee_shop',
      'restroom',
      'parking',
      'wheelchair_accessible',
      'air_conditioning',
      'tv',
      'magazines',
      'kids_play_area',
      'shuttle_service',
      'loaner_cars'
    ]
  }],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  images: [{
    url: String,
    alt: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationDate: Date,
  capacity: {
    type: Number,
    default: 10,
    min: 1
  },
  currentBookings: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient queries
garageSchema.index({ owner: 1 });
garageSchema.index({ 'address.city': 1, 'address.state': 1 });
garageSchema.index({ isActive: 1, isVerified: 1 });

// Virtual for full address
garageSchema.virtual('fullAddress').get(function() {
  return `${this.address.street}, ${this.address.city}, ${this.address.state} ${this.address.zipCode}`;
});

// Virtual for availability status
garageSchema.virtual('isAvailable').get(function() {
  return this.isActive && this.currentBookings < this.capacity;
});

// Ensure virtual fields are serialized
garageSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Garage', garageSchema);



