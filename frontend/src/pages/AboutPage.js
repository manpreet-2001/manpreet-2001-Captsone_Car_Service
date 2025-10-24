import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AboutPage.css';

const AboutPage = () => {
  const [stats, setStats] = useState({
    happyCustomers: '10,000+',
    servicesCompleted: '50,000+',
    customerSatisfaction: '98%',
    customerSupport: '24/7'
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [usersRes, bookingsRes, reviewsRes] = await Promise.allSettled([
        axios.get('/api/users'),
        axios.get('/api/bookings?limit=100'),
        axios.get('/api/reviews?limit=100')
      ]);
      
      let happyCustomers = '10,000+';
      let servicesCompleted = '50,000+';
      let customerSatisfaction = '98%';
      
      // Count users
      if (usersRes.status === 'fulfilled') {
        const usersData = usersRes.value.data;
        const usersArray = Array.isArray(usersData) ? usersData : usersData?.data || [];
        const totalUsers = usersArray.length;
        if (totalUsers > 0) {
          happyCustomers = totalUsers > 1000 ? `${Math.floor(totalUsers / 1000)}K+` : `${totalUsers}+`;
        }
      }
      
      // Count completed services
      if (bookingsRes.status === 'fulfilled') {
        const bookingsData = bookingsRes.value.data;
        const bookingsArray = Array.isArray(bookingsData) ? bookingsData : bookingsData?.data || [];
        const completedServices = bookingsArray.filter(booking => booking.status === 'completed').length;
        if (completedServices > 0) {
          servicesCompleted = completedServices > 1000 ? `${Math.floor(completedServices / 1000)}K+` : `${completedServices}+`;
        }
      }
      
      // Calculate satisfaction from reviews
      if (reviewsRes.status === 'fulfilled') {
        const reviewsData = reviewsRes.value.data;
        const reviewsArray = Array.isArray(reviewsData) ? reviewsData : reviewsData?.data || [];
        if (reviewsArray.length > 0) {
          const avgRating = reviewsArray.reduce((sum, review) => sum + (review.rating || 0), 0) / reviewsArray.length;
          customerSatisfaction = `${Math.round((avgRating / 5) * 100)}%`;
        }
      }
      
      console.log('AboutPage Stats:', { happyCustomers, servicesCompleted, customerSatisfaction });
      setStats({
        happyCustomers,
        servicesCompleted,
        customerSatisfaction,
        customerSupport: '24/7'
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const teamMembers = [
    {
      name: 'John Smith',
      role: 'CEO & Founder',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
      bio: 'With over 15 years in the automotive industry, John founded CarService to revolutionize vehicle maintenance.',
      expertise: ['Strategic Planning', 'Business Development', 'Customer Relations']
    },
    {
      name: 'Sarah Johnson',
      role: 'Head of Operations',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face',
      bio: 'Sarah ensures our operations run smoothly and maintains our high standards of service quality.',
      expertise: ['Operations Management', 'Quality Control', 'Process Optimization']
    },
    {
      name: 'Mike Rodriguez',
      role: 'Lead Technician',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face',
      bio: 'Mike leads our team of certified mechanics with 20+ years of hands-on automotive experience.',
      expertise: ['Engine Diagnostics', 'Advanced Repairs', 'Team Leadership']
    },
    {
      name: 'Emily Chen',
      role: 'Customer Success Manager',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face',
      bio: 'Emily ensures every customer has an exceptional experience from booking to service completion.',
      expertise: ['Customer Relations', 'Service Coordination', 'Problem Solving']
    }
  ];

  const milestones = [
    {
      year: '2020',
      title: 'Company Founded',
      description: 'Started with a vision to make car maintenance simple and accessible for everyone.'
    },
    {
      year: '2021',
      title: 'First 1000 Customers',
      description: 'Reached our first milestone of 1000 satisfied customers within the first year.'
    },
    {
      year: '2022',
      title: 'Mobile Service Launch',
      description: 'Expanded services to include mobile mechanics for convenience at your location.'
    },
    {
      year: '2023',
      title: 'Digital Platform',
      description: 'Launched our comprehensive online booking and management platform.'
    },
    {
      year: '2024',
      title: 'AI Integration',
      description: 'Introduced AI-powered diagnostics and predictive maintenance features.'
    }
  ];

  const values = [
    {
      icon: '🎯',
      title: 'Quality First',
      description: 'We never compromise on the quality of our services. Every job is done right the first time.'
    },
    {
      icon: '🤝',
      title: 'Customer Trust',
      description: 'Building long-term relationships through transparency, honesty, and exceptional service.'
    },
    {
      icon: '⚡',
      title: 'Efficiency',
      description: 'Streamlined processes and modern technology to get your vehicle back on the road quickly.'
    },
    {
      icon: '🔧',
      title: 'Expertise',
      description: 'Certified mechanics with years of experience and continuous training in latest technologies.'
    },
    {
      icon: '💡',
      title: 'Innovation',
      description: 'Embracing new technologies and methods to provide better, faster, and smarter services.'
    },
    {
      icon: '🌱',
      title: 'Sustainability',
      description: 'Environmentally conscious practices and eco-friendly solutions for a greener future.'
    }
  ];

  const statsData = [
    { number: stats.happyCustomers, label: 'Happy Customers' },
    { number: stats.servicesCompleted, label: 'Services Completed' },
    { number: stats.customerSatisfaction, label: 'Customer Satisfaction' },
    { number: stats.customerSupport, label: 'Customer Support' }
  ];

  return (
    <div className="about-page">
      {/* Hero Section */}
      <div className="about-hero">
        <div className="container">
          <div className="hero-content">
            <h1>About CarService</h1>
            <p className="hero-subtitle">
              Your trusted partner in automotive care, providing professional services 
              with transparency, quality, and customer satisfaction at the heart of everything we do.
            </p>
          </div>
        </div>
      </div>

      {/* Our Story Section */}
      <div className="our-story">
        <div className="container">
          <div className="story-content">
            <div className="story-text">
              <h2>Our Story</h2>
              <p>
                CarService was born from a simple belief: car maintenance should be straightforward, 
                transparent, and stress-free. Founded in 2020 by automotive industry veterans, we 
                set out to revolutionize how people care for their vehicles.
              </p>
              <p>
                What started as a small team of passionate mechanics has grown into a comprehensive 
                automotive service platform trusted by thousands of customers. We combine traditional 
                craftsmanship with modern technology to deliver exceptional results every time.
              </p>
              <p>
                Today, we're proud to serve communities across the region with a wide range of 
                automotive services, from routine maintenance to complex repairs, all backed by 
                our commitment to quality and customer satisfaction.
              </p>
            </div>
            <div className="story-image">
              <div className="image-placeholder">
                <span>🏗️</span>
                <p>Our Workshop</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {statsData.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="values-section">
        <div className="container">
          <div className="section-header">
            <h2>Our Values</h2>
            <p>The principles that guide everything we do</p>
          </div>
          <div className="values-grid">
            {values.map((value, index) => (
              <div key={index} className="value-card">
                <div className="value-icon">{value.icon}</div>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="team-section">
        <div className="container">
          <div className="section-header">
            <h2>Meet Our Team</h2>
            <p>The experts behind your exceptional service experience</p>
          </div>
          <div className="team-grid">
            {teamMembers.map((member, index) => (
              <div key={index} className="team-card">
                <div className="member-image">
                  <img src={member.image} alt={member.name} />
                </div>
                <div className="member-info">
                  <h3>{member.name}</h3>
                  <p className="member-role">{member.role}</p>
                  <p className="member-bio">{member.bio}</p>
                  <div className="member-expertise">
                    {member.expertise.map((skill, skillIndex) => (
                      <span key={skillIndex} className="expertise-tag">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="timeline-section">
        <div className="container">
          <div className="section-header">
            <h2>Our Journey</h2>
            <p>Key milestones in our growth and development</p>
          </div>
          <div className="timeline">
            {milestones.map((milestone, index) => (
              <div key={index} className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'}`}>
                <div className="timeline-content">
                  <div className="timeline-year">{milestone.year}</div>
                  <h3>{milestone.title}</h3>
                  <p>{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="mission-section">
        <div className="container">
          <div className="mission-content">
            <div className="mission-text">
              <h2>Our Mission</h2>
              <p>
                To provide exceptional automotive services that exceed customer expectations 
                while maintaining the highest standards of quality, transparency, and reliability. 
                We strive to make vehicle maintenance convenient, affordable, and stress-free 
                for every customer we serve.
              </p>
            </div>
            <div className="mission-image">
              <div className="image-placeholder">
                <span>🎯</span>
                <p>Our Mission</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Experience the Difference?</h2>
            <p>Join thousands of satisfied customers who trust CarService with their vehicles.</p>
            <div className="cta-buttons">
              <a href="/services" className="btn btn-primary btn-lg">Browse Services</a>
              <a href="/contact" className="btn btn-secondary btn-lg">Contact Us</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;




