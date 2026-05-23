/** @type {import('next').NextConfig} */

// When building in the GitHub Pages workflow, the site is served from
// https://<user>.github.io/<repo>/, so assets need to be prefixed with the
// repo name. Locally (npm run dev / build) this stays empty so everything
// works at the root.
const isGithubPages = process.env.GITHUB_PAGES === 'true';
const repoName = 'tj-consulting-hub';
const basePath = isGithubPages ? `/${repoName}` : '';

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
