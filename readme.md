# Martial Arts Academy Management System

A web application for managing students, payments, and plans for a martial arts academy.

## Features

- **Student Management**: Add, update, delete students with automatic status tracking (active, pending, inactive)
- **Payment Tracking**: Record monthly payments, handle advance payments, track payment history
- **Plan Management**: Create and manage different pricing plans for adults and kids
- **Dashboard**: Real-time statistics and analytics for business insights
- **Status Automation**: Automatic student status calculation based on payment history

## Database Schema

### Tables
- **students**: Student information (name, email, type, enrollment date)
- **plans**: Pricing plans with different rates for adults/kids
- **payments**: Payment records with month/year tracking
- **disciplines**: Available martial arts disciplines

### Views
- **student_current_status**: Current status of each student (active/pending/inactive)
- **student_last_payment**: Last payment date for each student
- **inactive_students**: Students 3+ months without payment
- **students_with_plan**: Students with their current plan information

## API Endpoints

### Students
- `GET /api/students` - Get all students with status
- `GET /api/students/:id` - Get specific student
- `POST /api/students` - Create new student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student
- `GET /api/students/status/:status` - Filter students by status
- `GET /api/students/inactive` - Get inactive students

### Payments
- `GET /api/payments/student/:studentId` - Get student's payment history
- `GET /api/payments/month/:year/:month` - Get payments for specific month
- `POST /api/payments` - Create new payment
- `PUT /api/payments/:id` - Update payment
- `DELETE /api/payments/:id` - Delete payment
- `GET /api/payments/revenue/:year/:month` - Get monthly revenue stats

### Plans
- `GET /api/plans` - Get all plans (filter by type with ?type=adult/kids)
- `GET /api/plans/:id` - Get specific plan
- `POST /api/plans` - Create new plan
- `PUT /api/plans/:id` - Update plan
- `DELETE /api/plans/:id` - Delete plan

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/students/distribution` - Student status distribution
- `GET /api/dashboard/revenue/trend/:year?` - Revenue trend by year
- `GET /api/dashboard/plans/distribution` - Plan usage distribution

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Set up database:
   ```bash
   # Create database
   createdb academy_db
   
   # Run schema and views
   psql -d academy_db -f ../database/schema.sql
   psql -d academy_db -f ../database/views.sql
   ```

4. Configure environment variables in `.env`:
   ```env
   DB_USER=postgres
   DB_HOST=localhost
   DB_NAME=academy_db
   DB_PASSWORD=your_password
   DB_PORT=5432
   PORT=3000
   NODE_ENV=development
   ```

5. Start the server:
   ```bash
   npm run dev  # Development with nodemon
   npm start    # Production
   ```

## Student Status Logic

- **Active**: Student paid for current month
- **Pending**: Student 1-2 months behind on payments
- **Inactive**: Student 3+ months without payment

Status is automatically calculated based on the most recent payment date.

## Payment Features

- Monthly payment tracking
- Support for advance payments
- Different pricing for adults vs kids
- Payment status management (paid/pending)
- Revenue analytics and reporting

## Development

The backend uses:
- **Express.js** for REST API
- **PostgreSQL** for database
- **ES6 modules** with `type: "module"`
- **Async/await** for database operations
- **CORS** enabled for frontend integration