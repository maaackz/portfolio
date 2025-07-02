"use client";
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Effects from '@/components/Effects';
import { supabase } from '@/lib/supabaseClient';

const SINGULAR_LABELS: { [key: string]: string } = {
  websites: 'website',
  games: 'game',
  software: 'software',
  design: 'design',
  videos: 'video',
  tools: 'tool',
};

interface Project {
  id: string;
  title?: string;
  slug?: string;
  description?: string;
  image?: string;
  type?: string;
  date?: string;
  category?: string;
  section?: string;
  categories?: string[];
  technologies?: string[];
  link?: string;
  casestudysections?: { title: string; description: string; image?: string }[];
}

export default function ProjectPage() {
  const params = useParams();
  const slug = typeof params?.slug === 'string' ? params.slug : Array.isArray(params?.slug) ? params.slug[0] : '';
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    const fetchProject = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('projects').select('*').eq('slug', slug).single();
      if (!error && data) setProject(data);
      setLoading(false);
    };
    fetchProject();
  }, [slug]);

  if (loading) {
    return <div className="project-page"><Navbar /><div className="loading"></div></div>;
  }
  if (!project) {
    return <div className="project-page"><Navbar /><div className="error">project not found.</div></div>;
  }

  // Get all categories and convert to singular labels
  let allCategories: string[] = [];
  if (project.categories && project.categories.length > 0) {
    allCategories = project.categories.map(cat => SINGULAR_LABELS[cat] || cat);
  } else if (project.category && !project.categories) {
    allCategories = [SINGULAR_LABELS[project.category] || project.category];
  } else if (project.section && !project.categories) {
    allCategories = [SINGULAR_LABELS[project.section] || project.section];
  } else if (project.type && !project.categories) {
    allCategories = [project.type];
  }
  const label = allCategories.join('. ') + (allCategories.length > 0 ? '.' : '');

  return (
    <div className="project-page">
      <Navbar />
      <Effects />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="project-case-main">
          <div className="project-case-image polaroid squiggly">
            <img src={project.image || '/images/placeholder.png'} alt={project.title} />
            <div className="project-case-image-caption">
              <div className="project-case-image-title">{project.title}</div>
              <div className="project-case-image-type">{label}</div>
              {project.link && (
                <a className="project-case-readmore" href={project.link} target="_blank" rel="noopener noreferrer">read more &rarr;</a>
              )}
            </div>
          </div>
          <div className="project-case-content faded-bg">
            <h1 className="project-case-title">{project.title}</h1>
            <h2 className="project-case-type">{label}</h2>
            {project.description && (
              <p className="project-case-desc">{project.description}</p>
            )}
            {project.technologies && (
              <div className="project-case-tags">
                {project.technologies.map((tech, i) => (
                  <span className="project-case-tag squiggly" key={i}>{tech}</span>
                ))}
              </div>
            )}
            {project.link && (
              <a className="project-case-demo squiggly" href={project.link} target="_blank" rel="noopener noreferrer">live demo / link to site</a>
            )}
          </div>
        </div>
        <div className="project-case-study">
          {project.casestudysections && project.casestudysections.length > 0 ? (
            project.casestudysections.map((section, idx) => (
              <div className="case-row" key={idx}>
                {section.image ? (
                  <div className="case-img-placeholder squiggly">
                    <img src={section.image} alt={section.title} style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8 }} />
                  </div>
                ) : (
                  <div className="case-img-placeholder squiggly">[ picture ]</div>
                )}
                <div className="case-desc-block">
                  <h3 className="case-title">{section.title}</h3>
                  <p className="case-desc">{section.description}</p>
                </div>
              </div>
            ))
          ) : null}
        </div>
      </div>
      <Footer />
    </div>
  );
} 