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

  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh data every 30 seconds
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);
    
    return () => clearInterval(interval);
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
            <button className="btn-secondary" onClick={fetchDashboardData}>
              🔄 Refresh
            </button>
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
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="users-tab">
            <div className="tab-header">
              <h2>User Management</h2>
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
                    bookings.map(booking => (
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
      </div>
    </div>
  );
};

export default AdminDashboard;

