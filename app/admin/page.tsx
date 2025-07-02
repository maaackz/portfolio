"use client";
import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { supabase } from '@/lib/supabaseClient';

// --- Styles (same as original) ---
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
} as React.CSSProperties;
const cardHover = {
  boxShadow: '0 4px 24px #fff3',
  border: '1.5px solid white',
} as React.CSSProperties;
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
} as React.CSSProperties;
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
} as React.CSSProperties;
const buttonHover = {
  background: 'white',
  color: 'black',
  border: '2px solid black',
} as React.CSSProperties;
const deleteButtonStyle = {
  ...buttonStyle,
  background: '#222',
  border: '2px solid #888',
  color: '#fff',
} as React.CSSProperties;
const deleteButtonHover = {
  background: 'white',
  color: '#222',
  border: '2px solid #222',
} as React.CSSProperties;
const tagStyle = {
  background: '#111',
  color: 'white',
  borderRadius: 6,
  padding: '0.2em 0.7em',
  fontSize: '0.95em',
  border: '1px solid #fff2',
  letterSpacing: '-0.02em',
} as React.CSSProperties;

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
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
    } as React.CSSProperties} onClick={onClick}>{children}</button>
  );
}

interface Project {
  id: string;
  title: string;
  slug: string;
  description?: string;
  image?: string;
  technologies?: string | string[];
  link?: string;
  casestudysections?: { title: string; description: string; image?: string }[];
  categories?: string[];
}

interface Availability {
  status: string;
  color: string;
}

interface Section {
  id: string;
  title: string;
  content?: string;
}

type ProjectInsert = Omit<Project, 'id'> & { id?: string };

// Custom Tag Input Component
function TagInput({ value, onChange, placeholder }: { value: string[]; onChange: (tags: string[]) => void; placeholder?: string }) {
  const [inputValue, setInputValue] = useState('');
  const [tags, setTags] = useState<string[]>(value);

  useEffect(() => {
    setTags(value);
  }, [value]);

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      const newTags = [...tags, trimmedTag];
      setTags(newTags);
      onChange(newTags);
    }
    setInputValue('');
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
    onChange(newTags);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div style={{ ...inputStyle, background: '#111', color: 'white', border: '1.5px solid #888', minHeight: 'auto', padding: '0.5em' } as React.CSSProperties}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3em', marginBottom: '0.5em' } as React.CSSProperties}>
        {tags.map((tag, index) => (
          <span key={index} style={{ ...tagStyle, display: 'flex', alignItems: 'center', gap: '0.3em' } as React.CSSProperties}>
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '0.8em', padding: '0 0.2em' } as React.CSSProperties}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => addTag(inputValue)}
        placeholder={placeholder || "Type and press Enter or comma to add tags"}
        style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', width: '100%', fontSize: '1em' } as React.CSSProperties}
      />
    </div>
  );
}

export default function PageEditor() {
  // --- Tabs & UI State ---
  const [tab, setTab] = useState<'projects' | 'sections' | 'pages'>('projects');
  const [hovered, setHovered] = useState<number | null>(null);
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- Projects State ---
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectForm, setProjectForm] = useState<Partial<Project>>({
    title: '', slug: '', description: '', image: '', technologies: [], link: '', casestudysections: [], categories: []
  });
  const [caseSection, setCaseSection] = useState<{ title: string; description: string; image?: string }>({ title: '', description: '', image: '' });
  const [editingCaseSectionIdx, setEditingCaseSectionIdx] = useState<number | null>(null);

  // --- Availability State ---
  const [availability, setAvailability] = useState<Availability>({ status: '', color: '#00ff00' });
  const [savingAvailability, setSavingAvailability] = useState(false);

  // --- Auth State ---
  const [authenticated, setAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });

  // --- Section/Page Management ---
  const [category, setCategory] = useState('');
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [availableSections, setAvailableSections] = useState<Section[]>([]);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [newSecId, setNewSecId] = useState('');
  const [newSecTitle, setNewSecTitle] = useState('');
  const [newSecContent, setNewSecContent] = useState('');

  // --- Project Categories ---
  const projectCategories = [
    'websites', 'games', 'software', 'design', 'videos', 'tools', 'illustration',
    'photography', 'writing', 'research', 'other'
  ];

  // --- Effects ---
  useEffect(() => {
    // Set loading to false after a short delay to prevent redirect loops
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!authenticated || isLoading) return;
    if (tab === 'projects') {
      const fetchProjects = async () => {
        try {
          const { data, error } = await supabase.from('projects').select('*');
        if (!error && data) setProjects(data);
        } catch (err) {
          console.error('Error fetching projects:', err);
        }
      };
      fetchProjects();
    }
  }, [tab, authenticated, isLoading]);

  useEffect(() => {
    if (!authenticated || isLoading) return;
    const fetchAvailability = async () => {
      try {
        const { data, error } = await supabase.from('availability').select('*').single();
      if (!error && data) setAvailability(data);
      } catch (err) {
        console.error('Error fetching availability:', err);
      }
    };
    fetchAvailability();
  }, [authenticated, isLoading]);

  useEffect(() => {
    if (!authenticated || isLoading) return;
    const fetchSections = async () => {
      try {
        const { data, error } = await supabase.from('sections').select('*');
      if (!error && data) setAvailableSections(data);
      } catch (err) {
        console.error('Error fetching sections:', err);
      }
    };
    fetchSections();
  }, [authenticated, isLoading]);

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/login', { 
          method: 'GET',
          credentials: 'include'
        });
        if (response.ok) {
          setAuthenticated(true);
        }
      } catch (error) {
        console.error('Auth check error:', error);
      }
    };
    
    checkAuth();
  }, []);

  // --- Auth ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginForm),
      });

      const data = await response.json();

      if (response.ok) {
      setAuthenticated(true);
    } else {
        setLoginError(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('Network error. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/login', {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    setAuthenticated(false);
  };

  // --- Project CRUD ---
  const handleProjectFormChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProjectForm(f => ({ ...f, [name]: value }));
  };

  const handleCategoryToggle = (category: string) => {
    setProjectForm(f => ({
      ...f,
      categories: f.categories?.includes(category)
        ? f.categories.filter(c => c !== category)
        : [...(f.categories || []), category]
    }));
  };

  const handleEditProject = (p: Project) => {
    setEditingProject(p);
    setProjectForm({
      ...p,
      technologies: Array.isArray(p.technologies)
        ? p.technologies
        : (typeof p.technologies === 'string' && p.technologies
            ? (p.technologies.trim().startsWith('[')
          ? JSON.parse(p.technologies).map((t: any) => t.value || t)
                : p.technologies.split(',').map((t: string) => t.trim()).filter(Boolean))
            : []),
      casestudysections: p.casestudysections || [],
      categories: p.categories || []
    });
  };

  const handleDeleteProject = async (id: string) => {
    if (!window.confirm('Delete this project?')) return;
    await supabase.from('projects').delete().eq('id', id);
    setProjects(ps => ps.filter(p => p.id !== id));
  };

  const handleSaveProject = async () => {
    let body = {
      ...projectForm,
      // Ensure arrays are properly formatted
      technologies: Array.isArray(projectForm.technologies) ? projectForm.technologies : [],
      categories: Array.isArray(projectForm.categories) ? projectForm.categories : [],
      casestudysections: Array.isArray(projectForm.casestudysections) ? projectForm.casestudysections : []
    };
    
    // Debug: Log what we're sending
    console.log('Sending to Supabase:', body);
    
    if (!editingProject) {
      if (!body.id) {
        body.id = (body.slug || body.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
      if (!body.slug) {
        body.slug = (body.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
    }
    
    console.log('Final body:', body);
    
    const result = await supabase.from('projects').upsert([body], { onConflict: 'id' });
    const data = result.data as Project[] | null;
    const error = result.error;
    
    if (error) {
      console.error('Supabase error:', error);
      alert('Failed to save project: ' + error.message);
      return;
    }
    
    if (data) {
      setEditingProject(null);
      setProjectForm({ title: '', slug: '', description: '', image: '', technologies: [], link: '', casestudysections: [], categories: [] });
      setProjects(ps => {
        if (editingProject) {
          return ps.map(p => p.id === data[0].id ? data[0] : p);
        } else {
          return [...ps, data[0]];
        }
      });
    }
  };

  // --- Case Study Section CRUD ---
  const handleAddOrEditCaseSection = () => {
    if (!caseSection.title && !caseSection.description && !caseSection.image) return;
    if (editingCaseSectionIdx !== null) {
      setProjectForm(f => ({
        ...f,
        casestudysections: f.casestudysections?.map((s, i) => i === editingCaseSectionIdx ? { ...caseSection } : s)
      }));
      setEditingCaseSectionIdx(null);
    } else {
      setProjectForm(f => ({
        ...f,
        casestudysections: [...(f.casestudysections || []), { ...caseSection }]
      }));
    }
    setCaseSection({ title: '', description: '', image: '' });
  };

  const handleDeleteCaseSection = (idx: number) => {
    setProjectForm(f => ({
      ...f,
      casestudysections: f.casestudysections?.filter((_, i) => i !== idx)
    }));
  };

  // --- Section CRUD ---
  const createSection = async () => {
    if (!newSecId || !newSecTitle || !newSecContent) return alert('Missing section fields');
    await supabase.from('sections').upsert({ id: newSecId, title: newSecTitle, content: newSecContent });
    const { data } = await supabase.from('sections').select('*');
    setAvailableSections(data || []);
    setNewSecId('');
    setNewSecTitle('');
    setNewSecContent('');
    alert('Section saved!');
  };

  const deleteSection = async (id: string) => {
    if (!window.confirm('Delete this section?')) return;
    await supabase.from('sections').delete().eq('id', id);
    const { data } = await supabase.from('sections').select('*');
    setAvailableSections(data || []);
  };

  const toggleSection = (id: string) => {
    setSelectedSections(prev => prev.includes(id)
      ? prev.filter(s => s !== id)
      : [...prev, id]);
  };

  // --- Page Builder ---
  const handleSavePage = async () => {
    if (!category || !slug || !title) return alert('Missing required fields');
    // For demo: just upsert a page with selected sections
    await supabase.from('pages').upsert({ slug, title, sections: selectedSections });
    alert('Page saved!');
  };

  // --- Availability ---
  const handleAvailabilityChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAvailability(a => ({ ...a, [name]: value }));
  };

  const saveAvailability = async () => {
    setSavingAvailability(true);
    await supabase.from('availability').upsert(availability);
    setSavingAvailability(false);
  };

  if (!authenticated) {
    return (
      <div style={{ minHeight: '100vh', background: 'black', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <form onSubmit={handleLogin} style={{ background: '#181818', padding: 32, borderRadius: 12, boxShadow: '0 2px 12px #0008', minWidth: 320 }}>
          <h2 style={{ marginBottom: 24 }}>Admin Login</h2>
          <input
            type="text"
            placeholder="Username"
            value={loginForm.username}
            onChange={e => setLoginForm(f => ({ ...f, username: e.target.value }))}
            style={{ width: '100%', marginBottom: 16, padding: 10, borderRadius: 6, border: '1px solid #888', background: '#222', color: 'white' }}
            autoFocus
          />
          <input
            type="password"
            placeholder="Password"
            value={loginForm.password}
            onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
            style={{ width: '100%', marginBottom: 16, padding: 10, borderRadius: 6, border: '1px solid #888', background: '#222', color: 'white' }}
          />
          {loginError && <div style={{ color: 'red', marginBottom: 12 }}>{loginError}</div>}
          <button type="submit" style={{ width: '100%', padding: 12, borderRadius: 6, background: 'white', color: 'black', fontWeight: 700, border: 'none', marginBottom: 8 }}>Login</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', background: 'linear-gradient(120deg, #111 0%, #222 100%)', minHeight: '100vh', color: 'white' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: 'white', letterSpacing: '-0.04em' }}>Admin Dashboard</h1>
      <button onClick={handleLogout} style={{ position: 'absolute', top: 24, right: 24, background: '#222', color: 'white', border: '1px solid #888', borderRadius: 6, padding: '0.5em 1.2em', fontWeight: 600, cursor: 'pointer' }}>Logout</button>
      {/* Availability Status Editor */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1em', marginBottom: '2em', background: '#181818', borderRadius: 10, padding: '1em 2em', maxWidth: 600 }}>
        <span style={{ fontWeight: 600, color: 'white', fontSize: '1.1em' }}>Availability:</span>
        <span style={{ width: 16, height: 16, borderRadius: '50%', background: availability.color, display: 'inline-block', border: '2px solid #fff2', marginRight: 8 }}></span>
        <input
          name="status"
          value={availability.status || ''}
          onChange={handleAvailabilityChange}
          style={{ ...inputStyle, width: 220, marginBottom: 0 }}
          placeholder="Status message"
        />
        <input
          name="color"
          type="color"
          value={availability.color || '#00ff00'}
          onChange={handleAvailabilityChange}
          style={{ width: 36, height: 36, border: 'none', background: 'none', marginLeft: 8 }}
        />
        <button style={{ ...buttonStyle, padding: '0.5em 1.2em', margin: 0 }} onClick={saveAvailability} disabled={savingAvailability}>
          {savingAvailability ? 'Saving...' : 'Save'}
        </button>
      </div>
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
                style={(hovered === idx ? { ...cardStyle, ...cardHover } : cardStyle) as React.CSSProperties}
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
                  {Array.isArray(p.technologies) ? p.technologies.map((t, i) => (
                    <span key={i} style={tagStyle}>{t}</span>
                  )) : typeof p.technologies === 'string' && p.technologies ? p.technologies.split(',').map((t, i) => (
                    <span key={i} style={tagStyle}>{t.trim()}</span>
                  )) : null}
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
              <TagInput
                value={Array.isArray(projectForm.technologies) ? projectForm.technologies : typeof projectForm.technologies === 'string' && projectForm.technologies ? projectForm.technologies.split(',').map(t => t.trim()) : []}
                onChange={(tags) => setProjectForm(f => ({ ...f, technologies: tags }))}
                placeholder="Add technologies..."
              />
              <label style={labelStyle}>Project Link</label>
              <input name="link" value={projectForm.link || ''} onChange={handleProjectFormChange} style={inputStyle} placeholder="Project Link" />
              <label style={labelStyle}>Project Categories</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5em', marginBottom: '1em' }}>
                {projectCategories.map(category => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => handleCategoryToggle(category)}
                    style={{
                      padding: '0.4em 0.8em',
                      borderRadius: 6,
                      border: '1px solid #888',
                      background: (projectForm.categories || []).includes(category) ? '#fff' : 'transparent',
                      color: (projectForm.categories || []).includes(category) ? '#000' : '#fff',
                      cursor: 'pointer',
                      fontSize: '0.9em',
                      transition: 'all 0.2s'
                    }}
                  >
                    {category}
                  </button>
                ))}
              </div>
              <div style={{ margin: '1em 0' }}>
                <b style={{ color: 'white' }}>Case Study Sections</b>
                <ul style={{ margin: '0.5em 0 0 0', padding: 0, listStyle: 'none' }}>
                  {(projectForm.casestudysections || []).map((cs, i) => (
                    <li key={(cs.title || '') + '-' + i} style={{ marginBottom: '0.5em', background: '#222', borderRadius: 6, padding: '0.5em 1em', color: 'white', border: '1px solid #fff2' }}>
                      <b>{cs.title}</b> - {cs.description}
                      <button
                        style={hoveredBtn === `editcs${i}` ? { ...buttonStyle, ...buttonHover } : buttonStyle}
                        onMouseEnter={() => setHoveredBtn(`editcs${i}`)}
                        onMouseLeave={() => setHoveredBtn(null)}
                        onClick={() => {
                          setCaseSection(cs);
                          setEditingCaseSectionIdx(i);
                        }}
                      >Edit</button>
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
                  <button style={{ ...buttonStyle, padding: '0.3em 1em', fontSize: '0.9em' }} onClick={handleAddOrEditCaseSection}>{editingCaseSectionIdx !== null ? 'Save' : 'Add'}</button>
                  {editingCaseSectionIdx !== null && (
                    <button style={{ ...deleteButtonStyle, padding: '0.3em 1em', fontSize: '0.9em' }} onClick={() => { setCaseSection({ title: '', description: '', image: '' }); setEditingCaseSectionIdx(null); }}>Cancel</button>
                  )}
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