import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/demos/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        // Tiara try-on. Everything the page loads comes from this site: the
        // MediaPipe wasm + face model are self-hosted under /mediapipe (copied
        // at build time). No other origin can be fetched or run, so camera
        // data has nowhere to go. 'unsafe-inline' covers Next.js's inline
        // bootstrap scripts; 'wasm-unsafe-eval' lets the face tracker compile.
        source: "/demos/cgr-gowns",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'",
              "connect-src 'self' data: blob:",
              "img-src 'self' data: blob:",
              "media-src 'self' blob: mediastream:",
              "style-src 'self' 'unsafe-inline'",
              "font-src 'self'",
              "worker-src 'self' blob:",
              "frame-src 'none'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'none'",
              "frame-ancestors 'none'",
            ].join("; "),
          },
          { key: "Permissions-Policy", value: "camera=(self), microphone=()" },
        ],
      },
      {
        // Versioned, build-time copies: safe to cache for a year.
        source: "/vendor/draco/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
      {
        // Versioned, build-time copies: safe to cache for a year.
        source: "/mediapipe/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/demos/alonday-dental/services",
        destination: "/demos/alonday-dental",
        permanent: false,
      },
      {
        source: "/demos/alonday-dental/about",
        destination: "/demos/alonday-dental",
        permanent: false,
      },
      {
        source: "/demos/alonday-dental/hours",
        destination: "/demos/alonday-dental",
        permanent: false,
      },
      {
        source: "/demos/alonday-dental/contact",
        destination: "/demos/alonday-dental",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
