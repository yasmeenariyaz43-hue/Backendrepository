# Habit Tracker API - Backend

A robust RESTful API powering the Habit Tracker application, built with Node.js, Express, and Supabase (PostgreSQL). This API handles user authentication, habit management, progress tracking, achievements, and community challenges.

![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![Express](https://img.shields.io/badge/Express-4.18.x-blue)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)
![JWT](https://img.shields.io/badge/JWT-Authentication-orange)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 📋 Project Overview

The Habit Tracker API serves as the backend infrastructure for a comprehensive habit-building application. It provides secure, scalable, and efficient endpoints for:

- **User Management**: Registration, authentication, profile management
- **Habit Tracking**: Create, read, update, and delete habits
- **Progress Logging**: Track daily habit completions
- **Streak Calculation**: Automatic streak tracking and updates
- **Achievement System**: Award badges based on user milestones
- **Community Challenges**: Join and compete in group challenges
- **Analytics**: Generate insights and progress reports

### Key Features

- ✅ JWT-based authentication
- ✅ RESTful API architecture
- ✅ MVC pattern implementation
- ✅ Input validation and sanitization
- ✅ Error handling middleware
- ✅ Rate limiting
- ✅ CORS enabled
- ✅ Environment configuration
- ✅ Database relationship management
- ✅ Automated streak calculations
- ✅ Achievement triggers
- ✅ Challenge progress tracking

## 🛠️ Tech Stack

### Core Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18.x | JavaScript runtime |
| Express.js | 4.18.x | Web framework |
| Supabase | Latest | PostgreSQL database + Backend as a Service |
| PostgreSQL | 15.x | Relational database |

### Key Dependencies
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "@supabase/supabase-js": "^2.38.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0",
    "express-validator": "^7.0.1",
    "helmet": "^7.0.0",
    "morgan": "^1.10.0",
    "express-rate-limit": "^6.10.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
Production: https://habit-tracker-api.onrender.com
Development: http://localhost:5000
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "fullName": "John Doe"
}
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john@example.com",
    "username": "john_doe",
    "fullName": "John Doe"
  }
}
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    settings JSONB DEFAULT '{}'
);
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(50) DEFAULT '#6366F1',
    icon VARCHAR(100),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, name)
);CREATE TABLE habits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    frequency VARCHAR(50) CHECK (frequency IN ('daily', 'weekly', 'monthly')) DEFAULT 'daily',
    difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
    target_value INTEGER DEFAULT 1,
    target_unit VARCHAR(50),
    current_streak INTEGER DEFAULT 0,
    best_streak INTEGER DEFAULT 0,
    total_completions INTEGER DEFAULT 0,
    color VARCHAR(50) DEFAULT '#6366F1',
    icon VARCHAR(100),
    reminder_time TIME,
    reminder_days INTEGER[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
{
  "status": "success",
  "data": {
    "achievements": [
      {
        "id": "990e8400-e29b-41d4-a716-446655440004",
        "name": "First Step",
        "description": "Complete your first habit",
        "badge_icon": "🎯",
        "earned_at": "2024-01-10T00:00:00.000Z",
        "points": 10
      }
    ],
    "stats": {
      "earned": 1,
      "total": 20,
      "points": 10,
      "completionRate": 5
    }
  }
}
PUT /api/habits/:id
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "name": "Evening Reading",
  "description": "Read for 45 minutes before bed",
  "difficulty": "medium"
}