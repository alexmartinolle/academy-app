# Database Seeder Instructions

## How to Apply the Seeder

### Prerequisites
- PostgreSQL installed and running
- Database `academy_db` created
- Schema and views already applied

### Steps to Seed the Database

1. **Navigate to the database folder:**
   ```bash
   cd database
   ```

2. **Apply the seeder:**
   ```bash
   psql -d academy_db -f seeder.sql
   ```

### Alternative: Using PostgreSQL Interactive Mode

1. **Connect to the database:**
   ```bash
   psql -d academy_db
   ```

2. **Execute the seeder:**
   ```sql
   \i seeder.sql
   ```

## What the Seeder Creates

### Disciplines (4)
- BJJ
- MMA  
- Budokon
- Yoga

### Plans (10 total)
**Adult Plans:**
- 1 class per week: €50
- 2 classes per week: €70
- BJJ Unlimited: €90
- MMA Unlimited: €80
- Budokon Unlimited: €50
- Yoga Unlimited: €50
- All Unlimited: €98

**Kids Plans:**
- 1 class per week: €45
- 2 classes per week: €65
- Unlimited: €75

### Students (23 total)
- **8 Active students** (paid current month - January 2026)
- **4 Pending students** (1-2 months behind - November/December 2025)
- **4 Inactive students** (3+ months behind - before October 2025)
- **3 New students** (recently enrolled)
- **3 Trial students** (came to try classes, haven't paid yet)

### Payment History
- Payments from **August 2025** to **June 2026**
- **5 months of historical data** (August-December 2025)
- **3 months of future payments** (February-April 2026)
- All plan types represented
- Various payment patterns (monthly, advance payments)

### Student Status Distribution
The seeder creates a realistic mix of:
- **Active**: Students with current month payments (January 2026)
- **Pending**: Students 1-2 months behind on payments
- **Inactive**: Students 3+ months without payment
- **Trial**: Students who came to try classes but haven't paid yet

## Verification

After running the seeder, you can verify the data with these queries:

```sql
-- Check student status distribution
SELECT student_status, COUNT(*) FROM student_current_status GROUP BY student_status;

-- View all students with their status
SELECT * FROM student_current_status ORDER BY student_status, last_name;

-- Check payment history for a specific student
SELECT p.*, s.first_name, s.last_name, pl.name as plan_name
FROM payments p
JOIN students s ON p.student_id = s.id
LEFT JOIN plans pl ON p.plan_id = pl.id
WHERE s.id = 1
ORDER BY p.year, p.month;

-- View current month payments (January 2026)
SELECT p.*, s.first_name, s.last_name, pl.name as plan_name, pl.price
FROM payments p
JOIN students s ON p.student_id = s.id
LEFT JOIN plans pl ON p.plan_id = pl.id
WHERE p.year = 2026 AND p.month = 1
ORDER BY s.last_name, s.first_name;

-- View trial students (no payments)
SELECT s.* 
FROM students s
LEFT JOIN payments p ON s.id = p.student_id
WHERE p.id IS NULL
ORDER BY s.enrollment_date DESC;
```

## Resetting the Database

If you need to reset and reseed:
```bash
psql -d academy_db -c "TRUNCATE payments, students, plans, disciplines RESTART IDENTITY CASCADE;"
psql -d academy_db -f seeder.sql
```

## Notes

- The seeder assumes the current date is **January 28, 2026**
- All IDs start from 1 and auto-increment
- Email addresses are formatted consistently
- Payment dates are realistic for each payment period
- The data represents a typical martial arts academy with mixed student engagement levels
- Trial students are included to demonstrate the enrollment pipeline
- Muay Thai discipline has been removed as requested
