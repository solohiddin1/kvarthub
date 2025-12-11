# Kvarthub - Installation & Setup Guide

A Django REST Framework project for managing apartment/property listings with user authentication and Google OAuth integration.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Set Up Python Virtual Environment](#2-set-up-python-virtual-environment)
  - [3. Install Dependencies](#3-install-dependencies)
  - [4. Configure Environment Variables](#4-configure-environment-variables)
  - [5. Database Setup](#5-database-setup)
  - [6. Run the Development Server](#6-run-the-development-server)
- [Project Structure](#project-structure)
- [Key Features](#key-features)
- [API Documentation](#api-documentation)
- [Development](#development)
  - [Running Tests](#running-tests)
  - [Database Migrations](#database-migrations)
- [Environment-Specific Notes](#environment-specific-notes)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have installed:

- **Python 3.8+** - [Download](https://www.python.org/downloads/)
- **pip** - Python package manager (comes with Python)
- **PostgreSQL 12+** - [Download](https://www.postgresql.org/download/) (or use SQLite for development)
- **Git** - [Download](https://git-scm.com/)

Optional but recommended:
- **PostgreSQL GUI** - pgAdmin or DBeaver for easier database management
- **REST Client** - Postman or Insomnia for API testing

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/solohiddin1/kvarthub.git
cd kvarthub
```

### 2. Set Up Python Virtual Environment

#### On Linux/macOS:
```bash
cd back
python3 -m venv venv
source venv/bin/activate
```

#### On Windows (PowerShell):
```bash
cd back
python -m venv venv
venv\Scripts\Activate.ps1
```

#### On Windows (CMD):
```bash
cd back
python -m venv venv
venv\Scripts\activate.bat
```

### 3. Install Dependencies

The project has two requirements files to support different operating systems:

**For Linux/macOS:**
```bash
pip install -r requirements-cross-platform.txt
```

**For Windows:**
```bash
pip install -r requirements-cross-platform.txt
```

The `requirements-cross-platform.txt` file automatically installs the correct database driver for your OS:
- **Linux/macOS**: Uses `psycopg2-binary` (pre-compiled)
- **Windows**: Uses `psycopg2` (built from source)

If you want to use simple package names without version pinning:
```bash
pip install -r requirements2.txt
```

### 4. Configure Environment Variables

Create a `.env` file in the `back/` directory with the following variables:

```env
# Django Settings
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_NAME=kvarthub_db
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432

# Email Configuration (for Sendinblue/SIB)
SIB_API_KEY=your-sib-api-key

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# JWT Settings
JWT_SECRET_KEY=your-jwt-secret-key
JWT_EXPIRATION_HOURS=24
```

### 5. Database Setup

#### Using PostgreSQL:

1. **Create database and user:**
```sql
CREATE DATABASE kvarthub_db;
CREATE USER postgres WITH PASSWORD 'your_password';
ALTER ROLE postgres SET client_encoding TO 'utf8';
ALTER ROLE postgres SET default_transaction_isolation TO 'read committed';
ALTER ROLE postgres SET default_transaction_deferrable TO on;
ALTER ROLE postgres SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE kvarthub_db TO postgres;
```

2. **Run migrations:**
```bash
cd back
python manage.py migrate
```

#### Using SQLite (Development Only):

SQLite is configured by default in development. Just run migrations:
```bash
cd back
python manage.py migrate
```

### 6. Run the Development Server

```bash
cd back
python manage.py runserver
```

The API will be available at: `http://localhost:8000`

API Documentation (Swagger UI): `http://localhost:8000/api/schema/swagger/`

---

## Project Structure

```
kvarthub/
├── back/                          # Django backend
│   ├── apps/
│   │   ├── users/                # User authentication & profile management
│   │   │   ├── models.py         # User model
│   │   │   ├── views.py          # User endpoints
│   │   │   ├── serializers.py    # User serializers
│   │   │   └── services/         # Google OAuth service
│   │   │
│   │   └── shared/               # Shared models (Districts, Regions, etc)
│   │       ├── models.py
│   │       ├── views.py
│   │       └── serializers.py
│   │
│   ├── config/
│   │   └── config.py             # Environment configuration
│   │
│   ├── kvarthub/                 # Project settings
│   │   ├── settings.py           # Django settings
│   │   ├── urls.py               # URL routing
│   │   └── wsgi.py               # WSGI configuration
│   │
│   ├── manage.py                 # Django management script
│   ├── requirements-cross-platform.txt  # Cross-platform dependencies
│   └── requirements2.txt          # Simple package names
│
└── README.md                      # This file
```

## Key Features

- ✅ **User Authentication** - JWT & Session-based auth
- ✅ **Google OAuth Integration** - Social login support
- ✅ **RESTful API** - Complete REST API with DRF
- ✅ **API Documentation** - Auto-generated Swagger/OpenAPI docs
- ✅ **Database Support** - PostgreSQL with automatic driver selection
- ✅ **Email Service** - Sendinblue (SIB) integration
- ✅ **Admin Panel** - Django Jazzmin admin interface
- ✅ **Filtering & Pagination** - Advanced filtering and pagination
- ✅ **Celery Support** - Async task processing ready

## API Documentation

Once the server is running:

1. **Swagger UI**: `http://localhost:8000/api/schema/swagger/`
2. **ReDoc**: `http://localhost:8000/api/schema/redoc/`
3. **OpenAPI JSON**: `http://localhost:8000/api/schema/openapi.json`

## Development

### Creating a Superuser

```bash
python manage.py createsuperuser
```

Then access the admin panel at: `http://localhost:8000/admin/`

### Running Tests

```bash
python manage.py test
```

Or with coverage:
```bash
coverage run --source='.' manage.py test
coverage report
```

### Database Migrations

Create migrations after model changes:
```bash
python manage.py makemigrations
python manage.py migrate
```

### Loading Fixtures

Load initial data (regions, districts):
```bash
python manage.py loaddata apps/shared/fixtures/regions.json
python manage.py loaddata apps/shared/fixtures/districts.json
```

### Celery Tasks (Optional)

To run Celery worker for async tasks:
```bash
celery -A kvarthub worker -l info
```

---

## Environment-Specific Notes

### Windows Developers

- Use `python` instead of `python3`
- Use `venv\Scripts\activate` instead of `source venv/bin/activate`
- The `requirements-cross-platform.txt` automatically handles PostgreSQL driver installation

### macOS Developers

If you encounter issues installing `psycopg2-binary`:
```bash
LDFLAGS=-L/usr/local/opt/openssl/lib CPPFLAGS=-I/usr/local/opt/openssl/include pip install psycopg2-binary
```

### Linux Developers

Ensure PostgreSQL development headers are installed:

**Ubuntu/Debian:**
```bash
sudo apt-get install postgresql postgresql-contrib python3-dev libpq-dev
```

**Fedora/RHEL:**
```bash
sudo dnf install postgresql-devel python3-devel
```

---

## Troubleshooting

### Issue: `ModuleNotFoundError: No module named 'django'`

**Solution**: Ensure virtual environment is activated and dependencies are installed:
```bash
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements-cross-platform.txt
```

### Issue: `psycopg2` installation fails on Windows

**Solution**: Use pre-compiled `psycopg2-binary`:
```bash
pip install psycopg2-binary
```

### Issue: Database connection refused

**Solution**: 
1. Verify PostgreSQL is running
2. Check `.env` file has correct credentials
3. Ensure database exists:
```bash
psql -U postgres -c "CREATE DATABASE kvarthub_db;"
```

### Issue: `SECRET_KEY not found` error

**Solution**: Create `.env` file in `back/` directory with required environment variables (see step 4 above)

### Issue: Port 8000 already in use

**Solution**: Use a different port:
```bash
python manage.py runserver 8001
```

---

## Contributing

1. Create a new branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Run tests: `python manage.py test`
4. Commit: `git commit -am 'Add new feature'`
5. Push: `git push origin feature/your-feature`

---

## Support

For issues or questions:
- Check existing [GitHub Issues](https://github.com/solohiddin1/kvarthub/issues)
- Create a new issue with detailed description

---

## License

This project is proprietary. All rights reserved.

---

**Happy Coding!** 🚀
