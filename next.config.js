/** @type {import('next').NextConfig} */

// The custom domain serves the site at the root. Authentication route handlers
// need a Node runtime (Vercel or next start), so this is no longer a static export.
const basePath = '';

const nextConfig = {
  trailingSlash: true, // emit /about/index.html so Pages serves clean URLs
  images: {
    unoptimized: true
  },
  basePath,
  assetPrefix: basePath ? `${basePath}/` : '',
  // Exposed to the client so assetPath() can prefix hardcoded /public paths.
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath
  }
};

export default nextConfig;
