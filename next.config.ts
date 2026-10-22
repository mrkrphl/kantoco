import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/demos/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        // Tiara try-on: the page may only fetch its own files plus the
        // MediaPipe wasm (jsDelivr) and face model (Google storage). No other
        // network destination is reachable, so camera data can't be sent.
        source: "/demos/cgr-gowns",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "connect-src 'self' data: blob: https://cdn.jsdelivr.net https://storage.googleapis.com; frame-ancestors 'none'",
          },
          { key: "Permissions-Policy", value: "camera=(self), microphone=()" },
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
