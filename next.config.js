/** @type {import('next').NextConfig} */

// FE-7: whitelist the product image CDN (DigitalOcean Spaces) for next/image.
// Defaults to the Spaces host; honours NEXT_PUBLIC_CDN_BASE_URL so a different
// bucket/CDN can be configured without code changes.
const cdnBase =
  process.env.NEXT_PUBLIC_CDN_BASE_URL ||
  "https://bucket-for-bazaar.fra1.cdn.digitaloceanspaces.com";

// Derive protocol + host + port from the CDN base so the pattern matches the
// ACTUAL URL — including http://localhost:8000 in local-storage dev (previously
// hardcoded https with no port, so next/image rejected dev images and the page
// that rendered them crashed).
let cdnPattern;
try {
  const u = new URL(cdnBase);
  cdnPattern = {
    protocol: u.protocol.replace(":", ""),
    hostname: u.hostname,
    ...(u.port ? { port: u.port } : {}),
  };
} catch {
  cdnPattern = { protocol: "https", hostname: "bucket-for-bazaar.fra1.cdn.digitaloceanspaces.com" };
}

const nextConfig = {
  images: {
    remotePatterns: [
      cdnPattern,
      // DigitalOcean Spaces direct (non-CDN) origin, just in case.
      { protocol: "https", hostname: "*.digitaloceanspaces.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "cdn.discordapp.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
};

module.exports = nextConfig;
