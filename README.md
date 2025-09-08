# Sport Meet Management System

A full-stack MERN application for managing sports meet events with role-based access control.

## Features

### User Roles
- **Admin**: Full access to all features - manage houses, users, matches, and announcements
- **Score Uploader**: Can add new matches, upload match scores, mark matches as finished, post announcements
- **House Captain**: Can post announcements for their house
- **Student/Guest**: Can view house leaderboard, match scores, and announcements (read-only)

### Frontend Features
- React-based SPA with role-based routing
- Dashboard pages: House Leaderboard, Sport Meet Scoreboard, Announcements
- Forms for adding/editing houses, matches, scores, and announcements
- Clean, modern UI using Tailwind CSS
- Authentication with JWT
- Real-time updates using Socket.IO

### Backend Features
- Node.js + Express API
- MongoDB database
- JWT authentication
- RESTful endpoints for CRUD operations
- Role-based authorization
- Real-time updates with Socket.IO
- Data validation and error handling

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd SportBackend/sport-meet-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory with the following content:
```env
# Server Configuration
PORT=4000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/sport-meet

# JWT Secret (Change this in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# CORS Origin
CORS_ORIGIN=http://localhost:3000
```

4. Start MongoDB (if running locally):
```bash
# On Windows
net start MongoDB

# On macOS/Linux
sudo systemctl start mongod
```

5. Seed the database with initial data:
```bash
npm run seed
```

6. Start the backend server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

The backend will be running on `http://localhost:4000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd SportBackend/sport-meet-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be running on `http://localhost:3000`

## Demo Credentials

After seeding the database, you can use these credentials to test different roles:

### Admin
- Email: `admin@sportmeet.com`
- Password: `password123`

### Score Uploader
- Email: `score@sportmeet.com`
- Password: `password123`

### House Captains
- Red Captain: `red.captain@sportmeet.com` / `password123`
- Blue Captain: `blue.captain@sportmeet.com` / `password123`
- Green Captain: `green.captain@sportmeet.com` / `password123`
- Yellow Captain: `yellow.captain@sportmeet.com` / `password123`

### Students
- John Smith: `john@sportmeet.com` / `password123`
- Jane Doe: `jane@sportmeet.com` / `password123`
- Mike Johnson: `mike@sportmeet.com` / `password123`
- Sarah Wilson: `sarah@sportmeet.com` / `password123`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Houses
- `GET /api/houses` - Get all houses (with leaderboard)
- `GET /api/houses/:id` - Get single house
- `GET /api/houses/:id/members` - Get house members
- `GET /api/houses/:id/stats` - Get house statistics
- `POST /api/houses` - Create house (admin only)
- `PUT /api/houses/:id` - Update house (admin only)
- `DELETE /api/houses/:id` - Delete house (admin only)
- `PATCH /api/houses/:id/score` - Update house score (admin/score_uploader only)

### Matches
- `GET /api/matches` - Get all matches
- `GET /api/matches/live` - Get live matches
- `GET /api/matches/upcoming` - Get upcoming matches
- `GET /api/matches/finished` - Get finished matches
- `GET /api/matches/stats` - Get match statistics
- `GET /api/matches/:id` - Get single match
- `POST /api/matches` - Create match (admin/score_uploader only)
- `PUT /api/matches/:id` - Update match (admin/score_uploader only)
- `DELETE /api/matches/:id` - Delete match (admin only)
- `PATCH /api/matches/:id/start` - Start match (admin/score_uploader only)
- `PATCH /api/matches/:id/finish` - Finish match (admin/score_uploader only)

### Announcements
- `GET /api/announcements` - Get all announcements
- `GET /api/announcements/recent` - Get recent announcements
- `GET /api/announcements/stats` - Get announcement statistics
- `GET /api/announcements/house/:houseId` - Get announcements by house
- `GET /api/announcements/:id` - Get single announcement
- `POST /api/announcements` - Create announcement (admin/captain/score_uploader only)
- `PUT /api/announcements/:id` - Update announcement (admin or creator only)
- `DELETE /api/announcements/:id` - Delete announcement (admin or creator only)
- `PATCH /api/announcements/:id/toggle` - Toggle announcement status (admin only)

## Real-time Updates

The application uses Socket.IO for real-time updates:

### Events
- `join-house` - Join house-specific room for updates
- `leave-house` - Leave house room
- `match-update` - Real-time score updates
- `match-started` - Match status changes
- `match-finished` - Match finished
- `new-announcement` - New announcements

## Project Structure

```
SportBackend/
├── sport-meet-backend/
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── middlewares/    # Custom middlewares
│   │   ├── utils/          # Utility functions
│   │   └── server.js       # Main server file
│   ├── package.json
│   └── seed.js            # Database seeding script
├── sport-meet-frontend/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   ├── services/      # API services
│   │   └── App.jsx        # Main app component
│   └── package.json
└── README.md
```

## Technologies Used

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT (jsonwebtoken)
- Socket.IO
- bcrypt
- cors
- helmet
- express-rate-limit

### Frontend
- React
- React Router
- Tailwind CSS
- Heroicons
- Axios
- Socket.IO Client

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

