// === client/src/components/ProjectCard.jsx ===
import React from 'react';
import { useNavigate } from 'react-router-dom';

const SINGULAR_LABELS = {
  websites: 'website',
  games: 'game',
  software: 'software',
  design: 'design',
  videos: 'video',
  // add more as needed
};

export default function ProjectCard({ title, link, image, type, date, id, slug, category, section }) {
  const navigate = useNavigate();

  const handleClick = (e) => {
    e.preventDefault();
    const projectSlug = slug || id;
    if (projectSlug) {
      navigate(`/projects/${projectSlug}`);
    }
  };

  // Prefer category, fallback to section, fallback to type
  const label = SINGULAR_LABELS[category] || SINGULAR_LABELS[section] || type || '';

  return (
    <div className="project" onClick={handleClick}>
      <div className="preview-container squiggly">
        <img src={image || 'images/placeholder.png'} alt={title} className="preview" />
      </div>
      <div className="project-details">
        <p className="project-title">{title}</p>
        <span className="project-details-top">
          <p className="project-type">{label}.</p>
          {/* <p className="date">{date || ''}</p> */}
        </span>
      </div>
    </div>
  );
}
