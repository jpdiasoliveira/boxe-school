# Backend Deployment Guide

## Current Status
- ✅ Frontend deployed on Vercel: https://boxe-school.vercel.app/
- ❌ Backend NOT deployed (needs deployment)

## Deployment Options

### Option 1: Vercel (Recommended)
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel --prod`
3. Configure environment variables in Vercel dashboard:
   - DATABASE_URL (Prisma connection string)
   - PORT (default: 3001)

### Option 2: Railway
1. Connect GitHub repository to Railway
2. Set environment variables:
   - DATABASE_URL
   - PORT=3001
3. Railway will auto-deploy

### Option 3: Render
1. Create new Web Service on Render
2. Connect GitHub repository
3. Set environment variables
4. Deploy

## Environment Variables Required
```
DATABASE_URL=postgresql://user:password@host:port/database
PORT=3001
```

## After Deployment
Update frontend API_URL in `src/context/BoxingContext.tsx`:
```typescript
const API_URL = 'https://your-backend-url.vercel.app/api';
```

## Database Setup
Run migrations:
```bash
npx prisma migrate deploy
npx prisma generate
```
