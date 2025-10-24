import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [services, setServices] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddService, setShowAddService] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editingService, setEditingService] = useState(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'owner',
    phone: '',
    address: ''
  });
  const [newService, setNewService] = useState({
    serviceName: '',
    description: '',
    category: 'maintenance',
    baseCost: '',
    estimatedDuration: '',
    isAvailable: true
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [usersRes, bookingsRes, vehiclesRes, servicesRes] = await Promise.allSettled([
        axios.get('/api/users'),
        axios.get('/api/bookings?limit=100'),
        axios.get('/api/vehicles?limit=100'),
        axios.get('/api/services?limit=100')
      ]);
      
      if (usersRes.status === 'fulfilled') {
        setUsers(usersRes.value.data?.data || usersRes.value.data || []);
      }
      
      if (bookingsRes.status === 'fulfilled') {
        const bookingsData = bookingsRes.value.data?.data || bookingsRes.value.data || [];
        setBookings(bookingsData);
        calculateAnalytics(bookingsData);
      }
      
      if (vehiclesRes.status === 'fulfilled') {
        setVehicles(vehiclesRes.value.data?.data || vehiclesRes.value.data || []);
      }
      
      if (servicesRes.status === 'fulfilled') {
        setServices(servicesRes.value.data?.data || servicesRes.value.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (bookingsData) => {
    const totalRevenue = bookingsData
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + (b.estimatedCost || b.actualCost || 0), 0);
    
    const pendingRevenue = bookingsData
      .filter(b => b.status === 'pending' || b.status === 'confirmed')
      .reduce((sum, b) => sum + (b.estimatedCost || 0), 0);

    setAnalytics({
      totalRevenue,
      pendingRevenue,
      completedBookings: bookingsData.filter(b => b.status === 'completed').length,
      pendingBookings: bookingsData.filter(b => b.status === 'pending' || b.status === 'rescheduled').length,
      confirmedBookings: bookingsData.filter(b => b.status === 'confirmed').length,
      cancelledBookings: bookingsData.filter(b => b.status === 'cancelled').length
    });
  };

  const handleUpdateUserStatus = async (userId, status) => {
    try {
      await axios.put(`/api/users/${userId}`, { status });
      fetchDashboardData();
      alert(`User status updated to ${status}`);
    } catch (error) {
      console.error('Failed to update user status:', error);
      alert('Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`/api/users/${userId}`);
        fetchDashboardData();
        alert('User deleted successfully');
      } catch (error) {
        console.error('Failed to delete user:', error);
        alert('Failed to delete user');
      }
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/users', newUser);
      setShowAddUser(false);
      setNewUser({ name: '', email: '', password: '', role: 'owner', phone: '', address: '' });
      fetchDashboardData();
      alert('User created successfully');
    } catch (error) {
      console.error('Failed to create user:', error);
      alert('Failed to create user: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/services/admin', newService);
      setShowAddService(false);
      setNewService({ serviceName: '', description: '', category: 'maintenance', baseCost: '', estimatedDuration: '', isAvailable: true });
      fetchDashboardData();
      alert('Service created successfully');
    } catch (error) {
      console.error('Failed to create service:', error);
      alert('Failed to create service: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setNewUser({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      phone: user.phone || '',
      address: user.address || ''
    });
    setShowAddUser(true);
  };

  const handleEditService = (service) => {
    setEditingService(service);
    setNewService({
      serviceName: service.serviceName,
      description: service.description,
      category: service.category,
      baseCost: service.baseCost,
      estimatedDuration: service.estimatedDuration,
      isAvailable: service.isAvailable
    });
    setShowAddService(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const updateData = { ...newUser };
      if (!updateData.password) {
        delete updateData.password; // Don't update password if empty
      }
      await axios.put(`/api/users/${editingUser._id}`, updateData);
      setShowAddUser(false);
      setEditingUser(null);
      setNewUser({ name: '', email: '', password: '', role: 'owner', phone: '', address: '' });
      fetchDashboardData();
      alert('User updated successfully');
    } catch (error) {
      console.error('Failed to update user:', error);
      alert('Failed to update user: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleUpdateService = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/services/${editingService._id}`, newService);
      setShowAddService(false);
      setEditingService(null);
      setNewService({ serviceName: '', description: '', category: 'maintenance', baseCost: '', estimatedDuration: '', isAvailable: true });
      fetchDashboardData();
      alert('Service updated successfully');
    } catch (error) {
      console.error('Failed to update service:', error);
      alert('Failed to update service: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await axios.delete(`/api/services/${serviceId}`);
        fetchDashboardData();
        alert('Service deleted successfully');
      } catch (error) {
        console.error('Failed to delete service:', error);
        alert('Failed to delete service');
      }
    }
  };

  const recentBookings = Array.isArray(bookings) ? bookings
    .sort((a, b) => {
      const dateA = new Date(a.bookingDate || a.createdAt);
      const dateB = new Date(b.bookingDate || b.createdAt);
      return dateB - dateA; // Latest first
    })
    .slice(0, 5) : [];

  const stats = {
    totalUsers: Array.isArray(users) ? users.length : 0,
    carOwners: Array.isArray(users) ? users.filter(u => u.role === 'owner').length : 0,
    mechanics: Array.isArray(users) ? users.filter(u => u.role === 'mechanic').length : 0,
    totalBookings: Array.isArray(bookings) ? bookings.length : 0,
    totalVehicles: Array.isArray(vehicles) ? vehicles.length : 0,
    totalServices: Array.isArray(services) ? services.length : 0
  };

  if (loading && users.length === 0) {
    return <LoadingSpinner message="Loading admin dashboard..." />;
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-text">
            <h1>Admin Dashboard</h1>
            <p>Welcome back, {user?.name}. Monitor and manage the entire platform.</p>
          </div>
          <div className="header-actions">
            {/* Removed auto-refresh button to prevent form resets */}
          </div>
        </div>
      </div>

      <div className="dashboard-nav">
        <button 
          className={activeTab === 'overview' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={activeTab === 'users' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button 
          className={activeTab === 'services' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveTab('services')}
        >
          Services
        </button>
        <button 
          className={activeTab === 'bookings' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveTab('bookings')}
        >
          All Bookings
        </button>
        <button 
          className={activeTab === 'analytics' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-info">
                  <h3>{stats.totalUsers}</h3>
                  <p>Total Users</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🚗</div>
                <div className="stat-info">
                  <h3>{stats.carOwners}</h3>
                  <p>Car Owners</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🔧</div>
                <div className="stat-info">
                  <h3>{stats.mechanics}</h3>
                  <p>Mechanics</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📅</div>
                <div className="stat-info">
                  <h3>{stats.totalBookings}</h3>
                  <p>Total Bookings</p>
                </div>
              </div>
            </div>

            <div className="overview-grid">
              <div className="overview-card">
                <h3>💰 Revenue Overview</h3>
                <div className="revenue-stats">
                  <div className="revenue-item">
                    <span className="revenue-label">Completed</span>
                    <span className="revenue-amount">${analytics.totalRevenue || 0}</span>
                  </div>
                  <div className="revenue-item">
                    <span className="revenue-label">Pending</span>
                    <span className="revenue-amount pending">${analytics.pendingRevenue || 0}</span>
                  </div>
                  <div className="revenue-item total">
                    <span className="revenue-label">Total Potential</span>
                    <span className="revenue-amount">${(analytics.totalRevenue || 0) + (analytics.pendingRevenue || 0)}</span>
                  </div>
                </div>
              </div>

              <div className="overview-card">
                <h3>📊 Booking Status</h3>
                <div className="status-stats">
                  <div className="status-item">
                    <span className="status-label">Pending</span>
                    <div className="status-bar">
                      <div className="status-fill pending" style={{width: `${(analytics.pendingBookings / stats.totalBookings) * 100}%`}}></div>
                      <span className="status-count">{analytics.pendingBookings || 0}</span>
                    </div>
                  </div>
                  <div className="status-item">
                    <span className="status-label">Confirmed</span>
                    <div className="status-bar">
                      <div className="status-fill confirmed" style={{width: `${(analytics.confirmedBookings / stats.totalBookings) * 100}%`}}></div>
                      <span className="status-count">{analytics.confirmedBookings || 0}</span>
                    </div>
                  </div>
                  <div className="status-item">
                    <span className="status-label">Completed</span>
                    <div className="status-bar">
                      <div className="status-fill completed" style={{width: `${(analytics.completedBookings / stats.totalBookings) * 100}%`}}></div>
                      <span className="status-count">{analytics.completedBookings || 0}</span>
                    </div>
                  </div>
                  <div className="status-item">
                    <span className="status-label">Cancelled</span>
                    <div className="status-bar">
                      <div className="status-fill cancelled" style={{width: `${(analytics.cancelledBookings / stats.totalBookings) * 100}%`}}></div>
                      <span className="status-count">{analytics.cancelledBookings || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="overview-card">
                <h3>📋 Recent Bookings</h3>
                <div className="recent-bookings">
                  {recentBookings.length > 0 ? (
                    recentBookings.map(booking => (
                      <div key={booking._id} className="recent-booking-item">
                        <div className="booking-info">
                          <strong>{booking.service?.serviceName || 'N/A'}</strong>
                          <span>{booking.owner?.name || 'N/A'}</span>
                        </div>
                        <div className="booking-meta">
                          <span className={`status-badge ${booking.status}`}>
                            {booking.status}
                          </span>
                          <span className="booking-date">
                            {booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="no-data">No recent bookings</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="users-tab">
            <div className="tab-header">
              <h2>User Management</h2>
              <button className="btn-primary" onClick={() => {
                setShowAddUser(true);
                setEditingUser(null);
                setNewUser({ name: '', email: '', password: '', role: 'owner', phone: '', address: '' });
              }}>
                Add User
              </button>
            </div>
            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(users) && users.length > 0 ? (
                    users.map(userItem => (
                      <tr key={userItem._id}>
                        <td>{userItem.name}</td>
                        <td>{userItem.email}</td>
                        <td>
                          <span className={`role-badge ${userItem.role}`}>
                            {userItem.role}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${userItem.status}`}>
                            {userItem.status}
                          </span>
                        </td>
                        <td>{new Date(userItem.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div className="action-buttons">
                            {userItem.status === 'active' ? (
                              <button 
                                className="btn-sm btn-warning"
                                onClick={() => handleUpdateUserStatus(userItem._id, 'suspended')}
                              >
                                Suspend
                              </button>
                            ) : (
                              <button 
                                className="btn-sm btn-success"
                                onClick={() => handleUpdateUserStatus(userItem._id, 'active')}
                              >
                                Activate
                              </button>
                            )}
                            <button 
                              className="btn-sm btn-secondary"
                              onClick={() => handleEditUser(userItem)}
                            >
                              Edit
                            </button>
                            <button 
                              className="btn-sm btn-danger"
                              onClick={() => handleDeleteUser(userItem._id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="no-data">No users found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="bookings-tab">
            <div className="tab-header">
              <h2>All Bookings</h2>
            </div>
            <div className="bookings-table-container">
              <table className="bookings-table">
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Customer</th>
                    <th>Mechanic</th>
                    <th>Vehicle</th>
                    <th>Date & Time</th>
                    <th>Cost</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(bookings) && bookings.length > 0 ? (
                    bookings
                      .sort((a, b) => {
                        const dateA = new Date(a.bookingDate || a.createdAt);
                        const dateB = new Date(b.bookingDate || b.createdAt);
                        return dateB - dateA; // Latest first
                      })
                      .map(booking => (
                      <tr key={booking._id}>
                        <td>{booking.service?.serviceName || 'N/A'}</td>
                        <td>{booking.owner?.name || 'N/A'}</td>
                        <td>{booking.mechanic?.name || 'N/A'}</td>
                        <td>{booking.vehicle?.make} {booking.vehicle?.model}</td>
                        <td>
                          {booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString() : 'N/A'}
                          <br />
                          <small>{booking.bookingTime || 'N/A'}</small>
                        </td>
                        <td>${booking.estimatedCost || booking.actualCost || 'N/A'}</td>
                        <td>
                          <span className={`status-badge ${booking.status}`}>
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="no-data">No bookings found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="analytics-tab">
            <div className="tab-header">
              <h2>Analytics & Reports</h2>
            </div>

            <div className="analytics-grid">
              <div className="analytics-card">
                <h3>💰 Revenue Statistics</h3>
                <div className="analytics-content">
                  <div className="analytics-row">
                    <span className="analytics-label">Total Revenue (Completed)</span>
                    <span className="analytics-value success">${analytics.totalRevenue || 0}</span>
                  </div>
                  <div className="analytics-row">
                    <span className="analytics-label">Pending Revenue</span>
                    <span className="analytics-value warning">${analytics.pendingRevenue || 0}</span>
                  </div>
                  <div className="analytics-row highlight">
                    <span className="analytics-label">Total Potential Revenue</span>
                    <span className="analytics-value">${(analytics.totalRevenue || 0) + (analytics.pendingRevenue || 0)}</span>
                  </div>
                  <div className="analytics-row">
                    <span className="analytics-label">Average Booking Value</span>
                    <span className="analytics-value">
                      ${stats.totalBookings > 0 ? Math.round((analytics.totalRevenue || 0) / analytics.completedBookings || 0) : 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="analytics-card">
                <h3>📊 Booking Statistics</h3>
                <div className="analytics-content">
                  <div className="analytics-row">
                    <span className="analytics-label">Total Bookings</span>
                    <span className="analytics-value">{stats.totalBookings}</span>
                  </div>
                  <div className="analytics-row">
                    <span className="analytics-label">Completed</span>
                    <span className="analytics-value success">{analytics.completedBookings || 0}</span>
                  </div>
                  <div className="analytics-row">
                    <span className="analytics-label">Confirmed</span>
                    <span className="analytics-value info">{analytics.confirmedBookings || 0}</span>
                  </div>
                  <div className="analytics-row">
                    <span className="analytics-label">Pending</span>
                    <span className="analytics-value warning">{analytics.pendingBookings || 0}</span>
                  </div>
                  <div className="analytics-row">
                    <span className="analytics-label">Cancelled</span>
                    <span className="analytics-value danger">{analytics.cancelledBookings || 0}</span>
                  </div>
                  <div className="analytics-row highlight">
                    <span className="analytics-label">Completion Rate</span>
                    <span className="analytics-value">
                      {stats.totalBookings > 0 ? Math.round((analytics.completedBookings / stats.totalBookings) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="analytics-card">
                <h3>🚗 Platform Statistics</h3>
                <div className="analytics-content">
                  <div className="analytics-row">
                    <span className="analytics-label">Total Users</span>
                    <span className="analytics-value">{stats.totalUsers}</span>
                  </div>
                  <div className="analytics-row">
                    <span className="analytics-label">Car Owners</span>
                    <span className="analytics-value">{stats.carOwners}</span>
                  </div>
                  <div className="analytics-row">
                    <span className="analytics-label">Mechanics</span>
                    <span className="analytics-value">{stats.mechanics}</span>
                  </div>
                  <div className="analytics-row">
                    <span className="analytics-label">Registered Vehicles</span>
                    <span className="analytics-value">{stats.totalVehicles}</span>
                  </div>
                  <div className="analytics-row">
                    <span className="analytics-label">Available Services</span>
                    <span className="analytics-value">{stats.totalServices}</span>
                  </div>
                  <div className="analytics-row highlight">
                    <span className="analytics-label">Avg Vehicles per Owner</span>
                    <span className="analytics-value">
                      {stats.carOwners > 0 ? (stats.totalVehicles / stats.carOwners).toFixed(1) : 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="services-tab">
            <div className="tab-header">
              <h2>Service Management</h2>
              <button className="btn-primary" onClick={() => {
                setShowAddService(true);
                setEditingService(null);
                setNewService({ serviceName: '', description: '', category: 'maintenance', baseCost: '', estimatedDuration: '', isAvailable: true });
              }}>
                Add Service
              </button>
            </div>
            <div className="services-grid">
              {Array.isArray(services) && services.length > 0 ? (
                services.map(service => (
                  <div key={service._id} className="service-card">
                    <div className="service-header">
                      <h3>{service.serviceName}</h3>
                      <span className={`service-status ${service.isAvailable ? 'available' : 'unavailable'}`}>
                        {service.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                    <div className="service-details">
                      <p>{service.description}</p>
                      <div className="service-meta">
                        <span className="price">${service.baseCost}</span>
                        <span className="duration">{service.estimatedDuration} min</span>
                        <span className="category">{service.category}</span>
                      </div>
                    </div>
                    <div className="service-actions">
                      <button 
                        className="btn-secondary"
                        onClick={() => handleEditService(service)}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn-danger"
                        onClick={() => handleDeleteService(service._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <h3>No services found</h3>
                  <p>Add your first service to get started</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit User Modal */}
      {showAddUser && (
        <div className="modal-overlay" onClick={() => setShowAddUser(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingUser ? 'Edit User' : 'Add New User'}</h3>
              <button className="close-btn" onClick={() => setShowAddUser(false)}>×</button>
            </div>
            <form onSubmit={editingUser ? handleUpdateUser : handleAddUser}>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  className="form-input"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password {editingUser ? '(leave empty to keep current)' : '*'}</label>
                <input
                  type="password"
                  className="form-input"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  required={!editingUser}
                />
              </div>
              <div className="form-group">
                <label>Role *</label>
                <select
                  className="form-select"
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  required
                >
                  <option value="owner">Car Owner</option>
                  <option value="mechanic">Mechanic</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  className="form-input"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  value={newUser.address}
                  onChange={(e) => setNewUser({...newUser, address: e.target.value})}
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAddUser(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Service Modal */}
      {showAddService && (
        <div className="modal-overlay" onClick={() => setShowAddService(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingService ? 'Edit Service' : 'Add New Service'}</h3>
              <button className="close-btn" onClick={() => setShowAddService(false)}>×</button>
            </div>
            <form onSubmit={editingService ? handleUpdateService : handleAddService}>
              <div className="form-group">
                <label>Service Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={newService.serviceName}
                  onChange={(e) => setNewService({...newService, serviceName: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  value={newService.description}
                  onChange={(e) => setNewService({...newService, description: e.target.value})}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    className="form-select"
                    value={newService.category}
                    onChange={(e) => setNewService({...newService, category: e.target.value})}
                    required
                  >
                    <option value="maintenance">Maintenance</option>
                    <option value="repair">Repair</option>
                    <option value="inspection">Inspection</option>
                    <option value="diagnostic">Diagnostic</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Base Cost ($) *</label>
                  <input
                    type="number"
                    className="form-input"
                    min="0"
                    step="0.01"
                    value={newService.baseCost}
                    onChange={(e) => setNewService({...newService, baseCost: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Estimated Duration (minutes) *</label>
                <input
                  type="number"
                  className="form-input"
                  min="15"
                  max="480"
                  value={newService.estimatedDuration}
                  onChange={(e) => setNewService({...newService, estimatedDuration: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={newService.isAvailable}
                    onChange={(e) => setNewService({...newService, isAvailable: e.target.checked})}
                  />
                  <span className="checkmark"></span>
                  Service is available for booking
                </label>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAddService(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingService ? 'Update Service' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;



