/**
 * robots.txt - Search engine crawler instructions
 */

export function GET() {
  const robotsTxt = `# checkaioverviews.com robots.txt
User-agent: *
Allow: /

# Sitemaps
Sitemap: https://checkaioverviews.com/sitemap.xml

# Disallow API routes from indexing
Disallow: /api/
`;

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400', // 24h cache
    },
  });
}
