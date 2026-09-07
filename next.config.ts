import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A nodemailer natív Node modulokat használ, ezért nem szabad bundle-özni.
  serverExternalPackages: ["nodemailer"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "louvretickets-eguide.com",
        pathname: "/images/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/disclamer.html",
        destination: "/disclaimer",
        permanent: true,
      },
      {
        source: "/disclamer",
        destination: "/disclaimer",
        permanent: true,
      },
      {
        source: "/cookie.html",
        destination: "/cookie",
        permanent: true,
      },
      {
        source: "/index.html",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
