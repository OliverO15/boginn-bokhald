import { redirect } from 'next/navigation'

export default function Home() {
  // Redirect to the main dashboard - this is now the primary interface
  redirect('/dashboard')
}
