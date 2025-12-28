import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/my-bookings'],
      },
    ],
    sitemap: 'https://www.cricketwalaplayarena.in/sitemap.xml',
  }
}
