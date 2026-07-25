/** @type {import('next').NextConfig} */
const supabasePatterns = (() => {
   const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
   if (!url) return [];
   try {
      const { protocol, hostname } = new URL(url);
      const p = protocol.replace(":", "");
      // Public (getPublicUrl), signées, transformation d’image — même host que NEXT_PUBLIC_SUPABASE_URL
      const pathnames = [
         "/storage/v1/object/public/**",
         "/storage/v1/object/sign/**",
         "/storage/v1/render/image/public/**",
      ];
      return pathnames.map((pathname) => ({ protocol: p, hostname, pathname }));
   } catch {
      return [];
   }
})();

const nextConfig = {
   output: "standalone",
   images: {
      remotePatterns: [
         {
            protocol: "http",
            hostname: "localhost",
         },
         {
            protocol: "https",
            hostname: "www.gravatar.com",
            pathname: "/avatar/**",
         },
         ...supabasePatterns,
      ],
   },
};

export default nextConfig;
