This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Environment variables

| Variable | Used for |
| --- | --- |
| `DATABASE_URL` | Server-only Neon Postgres connection |
| `BLOB_READ_WRITE_TOKEN` | Private Vercel Blob uploads and authenticated document reads |
| `SESSION_SIGNING_SECRET` | Independent secret for signed admin and committee sessions |
| `DPE_WRITES_PAUSED` | Optional maintenance flag; `true` rejects writes |
| `ADMIN_USERNAME`, `ADMIN_PASSWORD` | Admin dashboard sign-in (`/admin`). Changing either signs all admins out |
| `SCHOLARSHIP_COMMITTEE_PASSWORD` | Scholarship Committee sign-in (`/committee/scholarship-comments`). Changing it signs the committee out |

## Scholarship program comments

Brothers send comments at `/scholarships/input`; the Scholarship Committee reads and deletes them at
`/committee/scholarship-comments`. Neither page is linked from site navigation. The Neon schema is in `db/neon-schema.sql`; migration and rollback instructions are in
`internal-docs/DPE_DATABASE_MIGRATION.md`. Documents are stored in private Vercel Blob storage; every admin download requires a valid session.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
