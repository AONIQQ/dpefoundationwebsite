# Fundraising email end-to-end test

Runs the real app against a throwaway Postgres and a mock Google API (`mock-google.cjs` is preloaded into `next start` and answers the OAuth and Gmail calls from local files), then exercises importing contacts, queueing a campaign, the daily cap, Gmail errors, tracking, unsubscribe, bounce and reply polling.

Never point this at the production database.

```sh
# 1. A local Postgres, then (pass DATABASE_SSL=disable below if it has no TLS):
createdb dpe && psql -d dpe -f db/neon-schema.sql -f db/email.sql

# 2. Build and start with the mock
npm run build
export MOCK_DIR=$(mktemp -d)
openssl genpkey -algorithm RSA -out $MOCK_DIR/sa.pem
GOOGLE_SERVICE_ACCOUNT_JSON=$(node -e "console.log(JSON.stringify({client_email:'t@t.iam.gserviceaccount.com',private_key:require('fs').readFileSync('$MOCK_DIR/sa.pem','utf8')}))") \
NODE_OPTIONS="--require $PWD/scripts/email-e2e/mock-google.cjs" \
DATABASE_URL=postgres://localhost/dpe ADMIN_USERNAME=admin ADMIN_PASSWORD=pw-test SESSION_SIGNING_SECRET=test-secret-123 \
EMAIL_SENDER=info@dpefoundation.org EMAIL_PUBLIC_BASE_URL=http://localhost:3100 \
npx next start -p 3100 &

# 3. Run (expects an empty email schema)
S=$MOCK_DIR node scripts/email-e2e/e2e.mjs
```
