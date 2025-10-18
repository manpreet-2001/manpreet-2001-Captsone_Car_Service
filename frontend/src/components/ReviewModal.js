import React, { useState } from 'react';
import axios from 'axios';
import './ReviewModal.css';

const ReviewModal = ({ booking, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    rating: 5,
    comment: '',
    detailedRatings: {
      quality: 5,
      timeliness: 5,
      communication: 5,
      cleanliness: 5,
      value: 5
    },
    tags: []
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const availableTags = [
    'professional',
    'friendly',
    'punctual',
    'skilled',
    'clean',
    'fair_pricing',
    'good_communication',
    'quality_work',
    'recommended',
    'will_use_again'
  ];

  const handleRatingChange = (field, value) => {
    if (field === 'overall') {
      setFormData({ ...formData, rating: value });
    } else {
      setFormData({
        ...formData,
        detailedRatings: {
          ...formData.detailedRatings,
          [field]: value
        }
      });
    }
  };

  const toggleTag = (tag) => {
    const tags = formData.tags.includes(tag)
      ? formData.tags.filter(t => t !== tag)
      : [...formData.tags, tag];
    setFormData({ ...formData, tags });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const reviewData = {
        booking: booking._id,
        rating: formData.rating,
        comment: formData.comment,
        detailedRatings: formData.detailedRatings,
        tags: formData.tags
      };

      const response = await axios.post('/api/reviews', reviewData);
      
      if (response.data.success) {
        alert('Review submitted successfully!');
        onSuccess && onSuccess(response.data.data);
        onClose();
      }
    } catch (error) {
      console.error('Failed to submit review:', error);
      setError(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (value, onChange) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            className={`star-btn ${star <= value ? 'filled' : ''}`}
            onClick={() => onChange(star)}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content review-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📝 Leave a Review</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="booking-info-summary">
          <div className="booking-summary-item">
            <strong>Service:</strong> {booking.service?.serviceName}
          </div>
          <div className="booking-summary-item">
            <strong>Mechanic:</strong> {booking.mechanic?.name}
          </div>
          <div className="booking-summary-item">
            <strong>Date:</strong> {new Date(booking.bookingDate || booking.date).toLocaleDateString()}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="review-form">
          {/* Overall Rating */}
          <div className="form-section">
            <label className="form-label">Overall Rating *</label>
            {renderStars(formData.rating, (value) => handleRatingChange('overall', value))}
            <span className="rating-text">{formData.rating} out of 5</span>
          </div>

          {/* Detailed Ratings */}
          <div className="form-section">
            <label className="form-label">Detailed Ratings</label>
            <div className="detailed-ratings">
              <div className="rating-item">
                <span className="rating-label">Quality of Work</span>
                {renderStars(formData.detailedRatings.quality, (value) => handleRatingChange('quality', value))}
              </div>
              <div className="rating-item">
                <span className="rating-label">Timeliness</span>
                {renderStars(formData.detailedRatings.timeliness, (value) => handleRatingChange('timeliness', value))}
              </div>
              <div className="rating-item">
                <span className="rating-label">Communication</span>
                {renderStars(formData.detailedRatings.communication, (value) => handleRatingChange('communication', value))}
              </div>
              <div className="rating-item">
                <span className="rating-label">Cleanliness</span>
                {renderStars(formData.detailedRatings.cleanliness, (value) => handleRatingChange('cleanliness', value))}
              </div>
              <div className="rating-item">
                <span className="rating-label">Value for Money</span>
                {renderStars(formData.detailedRatings.value, (value) => handleRatingChange('value', value))}
              </div>
            </div>
          </div>

          {/* Comment */}
          <div className="form-section">
            <label className="form-label">Your Review *</label>
            <textarea
              className="form-textarea"
              rows="5"
              placeholder="Share your experience with this service..."
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              required
            />
          </div>

          {/* Tags */}
          <div className="form-section">
            <label className="form-label">Tags (Optional)</label>
            <div className="tags-container">
              {availableTags.map(tag => (
                <button
                  key={tag}
                  type="button"
                  className={`tag-btn ${formData.tags.includes(tag) ? 'active' : ''}`}
                  onClick={() => toggleTag(tag)}
                >
                  {tag.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;

