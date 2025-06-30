// === client/src/components/ProjectCard.jsx ===
import React from 'react';

export default function ProjectCard({ title, link, image, type, date }) {
  return (
    <a className="project" href={link || '#'}>
      <div className="preview-container squiggly">
        <img src={image || 'images/placeholder.png'} alt={title} className="preview" />
      </div>
      <div className="project-details">
        <p className="project-title">{title}</p>
        <span className="project-details-top">
          <p className="project-type">{type + "."}</p>
          {/* <p className="date">{date || ''}</p> */}
        </span>
      </div>
    </a>
  );
}
