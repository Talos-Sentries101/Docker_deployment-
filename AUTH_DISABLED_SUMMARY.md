/* AUTH_DISABLED_TEMPORARILY (Supabase/StackAuth)
   REASON: Temporarily disabling remote auth for local testing. */

Files changed (auth-related):

- src/stack/server.tsx — commented out StackServerApp init
- src/stack/client.tsx — commented out StackClientApp init
- src/app/layout.tsx — commented out StackProvider/StackTheme
- src/app/page.tsx — replaced auth landing with dashboard
- src/app/dashboard/page.tsx — commented auth guard, added guest fallback
- src/app/dashboard/components/Header.tsx — removed UserButton, logo -> /landing
- src/app/ctf-submission/page.tsx — guest-mode info message

New local auth modules:

- src/app/api/register/route.ts — local Postgres register
- src/app/api/login/route.ts — local Postgres login
- src/lib/auth-local.ts — JWT sign/verify (temporary)

Rollback steps (high level):

1) Re-enable provider/clients in the files above by uncommenting code
2) Remove temporary local auth files (or keep commented)
3) Restore env vars for remote auth
4) Restore route guards in dashboard/page.tsx
5) Move `/` back to the original landing and adjust header/nav


