# Martial Arts Academy - Frontend

A modern, responsive React application for managing a martial arts academy with a black, white, and red color scheme.

## Features

### 🏠 Dashboard
- Overview of key metrics (total students, active students, pending payments, monthly revenue)
- Quick access to student search
- Pending payments list with amounts
- Recent activity feed

### 🔍 Student Management
- **Student Search**: Search and filter students by name, email, status
- **Student Details**: View complete student information including:
  - Personal details (editable)
  - Enrollment date and modality
  - Complete payment history
  - Current plan and pricing
  - Pending payment alerts
- Status indicators (Active, Pending, Inactive, Trial)

### 📊 Statistics Dashboard
- Student status distribution (pie chart)
- Plan distribution (bar chart)
- Monthly trends (students and revenue)
- Detailed metrics including:
  - Student types (adults/kids)
  - Payment status breakdown
  - Average revenue calculations
  - Growth rates

### 💰 Financial Overview
- Revenue statistics (total, paid, pending)
- Payment history table with filtering
- Payment source tracking (monthly vs advanced)
- Export functionality
- Quick actions for recording payments

## Design System

### 🎨 Color Palette
- **Primary (Red)**: Used for accents, buttons, and important actions
- **Grayscale**: Black, white, and gray tones for text and backgrounds
- **Status Colors**: Green (active/paid), Yellow (pending), Red (inactive/overdue), Blue (trial)

### 📱 Responsive Design
- Mobile-first approach
- Collapsible sidebar for mobile devices
- Responsive grid layouts
- Touch-friendly interface elements

### 🎯 UI Components
- Modern card-based layouts
- Consistent button styles with hover effects
- Status badges and indicators
- Interactive charts and data visualizations
- Smooth transitions and micro-interactions

## Technology Stack

- **React 18** - Modern React with hooks
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **Recharts** - Data visualization library
- **Vite** - Fast development tooling

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

## Configuration

### API Proxy
The frontend is configured to proxy API requests to the backend at `http://localhost:5000`. Update the `vite.config.js` file if your backend runs on a different port.

### Environment Variables
Create a `.env` file in the frontend directory for environment-specific configuration.

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   └── Layout.jsx      # Main layout with navigation
│   ├── pages/              # Page components
│   │   ├── Dashboard.jsx   # Main dashboard
│   │   ├── StudentSearch.jsx # Student search and listing
│   │   ├── StudentDetail.jsx # Individual student view
│   │   ├── Statistics.jsx  # Statistics and charts
│   │   └── Financial.jsx   # Financial overview
│   ├── App.jsx             # Main app component with routing
│   ├── main.jsx           # App entry point
│   └── index.css          # Global styles and Tailwind
├── public/                # Static assets
├── index.html             # HTML template
├── package.json           # Dependencies and scripts
├── tailwind.config.js     # Tailwind configuration
└── vite.config.js         # Vite configuration
```

## Features Implementation

### State Management
- React hooks for local state management
- Mock data for development (replace with API calls)
- Loading states and error handling

### Data Visualization
- Interactive charts using Recharts
- Responsive chart containers
- Color-coded data representation

### User Experience
- Intuitive navigation with active state indicators
- Search and filtering functionality
- Edit capabilities for student information
- Responsive design for all screen sizes

## Development Notes

### Mock Data
Currently uses mock data for demonstration. Replace the mock data fetching with actual API calls to connect with your backend.

### Styling
- Tailwind CSS for rapid UI development
- Custom component classes for consistent styling
- Responsive breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)

### Icons
Lucide React provides a comprehensive set of icons that match the modern design aesthetic.

## Future Enhancements

- [ ] Real-time data updates
- [ ] Advanced filtering and sorting
- [ ] Payment processing integration
- [ ] Email notifications
- [ ] Advanced reporting features
- [ ] Mobile app version
