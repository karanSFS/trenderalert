import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components is disabled: Ant Design's CSS-in-JS reads Date.now() and Math.random()
  // while rendering, which Cache Components rejects during prerendering. See docs/ARCHITECTURE.md.
  compiler: {
    styledComponents: true,
  },
};

export default nextConfig;
