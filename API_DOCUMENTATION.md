# Sport Meet Management System - API Documentation

## Base URL
```
http://localhost:4000/api
```

## Authentication
All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## User Roles
- **admin**: Full access to all features
- **counselor**: Can manage matches and announcements
- **captain**: Can create announcements only
- **student/guest**: Read-only access

---

## Authentication Endpoints

### POST /auth/register
Register a new user
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student",
  "house": "house_id_here"
}
```

### POST /auth/login
Login user
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### GET /auth/me
Get current user info (requires authentication)

---

## House Management Endpoints

### GET /houses
Get all houses (public)

### GET /houses/:id
Get single house (public)

### POST /houses
Create new house (admin only)
```json
{
  "name": "Red House",
  "color": "#FF0000",
  "captainId": "user_id_here"
}
```

### PUT /houses/:id
Update house (admin only)
```json
{
  "name": "Red House",
  "color": "#FF0000",
  "captainId": "user_id_here"
}
```

### DELETE /houses/:id
Delete house (admin only)

### PATCH /houses/:id/score
Update house score (admin/counselor only)
```json
{
  "score": 150
}
```

---

## Match Management Endpoints

### GET /matches
Get all matches with optional filters
Query parameters:
- `status`: upcoming, live, finished
- `house`: house_id

### GET /matches/live
Get live matches (public)

### GET /matches/upcoming
Get upcoming matches (public)

### GET /matches/finished
Get finished matches (public)

### GET /matches/:id
Get single match (public)

### POST /matches
Create new match (admin/counselor only)
```json
{
  "house1": "house_id_1",
  "house2": "house_id_2",
  "matchTime": "2024-01-15T10:00:00Z",
  "sport": "Football",
  "description": "Championship Final"
}
```

### PUT /matches/:id
Update match (admin/counselor only)
```json
{
  "score1": 2,
  "score2": 1,
  "status": "finished",
  "description": "Updated description"
}
```

### DELETE /matches/:id
Delete match (admin only)

---

## Announcement Endpoints

### GET /announcements
Get all announcements with pagination
Query parameters:
- `limit`: number of announcements per page (default: 50)
- `page`: page number (default: 1)

### GET /announcements/recent
Get recent announcements (public)

### GET /announcements/:id
Get single announcement (public)

### POST /announcements
Create announcement (admin/captain/counselor only)
```json
{
  "title": "Important Update",
  "message": "Match postponed to tomorrow"
}
```

### PUT /announcements/:id
Update announcement (admin or creator only)
```json
{
  "title": "Updated Title",
  "message": "Updated message"
}
```

### DELETE /announcements/:id
Delete announcement (admin or creator only)

---

## Real-time Updates (Socket.io)

### Connection
Connect to: `http://localhost:4000`

### Events
- `join-house`: Join house-specific room for updates
- `leave-house`: Leave house room
- `score-update`: Real-time score updates
- `match-status`: Match status changes
- `announcement`: New announcements

---

## Error Responses

All error responses follow this format:
```json
{
  "message": "Error description"
}
```

Common status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error
