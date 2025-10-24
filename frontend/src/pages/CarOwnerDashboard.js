import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
import ReviewModal from '../components/ReviewModal';
import './CarOwnerDashboard.css';

const CarOwnerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [mechanics, setMechanics] = useState([]);

  // Form states
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [showEditVehicle, setShowEditVehicle] = useState(null);
  const [bookingFilter, setBookingFilter] = useState('all');
  const [historyFilter, setHistoryFilter] = useState('');
  const [rescheduleBookingId, setRescheduleBookingId] = useState(null); // Track booking being rescheduled
  const [reviewBooking, setReviewBooking] = useState(null); // Track booking being reviewed
  const [selectedBooking, setSelectedBooking] = useState(null); // Track booking being viewed
  const [newBooking, setNewBooking] = useState({
    vehicle: '',
    service: '',
    mechanic: '',
    date: '',
    time: '',
    notes: ''
  });
  const [newVehicle, setNewVehicle] = useState({
    make: '',
    model: '',
    year: '',
    licensePlate: '',
    color: '',
    vin: ''
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Try to fetch data from API endpoints
      const [vehiclesRes, bookingsRes, servicesRes, mechanicsRes] = await Promise.allSettled([
        axios.get('/api/vehicles'),
        axios.get('/api/bookings'),
        axios.get('/api/services?limit=100'),
        axios.get('/api/users/mechanics')
      ]);
      
      // Handle vehicles data
      if (vehiclesRes.status === 'fulfilled') {
        const vehiclesData = vehiclesRes.value.data;
        console.log('Vehicles API response:', vehiclesData);
        const vehiclesArray = Array.isArray(vehiclesData) ? vehiclesData : vehiclesData?.data || [];
        console.log('Vehicles array:', vehiclesArray);
        console.log('First vehicle:', vehiclesArray[0]);
        setVehicles(vehiclesArray);
        console.log('Vehicles set:', vehiclesArray.length, 'vehicles');
      } else {
        console.warn('Failed to fetch vehicles:', vehiclesRes.reason);
        console.error('Vehicles error details:', vehiclesRes.reason?.response?.data);
        console.error('Vehicles error status:', vehiclesRes.reason?.response?.status);
        console.error('Vehicles error message:', vehiclesRes.reason?.message);
        // Set empty array if API fails (user might not have any vehicles yet)
        setVehicles([]);
      }
      
      // Handle bookings data
      if (bookingsRes.status === 'fulfilled') {
        const bookingsData = bookingsRes.value.data;
        console.log('Bookings API response:', bookingsData);
        setBookings(Array.isArray(bookingsData) ? bookingsData : bookingsData?.data || []);
      } else {
        console.warn('Failed to fetch bookings:', bookingsRes.reason);
        // Set empty array - user will create bookings
        setBookings([]);
        /* Removed mock bookings - let users create real ones
        setBookings([
          {
            _id: '1',
            vehicle: { _id: '1', make: 'Toyota', model: 'Camry' },
            service: { _id: '1', serviceName: 'Oil Change Service', cost: 45 },
            mechanic: { _id: 'm1', name: 'John Smith' },
            date: new Date('2024-01-15'),
            time: '10:00',
            status: 'confirmed',
            notes: 'Regular oil change service',
            createdAt: new Date('2024-01-10')
          },
          {
            _id: '2',
            vehicle: { _id: '2', make: 'Honda', model: 'Civic' },
            service: { _id: '2', serviceName: 'Brake Inspection & Service', cost: 120 },
            mechanic: { _id: 'm2', name: 'Sarah Johnson' },
            date: new Date('2024-01-20'),
            time: '14:00',
            status: 'pending',
            notes: 'Brake system inspection and service',
            createdAt: new Date('2024-01-12')
          },
          {
            _id: '3',
            vehicle: { _id: '1', make: 'Toyota', model: 'Camry' },
            service: { _id: '3', serviceName: 'Engine Diagnostic', cost: 85 },
            mechanic: { _id: 'm3', name: 'Mike Wilson' },
            date: new Date('2023-12-10'),
            time: '09:00',
            status: 'completed',
            notes: 'Engine diagnostic and performance analysis',
            createdAt: new Date('2023-12-05')
          },
          {
            _id: '4',
            vehicle: { _id: '2', make: 'Honda', model: 'Civic' },
            service: { _id: '1', serviceName: 'Oil Change Service', cost: 45 },
            mechanic: { _id: 'm1', name: 'John Smith' },
            date: new Date('2023-11-15'),
            time: '11:00',
            status: 'completed',
            notes: 'Oil change and filter replacement',
            createdAt: new Date('2023-11-10')
          }
        */
        // End of removed mock bookings
      }
      
      // Handle services data
      if (servicesRes.status === 'fulfilled') {
        const servicesData = servicesRes.value.data;
        console.log('Services API response:', servicesData);
        const allServices = Array.isArray(servicesData) ? servicesData : servicesData?.data || [];
        console.log('Total services available:', allServices.length);
        setServices(allServices);
      } else {
        console.warn('Failed to fetch services:', servicesRes.reason);
        // Set mock data for services if API fails
        setServices([
          {
            _id: '1',
            serviceName: 'Oil Change Service',
            description: 'Engine oil change with premium filter replacement and fluid level check',
            baseCost: 45,
            estimatedDuration: 30,
            cost: 45,
            duration: 30
          },
          {
            _id: '2',
            serviceName: 'Brake Inspection & Service',
            description: 'Complete brake system inspection, pad replacement, and rotor resurfacing',
            baseCost: 120,
            estimatedDuration: 90,
            cost: 120,
            duration: 90
          },
          {
            _id: '3',
            serviceName: 'Engine Diagnostic',
            description: 'Computer diagnostic scan, engine performance analysis, and error code reading',
            baseCost: 85,
            estimatedDuration: 60,
            cost: 85,
            duration: 60
          },
          {
            _id: '4',
            serviceName: 'Transmission Service',
            description: 'Transmission fluid change, filter replacement, and system inspection',
            baseCost: 150,
            estimatedDuration: 120,
            cost: 150,
            duration: 120
          },
          {
            _id: '5',
            serviceName: 'AC System Service',
            description: 'Air conditioning system check, refrigerant recharge, and filter cleaning',
            baseCost: 95,
            estimatedDuration: 75,
            cost: 95,
            duration: 75
          },
          {
            _id: '6',
            serviceName: 'Tire Rotation & Balance',
            description: 'Tire rotation, wheel balancing, and alignment check',
            baseCost: 65,
            estimatedDuration: 45,
            cost: 65,
            duration: 45
          },
          {
            _id: '7',
            serviceName: 'Battery Service',
            description: 'Battery testing, terminal cleaning, and replacement if needed',
            baseCost: 75,
            estimatedDuration: 30,
            cost: 75,
            duration: 30
          },
          {
            _id: '8',
            serviceName: 'Spark Plug Replacement',
            description: 'Spark plug replacement, ignition system check, and performance tuning',
            baseCost: 110,
            estimatedDuration: 60,
            cost: 110,
            duration: 60
          },
          {
            _id: '9',
            serviceName: 'Timing Belt Service',
            description: 'Timing belt replacement, water pump service, and tensioner check',
            baseCost: 350,
            estimatedDuration: 180,
            cost: 350,
            duration: 180
          },
          {
            _id: '10',
            serviceName: 'Suspension Service',
            description: 'Shock absorber inspection, strut replacement, and suspension alignment',
            baseCost: 200,
            estimatedDuration: 120,
            cost: 200,
            duration: 120
          },
          {
            _id: '11',
            serviceName: 'Exhaust System Repair',
            description: 'Exhaust pipe inspection, muffler replacement, and emission system check',
            baseCost: 180,
            estimatedDuration: 90,
            cost: 180,
            duration: 90
          },
          {
            _id: '12',
            serviceName: 'Full Vehicle Inspection',
            description: 'Comprehensive 50-point safety inspection and maintenance report',
            baseCost: 125,
            estimatedDuration: 90,
            cost: 125,
            duration: 90
          }
        ]);
      }

      // Handle mechanics data
      if (mechanicsRes.status === 'fulfilled') {
        const mechanicsData = mechanicsRes.value.data;
        console.log('Mechanics API response:', mechanicsData);
        const allMechanics = Array.isArray(mechanicsData) ? mechanicsData : mechanicsData?.data || [];
        console.log('Total mechanics available:', allMechanics.length);
        setMechanics(allMechanics);
      } else {
        console.warn('Failed to fetch mechanics:', mechanicsRes.reason);
        setMechanics([]);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Set empty arrays on error to prevent filter errors
      setVehicles([]);
      setBookings([]);
      setServices([]);
      setMechanics([]);
    } finally {
      setLoading(false);
    }
  };

  // Safe array operations with fallbacks
  const upcomingBookings = Array.isArray(bookings) ? bookings.filter(booking => {
    if (!booking) return false;
    const bookingDate = booking.bookingDate || booking.date;
    if (!bookingDate) return false;
    return new Date(bookingDate) > new Date() && 
           booking.status !== 'completed' && 
           booking.status !== 'cancelled';
  }) : [];

  const recentBookings = Array.isArray(bookings) ? bookings
    .sort((a, b) => {
      const dateA = new Date(a.bookingDate || a.date || a.createdAt);
      const dateB = new Date(b.bookingDate || b.date || b.createdAt);
      return dateB - dateA; // Latest first
    })
    .slice(0, 5) : [];

  const stats = {
    totalVehicles: Array.isArray(vehicles) ? vehicles.length : 0,
    totalBookings: Array.isArray(bookings) ? bookings.length : 0,
    upcomingBookings: upcomingBookings.length,
    completedServices: Array.isArray(bookings) ? bookings.filter(b => b && b.status === 'completed').length : 0
  };

  // Handler functions
  const handleAddVehicle = async (e) => {
    e.preventDefault();
    try {
      console.log('Adding vehicle:', newVehicle);
      console.log('API URL:', axios.defaults.baseURL + '/api/vehicles');
      
      const response = await axios.post('/api/vehicles', newVehicle);
      console.log('Add vehicle response:', response.data);
      
      if (response.data.success) {
        setVehicles([...vehicles, response.data.data]);
        setNewVehicle({ make: '', model: '', year: '', licensePlate: '', color: '', vin: '' });
        setShowAddVehicle(false);
        alert('Vehicle added successfully!');
      }
    } catch (error) {
      console.error('Failed to add vehicle:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      
      // If there are validation errors, show them
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const validationErrors = error.response.data.errors.map(err => err.msg).join(', ');
        errorMessage = 'Validation errors: ' + validationErrors;
      }
      
      alert('Failed to add vehicle: ' + errorMessage);
    }
  };

  const handleEditVehicle = (vehicleId) => {
    const vehicle = vehicles.find(v => v._id === vehicleId);
    if (vehicle) {
      setNewVehicle(vehicle);
      setShowEditVehicle(vehicleId);
      setShowAddVehicle(true);
    }
  };

  const handleUpdateVehicle = (e) => {
    e.preventDefault();
    setVehicles(vehicles.map(v => 
      v._id === showEditVehicle ? { ...v, ...newVehicle } : v
    ));
    setNewVehicle({ make: '', model: '', year: '', licensePlate: '', color: '', vin: '' });
    setShowEditVehicle(null);
    setShowAddVehicle(false);
    alert('Vehicle updated successfully!');
  };

  const handleDeleteVehicle = (vehicleId) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      setVehicles(vehicles.filter(v => v._id !== vehicleId));
      alert('Vehicle deleted successfully!');
    }
  };

  const handleBookService = async (e) => {
    e.preventDefault();
    if (!newBooking.vehicle || !newBooking.service || !newBooking.date || !newBooking.time) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You must be logged in to book a service. Please log in first.');
        return;
      }

      // Check if this is a reschedule or new booking
      if (rescheduleBookingId) {
        // This is a reschedule - update existing booking
        // Convert date to ISO format for backend validation
        const rescheduleDate = new Date(newBooking.date + 'T' + newBooking.time + ':00');
        
        const rescheduleData = {
          newDate: rescheduleDate.toISOString(),
          newTime: newBooking.time,
          reason: 'Rescheduled by customer'
        };

        console.log('Rescheduling booking:', rescheduleBookingId, rescheduleData);
        const response = await axios.put(`/api/bookings/${rescheduleBookingId}/reschedule`, rescheduleData);
        console.log('Reschedule response:', response.data);
        
        if (response.data.success) {
          // Update the booking in the list
          setBookings(bookings.map(b => 
            b._id === rescheduleBookingId ? response.data.data : b
          ));
          setNewBooking({ vehicle: '', service: '', date: '', time: '', notes: '' });
          setRescheduleBookingId(null); // Clear reschedule mode
          setActiveTab('bookings');
          alert('Appointment rescheduled successfully!');
        }
      } else {
        // This is a new booking
        // Convert date to ISO format for backend validation
        const bookingDate = new Date(newBooking.date + 'T' + newBooking.time + ':00');
        
        const bookingData = {
          vehicle: newBooking.vehicle,
          service: newBooking.service,
          mechanic: newBooking.mechanic,  // User-selected mechanic
          bookingDate: bookingDate.toISOString(),
          bookingTime: newBooking.time,
          specialInstructions: newBooking.notes,
          serviceLocation: 'at_garage'
        };

        console.log('Creating new booking:', bookingData);
        const response = await axios.post('/api/bookings', bookingData);
        console.log('Booking response:', response.data);
        
        if (response.data.success) {
          setBookings([response.data.data, ...bookings]);
          setNewBooking({ vehicle: '', service: '', date: '', time: '', notes: '' });
          setActiveTab('bookings');
          alert('Service booked successfully!');
        } else {
          alert('Failed to book service: ' + (response.data.message || 'Unknown error'));
        }
      }
    } catch (error) {
      console.error('Failed to book/reschedule service:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      alert('Failed: ' + errorMessage);
      setRescheduleBookingId(null); // Clear reschedule mode on error
    }
  };

  const handleCancelBooking = (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      setBookings(bookings.map(b => 
        b._id === bookingId ? { ...b, status: 'cancelled' } : b
      ));
      alert('Booking cancelled successfully!');
    }
  };

  const handleRescheduleBooking = (bookingId) => {
    const booking = bookings.find(b => b._id === bookingId);
    if (booking) {
      const bookingDate = booking.bookingDate || booking.date;
      const bookingTime = booking.bookingTime || booking.time;
      
      setRescheduleBookingId(bookingId); // Track which booking is being rescheduled
      setNewBooking({
        vehicle: booking.vehicle?._id || booking.vehicle,
        service: booking.service?._id || booking.service,
        date: bookingDate ? (typeof bookingDate === 'string' ? bookingDate.split('T')[0] : new Date(bookingDate).toISOString().split('T')[0]) : '',
        time: bookingTime || '',
        notes: booking.specialInstructions || booking.notes || ''
      });
      setActiveTab('booking');
      alert('Update the date and time, then click "Book Service" to reschedule');
    }
  };

  // Filter functions
  const getFilteredBookings = () => {
    let filtered = bookingFilter === 'all' ? bookings : bookings.filter(b => b && b.status === bookingFilter);
    // Sort by newest first (most recent bookings at the top)
    return filtered.sort((a, b) => {
      const dateA = new Date(a.bookingDate || a.date || a.createdAt);
      const dateB = new Date(b.bookingDate || b.date || b.createdAt);
      return dateB - dateA; // Descending order (newest first)
    });
  };

  const getFilteredHistory = () => {
    let filtered = bookings.filter(b => b && b.status === 'completed');
    if (historyFilter) {
      filtered = filtered.filter(b => b.vehicle._id === historyFilter);
    }
    return filtered.sort((a, b) => {
      const dateA = new Date(a.bookingDate || a.date || a.createdAt);
      const dateB = new Date(b.bookingDate || b.date || b.createdAt);
      return dateB - dateA; // Latest first
    });
  };

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-text">
          <h1>Welcome back, {user?.name}</h1>
          <p>Manage your vehicles and service appointments</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary btn-lg" onClick={() => setActiveTab('booking')}>
            Book Service
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
          className={activeTab === 'vehicles' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveTab('vehicles')}
        >
          My Vehicles
        </button>
        <button 
          className={activeTab === 'bookings' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveTab('bookings')}
        >
          Bookings
        </button>
        <button 
          className={activeTab === 'booking' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveTab('booking')}
        >
          Book Service
        </button>
        <button 
          className={activeTab === 'history' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveTab('history')}
        >
          Service History
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">🚗</div>
                <div className="stat-info">
                  <h3>{stats.totalVehicles}</h3>
                  <p>Total Vehicles</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📅</div>
                <div className="stat-info">
                  <h3>{stats.upcomingBookings}</h3>
                  <p>Upcoming Appointments</p>
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
                <div className="stat-icon">📊</div>
                <div className="stat-info">
                  <h3>{stats.totalBookings}</h3>
                  <p>Total Bookings</p>
                </div>
              </div>
            </div>

            <div className="overview-grid">
              <div className="overview-card">
                <h3>Next Appointments (Upcoming)</h3>
                <div className="appointments-list">
                  {upcomingBookings.length > 0 ? (
                    upcomingBookings.slice(0, 3).map(booking => (
                      <div key={booking._id} className="appointment-item">
                        <div className="appointment-date">
                          {new Date(booking.bookingDate || booking.date).toLocaleDateString()}
                        </div>
                        <div className="appointment-details">
                          <strong>{booking.service?.serviceName}</strong>
                          <span>{booking.vehicle?.make} {booking.vehicle?.model}</span>
                        </div>
                        <div className="appointment-status">
                          <span className={`status-badge ${booking.status}`}>
                            {booking.status}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="no-data">No upcoming appointments</p>
                  )}
                </div>
              </div>

              <div className="overview-card">
                <h3>My Vehicles</h3>
                <div className="activity-list">
                  {Array.isArray(vehicles) && vehicles.length > 0 ? (
                    vehicles.slice(0, 3).map(vehicle => (
                      <div key={vehicle._id} className="activity-item">
                        <div className="activity-icon">
                          🚗
                        </div>
                        <div className="activity-details">
                          <strong>{vehicle.make} {vehicle.model}</strong>
                          <span>{vehicle.year} • {vehicle.licensePlate}</span>
                        </div>
                        <button 
                          className="btn-secondary btn-sm"
                          onClick={() => setActiveTab('vehicles')}
                        >
                          View
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="no-data">
                      <p>No vehicles added</p>
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          setShowAddVehicle(true);
                          setShowEditVehicle(null);
                        }}
                      >
                        Add Vehicle
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'vehicles' && (
          <div className="vehicles-tab">
            <div className="tab-header">
              <h2>My Vehicles</h2>
              <button 
                className="btn btn-primary btn-sm" 
                onClick={() => {
                  setShowAddVehicle(true);
                  setShowEditVehicle(null);
                  setNewVehicle({ make: '', model: '', year: '', licensePlate: '', color: '', vin: '' });
                }}
              >
                Add Vehicle
              </button>
            </div>

            {showAddVehicle && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <div className="modal-header">
                    <h3>{showEditVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</h3>
                    <button 
                      className="close-btn" 
                      onClick={() => {
                        setShowAddVehicle(false);
                        setShowEditVehicle(null);
                      }}
                    >
                      ×
                    </button>
                  </div>
                  <form onSubmit={showEditVehicle ? handleUpdateVehicle : handleAddVehicle}>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Make *</label>
                        <input
                          type="text"
                          className="form-input"
                          value={newVehicle.make}
                          onChange={(e) => setNewVehicle({...newVehicle, make: e.target.value})}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Model *</label>
                        <input
                          type="text"
                          className="form-input"
                          value={newVehicle.model}
                          onChange={(e) => setNewVehicle({...newVehicle, model: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Year *</label>
                        <input
                          type="number"
                          className="form-input"
                          value={newVehicle.year}
                          onChange={(e) => setNewVehicle({...newVehicle, year: e.target.value})}
                          min="1900"
                          max="2024"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>License Plate *</label>
                        <input
                          type="text"
                          className="form-input"
                          value={newVehicle.licensePlate}
                          onChange={(e) => setNewVehicle({...newVehicle, licensePlate: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Color</label>
                        <input
                          type="text"
                          className="form-input"
                          value={newVehicle.color}
                          onChange={(e) => setNewVehicle({...newVehicle, color: e.target.value})}
                        />
                      </div>
                      <div className="form-group">
                        <label>VIN (Optional)</label>
                        <input
                          type="text"
                          className="form-input"
                          value={newVehicle.vin}
                          onChange={(e) => setNewVehicle({...newVehicle, vin: e.target.value.toUpperCase()})}
                          placeholder="Optional - leave empty if unknown"
                        />
                      </div>
                    </div>
                    <div className="form-actions">
                      <button type="button" className="btn-secondary" onClick={() => {
                        setShowAddVehicle(false);
                        setShowEditVehicle(null);
                      }}>
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary btn-lg">
                        {showEditVehicle ? 'Update Vehicle' : 'Add Vehicle'}
                      </button>
                    </div>
                  </form>
                </div>
            </div>
            )}

            <div className="vehicles-grid">
              {Array.isArray(vehicles) && vehicles.length > 0 ? (
                vehicles.map(vehicle => {
                  console.log('Rendering vehicle:', vehicle);
                  return (
                    <div key={vehicle._id} className="vehicle-card">
                      <div className="vehicle-header">
                        <h3>{vehicle.make} {vehicle.model}</h3>
                        <span className="vehicle-year">{vehicle.year}</span>
                      </div>
                      <div className="vehicle-details">
                        <div className="detail-item">
                          <span className="label">License Plate:</span>
                          <span className="value">{vehicle.licensePlate || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="label">Color:</span>
                          <span className="value">{vehicle.color || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="label">VIN:</span>
                          <span className="value">{vehicle.vin || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="label">Added:</span>
                          <span className="value">{vehicle.createdAt ? new Date(vehicle.createdAt).toLocaleDateString() : 'N/A'}</span>
                        </div>
                      </div>
                      <div className="vehicle-actions">
                        <button 
                          className="btn-secondary"
                          onClick={() => handleEditVehicle(vehicle._id)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn-danger"
                          onClick={() => handleDeleteVehicle(vehicle._id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="empty-state">
                  <h3>No vehicles added yet</h3>
                  <p>Add your first vehicle to start booking services</p>
                  <button 
                    className="btn btn-primary btn-lg"
                    onClick={() => {
                      setShowAddVehicle(true);
                      setShowEditVehicle(null);
                    }}
                  >
                    Add Vehicle
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="bookings-tab">
            <div className="tab-header">
              <h2>My Bookings</h2>
              <div className="filter-tabs">
                <button 
                  className={`filter-btn ${bookingFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setBookingFilter('all')}
                >
                  All
                </button>
                <button 
                  className={`filter-btn ${bookingFilter === 'pending' ? 'active' : ''}`}
                  onClick={() => setBookingFilter('pending')}
                >
                  Pending
                </button>
                <button 
                  className={`filter-btn ${bookingFilter === 'confirmed' ? 'active' : ''}`}
                  onClick={() => setBookingFilter('confirmed')}
                >
                  Confirmed
                </button>
                <button 
                  className={`filter-btn ${bookingFilter === 'completed' ? 'active' : ''}`}
                  onClick={() => setBookingFilter('completed')}
                >
                  Completed
                </button>
                <button 
                  className={`filter-btn ${bookingFilter === 'cancelled' ? 'active' : ''}`}
                  onClick={() => setBookingFilter('cancelled')}
                >
                  Cancelled
                </button>
              </div>
            </div>
            <div className="bookings-table-container">
              {getFilteredBookings().length > 0 ? (
                <table className="bookings-table">
                  <thead>
                    <tr>
                      <th>Service</th>
                      <th>Vehicle</th>
                      <th>Date & Time</th>
                      <th>Mechanic</th>
                      <th>Cost</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredBookings().map(booking => (
                      <tr key={booking._id} className="booking-row">
                        <td className="service-cell">
                          <div className="service-info">
                            <strong>{booking.service?.serviceName}</strong>
                            {booking.notes && (
                              <div className="booking-notes">
                                <small>📝 {booking.notes}</small>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="vehicle-cell">
                          {booking.vehicle?.make} {booking.vehicle?.model}
                        </td>
                        <td className="datetime-cell">
                          <div className="datetime-info">
                            <div className="date">{new Date(booking.bookingDate || booking.date).toLocaleDateString()}</div>
                            <div className="time">{booking.bookingTime || booking.time}</div>
                          </div>
                        </td>
                        <td className="mechanic-cell">
                          {booking.mechanic?.name || 'Pending Assignment'}
                        </td>
                        <td className="cost-cell">
                          ${booking.estimatedCost || booking.service?.baseCost || booking.service?.cost || 'N/A'}
                        </td>
                        <td className="status-cell">
                          <span className={`status-badge ${booking.status}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="actions-cell">
                          <div className="booking-actions">
                            {(booking.status === 'pending' || booking.status === 'confirmed') && (
                              <>
                                <button 
                                  className="btn-secondary btn-sm"
                                  onClick={() => handleRescheduleBooking(booking._id)}
                                >
                                  Reschedule
                                </button>
                                <button 
                                  className="btn-danger btn-sm"
                                  onClick={() => handleCancelBooking(booking._id)}
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                            {booking.status === 'completed' && (
                              <button 
                                className="btn-primary btn-sm"
                                onClick={() => setReviewBooking(booking)}
                              >
                                Leave Review
                              </button>
                            )}
                            {booking.status === 'cancelled' && (
                              <button 
                                className="btn-primary btn-sm"
                                onClick={() => setActiveTab('booking')}
                              >
                                Book Again
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty-state">
                  <h3>No bookings found</h3>
                  <p>{bookingFilter === 'all' ? 'Book your first service appointment' : `No ${bookingFilter} bookings`}</p>
                  <button className="btn btn-primary btn-lg" onClick={() => setActiveTab('booking')}>
                    Book Service
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'booking' && (
          <div className="booking-tab">
            <div className="tab-header">
              <h2>{rescheduleBookingId ? '🔄 Reschedule Appointment' : '📅 Book a Service'}</h2>
            </div>
            <div className="booking-form-container">
              <form className="booking-form" onSubmit={handleBookService}>
                <div className="form-section">
                  <h3>Select Vehicle *</h3>
                  <div className="form-group">
                    <select 
                      className="form-select"
                      value={newBooking.vehicle}
                      onChange={(e) => setNewBooking({...newBooking, vehicle: e.target.value})}
                      required
                    >
                      <option value="">Choose your vehicle</option>
                      {Array.isArray(vehicles) && vehicles.map(vehicle => (
                        <option key={vehicle._id} value={vehicle._id}>
                          {vehicle.make} {vehicle.model} ({vehicle.year}) - {vehicle.licensePlate}
                        </option>
                      ))}
                    </select>
                  </div>
                  {vehicles.length === 0 && (
                    <p className="form-help">
                      No vehicles found. <button 
                        type="button" 
                        className="link-btn"
                        onClick={() => setActiveTab('vehicles')}
                      >
                        Add a vehicle first
                      </button>
                    </p>
                  )}
                </div>

                <div className="form-section">
                  <h3>Select Service *</h3>
                  <div className="services-grid">
                    {Array.isArray(services) && services.map(service => (
                      <div key={service._id} className="service-option">
                        <input 
                          type="radio" 
                          id={service._id} 
                          name="service" 
                          value={service._id}
                          checked={newBooking.service === service._id}
                          onChange={(e) => setNewBooking({...newBooking, service: e.target.value})}
                          required
                        />
                        <label htmlFor={service._id} className="service-label">
                          <div className="service-info">
                            <h4>{service.serviceName}</h4>
                            <p>{service.description}</p>
                            <div className="service-meta">
                              <span className="price">${service.baseCost || service.cost}</span>
                              <span className="duration">{service.estimatedDuration || service.duration} min</span>
                            </div>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-section">
                  <h3>Select Mechanic *</h3>
                  <div className="form-group">
                    <select 
                      className="form-select"
                      value={newBooking.mechanic}
                      onChange={(e) => setNewBooking({...newBooking, mechanic: e.target.value})}
                      required
                    >
                      <option value="">Choose your mechanic</option>
                      {Array.isArray(mechanics) && mechanics.map(mechanic => (
                        <option key={mechanic._id} value={mechanic._id}>
                          {mechanic.name}
                          {mechanic.rating?.average > 0 && ` ⭐ ${mechanic.rating.average.toFixed(1)}`}
                          {mechanic.experience > 0 && ` • ${mechanic.experience} years exp`}
                          {mechanic.specialization && mechanic.specialization.length > 0 && 
                            ` • ${mechanic.specialization.join(', ').replace(/_/g, ' ')}`
                          }
                        </option>
                      ))}
                    </select>
                  </div>
                  {mechanics.length === 0 && (
                    <p className="form-help">
                      ⚠️ No mechanics available. Please try again later.
                    </p>
                  )}
                </div>

                <div className="form-section">
                  <h3>Select Date & Time *</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Date</label>
                      <input 
                        type="date" 
                        className="form-input"
                        value={newBooking.date}
                        onChange={(e) => setNewBooking({...newBooking, date: e.target.value})}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Time</label>
                      <select 
                        className="form-select"
                        value={newBooking.time}
                        onChange={(e) => setNewBooking({...newBooking, time: e.target.value})}
                        required
                      >
                        <option value="">Select time</option>
                        <option value="09:00">9:00 AM</option>
                        <option value="10:00">10:00 AM</option>
                        <option value="11:00">11:00 AM</option>
                        <option value="12:00">12:00 PM</option>
                        <option value="13:00">1:00 PM</option>
                        <option value="14:00">2:00 PM</option>
                        <option value="15:00">3:00 PM</option>
                        <option value="16:00">4:00 PM</option>
                        <option value="17:00">5:00 PM</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Additional Notes</h3>
                  <div className="form-group">
                    <textarea 
                      className="form-textarea" 
                      placeholder="Any specific requirements or notes for the mechanic..."
                      rows="4"
                      value={newBooking.notes}
                      onChange={(e) => setNewBooking({...newBooking, notes: e.target.value})}
                    ></textarea>
                  </div>
                </div>

                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => {
                      setNewBooking({ vehicle: '', service: '', mechanic: '', date: '', time: '', notes: '' });
                      setRescheduleBookingId(null); // Clear reschedule mode
                    }}
                  >
                    {rescheduleBookingId ? 'Cancel Reschedule' : 'Clear Form'}
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-lg"
                    disabled={vehicles.length === 0 || mechanics.length === 0}
                  >
                    {rescheduleBookingId ? 'Reschedule Appointment' : 'Book Service'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="history-tab">
            <div className="tab-header">
              <h2>Service History</h2>
              <div className="history-filters">
                <select 
                  className="form-select"
                  value={historyFilter}
                  onChange={(e) => setHistoryFilter(e.target.value)}
                >
                  <option value="">All Vehicles</option>
                  {Array.isArray(vehicles) && vehicles.map(vehicle => (
                    <option key={vehicle._id} value={vehicle._id}>
                      {vehicle.make} {vehicle.model}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="history-list">
              {getFilteredHistory().length > 0 ? (
                getFilteredHistory().map(booking => (
                    <div key={booking._id} className="history-item">
                      <div className="history-date">
                      <div className="date-main">
                        {new Date(booking.bookingDate || booking.date).toLocaleDateString()}
                      </div>
                      <div className="date-time">
                        {booking.bookingTime || booking.time}
                      </div>
                      </div>
                      <div className="history-details">
                        <h4>{booking.service?.serviceName}</h4>
                      <p className="vehicle-info">
                        <strong>{booking.vehicle?.make} {booking.vehicle?.model}</strong> ({booking.vehicle?.year})
                      </p>
                      <p className="mechanic-info">
                        <span className="label">Mechanic:</span> {booking.mechanic?.name}
                      </p>
                      {booking.notes && (
                        <p className="notes-info">
                          <span className="label">Notes:</span> {booking.notes}
                        </p>
                      )}
                      </div>
                      <div className="history-cost">
                      <span className="cost-amount">${booking.estimatedCost || booking.actualCost || booking.service?.baseCost || booking.service?.cost || '0'}</span>
                      <span className="cost-label">Total</span>
                      </div>
                      <div className="history-actions">
                        <button 
                          className="btn-secondary"
                          onClick={() => setSelectedBooking(booking)}
                        >
                          View Details
                        </button>
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => setReviewBooking(booking)}
                        >
                          Leave Review
                        </button>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="empty-state">
                  <h3>No service history</h3>
                  <p>
                    {historyFilter 
                      ? 'No completed services found for the selected vehicle' 
                      : 'Your completed services will appear here'
                    }
                  </p>
                  {historyFilter && (
                    <button 
                      className="btn-secondary"
                      onClick={() => setHistoryFilter('')}
                    >
                      Show All Vehicles
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewBooking && (
        <ReviewModal
          booking={reviewBooking}
          onClose={() => {
            setReviewBooking(null);
            // Don't refresh data immediately to prevent modal from closing
          }}
          onSuccess={(reviewData) => {
            // Update the booking to show it has been reviewed
            setBookings(bookings.map(b =>
              b._id === reviewBooking._id ? { ...b, hasReview: true } : b
            ));
            setReviewBooking(null);
            // Show success message
            alert('Review submitted successfully!');
          }}
        />
      )}

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="modal-overlay" onClick={() => setSelectedBooking(null)}>
          <div className="modal-content booking-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📋 Booking Details</h3>
              <button className="close-btn" onClick={() => setSelectedBooking(null)}>×</button>
            </div>
            <div className="booking-details-content">
              <div className="detail-section">
                <h4>Service Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Service:</span>
                    <span className="detail-value">{selectedBooking.service?.serviceName || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Category:</span>
                    <span className="detail-value">{selectedBooking.service?.category || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Duration:</span>
                    <span className="detail-value">{selectedBooking.service?.estimatedDuration || selectedBooking.estimatedDuration || 'N/A'} minutes</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Description:</span>
                    <span className="detail-value">{selectedBooking.service?.description || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Vehicle Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Make & Model:</span>
                    <span className="detail-value">{selectedBooking.vehicle?.make} {selectedBooking.vehicle?.model}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Year:</span>
                    <span className="detail-value">{selectedBooking.vehicle?.year || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">License Plate:</span>
                    <span className="detail-value">{selectedBooking.vehicle?.licensePlate || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Color:</span>
                    <span className="detail-value">{selectedBooking.vehicle?.color || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Appointment Details</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Date:</span>
                    <span className="detail-value">
                      {selectedBooking.bookingDate ? new Date(selectedBooking.bookingDate).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Time:</span>
                    <span className="detail-value">{selectedBooking.bookingTime || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Status:</span>
                    <span className={`status-badge ${selectedBooking.status}`}>
                      {selectedBooking.status}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Mechanic:</span>
                    <span className="detail-value">{selectedBooking.mechanic?.name || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Cost Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Base Cost:</span>
                    <span className="detail-value">${selectedBooking.service?.baseCost || selectedBooking.estimatedCost || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Actual Cost:</span>
                    <span className="detail-value">${selectedBooking.actualCost || selectedBooking.estimatedCost || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Service Location:</span>
                    <span className="detail-value">{selectedBooking.serviceLocation || 'At Garage'}</span>
                  </div>
                </div>
              </div>

              {selectedBooking.specialInstructions && (
                <div className="detail-section">
                  <h4>Special Instructions</h4>
                  <div className="instructions-content">
                    <p>{selectedBooking.specialInstructions}</p>
                  </div>
                </div>
              )}

              {selectedBooking.notes && (
                <div className="detail-section">
                  <h4>Additional Notes</h4>
                  <div className="notes-content">
                    <p>{selectedBooking.notes}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setSelectedBooking(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarOwnerDashboard;
