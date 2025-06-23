import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  transpilePackages: ['handlebars', 'dotprompt'],
  experimental: {
    allowedDevOrigins: ['https://6000-firebase-studio-1750335091008.cluster-fkltigo73ncaixtmokrzxhwsfc.cloudworkstations.dev'],
  },
};

export default nextConfig;
