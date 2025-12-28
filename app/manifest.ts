import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Cricket Wala Play Arena',
    short_name: 'Cricket Wala',
    description: 'Book cricket practice slots at Cricket Wala Play Arena, Varanasi',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#16a34a',
    icons: [],
  }
}
