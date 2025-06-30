// === client/src/components/PageEditor.jsx ===
import React, { useState, useEffect, useRef } from 'react';
import Tagify from '@yaireo/tagify';
import '@yaireo/tagify/dist/tagify.css';

function TabButton({ active, onClick, children }) {
  return (
    <button style={{
      padding: '0.7em 1.5em',
      marginRight: '1em',
      border: active ? '2px solid white' : '2px solid #888',
      background: active ? '#111' : 'transparent',
      color: active ? 'white' : '#888',
      fontWeight: 600,
      cursor: 'pointer',
      borderRadius: 8,
      boxShadow: active ? '0 2px 12px #fff2' : 'none',
      transition: 'all 0.2s',
      letterSpacing: '-0.03em',
    }} onClick={onClick}>{children}</button>
  );
}

const cardStyle = {
  background: '#181818',
  border: '1.5px solid #fff2',
  borderRadius: 12,
  padding: '1.5em',
  marginBottom: '1.5em',
  boxShadow: '0 2px 12px #0002',
  transition: 'box-shadow 0.2s, border 0.2s',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5em',
};
const cardHover = {
  boxShadow: '0 4px 24px #fff3',
  border: '1.5px solid white',
};
const labelStyle = { fontWeight: 600, marginBottom: 4, color: 'white', letterSpacing: '-0.02em' };
const inputStyle = {
  padding: '0.7em 1.2em',
  border: '1.5px solid #888',
  borderRadius: 6,
  marginBottom: '1em',
  fontSize: '1em',
  background: '#222',
  color: 'white',
  outline: 'none',
  width: '100%',
  letterSpacing: '-0.02em',
};
const buttonStyle = {
  padding: '0.7em 1.5em',
  border: '2px solid white',
  background: 'black',
  color: 'white',
  fontWeight: 600,
  borderRadius: 8,
  cursor: 'pointer',
  marginRight: '1em',
  marginTop: '0.5em',
  transition: 'background 0.2s, color 0.2s, border 0.2s',
  letterSpacing: '-0.03em',
};
const buttonHover = {
  background: 'white',
  color: 'black',
  border: '2px solid black',
};
const deleteButtonStyle = {
  ...buttonStyle,
  background: '#222',
  border: '2px solid #888',
  color: '#fff',
};
const deleteButtonHover = {
  background: 'white',
  color: '#222',
  border: '2px solid #222',
};
const tagStyle = {
  background: '#111',
  color: 'white',
  borderRadius: 6,
  padding: '0.2em 0.7em',
  fontSize: '0.95em',
  border: '1px solid #fff2',
  letterSpacing: '-0.02em',
};

export default function AdminDashboard() {
  const [tab, setTab] = useState('projects');
  const [hovered, setHovered] = useState(null);
  const [hoveredBtn, setHoveredBtn] = useState(null);
  // --- Projects State ---
  const [projects, setProjects] = useState([]);
  const [editingProject, setEditingProject] = useState(null);
  const [projectForm, setProjectForm] = useState({
    title: '', slug: '', description: '', image: '', technologies: [], link: '', caseStudySections: []
  });
  const [caseSection, setCaseSection] = useState({ title: '', description: '', image: '' });
  const tagifyRef = useRef();

  useEffect(() => {
    if (tab === 'projects') {
      fetch('/api/projects')
        .then(res => res.json())
        .then(setProjects)
        .catch(() => setProjects([]));
    }
  }, [tab]);

  const handleProjectFormChange = e => {
    const { name, value } = e.target;
    setProjectForm(f => ({ ...f, [name]: value }));
  };

  const handleEditProject = p => {
    setEditingProject(p);
    setProjectForm({
      ...p,
      technologies: Array.isArray(p.technologies)
        ? p.technologies
        : typeof p.technologies === 'string' && p.technologies.trim().startsWith('[')
          ? JSON.parse(p.technologies).map(t => t.value || t)
          : (p.technologies || '').split(',').map(t => t.trim()).filter(Boolean),
      caseStudySections: p.caseStudySections || []
    });
  };

  const handleDeleteProject = id => {
    if (!window.confirm('Delete this project?')) return;
    fetch(`/api/projects/${id}`, { method: 'DELETE' })
      .then(() => setProjects(ps => ps.filter(p => p.id !== id)));
  };

  const handleSaveProject = () => {
    const body = {
      ...projectForm,
      technologies: projectForm.technologies,
      caseStudySections: projectForm.caseStudySections
    };
    const method = editingProject ? 'PUT' : 'POST';
    const url = editingProject ? `/api/projects/${editingProject.id}` : '/api/projects';
    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
      .then(res => res.json())
      .then(saved => {
        setEditingProject(null);
        setProjectForm({ title: '', slug: '', description: '', image: '', technologies: [], link: '', caseStudySections: [] });
        setProjects(ps => {
          if (editingProject) {
            return ps.map(p => p.id === saved.id ? saved : p);
          } else {
            return [...ps, saved];
          }
        });
      });
  };

  const handleAddCaseSection = () => {
    setProjectForm(f => ({
      ...f,
      caseStudySections: [...(f.caseStudySections || []), { ...caseSection }]
    }));
    setCaseSection({ title: '', description: '', image: '' });
  };

  const handleDeleteCaseSection = idx => {
    setProjectForm(f => ({
      ...f,
      caseStudySections: f.caseStudySections.filter((_, i) => i !== idx)
    }));
  };

  // --- Section/Page Management (keep old UI for now) ---
  const [category, setCategory] = useState('');
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [availableSections, setAvailableSections] = useState([]);
  const [selectedSections, setSelectedSections] = useState([]);
  const [newSecId, setNewSecId] = useState('');
  const [newSecTitle, setNewSecTitle] = useState('');
  const [newSecContent, setNewSecContent] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/api/sections')
      .then(res => res.json())
      .then(sections => {
        if (!Array.isArray(sections)) throw new Error('Invalid sections response');
        setAvailableSections(sections);
      })
      .catch(err => {
        console.error('Failed to fetch sections:', err);
        setAvailableSections([]);
      });
  }, []);

  const createSection = () => {
    if (!newSecId || !newSecTitle || !newSecContent) return alert('Missing section fields');
    fetch(`http://localhost:5000/api/sections/${newSecId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: newSecId, title: newSecTitle, content: newSecContent })
    })
      .then(() => fetch('http://localhost:5000/api/sections'))
      .then(res => res.json())
      .then(sections => {
        if (!Array.isArray(sections)) throw new Error('Invalid sections response');
        setAvailableSections(sections);
        setNewSecId('');
        setNewSecTitle('');
        setNewSecContent('');
        alert('Section saved!');
      })
      .catch(err => {
        console.error('Failed to save section:', err);
      });
  };

  const deleteSection = (id) => {
    if (!window.confirm('Delete this section?')) return;
    fetch(`http://localhost:5000/api/sections/${id}`, { method: 'DELETE' })
      .then(() => fetch('http://localhost:5000/api/sections'))
      .then(res => res.json())
      .then(sections => {
        if (!Array.isArray(sections)) throw new Error('Invalid sections response');
        setAvailableSections(sections);
      })
      .catch(err => console.error('Failed to delete section:', err));
  };

  const toggleSection = (id) => {
    setSelectedSections(prev => prev.includes(id)
      ? prev.filter(s => s !== id)
      : [...prev, id]);
  };

  const handleSavePage = () => {
    if (!category || !slug || !title) return alert('Missing required fields');

    fetch(`http://localhost:5000/api/structure`)
      .then(res => res.json())
      .then(structure => {
        const categories = structure.categories || [];
        const catIndex = categories.findIndex(c => c.slug === category);
        if (catIndex !== -1) {
          const pages = categories[catIndex].pages || [];
          if (!pages.includes(slug)) pages.push(slug);
          categories[catIndex].pages = pages;
        } else {
          categories.push({ title: category, slug: category, pages: [slug] });
        }
        return fetch('http://localhost:5000/api/structure', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ categories })
        });
      })
      .then(() => {
        return fetch(`http://localhost:5000/api/${category}/${slug}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, sections: selectedSections })
        });
      })
      .then(() => alert('Page saved!'))
      .catch(console.error);
  };

  // Tagify integration for technologies
  useEffect(() => {
    if (!tagifyRef.current) return;
    // Remove any previous Tagify instance
    if (tagifyRef.current.tagify) tagifyRef.current.tagify.destroy();
    const tagify = new Tagify(tagifyRef.current, {
      whitelist: [],
      dropdown: { enabled: 0 },
      originalInputValueFormat: valuesArr => valuesArr.map(item => item.value),
      enforceWhitelist: false,
      editTags: 1,
      maxTags: 10,
      callbacks: {
        add: onTagChange,
        remove: onTagChange,
        edit: onTagChange,
        blur: onTagChange,
      },
    });
    tagifyRef.current.tagify = tagify;
    // Set initial value as array of objects
    tagify.loadOriginalValues((projectForm.technologies || []).map(t => ({ value: t })));
    return () => tagify.destroy();
    // eslint-disable-next-line
  }, [editingProject]);

  function onTagChange(e) {
    let tagValues = [];
    try {
      tagValues = tagifyRef.current.tagify.value.map(t => t.value);
    } catch {
      tagValues = [];
    }
    setProjectForm(f => ({ ...f, technologies: tagValues }));
  }

  return (
    <div style={{ padding: '2rem', background: 'linear-gradient(120deg, #111 0%, #222 100%)', minHeight: '100vh', color: 'white' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: 'white', letterSpacing: '-0.04em' }}>Admin Dashboard</h1>
      <div style={{ marginBottom: '2em' }}>
        <TabButton active={tab === 'projects'} onClick={() => setTab('projects')}>Projects</TabButton>
        <TabButton active={tab === 'sections'} onClick={() => setTab('sections')}>Sections</TabButton>
        <TabButton active={tab === 'pages'} onClick={() => setTab('pages')}>Pages</TabButton>
      </div>
      {tab === 'projects' && (
        <div>
          <h2 style={{ color: 'white', marginBottom: '1em', letterSpacing: '-0.02em' }}>Projects</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2em' }}>
            {projects.map((p, idx) => (
              <div
                key={p.id || p.slug}
                style={hovered === idx ? { ...cardStyle, ...cardHover } : cardStyle}
                onMouseEnter={() => setHovered(idx)}
                onMouseLeave={() => setHovered(null)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1em' }}>
                  {p.image && <img src={p.image} alt={p.title} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, border: '2px solid #fff2' }} />}
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.2em', color: 'white' }}>{p.title}</div>
                    <div style={{ color: '#888', fontSize: '0.95em' }}>{p.slug}</div>
                  </div>
                </div>
                <div style={{ margin: '0.5em 0', color: '#bbb' }}>{p.description}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5em', marginBottom: '0.5em' }}>
                  {(p.technologies || []).map((t, i) => (
                    <span key={i} style={tagStyle}>{t}</span>
                  ))}
                </div>
                <div>
                  <button
                    style={buttonStyle}
                    onMouseEnter={() => setHoveredBtn(`edit${idx}`)}
                    onMouseLeave={() => setHoveredBtn(null)}
                    onClick={() => handleEditProject(p)}
                  >Edit</button>
                  <button
                    style={hoveredBtn === `del${idx}` ? { ...deleteButtonStyle, ...deleteButtonHover } : deleteButtonStyle}
                    onMouseEnter={() => setHoveredBtn(`del${idx}`)}
                    onMouseLeave={() => setHoveredBtn(null)}
                    onClick={() => handleDeleteProject(p.id)}
                  >Delete</button>
                </div>
              </div>
            ))}
          </div>
          <div style={{ ...cardStyle, marginTop: '2em', maxWidth: 600 }}>
            <h3 style={{ color: 'white', marginBottom: '1em', letterSpacing: '-0.02em' }}>{editingProject ? 'Edit Project' : 'Add Project'}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5em' }}>
              <label style={labelStyle}>Title</label>
              <input name="title" value={projectForm.title || ''} onChange={handleProjectFormChange} style={inputStyle} placeholder="Title" />
              <label style={labelStyle}>Slug</label>
              <input name="slug" value={projectForm.slug || ''} onChange={handleProjectFormChange} style={inputStyle} placeholder="Slug" />
              <label style={labelStyle}>Description</label>
              <input name="description" value={projectForm.description || ''} onChange={handleProjectFormChange} style={inputStyle} placeholder="Description" />
              <label style={labelStyle}>Image URL</label>
              <input name="image" value={projectForm.image || ''} onChange={handleProjectFormChange} style={inputStyle} placeholder="Image URL" />
              <label style={labelStyle}>Technologies</label>
              <input
                ref={tagifyRef}
                name="technologies"
                style={{ ...inputStyle, background: '#111', color: 'white', border: '1.5px solid #888' }}
                placeholder="Add technologies..."
              />
              <label style={labelStyle}>Project Link</label>
              <input name="link" value={projectForm.link || ''} onChange={handleProjectFormChange} style={inputStyle} placeholder="Project Link" />
              <div style={{ margin: '1em 0' }}>
                <b style={{ color: 'white' }}>Case Study Sections</b>
                <ul style={{ margin: '0.5em 0 0 0', padding: 0, listStyle: 'none' }}>
                  {(projectForm.caseStudySections || []).map((cs, i) => (
                    <li key={i} style={{ marginBottom: '0.5em', background: '#222', borderRadius: 6, padding: '0.5em 1em', color: 'white', border: '1px solid #fff2' }}>
                      <b>{cs.title}</b> - {cs.description}
                      <button
                        style={hoveredBtn === `delcs${i}` ? { ...deleteButtonStyle, ...deleteButtonHover } : deleteButtonStyle}
                        onMouseEnter={() => setHoveredBtn(`delcs${i}`)}
                        onMouseLeave={() => setHoveredBtn(null)}
                        onClick={() => handleDeleteCaseSection(i)}
                      >Delete</button>
                    </li>
                  ))}
                </ul>
                <div style={{ display: 'flex', gap: '0.5em', marginTop: '0.5em' }}>
                  <input value={caseSection.title || ''} onChange={e => setCaseSection(s => ({ ...s, title: e.target.value }))} style={{ ...inputStyle, marginBottom: 0 }} placeholder="Section Title" />
                  <input value={caseSection.description || ''} onChange={e => setCaseSection(s => ({ ...s, description: e.target.value }))} style={{ ...inputStyle, marginBottom: 0 }} placeholder="Section Description" />
                  <input value={caseSection.image || ''} onChange={e => setCaseSection(s => ({ ...s, image: e.target.value }))} style={{ ...inputStyle, marginBottom: 0 }} placeholder="Section Image URL" />
                  <button style={{ ...buttonStyle, padding: '0.3em 1em', fontSize: '0.9em' }} onClick={handleAddCaseSection}>Add</button>
                </div>
              </div>
              <button style={{ ...buttonStyle, marginTop: '1em' }} onClick={handleSaveProject}>{editingProject ? 'Save Changes' : 'Add Project'}</button>
            </div>
          </div>
        </div>
      )}
      {tab === 'sections' && (
        <div>
          <h2 style={{ color: 'white', marginBottom: '1em', letterSpacing: '-0.02em' }}>Section Manager</h2>
          <div style={{ ...cardStyle, maxWidth: 600 }}>
            <label style={labelStyle}>Section ID</label>
            <input value={newSecId} onChange={(e) => setNewSecId(e.target.value)} style={inputStyle} placeholder="Section ID (e.g. websites)" />
            <label style={labelStyle}>Section Title</label>
            <input value={newSecTitle} onChange={(e) => setNewSecTitle(e.target.value)} style={inputStyle} placeholder="Section Title" />
            <label style={labelStyle}>Section Content</label>
            <textarea value={newSecContent} onChange={(e) => setNewSecContent(e.target.value)} style={{ ...inputStyle, minHeight: 80 }} placeholder="Section Content" />
            <button style={buttonStyle} onClick={createSection}>Save Section</button>
          </div>
          <h3 style={{ color: 'white', marginTop: '2em', letterSpacing: '-0.02em' }}>Available Sections</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5em', maxWidth: 600 }}>
      {availableSections.map((s, i) => (
              <div key={i} style={{ ...cardStyle, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '0.7em 1.2em' }}>
                <label style={{ color: 'white' }}>
            <input
              type="checkbox"
              checked={selectedSections.includes(s.id)}
              onChange={() => toggleSection(s.id)}
                    style={{ marginRight: 8 }}
            />
            {s.id} — {s.title}
          </label>
                <button style={deleteButtonStyle} onClick={() => deleteSection(s.id)}>🗑</button>
              </div>
            ))}
          </div>
        </div>
      )}
      {tab === 'pages' && (
        <div>
          <h2 style={{ color: 'white', marginBottom: '1em', letterSpacing: '-0.02em' }}>Page Builder</h2>
          <div style={{ ...cardStyle, maxWidth: 600 }}>
            <label style={labelStyle}>Category</label>
            <input value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle} placeholder="Category (e.g. websites)" />
            <label style={labelStyle}>Page Slug</label>
            <input value={slug} onChange={(e) => setSlug(e.target.value)} style={inputStyle} placeholder="Page Slug (e.g. my-portfolio)" />
            <label style={labelStyle}>Page Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} placeholder="Page Title" />
            <button style={buttonStyle} onClick={handleSavePage}>Save Page</button>
          </div>
        </div>
      )}
    </div>
  );
}