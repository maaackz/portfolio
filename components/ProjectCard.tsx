"use client";
import React from 'react';
import Link from 'next/link';

const SINGULAR_LABELS: { [key: string]: string } = {
  websites: 'website',
  games: 'game',
  software: 'software',
  design: 'design',
  videos: 'video',
  tools: 'tool',
  // add more as needed
};

interface ProjectCardProps {
  title?: string;
  link?: string;
  image?: string;
  type?: string;
  date?: string;
  id?: string;
  slug?: string;
  category?: string;
  section?: string;
  categories?: string[];
}

export default function ProjectCard({ title, link, image, type, date, id, slug, category, section, categories }: ProjectCardProps) {
  // Get all categories and convert to singular labels
  let allCategories: string[] = [];
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
  const projectSlug = slug || id;

  return (
    <Link href={projectSlug ? `/projects/${projectSlug}` : '#'} className="project">
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
    </Link>
  );
}
