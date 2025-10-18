const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Vehicle must belong to an owner']
  },
  make: {
    type: String,
    required: [true, 'Vehicle make is required'],
    trim: true,
    maxlength: [50, 'Make cannot exceed 50 characters']
  },
  model: {
    type: String,
    required: [true, 'Vehicle model is required'],
    trim: true,
    maxlength: [50, 'Model cannot exceed 50 characters']
  },
  year: {
    type: Number,
    required: [true, 'Vehicle year is required'],
    min: [1900, 'Year must be after 1900'],
    max: [new Date().getFullYear() + 1, 'Year cannot be in the future']
  },
  licensePlate: {
    type: String,
    required: [true, 'License plate is required'],
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: [20, 'License plate cannot exceed 20 characters']
  },
  vin: {
    type: String,
    unique: true,
    sparse: true, // Allows null values while maintaining uniqueness
    trim: true,
    uppercase: true // Automatically convert to uppercase
    // No validation - VIN is completely optional
  },
  color: {
    type: String,
    trim: true,
    maxlength: [30, 'Color cannot exceed 30 characters']
  },
  mileage: {
    type: Number,
    min: [0, 'Mileage cannot be negative'],
    default: 0
  },
  fuelType: {
    type: String,
    enum: ['gasoline', 'diesel', 'electric', 'hybrid', 'other'],
    default: 'gasoline'
  },
  transmission: {
    type: String,
    enum: ['automatic', 'manual', 'cvt', 'other'],
    default: 'automatic'
  },
  engineSize: {
    type: String,
    trim: true
  },
  vehicleType: {
    type: String,
    enum: ['sedan', 'suv', 'truck', 'coupe', 'convertible', 'hatchback', 'wagon', 'van', 'motorcycle', 'other'],
    default: 'sedan'
  },
  images: [{
    url: String,
    alt: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  serviceHistory: [{
    date: {
      type: Date,
      required: true
    },
    serviceType: {
      type: String,
      required: true
    },
    description: String,
    mileage: Number,
    cost: Number,
    mechanic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String
  }],
  nextServiceDue: {
    type: Date,
    default: null
  },
  insuranceInfo: {
    provider: String,
    policyNumber: String,
    expiryDate: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries (unique indexes are already defined in schema)
vehicleSchema.index({ owner: 1, licensePlate: 1 });

// Virtual for full vehicle name
vehicleSchema.virtual('fullName').get(function() {
  return `${this.year} ${this.make} ${this.model}`;
});

// Ensure virtual fields are serialized
vehicleSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
