# CommerceFlow - Project Setup

## How to run
- **Backend** (`cd /c/Users/ishan/OneDrive/Desktop/New\ folder/CommerceFlow && npx tsx src/index.ts`) — Express on :4000
- **Frontend** (`cd frontend && npm run dev`) — Next.js on :3000
- **Prisma Studio** (`npx prisma studio`) — DB browser on :5555

## Database
- **SQLite** at `prisma/dev.db` (converted from PostgreSQL)
- All enums removed from schema, replaced with String
- JSON fields stored as String (JSON.stringify in seed)
- Run `npx prisma db push` to sync schema, `npx prisma db seed` to repopulate

## Test Credentials (seeded)
| Role       | Email                     | Password   |
|------------|---------------------------|------------|
| Admin      | admin@commerceflow.dev    | Admin@123  |
| Customer   | customer@example.com      | Admin@123  |
| Seller     | seller@example.com        | Admin@123  |
| Delivery   | delivery@example.com      | Admin@123  |

## API Base
- `http://localhost:4000/api/v1`

## Key fixes applied
1. PostgreSQL → SQLite migration (schema, enums, JSON fields, repository filters)
2. Backend config loads env from `env/.env.development` then root `.env` as fallback
3. Frontend homepage & navbar hardcoded category slugs updated to match seeded DB slugs
4. Cart API returns empty cart (instead of 404) for new users
5. Product lookup supports both UUID and slug

## Notes
- Redis not available (no Docker daemon); backend runs without caching/queues
- All category slugs differ from original hardcoded values — see seeded slugs below
  - `electronics`, `fashion-men`, `fashion-women`, `kids`, `home-decor`, `beauty`, `sports`, `books`, `furniture`, `automotive`, `groceries`, `kitchen`, `fitness`, `office-supplies`, `pet-supplies`
