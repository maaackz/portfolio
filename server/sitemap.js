import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function generateSitemap() {
  const baseUrl = 'https://maaackz.com';
  const dataDir = path.join(__dirname, 'data');
  const projectsDir = path.join(dataDir, 'projects');
  const sectionsDir = path.join(dataDir, 'sections');
  const pagesDir = path.join(dataDir, 'pages');
  
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Homepage -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- About page -->
  <url>
    <loc>${baseUrl}/#about</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <!-- Work/Portfolio page -->
  <url>
    <loc>${baseUrl}/#work</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;

  // Add project pages
  if (fs.existsSync(projectsDir)) {
    const projectFiles = fs.readdirSync(projectsDir).filter(file => file.endsWith('.json'));
    projectFiles.forEach(file => {
      try {
        const projectData = JSON.parse(fs.readFileSync(path.join(projectsDir, file), 'utf-8'));
        const slug = projectData.slug || projectData.id;
        sitemap += `
  <url>
    <loc>${baseUrl}/projects/${slug}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
      } catch (error) {
        console.error(`Error processing project file ${file}:`, error);
      }
    });
  }

  // Add section pages
  if (fs.existsSync(sectionsDir)) {
    const sectionFiles = fs.readdirSync(sectionsDir).filter(file => file.endsWith('.json'));
    sectionFiles.forEach(file => {
      try {
        const sectionData = JSON.parse(fs.readFileSync(path.join(sectionsDir, file), 'utf-8'));
        const slug = sectionData.id;
        sitemap += `
  <url>
    <loc>${baseUrl}/${slug}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
      } catch (error) {
        console.error(`Error processing section file ${file}:`, error);
      }
    });
  }

  // Add custom pages
  if (fs.existsSync(pagesDir)) {
    const categories = fs.readdirSync(pagesDir);
    categories.forEach(category => {
      const categoryPath = path.join(pagesDir, category);
      if (fs.statSync(categoryPath).isDirectory()) {
        const pageFiles = fs.readdirSync(categoryPath).filter(file => file.endsWith('.json'));
        pageFiles.forEach(file => {
          try {
            const pageData = JSON.parse(fs.readFileSync(path.join(categoryPath, file), 'utf-8'));
            const slug = pageData.slug || file.replace('.json', '');
            sitemap += `
  <url>
    <loc>${baseUrl}/${category}/${slug}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`;
          } catch (error) {
            console.error(`Error processing page file ${file}:`, error);
          }
        });
      }
    });
  }

  sitemap += `
</urlset>`;

  return sitemap;
}

export { generateSitemap }; 