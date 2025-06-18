/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    minimumCacheTTL: 60 * 60 * 24, // 1 day
  },
  // Add this to handle CommonJS modules
  webpack: (config) => {
    // Handle @vanilla-extract/sprinkles/createUtils
    config.module.rules.push({
      test: /@vanilla-extract\/sprinkles\/createUtils/,
      type: 'javascript/auto',
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env', '@babel/preset-typescript'],
        },
      },
    });
    return config;
  },
}

export default nextConfig;
