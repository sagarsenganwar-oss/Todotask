import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components is off: every page shows private data that must be
  // read fresh from the database on each request.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
