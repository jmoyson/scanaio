/**
 * sitemap.xml - Dynamic sitemap for search engines
 *
 * Includes:
 * - Static pages (home, insights, why)
 * - Dynamic domain result pages
 */

import { supabase } from '@/lib/db/client';

export async function GET() {
  const baseUrl = 'https://checkaioverviews.com';

  // Static pages
  const staticPages: { url: string; priority: string; changefreq: string; lastmod?: string }[] = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/insights', priority: '0.8', changefreq: 'daily' },
    { url: '/why', priority: '0.7', changefreq: 'weekly' },
    { url: '/terms', priority: '0.3', changefreq: 'monthly' },
    { url: '/privacy', priority: '0.3', changefreq: 'monthly' },
  ];

  // Fetch all scanned domains for dynamic pages
  let domainPages: { url: string; priority: string; changefreq: string; lastmod?: string }[] = [];

  try {
    const { data: domains } = await supabase
      .from('domains')
      .select('domain, last_scanned_at')
      .order('last_scanned_at', { ascending: false })
      .limit(1000); // Limit to most recent 1000

    if (domains) {
      domainPages = domains.map(d => ({
        url: `/d/${d.domain}`,
        priority: '0.6',
        changefreq: 'weekly',
        lastmod: d.last_scanned_at?.split('T')[0], // YYYY-MM-DD format
      }));
    }
  } catch (error) {
    console.error('[Sitemap] Error fetching domains:', error);
  }

  const allPages = [...staticPages, ...domainPages];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>${page.lastmod ? `
    <lastmod>${page.lastmod}</lastmod>` : ''}
  </url>`).join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600', // 1h cache
    },
  });
}
