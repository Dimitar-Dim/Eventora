# Eventora

A modern, full-stack ***REMOVED***s to discover events, purchase tickets, manage seating arrangements, and provides organizers with comprehensive event management tools.

## Features

### For Attendees
- **Event Discovery** - Browse and search events by genre, date, and location
- **Ticket Purchase** - Secure ticket booking with multiple payment options
- **Seat Selection** - Interactive seating layout for venue selection
- **QR Code Tickets** - Generate and manage digital tickets with QR codes
- **User Profiles** - Track bookings, manage preferences, and personal information
- **Email Notifications** - Automatic confirmation and reminder emails

### For Organizers
- **Event Management** - Create, edit, and manage events with detailed information
- **Seating Configuration** - Support for multiple layout types (Floor, Balcony, Mixed)
- **Inventory Management** - Track available tickets and standing room capacity
- **Revenue Analytics** - Dashboard with ticket sales and revenue metrics
- **Attendee Management** - Access to attendee information and check-in capabilities

### Platform Features
- **JWT Authentication** - Secure token-based authentication
- **Email Service** - Email notifications for confirmations and updates
- **PDF Export** - Generate ticket and confirmation documents
- **Real-time Updates** - WebSocket integration for live data
- **Responsive Design** - Mobile-friendly interface with Tailwind CSS
- **End-to-End Testing** - Comprehensive Cypress test suite

## Architecture

### Tech Stack

**Backend:**
- Java 21
- Spring Boot 3.5.5
- Spring Security (JWT)
- Spring Data JPA / Hibernate
- PostgreSQL
- Flyway (Database Migrations)
- ZXing (QR Code Generation)
- OpenPDF (PDF Generation)

**Frontend:**
- Next.js 14.2.15
- React 18
- TypeScript 5
- Tailwind CSS
- Radix UI Components
- Recharts (Data Visualization)
- Cypress (E2E Testing)

**DevOps:**
- Docker & Docker Compose
- Gradle (Java Build)

## Prerequisites

Before you begin, ensure you have installed:
- **Java 21** or later
- **Node.js 18** or later (for frontend)
- **Docker** and **Docker Compose**
- **PostgreSQL 15+** (or use Docker)
- **Git**

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Dimitar-Dim/Eventora.git
cd Eventora
```

### 2. Backend Setup

#### Option A: Using Docker Compose (Recommended)

```bash
# Start the database container
docker-compose up -d database-container

# Navigate to backend
cd Backend/Eventora

# Build and run the backend
./gradlew bootRun
```

The backend will be available at `http://localhost:8080`

#### Option B: Local PostgreSQL

1. Create a PostgreSQL database:
```sql
CREATE DATABASE eventora;
```

2. Update `Backend/Eventora/src/main/resources/application.properties` with your database credentials

3. Build and run:
```bash
cd Backend/Eventora
./gradlew bootRun
```

### 3. Frontend Setup

```bash
cd Frontend

# Install dependencies
npm install

# Run d***REMOVED***ver
npm run dev
```

The frontend will be available at `http://localhost:3000`

## 🐳 Docker Deployment

Run the entire stack with Docker Compose:

```bash
docker-compose up --build
```

This will start:
- PostgreSQL database
- Spring Boot backend API
- Next.js frontend application

Access the application at `http://localhost:3000`

## Testing

### Backend Tests
```bash
cd Backend/Eventora
./gradlew test
```

### Frontend E2E Tests
```bash
cd Frontend

# Open Cypress test runner
npm run cypress:open

# Run tests headless
npm run test:e2e
```

### Test Coverage
```bash
cd Backend/Eventora
./gradlew jacocoTestReport
```

Coverage reports available in `build/reports/jacoco/test/html/index.html`

## 📁 Project Structure

```
Eventora/
├── Backend/
│   └── Eventora/
│       ├── src/
│       │   ├── main/
│       │   │   ├── java/com/dimitar/     # Java source code
│       │   │   └── resources/             # Configuration files
│       │   └── test/                      # Unit tests
│       ├── build.gradle                   # Gradle dependencies
│       └── Dockerfile
├── Frontend/
│   ├── src/
│   │   ├── app/                          # Next.js pages and routes
│   │   ├── components/                   # React components
│   │   ├── api/                          # API service calls
│   │   ├── context/                      # React context (Auth, etc.)
│   │   ├── types/                        # TypeScript interfaces
│   │   └── utils/                        # Utility functions
│   ├── cypress/                          # E2E tests
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yaml                   # Docker Compose configuration
├── database-container.yml                # Database container setup
```

## Authentication

- JWT-based authentication
- Secure password encryption with Spring Security
- Access token with configurable expiration
- Refresh token mechanism for extended sessions
## 🛡️ Security

**Important:** This project handles user data and payment information. Please review [SECURITY.md](SECURITY.md) for:
- Environment variable configuration
- Credentials management
- Secrets rotation procedures
- Production deployment security guidelines

Do NOT commit secrets to version control. Use `.env` files and environment variables instead.
## Database Schema

Key entities:
- **Users** - User accounts and profiles
- **Events** - Event details and metadata
- **Tickets** - Ticket purchases and reservations
- **Seats** - Seating arrangements and availability
- **Orders** - Purchase orders and transactions

Database migrations are managed by Flyway and applied automatically on application startup.

## Configuration

### Backend Configuration Files
- `application.properties` - Main configuration
- `application-dev.yml` - Development environment settings
- `application-test.properties` - Test environment settings

### Environment Variables
Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Then edit `.env` with your actual values:

```env
DATABASE_URL=jdbc:postgresql://localhost:5432/eventora
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_secure_password
JWT_SECRET=your_secure_jwt_secret_min_32_chars
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your_app_specific_password
FRONTEND_URL=http://localhost:3000
```

⚠️ **Important:** Never commit `.env` file to version control. See [SECURITY.md](SECURITY.md) for detailed security setup instructions.

## Styling

The frontend uses:
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Unstyled, accessible component primitives
- **Custom CSS Modules** - For component-specific styles

## Reporting Issues

Found a bug? Please create an issue with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots/logs if applicable
- Your environment details

## License

This project is licensed under the GPL v3 License - see the [LICENSE](LICENSE) file for details.

## Author

**Dimitar Dimitrov**
- GitHub: [@Dimitar-Dim](https://github.com/Dimitar-Dim)