This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Environment variables

| Variable | Used for |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public Supabase client |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side database access; also part of the session-signing key |
| `ADMIN_USERNAME`, `ADMIN_PASSWORD` | Admin dashboard sign-in (`/admin`). Changing either signs all admins out |
| `SCHOLARSHIP_COMMITTEE_PASSWORD` | Scholarship Committee sign-in (`/committee/scholarship-comments`). Changing it signs the committee out |

## Scholarship program comments

Brothers send comments at `/scholarships/input`; the Scholarship Committee reads and deletes them at
`/committee/scholarship-comments`. Neither page is linked from site navigation. Run
`db/scholarship_comments.sql` once in the Supabase SQL Editor to create the table. It has row level
security with no policies on purpose: do not add a SELECT policy, or the comments become readable with
the public key.

## Deploying (Vercel)

Vercel only builds commits whose author is a member of the Vercel team. Commits
authored as the `claude` GitHub user (`Claude <noreply@anthropic.com>`, the
default identity in Claude Code cloud sessions) are rejected within seconds with
no build log. This repo's history credits Claude as a trailer instead:

```
git commit --author="Andrew Olson <info@aoniqq.com>" ...
Co-Authored-By: Claude <noreply@anthropic.com>
```

The Scholarship Committee password (`SCHOLARSHIP_COMMITTEE_PASSWORD`) must be set
in the Production environment before the comment box is announced.

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
