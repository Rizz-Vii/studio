// src/app/sitemap.xml/route.ts

// IMPORTANT: Replace this with your actual production domain
const URL = "https://yourdomain.com";

function generateSiteMap(paths: string[]) {
  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     ${paths
       .map((path) => {
         return `
           <url>
               <loc>${`${URL}${path}`}</loc>
               <lastmod>${new Date().toISOString()}</lastmod>
               <changefreq>weekly</changefreq>
               <priority>0.8</priority>
           </url>
         `;
       })
       .join('')}
   </urlset>
 `;
}

export async function GET() {
  // Define the public paths of your application
  const publicPaths = [
    '/',
    '/keyword-tool',
    '/content-analyzer',
    '/competitors',
    '/serp-view',
    '/seo-audit',
    '/link-view',
    '/content-brief',
  ];

  const body = generateSiteMap(publicPaths);

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-control': 'public, s-maxage=86400, stale-while-revalidate',
    },
  });
}
