import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // assetPrefix: "/v2",
  webpack: (config, { isServer }) => {
    // Avoid bundling optional Node-only 'canvas' dependency
    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false,
      fs: false,
      path: false,
      glob: false,
    };

    // Ignore canvas module completely
    config.externals = config.externals || [];
    if (!isServer) {
      config.externals.push({
        canvas: "canvas",
      });
    }

    return config;
  },
};

export default withNextIntl(nextConfig);
