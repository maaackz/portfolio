// === client/src/components/ProjectCard.jsx ===
import React from 'react';
import { useNavigate } from 'react-router-dom';

const SINGULAR_LABELS = {
  websites: 'website',
  games: 'game',
  software: 'software',
  design: 'design',
  videos: 'video',
  tools: 'tool',
  // add more as needed
};

export default function ProjectCard({ title, link, image, type, date, id, slug, category, section, categories }) {
  const navigate = useNavigate();

  const handleClick = (e) => {
    e.preventDefault();
    const projectSlug = slug || id;
    if (projectSlug) {
      navigate(`/projects/${projectSlug}`);
    }
  };

  // Get all categories and convert to singular labels
  let allCategories = [];
  if (categories && categories.length > 0) {
    allCategories = categories.map(cat => SINGULAR_LABELS[cat] || cat);
  } else if (category && !categories) {
    allCategories = [SINGULAR_LABELS[category] || category];
  } else if (section && !categories) {
    allCategories = [SINGULAR_LABELS[section] || section];
  } else if (type && !categories) {
    allCategories = [type];
  }
  
  const label = allCategories.join('. ') + (allCategories.length > 0 ? '.' : '');

  return (
    <div className="project" onClick={handleClick}>
      <div className="preview-container squiggly">
        <img src={image || 'images/placeholder.png'} alt={title} className="preview" />
      </div>
      <div className="project-details">
        <p className="project-title">{title}</p>
        <span className="project-details-top">
          <p className="project-type">{label}</p>
          {/* <p className="date">{date || ''}</p> */}
        </span>
      </div>
    </div>
  );
}
