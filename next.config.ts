import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
