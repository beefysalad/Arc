import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'
import { QueryProvider } from './providers/query-provider'
import { ThemeProvider } from './providers/theme-provider'

import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: {
    default: 'Arc',
    template: '%s · Arc',
  },
  description: 'Arc is a Telegram movie tracking bot with a living taste dashboard.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ClerkProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <QueryProvider>
              {children}
              <Toaster richColors position="bottom-center" />
            </QueryProvider>
          
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}
