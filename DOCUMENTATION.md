# Boginn Bókhald - Documentation

A modern web application for managing archery club bookkeeping and member administration.

## Table of Contents
- [Overview](#overview)
- [Installation](#installation)
- [User Guide](#user-guide)
- [API Reference](#api-reference)
- [Development](#development)
- [Troubleshooting](#troubleshooting)

## Overview

Boginn Bókhald replaces Excel-based bookkeeping with a modern web interface that automates calculations and provides clear financial insights for archery club management.

### Key Features
- **Program Management**: Configure different training programs with pricing
- **Registration Tracking**: Track student registrations and calculate revenue
- **Financial Automation**: Automatic calculations for revenue, venue costs, and instructor wages
- **Instructor Management**: Track instructor schedules and wage calculations
- **Reporting**: Generate financial summaries and trend analysis

### Architecture
- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: PostgreSQL via Supabase with Prisma ORM
- **Deployment**: Vercel-ready (or any Node.js hosting)

## Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (for database)

### Setup Steps

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd boginn-bokhald
   npm install
   ```

2. **Database Setup**
   - Create a Supabase project
   - Copy your database URLs from Supabase dashboard
   - Create `.env` file:
   ```env
   DATABASE_URL="your_supabase_pooled_connection_url"
   DIRECT_URL="your_supabase_direct_connection_url"
   ```

3. **Initialize Database**
   ```bash
   npx prisma db push
   npm run db:seed
   ```

4. **Start Development**
   ```bash
   npm run dev
   ```
   
   Application will be available at http://localhost:3000

## User Guide

### Getting Started

1. **Create a Year**
   - Navigate to "Years & Programs"
   - Click "Add New Year"
   - Enter the year (e.g., 2025)

2. **Configure Programs**
   - Select your created year
   - Click "Manage Programs"
   - Add programs for each training type:
     - Adult Training (Fullorðins)
     - Kids Training (Krakka)
     - U16 Training
     - U21 Training
     - Monthly Pass (Mánaðarkort)
     - Foundation Course (Grunnnámskeið)

3. **Set Pricing**
   - Full registration price
   - Half registration price (optional)
   - Subscription price (for programs that offer it)
   - Venue split percentage (typically 50% to Bogfimisetrið)

### Program Types

#### Seasonal Programs
- **Adult Training**: Standard adult archery training
- **Kids Training**: Children's programs with instructor supervision
- **U16/U21**: Age-specific training programs
- **Structure**: Spring (Vor), Summer (Sumar), Fall (Haust) seasons

#### Monthly Programs
- **Monthly Pass**: Ongoing membership access
- **Foundation Course**: Basic training courses
- **Structure**: Month-by-month billing

### Financial Calculations

The system automatically calculates:

1. **Revenue** = (Full registrations × Full price) + (Half registrations × Half price) + (Subscription registrations × Subscription price)

2. **Venue Costs** = Revenue × Venue split percentage

3. **Instructor Wages** = Sessions × Hours per session × Hourly wage

4. **Net Profit** = Revenue - Venue costs - Instructor wages

### Workflow Example

Based on your Excel data, here's a typical workflow:

1. **Setup Year 2025**
2. **Configure U16 Training**:
   - Full Price: 50,000 ISK
   - Venue Split: 50%
   - Session Hours: 1.5h
3. **Add Instructor** (Valgerður, 3,250 ISK/hour)
4. **Enter Registrations**: 13 full, 1 half for Spring season
5. **System Calculates**:
   - Revenue: 675,000 ISK
   - Venue Cost: 337,500 ISK  
   - Instructor Wages: Based on sessions worked
   - Net Profit: Revenue - Costs

## API Reference

### Years

#### GET /api/years
Get all years with programs

#### POST /api/years
Create a new year
```json
{
  "year": 2025
}
```

### Programs

#### GET /api/years/[yearId]/available-program-types
Get program types not yet configured for a year

#### POST /api/years/[yearId]/programs
Create a program for a year
```json
{
  "programTypeId": "string",
  "fullPrice": 50000,
  "halfPrice": 25000,
  "subscriptionPrice": 61500,
  "venueSplitPercent": 50.0
}
```

#### GET /api/programs/[programId]
Get program details

#### PUT /api/programs/[programId]
Update program pricing

#### DELETE /api/programs/[programId]
Delete program (if no registrations exist)

### Database Schema

Key models:
- **Year**: Container for annual programs
- **ProgramType**: Template for program types (Adult, Kids, etc.)
- **Program**: Yearly instance of a program type with pricing
- **Instructor**: Staff with hourly wages
- **Registration**: Student enrollments with counts
- **Season**: Time periods for seasonal programs

## Development

### Project Structure
```
src/
  app/                  # Next.js app directory
    api/               # API routes
    years/             # Year management pages
    globals.css        # Global styles
  lib/
    prisma.ts          # Database client
prisma/
  schema.prisma        # Database schema
  seed.ts             # Initial data
```

### Key Technologies
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type safety
- **Prisma**: Type-safe database ORM
- **Tailwind CSS**: Utility-first styling
- **Supabase**: Managed PostgreSQL hosting

### Development Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run db:seed      # Seed database with initial data
npx prisma studio    # Open database browser
npx prisma generate  # Regenerate Prisma client
```

### Database Operations
```bash
# Reset database (development only)
npx prisma db push --force-reset

# Create migration
npx prisma migrate dev --name description

# Deploy to production
npx prisma migrate deploy
```

## Troubleshooting

### Common Issues

#### Database Connection Error
```
Error: P1000: Authentication failed against database server
```
**Solution**: Check your `.env` file has correct Supabase credentials

#### Prisma Client Not Generated
```
PrismaClientInitializationError: Prisma Client could not locate the Query Engine
```
**Solution**: Run `npx prisma generate`

#### Development Server Port Conflict
```
Port 3000 is in use, using port 3001
```
**Solution**: This is normal, just use the displayed port

#### Seeding Fails
```
Invalid `prisma.instructor.upsert()` invocation
```
**Solution**: Ensure database is migrated: `npx prisma db push`

### Performance Tips

1. **Database Queries**: Use Prisma's `include` for related data
2. **Caching**: Consider Redis for production
3. **Images**: Optimize with Next.js Image component
4. **Bundle Size**: Monitor with `npm run build`

### Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **Database**: Use connection pooling for production
3. **Validation**: Always validate API inputs
4. **Authentication**: Add user auth for production use

### Deployment

#### Vercel (Recommended)
1. Connect GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

#### Manual Deployment
1. Build: `npm run build`
2. Set production environment variables
3. Run: `npm start`

---

*For additional support or feature requests, please refer to the project repository or contact the development team.*