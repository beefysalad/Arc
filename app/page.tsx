import { auth } from '@clerk/nextjs/server'

import { HomeLanding } from '@/components/arc/home-landing'

export default async function Home() {
  const { userId } = await auth()

  return <HomeLanding isSignedIn={!!userId} />
}
