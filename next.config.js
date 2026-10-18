/** @type {import('next').NextConfig} */

// The custom domain tjconsulting.org serves the site at the root,
// including when built by the GitHub Pages workflow.
const basePath = '';

const nextConfig = {
  output: 'export', // static HTML export -> ./out
  trailingSlash: true, // emit /about/index.html so Pages serves clean URLs
  images: {
    unoptimized: true // required: Pages has no image-optimization server
  },
  basePath,
  assetPrefix: basePath ? `${basePath}/` : '',
  // Exposed to the client so assetPath() can prefix hardcoded /public paths.
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath
  }
};

export default nextConfig;
