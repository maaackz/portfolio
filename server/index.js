// === server/index.js ===
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

const dataDir = path.join(__dirname, 'data');
const sectionsDir = path.join(dataDir, 'sections');
const structureFile = path.join(dataDir, 'structure.json');
const tagsFile = path.join(dataDir, 'tags.json');

app.use(cors());
app.use(bodyParser.json());

// Ensure base directories exist
fs.mkdirSync(sectionsDir, { recursive: true });
fs.mkdirSync(path.join(dataDir, 'pages'), { recursive: true });

// === Sections ===
app.get('/api/sections', (req, res) => {
  const files = fs.readdirSync(sectionsDir);
  const sections = files.map(file => {
    const content = fs.readFileSync(path.join(sectionsDir, file));
    return JSON.parse(content);
  });
  res.json(sections);
});

app.get('/api/sections/:id', (req, res) => {
  const sectionPath = path.join(sectionsDir, `${req.params.id}.json`);
  if (!fs.existsSync(sectionPath)) return res.status(404).json({ error: 'Section not found' });
  const content = fs.readFileSync(sectionPath);
  res.json(JSON.parse(content));
});

app.post('/api/sections/:id', (req, res) => {
  const sectionPath = path.join(sectionsDir, `${req.params.id}.json`);
  fs.writeFileSync(sectionPath, JSON.stringify(req.body, null, 2));
  res.json({ success: true });
});

const projectsDir = path.join(dataDir, 'projects');
fs.mkdirSync(projectsDir, { recursive: true });

app.get('/api/projects', (req, res) => {
  const files = fs.readdirSync(projectsDir);
  const projects = files
    .filter(file => file.endsWith('.json'))
    .map(file => {
      const content = fs.readFileSync(path.join(projectsDir, file), 'utf-8');
      return JSON.parse(content);
    });
  res.json(projects);
});

// Get projects by category
app.get('/api/projects/category/:category', (req, res) => {
  const { category } = req.params;
  const files = fs.readdirSync(projectsDir);
  const projects = files
    .filter(file => file.endsWith('.json'))
    .map(file => {
      const content = fs.readFileSync(path.join(projectsDir, file), 'utf-8');
      return JSON.parse(content);
    })
    .filter(project => project.category === category || project.section === category);
  res.json(projects);
});

// Get a specific project by ID or slug
app.get('/api/projects/:id', (req, res) => {
  const { id } = req.params;
  const files = fs.readdirSync(projectsDir);
  
  for (const file of files) {
    if (file.endsWith('.json')) {
      const content = fs.readFileSync(path.join(projectsDir, file), 'utf-8');
      const project = JSON.parse(content);
      if (project.id === id || project.slug === id) {
        return res.json(project);
      }
    }
  }
  
  res.status(404).json({ error: 'Project not found' });
});

// Add PUT route for updating a project
app.put('/api/projects/:id', (req, res) => {
  const { id } = req.params;
  const projectPath = path.join(projectsDir, `${id}.json`);
  if (!fs.existsSync(projectPath)) {
    return res.status(404).json({ error: 'Project not found' });
  }
  fs.writeFileSync(projectPath, JSON.stringify(req.body, null, 2));
  res.json({ ...req.body, id });
});

// === Pages ===
app.get('/api/:category/:slug', (req, res) => {
  const { category, slug } = req.params;
  const pagePath = path.join(dataDir, 'pages', category, `${slug}.json`);
  if (!fs.existsSync(pagePath)) return res.status(404).json({ error: 'Page not found' });
  const page = JSON.parse(fs.readFileSync(pagePath));

  // Resolve section data
  const resolvedSections = page.sections.map(sectionId => {
    const sectionPath = path.join(sectionsDir, `${sectionId}.json`);
    return fs.existsSync(sectionPath) ? JSON.parse(fs.readFileSync(sectionPath)) : null;
  }).filter(Boolean);

  res.json({ ...page, sections: resolvedSections });
});

app.post('/api/:category/:slug', (req, res) => {
  const { category, slug } = req.params;
  const { title, sections, tags } = req.body;
  const pageDir = path.join(dataDir, 'pages', category);
  fs.mkdirSync(pageDir, { recursive: true });
  fs.writeFileSync(path.join(pageDir, `${slug}.json`), JSON.stringify({ title, slug, sections, tags }, null, 2));
  res.json({ success: true });
});

// === Structure ===
app.get('/api/structure', (req, res) => {
  if (!fs.existsSync(structureFile)) return res.json({ categories: [] });
  const structure = JSON.parse(fs.readFileSync(structureFile));
  res.json(structure);
});

app.post('/api/structure', (req, res) => {
  fs.writeFileSync(structureFile, JSON.stringify(req.body, null, 2));
  res.json({ success: true });
});

// === Tags ===
app.get('/api/tags', (req, res) => {
  if (!fs.existsSync(tagsFile)) return res.json([]);
  const tags = JSON.parse(fs.readFileSync(tagsFile));
  res.json(tags);
});

app.post('/api/tags', (req, res) => {
  fs.writeFileSync(tagsFile, JSON.stringify(req.body, null, 2));
  res.json({ success: true });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
