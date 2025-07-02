import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  try {
    // Fetch projects for sitemap
    const { data: projects } = await supabase
      .from('projects')
      .select('slug, updated_at')
      .eq('published', true);

    // Fetch pages for sitemap
    const { data: pages } = await supabase
      .from('pages')
      .select('slug, updated_at')
      .eq('published', true);

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.vercel.app';
    const now = new Date().toISOString();

    // Only include necessary attributes for SEO: xmlns, xmlns:xsi, xsi:schemaLocation
    // <changefreq> and <priority> are optional for SEO and not required by Google, so omitting for a cleaner sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
      xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
            http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
<url>
  <loc>${baseUrl}/</loc>
  <lastmod>${now}</lastmod>
</url>
<url>
  <loc>${baseUrl}/projects</loc>
  <lastmod>${now}</lastmod>
</url>
${projects?.map(project => `
<url>
  <loc>${baseUrl}/projects/${project.slug}</loc>
  <lastmod>${new Date(project.updated_at).toISOString()}</lastmod>
</url>`).join('') || ''}
${pages?.map(page => `
<url>
  <loc>${baseUrl}/pages/${page.slug}</loc>
  <lastmod>${new Date(page.updated_at).toISOString()}</lastmod>
</url>`).join('') || ''}
</urlset>`;

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
} 