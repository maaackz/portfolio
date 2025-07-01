// Usage: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node import_projects_to_supabase.cjs
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY as environment variables.');
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Always resolve projectsDir relative to the project root (one level up from next-portfolio)
const projectsDir = path.join(__dirname, '..', 'server', 'data', 'projects');

function camelToLower(obj) {
  const out = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const lowerKey = key.toLowerCase();
      out[lowerKey] = obj[key];
    }
  }
  return out;
}

async function importProjects() {
  const files = fs.readdirSync(projectsDir).filter(f => f.endsWith('.json'));
  for (const file of files) {
    const filePath = path.join(projectsDir, file);
    const raw = fs.readFileSync(filePath, 'utf-8');
    const project = JSON.parse(raw);
    // Convert all keys to lowercase for Postgres
    const projectLower = camelToLower(project);
    const { error } = await supabase.from('projects').upsert(projectLower, { onConflict: 'id' });
    if (error) {
      console.error(`Error importing ${file}:`, error.message);
    } else {
      console.log(`Imported ${file}`);
    }
  }
  console.log('Done!');
}

importProjects(); 