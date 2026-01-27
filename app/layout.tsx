import type { Metadata, Viewport } from 'next'
import { Sora } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import FooterSection from '@/components/FooterSection'
import PageLoaderWrapper from '@/components/PageLoaderWrapper'

const sora = Sora({ 
  subsets: ['latin'],
  display: 'swap', // Optimize font loading
  weight: ['300', '400', '500', '600', '700'],
})

// SEO Metadata
export const metadata: Metadata = {
  title: {
    default: 'Cricket Wala Play Arena Patna - Book Cricket Box in Kanti Factory, Patna Bihar',
    template: '%s | Cricket Wala Play Arena Patna'
  },
  description: 'Book your cricket practice session at Cricket Wala Play Arena Patna, located in Kanti Factory, Patna, Bihar. Premium indoor cricket box with professional equipment. Easy online booking, affordable rates ₹10/hour. Open 6 AM - 12 AM.',
  keywords: [
    'cricket box patna',
    'cricket practice patna',
    'indoor cricket patna',
    'cricket wala play arena',
    'book cricket slot',
    'cricket net practice',
    'sports booking patna',
    'cricket training patna',
    'kanti factory cricket',
    'cricket box kanti factory',
    'cricket box bihar'
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
    siteName: 'Cricket Wala Play Arena Patna',
    title: 'Cricket Wala Play Arena Patna - Book Cricket Box in Kanti Factory, Patna Bihar',
    description: 'Book your cricket practice session at Cricket Wala Play Arena Patna, located in Kanti Factory, Patna, Bihar. Premium indoor cricket box, easy online booking, affordable rates ₹10/hour.',
    images: [
      {
        url: '/cwpa.jpg',
        width: 1200,
        height: 630,
        alt: 'Cricket Wala Play Arena - Indoor Cricket Box',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cricket Wala Play Arena Patna - Book Cricket Box in Kanti Factory, Patna Bihar',
    description: 'Book your cricket practice session at Cricket Wala Play Arena Patna, located in Kanti Factory, Patna, Bihar. Premium indoor cricket box, easy online booking.',
    images: ['/cwpa.jpg'],
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
              "alternateName": "Cricket Wala Play Arena Patna",
              "description": "Premium indoor cricket box for practice sessions. Located at H5V9+V8F, Mahatma Gandhi Nagar, Kanti Factory Road, Kankarbagh, Patna, Bihar 800026. Book cricket slots online with affordable rates.",
              "url": "https://www.cricketwalaplayarena.in",
              "logo": "https://www.cricketwalaplayarena.in/cwpa.jpg",
              "image": "https://www.cricketwalaplayarena.in/cwpa.jpg",
              "telephone": "+918340296635",
              "email": "cricketwala1112025@gmail.com",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "H5V9+V8F, Mahatma Gandhi Nagar, Kanti Factory Road, Kankarbagh",
                "addressLocality": "Patna",
                "addressRegion": "Bihar",
                "postalCode": "800026",
                "addressCountry": "IN"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": "25.594565",
                "longitude": "85.168188"
              },
              "openingHoursSpecification": {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                "opens": "06:00",
                "closes": "00:00"
              },
              "priceRange": "₹₹",
              "areaServed": {
                "@type": "City",
                "name": "Patna"
              },
              "sameAs": []
            })
          }}
        />
      </head>
      <body className={sora.className}>
        <PageLoaderWrapper />
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 pt-24 md:pt-28">
            {children}
          </main>
          <FooterSection />
        </div>
      </body>
    </html>
  )
}
