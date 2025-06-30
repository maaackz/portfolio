import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function ProjectPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const findProject = async () => {
      try {
        // First try to get from the new projects endpoint
        const response = await fetch(`/api/projects/${slug}`);
        if (response.ok) {
          const foundProject = await response.json();
          setProject(foundProject);
          setLoading(false);
          return;
        }

        // If not found, try the old structure approach
        const structureResponse = await fetch('/api/structure');
        const structure = await structureResponse.json();
        
        for (const category of structure.categories || []) {
          for (const pageSlug of category.pages || []) {
            if (pageSlug === slug) {
              const pageResponse = await fetch(`/api/${category.slug}/${pageSlug}`);
              const pageData = await pageResponse.json();
              setProject({ ...pageData, category: category.slug });
              setLoading(false);
              return;
            }
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading project:', error);
        setLoading(false);
      }
    };

    findProject();
  }, [slug]);

  if (loading) {
    return (
      <div className="project-page">
        <div className="loading">loading...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="project-page">
        <div className="error">project not found.</div>
        <button onClick={() => navigate('/')} className="back-button">back to home.</button>
      </div>
    );
  }

  return (
    <div className="project-page">
      <header>
        <nav>
          <span className="home nowrap">
            <a href="/"><h1 className="name">max m.</h1></a>
          </span>
          <button onClick={() => navigate('/')} className="back-button">back to work.</button>
        </nav>
      </header>

      <main className="project-content">
        <div className="project-hero">
          <div className="project-image-container squiggly">
            <img 
              src={project.image || '/images/placeholder.png'} 
              alt={project.title} 
              className="project-hero-image"
            />
          </div>
          <div className="project-hero-info">
            <h1 className="project-title">{project.title}</h1>
            <p className="project-type">{project.type}.</p>
            {project.date && <p className="project-date">{project.date}.</p>}
            {project.category && <p className="project-category">{project.category}.</p>}
          </div>
        </div>

        <div className="project-details">
          {project.description && (
            <section className="project-description">
              <h2 className="section-title">description.</h2>
              <p className="description-text">{project.description}</p>
            </section>
          )}

          {project.technologies && (
            <section className="project-technologies">
              <h2 className="section-title">technologies.</h2>
              <div className="tech-tags">
                {project.technologies.map((tech, index) => (
                  <span key={index} className="tech-tag">{tech}</span>
                ))}
              </div>
            </section>
          )}

          {project.features && (
            <section className="project-features">
              <h2 className="section-title">features.</h2>
              <ul className="features-list">
                {project.features.map((feature, index) => (
                  <li key={index} className="feature-item">{feature}</li>
                ))}
              </ul>
            </section>
          )}

          {project.content && (
            <section className="project-content-section">
              <h2 className="section-title">details.</h2>
              <div className="content-text" dangerouslySetInnerHTML={{ __html: project.content }} />
            </section>
          )}

          {(project.link || project.github) && (
            <section className="project-links">
              <h2 className="section-title">links.</h2>
              <div className="project-links-container">
                {project.link && (
                  <a href={project.link} target="_blank" rel="noopener noreferrer" className="project-link">
                    view project.
                  </a>
                )}
                {project.github && (
                  <a href={project.github} target="_blank" rel="noopener noreferrer" className="project-link">
                    view code.
                  </a>
                )}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
} 