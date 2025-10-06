import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
import './MechanicDashboard.css';

const MechanicDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [schedule, setSchedule] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [appointmentsRes, servicesRes] = await Promise.all([
        axios.get('/bookings'),
        axios.get('/services')
      ]);
      
      setAppointments(appointmentsRes.data);
      setServices(servicesRes.data.filter(service => service.mechanic === user._id));
      
      // Generate sample schedule
      const today = new Date();
      const weekSchedule = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        weekSchedule.push({
          date: date.toISOString().split('T')[0],
          appointments: appointments.filter(apt => 
            new Date(apt.date).toDateString() === date.toDateString()
          )
        });
      }
      setSchedule(weekSchedule);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const todayAppointments = appointments.filter(apt => 
    new Date(apt.date).toDateString() === new Date().toDateString()
  );

  const pendingAppointments = appointments.filter(apt => apt.status === 'pending');
  const confirmedAppointments = appointments.filter(apt => apt.status === 'confirmed');

  const stats = {
    totalAppointments: appointments.length,
    todayAppointments: todayAppointments.length,
    pendingAppointments: pendingAppointments.length,
    completedServices: appointments.filter(apt => apt.status === 'completed').length,
    totalServices: services.length
  };

  const updateAppointmentStatus = async (appointmentId, status) => {
    try {
      await axios.put(`/bookings/${appointmentId}/status`, { status });
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Failed to update appointment status:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading mechanic dashboard..." />;
  }

  return (
    <div className="mechanic-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Mechanic Portal</h1>
          <p>Welcome back, {user?.name}. Manage your appointments and services.</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => setActiveTab('services')}>
            Manage Services
          </button>
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
          className={activeTab === 'appointments' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveTab('appointments')}
        >
          Appointments
        </button>
        <button 
          className={activeTab === 'services' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveTab('services')}
        >
          My Services
        </button>
        <button 
          className={activeTab === 'schedule' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveTab('schedule')}
        >
          Schedule
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📅</div>
                <div className="stat-info">
                  <h3>{stats.todayAppointments}</h3>
                  <p>Today's Appointments</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⏳</div>
                <div className="stat-info">
                  <h3>{stats.pendingAppointments}</h3>
                  <p>Pending Requests</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-info">
                  <h3>{stats.completedServices}</h3>
                  <p>Completed Services</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🔧</div>
                <div className="stat-info">
                  <h3>{stats.totalServices}</h3>
                  <p>Active Services</p>
                </div>
              </div>
            </div>

            <div className="overview-grid">
              <div className="overview-card">
                <h3>Today's Schedule</h3>
                <div className="appointments-list">
                  {todayAppointments.length > 0 ? (
                    todayAppointments.map(appointment => (
                      <div key={appointment._id} className="appointment-item">
                        <div className="appointment-time">
                          {appointment.time}
                        </div>
                        <div className="appointment-details">
                          <strong>{appointment.service?.serviceName}</strong>
                          <span>{appointment.owner?.name}</span>
                          <span>{appointment.vehicle?.make} {appointment.vehicle?.model}</span>
                        </div>
                        <div className="appointment-actions">
                          <button 
                            className="btn-success btn-sm"
                            onClick={() => updateAppointmentStatus(appointment._id, 'confirmed')}
                          >
                            Confirm
                          </button>
                          <button 
                            className="btn-danger btn-sm"
                            onClick={() => updateAppointmentStatus(appointment._id, 'cancelled')}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="no-data">No appointments scheduled for today</p>
                  )}
                </div>
              </div>

              <div className="overview-card">
                <h3>Pending Requests</h3>
                <div className="pending-list">
                  {pendingAppointments.length > 0 ? (
                    pendingAppointments.map(appointment => (
                      <div key={appointment._id} className="pending-item">
                        <div className="pending-date">
                          {new Date(appointment.date).toLocaleDateString()}
                        </div>
                        <div className="pending-details">
                          <strong>{appointment.service?.serviceName}</strong>
                          <span>{appointment.owner?.name}</span>
                          <span>{appointment.vehicle?.make} {appointment.vehicle?.model}</span>
                        </div>
                        <div className="pending-actions">
                          <button 
                            className="btn-success btn-sm"
                            onClick={() => updateAppointmentStatus(appointment._id, 'confirmed')}
                          >
                            Accept
                          </button>
                          <button 
                            className="btn-danger btn-sm"
                            onClick={() => updateAppointmentStatus(appointment._id, 'cancelled')}
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="no-data">No pending requests</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="appointments-tab">
            <div className="tab-header">
              <h2>All Appointments</h2>
              <div className="filter-tabs">
                <button className="filter-btn active">All</button>
                <button className="filter-btn">Today</button>
                <button className="filter-btn">Pending</button>
                <button className="filter-btn">Confirmed</button>
              </div>
            </div>
            <div className="appointments-grid">
              {appointments.length > 0 ? (
                appointments.map(appointment => (
                  <div key={appointment._id} className="appointment-card">
                    <div className="appointment-header">
                      <div className="appointment-info">
                        <h3>{appointment.service?.serviceName}</h3>
                        <p>{appointment.owner?.name}</p>
                        <p>{appointment.vehicle?.make} {appointment.vehicle?.model}</p>
                      </div>
                      <div className="appointment-status">
                        <span className={`status-badge ${appointment.status}`}>
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                    <div className="appointment-details">
                      <div className="detail-row">
                        <span className="label">Date:</span>
                        <span className="value">{new Date(appointment.date).toLocaleDateString()}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Time:</span>
                        <span className="value">{appointment.time}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Cost:</span>
                        <span className="value">${appointment.service?.cost}</span>
                      </div>
                      {appointment.notes && (
                        <div className="detail-row">
                          <span className="label">Notes:</span>
                          <span className="value">{appointment.notes}</span>
                        </div>
                      )}
                    </div>
                    <div className="appointment-actions">
                      {appointment.status === 'pending' && (
                        <>
                          <button 
                            className="btn-success"
                            onClick={() => updateAppointmentStatus(appointment._id, 'confirmed')}
                          >
                            Confirm
                          </button>
                          <button 
                            className="btn-danger"
                            onClick={() => updateAppointmentStatus(appointment._id, 'cancelled')}
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {appointment.status === 'confirmed' && (
                        <button 
                          className="btn-primary"
                          onClick={() => updateAppointmentStatus(appointment._id, 'completed')}
                        >
                          Mark Complete
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <h3>No appointments found</h3>
                  <p>Your appointments will appear here</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="services-tab">
            <div className="tab-header">
              <h2>My Services</h2>
              <button className="btn-primary">Add Service</button>
            </div>
            <div className="services-grid">
              {services.length > 0 ? (
                services.map(service => (
                  <div key={service._id} className="service-card">
                    <div className="service-header">
                      <h3>{service.serviceName}</h3>
                      <span className={`service-status ${service.available ? 'available' : 'unavailable'}`}>
                        {service.available ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                    <div className="service-details">
                      <p>{service.description}</p>
                      <div className="service-meta">
                        <span className="price">${service.cost}</span>
                        <span className="duration">{service.duration} min</span>
                      </div>
                    </div>
                    <div className="service-actions">
                      <button className="btn-secondary">Edit</button>
                      <button className="btn-danger">Delete</button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <h3>No services added yet</h3>
                  <p>Add your first service to start receiving bookings</p>
                  <button className="btn-primary">Add Service</button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="schedule-tab">
            <div className="tab-header">
              <h2>Weekly Schedule</h2>
              <div className="schedule-actions">
                <button className="btn-secondary">Previous Week</button>
                <button className="btn-secondary">Next Week</button>
              </div>
            </div>
            <div className="schedule-grid">
              {schedule.map(day => (
                <div key={day.date} className="schedule-day">
                  <div className="day-header">
                    <h4>{new Date(day.date).toLocaleDateString('en-US', { 
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric'
                    })}</h4>
                    <span className="appointment-count">
                      {day.appointments.length} appointments
                    </span>
                  </div>
                  <div className="day-appointments">
                    {day.appointments.length > 0 ? (
                      day.appointments.map(appointment => (
                        <div key={appointment._id} className="schedule-appointment">
                          <div className="appointment-time">{appointment.time}</div>
                          <div className="appointment-service">{appointment.service?.serviceName}</div>
                          <div className="appointment-customer">{appointment.owner?.name}</div>
                        </div>
                      ))
                    ) : (
                      <p className="no-appointments">No appointments</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MechanicDashboard;
