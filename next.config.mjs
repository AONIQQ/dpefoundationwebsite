/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // The campaign editor offers the designed appeal emails as templates.
    outputFileTracingIncludes: {
      '/api/admin/email/templates': ['./emails/*.html'],
    },
  },
};



export default nextConfig;
