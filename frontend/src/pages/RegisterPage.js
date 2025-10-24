import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import './RegisterPage.css';

const RegisterPage = () => {
  const { register, user, loading } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'owner',
    address: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [spamCheck, setSpamCheck] = useState('');
  const [startTime, setStartTime] = useState(null);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      const dashboardPath = getDashboardPath();
      navigate(dashboardPath, { replace: true });
    }
  }, [user, loading, navigate]);

  const getDashboardPath = () => {
    if (!user) return '/dashboard';
    switch (user.role) {
      case 'admin':
        return '/admin-dashboard';
      case 'mechanic':
        return '/mechanic-dashboard';
      default:
        return '/dashboard';
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Phone validation
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    // Terms agreement validation
    if (!agreeToTerms) {
      newErrors.terms = 'You must agree to the terms and conditions';
    }

    // Spam prevention checks
    if (!spamCheck) {
      newErrors.spamCheck = 'Please complete the spam check';
    } else if (spamCheck !== 'car') {
      newErrors.spamCheck = 'Incorrect answer';
    }

    // Check if form was filled too quickly (less than 10 seconds)
    if (startTime && Date.now() - startTime < 10000) {
      newErrors.general = 'Please take your time filling out the form';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Set start time when user first starts typing
    if (!startTime) {
      setStartTime(Date.now());
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      const registrationData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone,
        role: formData.role,
        address: formData.address.trim()
      };

      const result = await register(registrationData);
      
      if (result.success) {
        const dashboardPath = getDashboardPath();
        navigate(dashboardPath, { replace: true });
      } else {
        setErrors({ general: result.error });
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleOptions = [
    { value: 'owner', label: 'Car Owner', description: 'Book and manage vehicle services' },
    { value: 'mechanic', label: 'Mechanic', description: 'Provide automotive services' }
  ];

  if (loading) {
    return <LoadingSpinner message="Loading..." />;
  }

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-card">
          <div className="register-header">
            <h1>Create Account</h1>
            <p>Join our car service platform and get started today</p>
          </div>

          <form onSubmit={handleSubmit} className="register-form">
            {errors.general && (
              <div className="error-message general">
                {errors.general}
              </div>
            )}

            {/* Name Field */}
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={errors.name ? 'error' : ''}
                placeholder="Enter your full name"
                disabled={isSubmitting}
              />
              {errors.name && (
                <span className="error-message">{errors.name}</span>
              )}
            </div>

            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? 'error' : ''}
                placeholder="Enter your email"
                disabled={isSubmitting}
              />
              {errors.email && (
                <span className="error-message">{errors.email}</span>
              )}
            </div>

            {/* Phone Field */}
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={errors.phone ? 'error' : ''}
                placeholder="Enter your phone number"
                disabled={isSubmitting}
              />
              {errors.phone && (
                <span className="error-message">{errors.phone}</span>
              )}
            </div>

            {/* Address Field */}
            <div className="form-group">
              <label htmlFor="address">Address</label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className={errors.address ? 'error' : ''}
                placeholder="Enter your address"
                rows="3"
                disabled={isSubmitting}
              />
              {errors.address && (
                <span className="error-message">{errors.address}</span>
              )}
            </div>

            {/* Role Selection */}
            <div className="form-group">
              <label>Account Type</label>
              <div className="role-selection">
                {roleOptions.map((option) => (
                  <label key={option.value} className="role-option">
                    <input
                      type="radio"
                      name="role"
                      value={option.value}
                      checked={formData.role === option.value}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                    />
                    <div className="role-content">
                      <span className="role-label">{option.label}</span>
                      <span className="role-description">{option.description}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={errors.password ? 'error' : ''}
                  placeholder="Create a strong password"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.password && (
                <span className="error-message">{errors.password}</span>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="password-input">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={errors.confirmPassword ? 'error' : ''}
                  placeholder="Confirm your password"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isSubmitting}
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="error-message">{errors.confirmPassword}</span>
              )}
            </div>

            {/* Spam Check */}
            <div className="form-group">
              <label htmlFor="spamCheck">Spam Check: What do you drive? *</label>
              <input
                type="text"
                id="spamCheck"
                name="spamCheck"
                value={spamCheck}
                onChange={(e) => setSpamCheck(e.target.value)}
                className={errors.spamCheck ? 'error' : ''}
                placeholder="Answer: car"
                disabled={isSubmitting}
              />
              {errors.spamCheck && (
                <span className="error-message">{errors.spamCheck}</span>
              )}
            </div>

            {/* Terms Agreement */}
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  disabled={isSubmitting}
                />
                <span className="checkmark"></span>
                I agree to the{' '}
                <Link to="/terms" className="terms-link">Terms of Service</Link>
                {' '}and{' '}
                <Link to="/privacy" className="terms-link">Privacy Policy</Link>
              </label>
              {errors.terms && (
                <span className="error-message">{errors.terms}</span>
              )}
            </div>

            <button
              type="submit"
              className="register-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="register-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="login-link">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

