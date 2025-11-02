#!/usr/bin/env bash

# ROLLBACK helper (manual review required)
# This script provides guidance; it does NOT automatically restore everything.

echo "Restoring remote auth (manual steps):"
echo "1) Re-enable Stack providers in src/app/layout.tsx (uncomment StackProvider/StackTheme)."
echo "2) Re-enable src/stack/client.tsx and src/stack/server.tsx by uncommenting their contents."
echo "3) Remove local auth API routes: src/app/api/register/route.ts and src/app/api/login/route.ts (or comment)."
echo "4) Remove src/lib/auth-local.ts."
echo "5) Restore landing at '/', move dashboard back behind auth guard."
echo "6) Revert project name if needed: package.json name -> cyberlearn."
echo "7) Restore challenges from backup in ./data/challenges-backup-*.json if desired."
echo "8) Re-add any guards: useUser redirects in dashboard/page.tsx."

echo "Environment variables to restore:"
echo "  NEXT_PUBLIC_STACK_PROJECT_ID=..."
echo "  NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=..."
echo "  STACK_SECRET_SERVER_KEY=..."
echo "  SUPABASE_URL=..., SUPABASE_ANON_KEY=... (if used)"

echo "Done. Please review diffs and restart the dev server."


