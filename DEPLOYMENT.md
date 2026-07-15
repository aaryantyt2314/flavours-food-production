# Deployment Checklist

Use this checklist for every production release.

1. Set production environment variables on the host:
   - `DATABASE_URL` with a managed Postgres URL and TLS enabled, usually `sslmode=require`
   - `DIRECT_URL` for migrations
   - `NEXTAUTH_SECRET` with at least 32 characters
   - `NEXTAUTH_URL` set to the real public site URL, never localhost
   - `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
   - `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`
   - Cloudinary and Telegram variables only if those features are enabled

2. Generate the Prisma client:
   ```bash
   npm run db:generate
   ```

3. Apply database migrations:
   ```bash
   npm run db:deploy
   ```

4. Build the standalone app:
   ```bash
   npm run build
   ```

5. Run the release gate:
   ```bash
   npm run deploy:check
   ```

6. Start production:
   ```bash
   npm start
   ```

7. Verify readiness:
   ```bash
   curl https://YOUR_DOMAIN/api/health
   ```

The app is deployment-certified only when `npm run build`, `npm run deploy:check`, and `/api/health` all pass against the production environment.
