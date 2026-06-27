import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SongRaccoon',
  description: 'Describe a feeling. Find the songs.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: 'SongRaccoon',
    description: 'Describe a feeling. Find the songs.',
    url: 'https://songraccoon.vercel.app',
    siteName: 'SongRaccoon',
    images: [
      {
        url: 'https://songraccoon.vercel.app/api/og',
        width: 1200,
        height: 630,
        alt: 'SongRaccoon — AI music discovery',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SongRaccoon',
    description: 'Describe a feeling. Find the songs.',
    images: ['https://songraccoon.vercel.app/api/og'],
  },
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
