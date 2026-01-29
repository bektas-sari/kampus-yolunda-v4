/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/**',
      },
      // 👇 YENİ EKLENEN: Render Backend İzni (Tüm subdomainler)
      {
        protocol: 'https',
        hostname: '**.onrender.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;