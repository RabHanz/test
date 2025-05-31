import { GetServerSideProps } from 'next';
import { navigationConfig } from '../config/navigation';

const EXTERNAL_DATA_URL = 'https://your-domain.com';

function generateSiteMap() {
  const getUrls = (items: any[]): string[] => {
    let urls: string[] = [];
    items.forEach((item) => {
      urls.push(`${EXTERNAL_DATA_URL}${item.path}`);
      if (item.children) {
        urls = [...urls, ...getUrls(item.children)];
      }
    });
    return urls;
  };

  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <!-- Add the home page -->
     <url>
       <loc>${EXTERNAL_DATA_URL}</loc>
       <lastmod>${new Date().toISOString()}</lastmod>
       <changefreq>daily</changefreq>
       <priority>1.0</priority>
     </url>
     ${getUrls(navigationConfig)
       .map((url) => {
         return `
       <url>
           <loc>${url}</loc>
           <lastmod>${new Date().toISOString()}</lastmod>
           <changefreq>weekly</changefreq>
           <priority>0.7</priority>
       </url>
     `;
       })
       .join('')}
   </urlset>
 `;
}

function SiteMap() {
  // getServerSideProps will handle the XML generation
  return null;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  // Generate the XML sitemap
  const sitemap = generateSiteMap();

  res.setHeader('Content-Type', 'text/xml');
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
};

export default SiteMap; 