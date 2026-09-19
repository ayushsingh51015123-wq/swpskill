# SkillSwap Backend
Express API for SkillSwap gigs and bookings.

## Local
```bash
npm install
npm start
```
API: http://localhost:3000

Endpoints:
- GET /api/health
- GET/POST /api/gigs
- GET /api/bookings
- POST /api/bookings
- PATCH /api/bookings/:id/status
- GET /api/bookings/:id

Bookings persist to data.json.