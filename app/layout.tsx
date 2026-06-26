import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SongRaccoon',
  description: 'AI-powered music discovery. Describe a feeling, get a playlist.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <div className="grain" />
        {children}
      </body>
    </html>
  )
}
