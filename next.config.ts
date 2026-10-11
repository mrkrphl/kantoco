import type { NextConfig } from "next";

const nextConfig: NextConfig = {
<<<<<<< HEAD
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
=======
  async headers() {
    return [
      {
        source: "/demos/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex" }],
>>>>>>> c387a6e (Add unlisted Cafe 408 BF Homes sample at /demos/cafe-408-bf.)
      },
    ];
  },
};

export default nextConfig;
