import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/demos/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex" }],
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
