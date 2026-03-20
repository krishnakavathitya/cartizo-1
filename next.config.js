/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'cartizo-images.s3.amazonaws.com', 'res.cloudinary.com'],
    formats: ['image/webp', 'image/avif'],
  },
}

module.exports = nextConfig
