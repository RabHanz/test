/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['localhost'],
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@slack/web-api', 'googleapis', 'google-auth-library'],
    memoryBasedWorkersCount: true,
  },
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000,
    pagesBufferLength: 5,
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      // Don't resolve 'fs' module on the client to prevent this error on build --> Error: Can't resolve 'fs'
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        http2: false,
        events: false,
        os: false,
        path: false,
        crypto: false,
        stream: false,
        util: false,
        buffer: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        constants: false,
        module: false,
        process: false,
      };
    }

    // Optimize webpack configuration
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        minimize: true,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 244000,
          cacheGroups: {
            default: false,
            vendors: false,
            commons: {
              name: 'commons',
              chunks: 'all',
              minChunks: 2,
            },
            lib: {
              test: /[\\/]node_modules[\\/]/,
              chunks: 'all',
              name(module) {
                const match = module.context?.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/);
                if (!match) return 'vendor';
                const packageName = match[1];
                return `npm.${packageName.replace('@', '')}`;
              },
            },
          },
        },
      };
    }

    // Add a rule to handle node: protocol imports
    config.module.rules.push({
      test: /\.m?js$/,
      resolve: {
        fullySpecified: false,
      },
    });

    // Add transpilation for problematic modules
    config.module.rules.push({
      test: /\.(js|mjs|jsx|ts|tsx)$/,
      include: [
        /node_modules\/@slack\/web-api/,
        /node_modules\/googleapis/,
        /node_modules\/google-auth-library/,
        /node_modules\/gcp-metadata/,
        /node_modules\/google-logging-utils/,
      ],
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['next/babel'],
          plugins: ['@babel/plugin-proposal-private-property-in-object'],
        },
      },
    });

    return config;
  },
};

module.exports = nextConfig; 