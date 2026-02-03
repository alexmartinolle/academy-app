# Martial Arts Academy App 🥋

A comprehensive web application for managing martial arts academy operations, including student enrollment, payment tracking, and advanced analytics. Built with a scalable architecture that leverages PostgreSQL for data processing and a clean separation between backend and frontend.

## 🏗️ Architecture Overview

### **Backend-First Design**
- **Database-centric**: All business logic and data processing handled by PostgreSQL
- **RESTful API**: Clean, standardized endpoints for frontend consumption
- **Scalable Architecture**: Optimized queries, views, and indexes for high performance
- **Immutable Data**: Plans are immutable - price changes create new records

### **Technology Stack**

#### **Backend**
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Database with advanced features
- **pg** - PostgreSQL client
- **Joi** - Input validation
- **Winston** - Structured logging
- **dotenv** - Environment configuration
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Compression** - Response compression
- **express-rate-limit** - Rate limiting
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication

#### **Frontend (Planned)**
- **React** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Router** - Navigation
- **React Query** - Data fetching
- **Chart.js** - Data visualization

## 📊 Database Features

### **Advanced PostgreSQL Features**
- **ENUM Types**: `student_type`, `student_status`, `plan_frequency`, `payment_method`
- **Partial Indexes**: Optimized for active records
- **Business Logic Triggers**: Automatic status synchronization
- **Materialized Views**: Pre-computed analytics
- **CTEs & Window Functions**: Complex reporting queries
- **Foreign Key Constraints**: Data integrity
- **CHECK Constraints**: Business rule validation

### **Optimized Views**
- `v_students_list` - Complete student information
- `v_students_overdue` - Payment overdue detection
- `v_student_payments_history` - Payment tracking
- `v_daily_revenue` - Daily revenue analytics
- `v_monthly_revenue` - Monthly revenue trends
- `v_main_kpis` - Dashboard metrics
- `v_growth_trend` - Student growth analysis
- `v_cohort_retention` - Retention analytics
- `v_modalities_statistics` - Modality performance

## 🚀 Core Features

### **Student Management**
- ✅ Student registration and profile management
- ✅ Student status tracking (active, inactive, payment_pending)
- ✅ Student type classification (adult, kids)
- ✅ Enrollment and cancellation tracking
- ✅ Overdue payment detection

### **Plan Management**
- ✅ Plan creation with immutable pricing
- ✅ Plan frequency options (1_week, 2_week, unlimited)
- ✅ Plan-modality relationships
- ✅ Active student tracking per plan
- ✅ Plan deactivation with safety checks

### **Payment Processing**
- ✅ Payment recording with period coverage
- ✅ Multiple payment methods (cash, transfer, card)
- ✅ Payment history tracking
- ✅ Revenue analytics (daily, monthly, yearly)
- ✅ Payment method statistics

### **Modality Management**
- ✅ Modality creation and organization
- ✅ Plan-modality associations
- ✅ Student enrollment by modality
- ✅ Revenue tracking per modality

### **Advanced Analytics**
- ✅ Dashboard KPIs
- ✅ Revenue trends and forecasting
- ✅ Student growth analytics
- ✅ Cohort retention analysis
- ✅ Plan distribution statistics
- ✅ Payment method analytics
- ✅ Modality performance metrics

## 📁 Project Structure

```
academy-app/
├── backend/                    # Backend application
│   ├── src/
│   │   ├── config/            # Database configuration
│   │   ├── controllers/       # Business logic handlers
│   │   ├── routes/           # API endpoint definitions
│   │   ├── utils/            # Helper utilities
│   │   └── app.js            # Express application
│   ├── .env.example          # Environment variables template
│   ├── package.json          # Dependencies and scripts
│   └── README.md             # Backend documentation
├── database/                  # Database schema and migrations
│   ├── 01-types.sql          # ENUM type definitions
│   ├── 02-tables.sql         # Table definitions
│   ├── 03-indexes.sql        # Performance indexes
│   ├── 04-triggers-timestamp.sql # Timestamp triggers
│   ├── 05-triggers-business.sql  # Business logic triggers
│   └── 06-views.sql          # Optimized database views
├── frontend/                  # Frontend application (planned)
└── README.md                  # Project documentation
```

## 🛠️ Installation & Setup

### **Prerequisites**
- Node.js 18+ 
- PostgreSQL 14+
- Git

### **Database Setup**

1. **Create Database:**
```sql
CREATE DATABASE academy_app;
CREATE USER academy_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE academy_app TO academy_user;
```

2. **Run Schema:**
```bash
cd database
psql -d academy_app -U academy_user -f 01-types.sql
psql -d academy_app -U academy_user -f 02-tables.sql
psql -d academy_app -U academy_user -f 03-indexes.sql
psql -d academy_app -U academy_user -f 04-triggers-timestamp.sql
psql -d academy_app -U academy_user -f 05-triggers-business.sql
psql -d academy_app -U academy_user -f 06-views.sql
```

### **Backend Setup**

1. **Install Dependencies:**
```bash
cd backend
npm install
```

2. **Environment Configuration:**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. **Start Development Server:**
```bash
npm run dev
```

4. **Start Production Server:**
```bash
npm start
```

## 📡 API Documentation

### **Base URL**
```
http://localhost:3000/api
```

### **Authentication**
```
Authorization: Bearer <jwt_token>
```

### **Endpoints**

#### **Students**
- `GET /students` - List students with pagination
- `GET /students/:id` - Get student details
- `POST /students` - Create new student
- `PUT /students/:id` - Update student
- `DELETE /students/:id` - Deactivate student
- `GET /students/overdue` - Get overdue students
- `GET /students/:id/payments` - Student payment history
- `GET /students/:id/plans` - Student plan history

#### **Plans**
- `GET /plans` - List plans
- `GET /plans/:id` - Get plan details
- `POST /plans` - Create plan
- `PUT /plans/:id` - Update plan (immutable pricing)
- `DELETE /plans/:id` - Deactivate plan
- `GET /plans/:id/modalities` - Plan modalities
- `POST /plans/:id/modalities` - Add modalities
- `DELETE /plans/:id/modalities/:modalityId` - Remove modality

#### **Payments**
- `GET /payments` - List payments with filters
- `GET /payments/:id` - Get payment details
- `POST /payments` - Record payment
- `GET /payments/student/:studentId` - Student payment history
- `GET /payments/methods/summary` - Payment methods summary
- `GET /payments/revenue/daily` - Daily revenue
- `GET /payments/revenue/monthly` - Monthly revenue

#### **Modalities**
- `GET /modalities` - List modalities
- `GET /modalities/:id` - Get modality details
- `POST /modalities` - Create modality
- `PUT /modalities/:id` - Update modality
- `DELETE /modalities/:id` - Deactivate modality
- `GET /modalities/:id/plans` - Modality plans
- `GET /modalities/:id/students` - Modality students

#### **Student Plans**
- `GET /student-plans` - List student plans
- `GET /student-plans/:id` - Get student plan details
- `POST /student-plans` - Assign plan to student
- `PUT /student-plans/:id` - Update student plan
- `DELETE /student-plans/:id` - Deactivate student plan
- `GET /student-plans/student/:studentId` - Student plan history
- `GET /student-plans/plan/:planId/students` - Plan students

#### **Statistics**
- `GET /stats/dashboard` - Dashboard KPIs
- `GET /stats/revenue` - Revenue statistics
- `GET /stats/students` - Student statistics
- `GET /stats/growth` - Growth trends
- `GET /stats/plans` - Plan distribution
- `GET /stats/modalities` - Modality statistics
- `GET /stats/retention` - Cohort retention
- `GET /stats/payments` - Payment statistics

## 🔧 Configuration

### **Environment Variables**

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=academy_app
DB_USER=academy_user
DB_PASSWORD=your_password

# Server
PORT=3000
NODE_ENV=development

# Security
JWT_SECRET=your_jwt_secret
BCRYPT_ROUNDS=12

# CORS
CORS_ORIGIN=http://localhost:3001

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- student.test.js
```

## 📊 Performance Features

### **Database Optimization**
- **Partial Indexes**: Only index active records
- **Composite Indexes**: Multi-column optimization
- **Materialized Views**: Pre-computed analytics
- **Query Optimization**: Efficient joins and aggregations

### **API Performance**
- **Pagination**: Large dataset handling
- **Compression**: Reduced response sizes
- **Rate Limiting**: API protection
- **Caching**: Strategic response caching

## 🔒 Security Features

- **Helmet.js**: Security headers
- **CORS**: Cross-origin protection
- **Rate Limiting**: DDoS protection
- **Input Validation**: Joi schema validation
- **Password Hashing**: bcrypt security
- **JWT Authentication**: Secure token handling
- **Environment Variables**: Sensitive data protection

## 📈 Scalability Features

- **Database-First**: Heavy lifting in PostgreSQL
- **Immutable Data**: Historical integrity
- **Optimized Queries**: Index-driven performance
- **Modular Architecture**: Easy scaling
- **Async Processing**: Non-blocking operations
- **Connection Pooling**: Database efficiency

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Roadmap

### **Phase 1: Backend Complete** ✅
- [x] Database schema with advanced features
- [x] RESTful API with full CRUD operations
- [x] Advanced analytics and reporting
- [x] Security and performance optimization

### **Phase 2: Frontend Development** 🚧
- [ ] React application setup
- [ ] Student management interface
- [ ] Payment processing UI
- [ ] Analytics dashboard
- [ ] Responsive design

### **Phase 3: Advanced Features** 📋
- [ ] User authentication system
- [ ] Role-based permissions
- [ ] Email notifications
- [ ] File upload capabilities
- [ ] Mobile app development

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

---

**Built with ❤️ for martial arts academies**
