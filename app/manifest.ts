import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Cricket Wala Play Arena Patna',
    short_name: 'CWPA Patna',
    description: 'Book cricket practice slots at Cricket Wala Play Arena Patna, located in Kanti Factory, Patna, Bihar (Not in Varanasi)',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#16a34a',
    icons: [],
  }
}
