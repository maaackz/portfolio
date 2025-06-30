import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import Effects from './Effects';

const SINGULAR_LABELS = {
  websites: 'website',
  games: 'game',
  software: 'software',
  design: 'design',
  videos: 'video',
  tools: 'tool',
  // add more as needed
};

export default function ProjectPage() {
  const { slug } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const findProject = async () => {
      try {
        const response = await fetch(`/api/projects/${slug}`);
        if (response.ok) {
          const foundProject = await response.json();
          setProject(foundProject);
          setLoading(false);
          return;
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };
    findProject();
  }, [slug]);

  if (loading) {
    return <div className="project-page"><Navbar /><div className="loading"></div></div>;
  }
  if (!project) {
    return <div className="project-page"><Navbar /><div className="error">project not found.</div></div>;
  }

  // Get all categories and convert to singular labels
  let allCategories = [];
  if (project.categories && project.categories.length > 0) {
    allCategories = project.categories.map(cat => SINGULAR_LABELS[cat] || cat);
  } else if (project.category && !project.categories) {
    allCategories = [SINGULAR_LABELS[project.category] || project.category];
  } else if (project.section && !project.categories) {
    allCategories = [SINGULAR_LABELS[project.section] || project.section];
  } else if (project.type && !project.categories) {
    allCategories = [project.type];
  }
  
  const label = allCategories.join('. ') + (allCategories.length > 0 ? '' : '');

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
              <div className="project-case-image-type">{label}.</div>
              <a className="project-case-readmore" href={project.link} target="_blank" rel="noopener noreferrer">read more &rarr;</a>
            </div>
          </div>
          <div className="project-case-content faded-bg">
            <h1 className="project-case-title">{project.title}</h1>
            <h2 className="project-case-type">{label}.</h2>
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
              <a className="project-case-demo squiggly" href={project.link} target="_blank" rel="noopener noreferrer">live demo / link to site ↗</a>
            )}
          </div>
        </div>
        <div className="project-case-study">
          {project.caseStudySections && project.caseStudySections.length > 0 ? (
            project.caseStudySections.map((section, idx) => (
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