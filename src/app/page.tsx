// AUTH_RESTRICTION_REENABLED
// Root route now redirects to login page
// To disable, restore original landing page logic

import { redirect } from 'next/navigation'
 
export default function Home() {
  redirect('/login')
}