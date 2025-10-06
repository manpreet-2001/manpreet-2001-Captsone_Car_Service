import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import './LoginPage.css';

const LoginPage = () => {
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      const from = location.state?.from?.pathname || getDashboardPath();
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, location]);

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

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
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
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        const dashboardPath = getDashboardPath();
        navigate(dashboardPath, { replace: true });
      } else {
        setErrors({ general: result.error });
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const demoCredentials = [
    { role: 'Car Owner', email: 'owner@example.com', password: 'password123' },
    { role: 'Mechanic', email: 'mechanic@example.com', password: 'password123' },
    { role: 'Admin', email: 'admin@example.com', password: 'password123' }
  ];

  const handleDemoLogin = (email, password) => {
    setFormData({ email, password });
  };

  if (loading) {
    return <LoadingSpinner message="Loading..." />;
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1>Welcome Back</h1>
            <p>Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {errors.general && (
              <div className="error-message general">
                {errors.general}
              </div>
            )}

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
                  placeholder="Enter your password"
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

            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" />
                <span className="checkmark"></span>
                Remember me
              </label>
              <Link to="/forgot-password" className="forgot-link">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="login-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="demo-section">
            <h3>Demo Accounts</h3>
            <p>Try different user roles:</p>
            <div className="demo-buttons">
              {demoCredentials.map((demo, index) => (
                <button
                  key={index}
                  type="button"
                  className="demo-btn"
                  onClick={() => handleDemoLogin(demo.email, demo.password)}
                  disabled={isSubmitting}
                >
                  {demo.role}
                </button>
              ))}
            </div>
          </div>

          <div className="login-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="register-link">
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
