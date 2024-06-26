import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isDashboardRoute = createRouteMatcher(['/dashboard(.*)'])
const isAdminRoute = createRouteMatcher(['/admin(.*)'])

const authRoutes = createRouteMatcher(['/(.*)'])

export default clerkMiddleware((auth, req) => {
  // Restrict admin route to users with specific role
  if (isAdminRoute(req)) auth().protect({ role: 'org:admin' })

  // Restrict dashboard routes to signed in users
  if (isDashboardRoute(req)) auth().protect()

  if (authRoutes(req)) auth().protect()
})

export const config = {
  matcher: ['/((?!.+.[w]+$|_next).*)', '/', '/(api|trpc)(.*)']
}
