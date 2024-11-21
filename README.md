# FXQL (Foreign Exchange Query Language) Parser

## Overview
This project is a NestJS-based API for parsing and managing FXQL statements related to currency exchange rates.

## Local Development Requirements
- Node.js (v18 or later recommended)
- npm (v9 or later)
- PostgreSQL (v13 or later)
- Docker (optional, for containerized development)

## Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/timi-busari/fxql-parser.git
cd fxql-parser
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
Create a `.env` file in the project root with the following variables:
```
# Database Configuration
DB_HOST=localhost
DB_PORT=54321
DB_USERNAME=devusername
DB_PASSWORD=your-db-password
DB_NAME=foreign_exchange_db

# Application Configuration
PORT=3000
API_KEY=your-secret-key
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=10

# Prisma Database URL
DATABASE_URL="postgresql://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=public"
```

### 4. Initialize Database
```bash
npm run prisma:generate
npm run prisma:migrate
```

### 5. Run the Application
```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod
```

## API Documentation
API documentation is generated using Swagger and can be accessed at:
`http://localhost:3000/api-docs`

### API Endpoint
- **POST** `/fxql-statements`
  - Parses and saves FXQL statements
  - Requires `fxql-api-key` header for authentication

### FXQL Statement Format
Example: `USD-EUR { BUY 1.05 SELL 1.10 CAP 1000 }`
- Source Currency: USD
- Destination Currency: EUR
- Buy Price: 1.05
- Sell Price: 1.10
- Cap Amount: 1000

## Design Decisions and Assumptions

### Authentication
- API uses a simple API key authentication mechanism
- API key is validated through a custom guard (`ApiKeyGuard`)

### Rate Limiting
- Implemented using `express-rate-limit`
- Configurable window and max request limits
- Default: 10 requests per 15 minutes

### Validation
- Uses `class-validator` for input validation
- Whitelist strategy prevents unknown properties
- Custom exception factory for validation errors

### Database
- Uses Prisma ORM for database interactions
- Supports PostgreSQL
- Migrations managed through Prisma CLI

## Security Considerations
- Helmet middleware for adding HTTP headers
- Input validation and sanitization
- Rate limiting to prevent abuse

## Testing
```bash
# Run unit tests
npm run test

# Run test coverage
npm run test:cov

```

## Deployment
- Configured for easy deployment with npm scripts
- Includes database migration step in production start script

## Troubleshooting
- Ensure all environment variables are correctly set
- Check database connection parameters
- Verify API key configuration

## License
UNLICENSED - Private Project

## Contact
Timi Busari