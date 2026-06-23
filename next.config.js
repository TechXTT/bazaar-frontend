/** @type {import('next').NextConfig} */

// FE-7: whitelist the product image CDN (DigitalOcean Spaces) for next/image.
// Defaults to the Spaces host; honours NEXT_PUBLIC_CDN_BASE_URL so a different
// bucket/CDN can be configured without code changes.
const cdnBase =
  process.env.NEXT_PUBLIC_CDN_BASE_URL ||
  "https://bucket-for-bazaar.fra1.cdn.digitaloceanspaces.com";

let cdnHost;
try {
  cdnHost = new URL(cdnBase).hostname;
} catch {
  cdnHost = "bucket-for-bazaar.fra1.cdn.digitaloceanspaces.com";
}

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: cdnHost },
      // DigitalOcean Spaces direct (non-CDN) origin, just in case.
      { protocol: "https", hostname: "*.digitaloceanspaces.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "cdn.discordapp.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
};

module.exports = nextConfig;
