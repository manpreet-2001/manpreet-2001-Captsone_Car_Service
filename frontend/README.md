# Car Service Platform - Frontend (React)

A professional, dynamic React frontend for the Car Service Booking Platform built with modern engineering practices.

## Features

### 🎨 **Professional Design**
- Clean, modern interface without emojis
- Engineering-focused design approach
- Responsive layout for all devices
- Consistent color scheme and typography

### 🔐 **Authentication System**
- JWT-based authentication
- Role-based access control (Owner, Mechanic, Admin)
- Protected routes with automatic redirection
- Demo accounts for testing different roles

### 📱 **Dynamic Pages**
- **HomePage**: Landing page with stats, features, and service packages
- **LoginPage**: Professional login form with demo credentials
- **CarOwnerDashboard**: Complete vehicle and booking management
- **MechanicDashboard**: Appointment management and service offerings

### 🛠️ **Technical Features**
- React Router for navigation
- Axios for API communication
- Context API for state management
- CSS Modules for component styling
- Loading states and error handling

## Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Backend API running (see backend README)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your settings:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```

3. **Start development server:**
   ```bash
   npm start
   ```

4. **Open in browser:**
   ```
   http://localhost:3000
   ```

## Demo Accounts

Test different user roles with these demo credentials:

| Role | Email | Password |
|------|-------|----------|
| Car Owner | owner@example.com | password123 |
| Mechanic | mechanic@example.com | password123 |
| Admin | admin@example.com | password123 |

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── Navbar.js        # Navigation component
│   ├── ProtectedRoute.js # Route protection
│   └── LoadingSpinner.js # Loading indicator
├── contexts/            # React Context providers
│   └── AuthContext.js   # Authentication state
├── pages/               # Main application pages
│   ├── HomePage.js      # Landing page
│   ├── LoginPage.js     # Authentication
│   ├── CarOwnerDashboard.js # Owner interface
│   └── MechanicDashboard.js # Mechanic interface
├── App.js               # Main application component
├── App.css              # Global styles
└── index.js             # Application entry point
```

## Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## API Integration

The frontend integrates with the backend API endpoints:

- **Authentication**: `/api/auth/login`, `/api/auth/register`
- **Users**: `/api/users/*`
- **Vehicles**: `/api/vehicles/*`
- **Services**: `/api/services/*`
- **Bookings**: `/api/bookings/*`

## Design Principles

### Engineering-Focused Approach
- **Clean Code**: Well-structured, readable components
- **Performance**: Optimized rendering and API calls
- **Scalability**: Modular architecture for easy expansion
- **Maintainability**: Consistent patterns and documentation

### Professional UI/UX
- **Consistent Design**: Unified color scheme and typography
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Loading States**: Proper feedback during async operations
- **Error Handling**: User-friendly error messages

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Development

### Adding New Pages
1. Create component in `src/pages/`
2. Add route in `src/App.js`
3. Update navigation in `src/components/Navbar.js`

### Styling Guidelines
- Use CSS modules for component-specific styles
- Follow the established color scheme
- Maintain responsive design principles
- Keep accessibility in mind

### State Management
- Use React Context for global state (auth, user data)
- Use local state for component-specific data
- Implement proper loading and error states

## Production Deployment

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Deploy the `build/` folder** to your hosting service:
   - Vercel
   - Netlify
   - AWS S3 + CloudFront
   - Heroku

3. **Environment variables** in production:
   ```
   REACT_APP_API_URL=https://your-api-domain.com/api
   ```

## Contributing

1. Follow the established code style
2. Add proper error handling
3. Include loading states
4. Test on multiple devices
5. Update documentation

## License

This project is part of the Car Service Booking Platform MERN stack implementation.
