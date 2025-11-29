import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DISHA - Disaster Information Sharing & Help Alert',
  description: 'DISHA is a cutting-edge application designed to address the critical need for effective and timely disaster management. By leveraging advanced technologies like AI-powered sentiment analysis and real-time data aggregation, DISHA empowers rescue agencies to respond to disasters more efficiently and with greater accuracy.',
  generator: 'Vansh Pratap Singh',
  icons: '/disha-logo.png',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
