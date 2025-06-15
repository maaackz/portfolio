// === client/src/components/PageEditor.jsx ===
import React, { useState, useEffect } from 'react';

export default function PageEditor() {
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

  return (
    <div style={{ padding: '2rem' }}>
      <h1>CMS Admin Panel</h1>

      <h2>Section Manager</h2>
      <input value={newSecId} onChange={(e) => setNewSecId(e.target.value)} placeholder="Section ID (e.g. websites)" />
      <input value={newSecTitle} onChange={(e) => setNewSecTitle(e.target.value)} placeholder="Section Title" />
      <textarea value={newSecContent} onChange={(e) => setNewSecContent(e.target.value)} placeholder="Section Content" />
      <button onClick={createSection}>Save Section</button>

      <h3>Available Sections</h3>
      {availableSections.map((s, i) => (
        <div key={i}>
          <label>
            <input
              type="checkbox"
              checked={selectedSections.includes(s.id)}
              onChange={() => toggleSection(s.id)}
            />
            {s.id} — {s.title}
          </label>
          <button onClick={() => deleteSection(s.id)} style={{ marginLeft: '0.5rem' }}>🗑</button>
        </div>
      ))}

      <hr />

      <h2>Page Builder</h2>
      <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category (e.g. websites)" />
      <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="Page Slug (e.g. my-portfolio)" />
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Page Title" />
      <button onClick={handleSavePage}>Save Page</button>
    </div>
  );
}