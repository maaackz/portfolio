// === server/index.js ===
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

// Fix __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

const dataDir = path.join(__dirname, 'data');
const sectionsDir = path.join(dataDir, 'sections');
const structureFile = path.join(dataDir, 'structure.json');
const tagsFile = path.join(dataDir, 'tags.json');
const availabilityFile = path.join(dataDir, 'availability.json');

const ADMIN_USER = 'admin';
const ADMIN_PASS_HASH_FILE = path.join(dataDir, 'admin_pass.hash');

const SESSION_SECRET = process.env.SESSION_SECRET || 'your-secret-key-change-in-production';
if (!SESSION_SECRET) {
  console.error('ERROR: SESSION_SECRET environment variable not set.');
  process.exit(1);
}

app.use(cors());
app.use(bodyParser.json());

app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax' }
}));

function isAuthenticated(req, res, next) {
  if (req.session && req.session.authenticated) return next();
  res.status(401).json({ error: 'Unauthorized' });
}

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (username !== ADMIN_USER) return res.status(401).json({ error: 'Invalid credentials' });
  if (!fs.existsSync(ADMIN_PASS_HASH_FILE)) return res.status(500).json({ error: 'Admin password not set' });
  const hash = fs.readFileSync(ADMIN_PASS_HASH_FILE, 'utf-8');
  const match = await bcrypt.compare(password, hash);
  if (match) {
    req.session.authenticated = true;
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.get('/api/login', (req, res) => {
  if (req.session && req.session.authenticated) {
    res.json({ authenticated: true });
  } else {
    res.status(401).json({ authenticated: false });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

// Middleware to protect admin routes (POST/PUT/DELETE)
function protectAdminRoutes(req, res, next) {
  console.log(`[AUTH] ${req.method} ${req.path} - Session:`, req.session);
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    // Skip auth for login/logout routes
    if (req.path === '/login' || req.path === '/logout') {
      return next();
    }
    console.log(`[AUTH] Checking authentication for ${req.method} ${req.path}`);
    return isAuthenticated(req, res, next);
  }
  next();
}

app.use('/api', protectAdminRoutes);

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

// Add POST route for creating new projects
app.post('/api/projects', (req, res) => {
  try {
    const newProject = req.body;
    
    // Validate required fields
    if (!newProject.id || !newProject.slug) {
      return res.status(400).json({ error: 'Project must have an id and slug' });
    }
    
    // Check if project already exists
    const projectPath = path.join(projectsDir, `${newProject.id}.json`);
    if (fs.existsSync(projectPath)) {
      return res.status(409).json({ error: 'Project with this ID already exists' });
    }
    
    // Save the project
    fs.writeFileSync(projectPath, JSON.stringify(newProject, null, 2));
    res.json(newProject);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
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

// Add DELETE route for removing projects
app.delete('/api/projects/:id', (req, res) => {
  try {
    const { id } = req.params;
    const projectPath = path.join(projectsDir, `${id}.json`);
    
    if (!fs.existsSync(projectPath)) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    fs.unlinkSync(projectPath);
    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
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

// Get availability status
app.get('/api/availability', (req, res) => {
  if (!fs.existsSync(availabilityFile)) {
    return res.json({ status: 'i am available for work.', color: '#00ff00' });
  }
  const data = JSON.parse(fs.readFileSync(availabilityFile, 'utf-8'));
  res.json(data);
});

// Set availability status
app.post('/api/availability', (req, res) => {
  const { status, color } = req.body;
  if (!status || !color) return res.status(400).json({ error: 'Missing status or color' });
  fs.writeFileSync(availabilityFile, JSON.stringify({ status, color }, null, 2));
  res.json({ success: true });
});

// Add a test endpoint to check if server is working
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!', session: req.session });
});

// Serve static files from the React app build directory
const clientBuildPath = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
