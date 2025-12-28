import type { Metadata, Viewport } from 'next'
import { Sora } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const sora = Sora({ 
  subsets: ['latin'],
  display: 'swap', // Optimize font loading
  weight: ['300', '400', '500', '600', '700'],
})

// SEO Metadata
export const metadata: Metadata = {
  title: {
    default: 'Cricket Wala Play Arena - Book Cricket Box in Varanasi',
    template: '%s | Cricket Wala Play Arena'
  },
  description: 'Book your cricket practice session at Cricket Wala Play Arena in Varanasi. Premium indoor cricket box with professional equipment. Easy online booking, affordable rates ₹10/hour. Open 6 AM - 12 AM.',
  keywords: [
    'cricket box varanasi',
    'cricket practice varanasi',
    'indoor cricket varanasi',
    'cricket wala play arena',
    'book cricket slot',
    'cricket net practice',
    'sports booking varanasi',
    'cricket training varanasi'
  ],
  authors: [{ name: 'Cricket Wala Play Arena' }],
  creator: 'Cricket Wala Play Arena',
  publisher: 'Cricket Wala Play Arena',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://www.cricketwalaplayarena.in'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://www.cricketwalaplayarena.in',
    siteName: 'Cricket Wala Play Arena',
    title: 'Cricket Wala Play Arena - Book Cricket Box in Varanasi',
    description: 'Book your cricket practice session at Cricket Wala Play Arena. Premium indoor cricket box, easy online booking, ₹10/hour.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Cricket Wala Play Arena - Indoor Cricket Box',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cricket Wala Play Arena - Book Cricket Box in Varanasi',
    description: 'Book your cricket practice session. Premium indoor cricket box, easy online booking.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code', // Add your Google Search Console verification
  },
}

export const viewport: Viewport = {
  themeColor: '#16a34a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Structured Data - LocalBusiness */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SportsActivityLocation",
              "name": "Cricket Wala Play Arena",
              "description": "Premium indoor cricket box for practice sessions in Varanasi",
              "url": "https://www.cricketwalaplayarena.in",
              "telephone": "+91-9473236395",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Near Varanasi",
                "addressLocality": "Varanasi",
                "addressRegion": "Uttar Pradesh",
                "postalCode": "221001",
                "addressCountry": "IN"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": "25.3176",
                "longitude": "82.9739"
              },
              "openingHoursSpecification": {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                "opens": "06:00",
                "closes": "24:00"
              },
              "priceRange": "₹10/hour",
              "image": "https://www.cricketwalaplayarena.in/og-image.jpg",
              "sameAs": []
            })
          }}
        />
      </head>
      <body className={sora.className}>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 pt-16 md:pt-20">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
