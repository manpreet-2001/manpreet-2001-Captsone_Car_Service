const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: [true, 'Review must be linked to a booking'],
    unique: true // One review per booking
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Review must have a customer']
  },
  mechanic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Review must have a mechanic']
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: [true, 'Review must be for a service']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  comment: {
    type: String,
    maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    trim: true
  },
  // Detailed ratings
  detailedRatings: {
    quality: {
      type: Number,
      min: 1,
      max: 5
    },
    timeliness: {
      type: Number,
      min: 1,
      max: 5
    },
    communication: {
      type: Number,
      min: 1,
      max: 5
    },
    cleanliness: {
      type: Number,
      min: 1,
      max: 5
    },
    value: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  // Review categories
  tags: [{
    type: String,
    enum: [
      'professional',
      'friendly',
      'punctual',
      'skilled',
      'clean',
      'fair_pricing',
      'good_communication',
      'quality_work',
      'recommended',
      'will_use_again',
      'poor_service',
      'late',
      'overpriced',
      'unprofessional',
      'poor_quality',
      'bad_communication'
    ]
  }],
  // Response from mechanic
  mechanicResponse: {
    comment: {
      type: String,
      maxlength: [500, 'Mechanic response cannot exceed 500 characters']
    },
    respondedAt: {
      type: Date,
      default: Date.now
    }
  },
  // Verification
  isVerified: {
    type: Boolean,
    default: false
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  isReported: {
    type: Boolean,
    default: false
  },
  reportReason: {
    type: String,
    enum: ['inappropriate', 'spam', 'fake', 'harassment', 'other']
  },
  // Helpfulness tracking
  helpfulVotes: {
    helpful: {
      type: Number,
      default: 0
    },
    notHelpful: {
      type: Number,
      default: 0
    }
  },
  // Moderation
  isModerated: {
    type: Boolean,
    default: false
  },
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatedAt: Date,
  moderationNotes: String
}, {
  timestamps: true
});

// Index for efficient queries
reviewSchema.index({ mechanic: 1, rating: 1 });
reviewSchema.index({ customer: 1, createdAt: -1 });
reviewSchema.index({ service: 1, rating: 1 });
reviewSchema.index({ isPublic: 1, isVerified: 1 });

// Virtual for helpfulness score
reviewSchema.virtual('helpfulnessScore').get(function() {
  const total = this.helpfulVotes.helpful + this.helpfulVotes.notHelpful;
  if (total === 0) return 0;
  return (this.helpfulVotes.helpful / total) * 100;
});

// Virtual for detailed rating average
reviewSchema.virtual('detailedRatingAverage').get(function() {
  if (!this.detailedRatings) return this.rating;
  
  const ratings = Object.values(this.detailedRatings).filter(rating => rating != null);
  if (ratings.length === 0) return this.rating;
  
  const sum = ratings.reduce((acc, rating) => acc + rating, 0);
  return Math.round((sum / ratings.length) * 10) / 10; // Round to 1 decimal place
});

// Ensure virtual fields are serialized
reviewSchema.set('toJSON', { virtuals: true });

// Pre-save middleware to update user and service ratings
reviewSchema.post('save', async function() {
  try {
    // Update mechanic's average rating
    const mechanic = await mongoose.model('User').findById(this.mechanic);
    if (mechanic) {
      const reviews = await mongoose.model('Review').find({ 
        mechanic: this.mechanic, 
        isPublic: true 
      });
      
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
      
      await mongoose.model('User').findByIdAndUpdate(this.mechanic, {
        'rating.average': Math.round(averageRating * 10) / 10,
        'rating.count': reviews.length
      });
    }
    
    // Update service's average rating
    const service = await mongoose.model('Service').findById(this.service);
    if (service) {
      const serviceReviews = await mongoose.model('Review').find({ 
        service: this.service, 
        isPublic: true 
      });
      
      const totalServiceRating = serviceReviews.reduce((sum, review) => sum + review.rating, 0);
      const averageServiceRating = serviceReviews.length > 0 ? totalServiceRating / serviceReviews.length : 0;
      
      await mongoose.model('Service').findByIdAndUpdate(this.service, {
        'rating.average': Math.round(averageServiceRating * 10) / 10,
        'rating.count': serviceReviews.length
      });
    }
  } catch (error) {
    console.error('Error updating ratings:', error);
  }
});

module.exports = mongoose.model('Review', reviewSchema);
