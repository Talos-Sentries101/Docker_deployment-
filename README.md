## Letushack (temporary rename from "cyberlearn")

/* PROJECT_RENAME: cyberlearn -> Letushack (temporary)
   ROLLBACK_INSTRUCTIONS: Revert package.json name and any renamed references. */

Temporary local auth mode is enabled:

- Remote auth (StackAuth) is commented out.
- Local Postgres endpoints: `POST /api/register`, `POST /api/login`.
- **Leaderboard feature is now fully implemented** at `/leaderboard`.
- Root (`/`) redirects to login; Dashboard at `/dashboard`; Landing at `/landing`.

### Getting Started

```bash
npm install
npm run init:db              # Initialize database and tables
npm run seed:leaderboard     # (Optional) Seed with test data
npm run dev
```

Open http://localhost:3000 to view. Root redirects to login page.

### Test Local Auth

```bash
# register
curl -s -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"roll_number":"r1","password":"pass1234","name":"John Doe"}'

# login
curl -s -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"roll_number":"r1","password":"pass1234"}'
```

### Database Schema

The application uses two main tables:

**users** table:
- `id` (SERIAL PRIMARY KEY)
- `roll_number` (VARCHAR UNIQUE)
- `password_hash` (VARCHAR)
- `name` (VARCHAR)
- `ip_address`, `last_activity`, `created_at`

**points** table:
- `roll_number` (PRIMARY KEY, FOREIGN KEY → users.roll_number)
- `xl1, xl2, xl3, xl4, xl5` (INT DEFAULT 0) - XL challenge points
- `cl1, cl2, cl3, cl4, cl5` (INT DEFAULT 0) - CL challenge points

### Leaderboard Feature

The leaderboard dynamically ranks users based on their total score:
- **Total Score** = sum of all 10 point columns (xl1-5 + cl1-5)
- Sorted by score (DESC), then by name (ASC)
- Highlights top 3 users with gold, silver, bronze styling
- Shows current user's rank and position
- Auto-refreshes on page load

**API Endpoint**: `GET /api/leaderboard`

**Seed Test Data**:
```bash
npm run seed:leaderboard
```
This creates 10 sample users with varying scores for testing.

### Environment Variables

Required `.env.local` configuration:
```bash
# PostgreSQL Connection
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=your_password_here
PGDATABASE=letushack_db

# JWT Configuration
JWT_SECRET_LOCAL="your-super-secret-key-change-in-production"
```

### Rollback Helper

```bash
bash scripts/restore-auth.sh
```