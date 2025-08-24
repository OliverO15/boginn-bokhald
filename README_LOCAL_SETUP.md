# 🏹 Boginn Bókhald - Local Development Setup

This guide helps you set up the application locally using Docker + PM2 for easy development without opening terminals every time.

## Prerequisites

- **Docker Desktop** installed and running
- **Node.js** (v18 or higher) 
- **PM2** installed globally: `npm install -g pm2`

## Quick Start

### 1. Start Everything
```bash
npm run local:start
```

This will:
- Start PostgreSQL database in Docker
- Run database migrations and seeding
- Build the application for production
- Start the app with PM2

### 2. Access the Application
- **Web App**: http://localhost:3003
- **Database Admin (PgAdmin)**: http://localhost:5051
  - Email: `admin@example.com`
  - Password: `admin`

### 3. Stop Everything
```bash
npm run local:stop
```

## Available Scripts

### Database Management
```bash
npm run db:up          # Start database container
npm run db:down        # Stop database container  
npm run db:reset       # Reset database (removes all data)
npm run db:migrate     # Run migrations
npm run db:seed        # Seed database with sample data
npm run db:setup       # Full database setup (migrate + generate + seed)
```

### Application Management
```bash
npm run build:prod     # Build application for production
npm run pm2:start      # Start app with PM2
npm run pm2:stop       # Stop PM2 app
npm run pm2:restart    # Restart PM2 app
npm run pm2:logs       # View application logs
```

### Complete Workflows
```bash
npm run local:start    # Complete startup (database + app)
npm run local:stop     # Complete shutdown
npm run local:restart  # Restart everything
npm run deploy         # Quick deployment workflow
```

## Development Workflow

### For Daily Use:
1. **Start**: `npm run local:start`
2. **Work on your code**
3. **Rebuild & Restart**: `npm run build:prod && npm run pm2:restart`  
4. **View Logs**: `npm run pm2:logs`
5. **Stop**: `npm run local:stop` (when done for the day)

### For Development with Hot Reload:
```bash
npm run db:up    # Start database only
npm run dev      # Start development server with hot reload
```

## Database Access

### Via PgAdmin (Web UI):
- URL: http://localhost:5051
- Email: `admin@example.com` / Password: `admin`
- Connect to server:
  - Host: `db` (or `localhost` if accessing from host machine)
  - Port: `5432` (internal container port)
  - Username: `archery`
  - Password: `archery`
  - Database: `archery`

### Via Command Line:
```bash
docker exec -it archery-db psql -U archery -d archery
```

## Troubleshooting

### Database Connection Issues:
```bash
npm run db:reset     # Reset database completely
npm run db:setup     # Re-setup database
```

### PM2 Issues:
```bash
pm2 kill            # Kill all PM2 processes
npm run pm2:start   # Restart
```

### Port Conflicts:
- App runs on port **3003**
- Database on port **5433**  
- PgAdmin on port **5051**

### View All Services:
```bash
docker ps                    # See running containers
pm2 status                   # See PM2 processes
npm run pm2:logs            # See application logs
```

## File Structure

```
├── ecosystem.config.js      # PM2 configuration
├── docker-compose.yml       # Docker services setup
├── scripts/
│   ├── start.sh            # Startup script
│   └── stop.sh             # Shutdown script
├── .env                    # Environment variables
├── .env.local              # Local environment overrides
└── README_LOCAL_SETUP.md   # This file
```

## Environment Variables

The application uses these environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `DIRECT_URL`: Direct database connection (for migrations)
- `NODE_ENV`: Environment mode (production for PM2)

These are configured automatically in the local setup.