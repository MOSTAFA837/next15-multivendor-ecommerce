const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      {
        protocol: "https",
        hostname: "**.pexels.com",
      },
    ],
  },
};

export default nextConfig;
