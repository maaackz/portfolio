import React, { useEffect, useState } from 'react';
import './styles/main.css'; // ✅ Renamed & imported as global CSS
import { copyText as copyEmail, setupReveal } from '../homeUtils';
import ProjectCard from '../components/ProjectCard';
import CategoryFilter from '../components/CategoryFilter';
import Navbar from './Navbar';
import Footer from './Footer';
import Effects from './Effects';
import { useLocation, useNavigate } from 'react-router-dom';

export default function HomePageCMS() {
  const [sections, setSections] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const [availability, setAvailability] = useState({ status: '', color: '#00ff00' });

  useEffect(() => {
    setupReveal();

    fetch('/api/sections')
      .then(res => res.json())
      .then(setSections)
      .catch(console.error);

    fetch('/api/projects')
      .then(res => res.json())
      .then(baseProjects => {
        fetch('/api/structure')
          .then(res => res.json())
          .then(data => {
            const promises = (data.categories || []).flatMap(cat =>
              (cat.pages || []).map(slug =>
                fetch(`/api/${cat.slug}/${slug}`)
                  .then(r => r.json())
                  .then(page => ({ ...page, category: cat.slug }))
              )
            );
            return Promise.all(promises).then(structuredProjects => {
              const allProjects = [...baseProjects, ...structuredProjects];
              setProjects(allProjects);
              setFilteredProjects(allProjects);
            });
          })
          .catch(console.error);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetch('/api/availability')
      .then(res => res.json())
      .then(data => setAvailability(data))
      .catch(() => setAvailability({ status: 'i am available for work.', color: '#00ff00' }));
  }, []);

  // Filter projects when activeCategory or search changes
  useEffect(() => {
    let filtered = projects;
    if (activeCategory !== 'all') {
      filtered = filtered.filter(project =>
        project.category === activeCategory || project.section === activeCategory
      );
    }
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      filtered = filtered.filter(project =>
        (project.title && project.title.toLowerCase().includes(s))
      );
    }
    setFilteredProjects(filtered);
  }, [activeCategory, projects, search]);

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const titles = ['designer', 'developer', 'writer', 'poet', 'creative'];
  const [currentTitle, setCurrentTitle] = useState(titles[0]);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimating(true); // trigger animation
      setTimeout(() => {
        setCurrentTitle(prev => {
          const index = titles.indexOf(prev);
          return titles[(index + 1) % titles.length];
        });
        setAnimating(false); // reset animation
      }, 300); // matches animation duration
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleCopy = () => {
    const copyButton = document.getElementById("copy");
    navigator.clipboard.writeText("contact@maaackz.com");
    copyButton.textContent = "copied.";
    setTimeout(() => {
      copyButton.textContent = "copy.";
    }, 5000);
  };

  // Compute project counts for each category and for 'all'
  const projectCounts = React.useMemo(() => {
    const counts = { all: projects.length };
    sections.forEach(section => {
      counts[section.id] = projects.filter(
        p => p.category === section.id || p.section === section.id
      ).length;
    });
    return counts;
  }, [projects, sections]);

  React.useEffect(() => {
    if (location.state && location.state.scrollTo) {
      const section = document.getElementById(location.state.scrollTo);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
        // Clear the state so it doesn't scroll again
        navigate('.', { replace: true, state: {} });
      }
    }
  }, [location, navigate]);

  return (
    <div id="body">
      <Navbar active="work" />
      <Effects />

      <main>
        <section id="hero">
          <a href="#work">
            <button className="hero-button nowrap">
              <h3 className="hero-button-text"></h3>
              <svg className="hero-button-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 67 74" fill="none">
                <path d="M5 32C2.23858 32 0 34.2386 0 37C0 39.7614 2.23858 42 5 42V32ZM65.5355 40.5355C67.4882 38.5829 67.4882 35.4171 65.5355 33.4645L33.7157 1.64466C31.7631 -0.307961 28.5973 -0.307961 26.6447 1.64466C24.692 3.59728 24.692 6.76311 26.6447 8.71573L54.9289 37L26.6447 65.2843C24.692 67.2369 24.692 70.4027 26.6447 72.3553C28.5973 74.308 31.7631 74.308 33.7157 72.3553L65.5355 40.5355ZM5 42H62V32H5V42Z" fill="white"/>
              </svg>
            </button>
          </a>
        </section>

        <section id="about" className="reveal">
          <h2 className="label">about.</h2>
          <h2 className="description">
            i'm an 20-year old college student from california who's passionate about making cool stuff.
          </h2>
          <section className="slider-container">
            <div className="slider-track">
              {[...Array(3)].map((_, i) => (
                [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                  <div className="img-outline">
                    <div className="squiggly">
                      <img key={`${i}-${n}`} src={`/images/film-carousel/${n}.jpg`} alt={`film ${n}`}/>
                    </div>
                    
                  </div>
                  
                ))
              ))}
            </div>
          </section>
        </section>

        <section id="work" className="reveal">
          <h2 className="label">work.</h2>
          <h2 className="description">here's some projects that i've worked on.</h2>
          <div className="filter-bar squiggly">
            <CategoryFilter 
              categories={sections}
              activeCategory={activeCategory}
              onCategoryChange={handleCategoryChange}
              counts={projectCounts}
            />
            <div className="search-bar-wrapper">
              <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" stroke="#888" strokeWidth="3"/><line x1="16.5" y1="16.5" x2="22" y2="22" stroke="#888" strokeWidth="3" strokeLinecap="square"/></svg>
              <input
                className="project-search"
                type="text"
                placeholder="search projects..."
                value={search}
                onChange={handleSearchChange}
              />
            </div>
          </div>
          <div className="projects">
            {filteredProjects.map((p, i) => (
              <ProjectCard
                key={i}
                id={p.id}
                slug={p.slug}
                title={p.title}
                link={p.link}
                image={p.image}
                type={p.type}
                date={p.date || 'n/a'}
                category={p.category}
                section={p.section}
              />
            ))}
          </div>
        </section>

        <section id="contact" className="reveal">
          <h2 className="label">contact.</h2>
          <h2 className="description">let's work together.</h2>
          <ul className="contact-info">
            <li className="contact">
              <span>
                <a href="mailto:contact@maaackz.com" id="email">contact@maaackz.com.</a>
                <button onClick={handleCopy} className="copy" id="copy">copy.</button>
              </span>
            </li>
            <li className="contact"><a href="sms://+15623831777">+15623831777.</a></li>
            <li className="contact"><a href="https://instagram.com/maaaaackz">@maaaaackz.</a></li>
          </ul>
          <span className="availability">
            <p className="status">status: {availability.status}</p>
            <span className="status-dot squiggly" style={{ backgroundColor: availability.color }}></span>
          </span>
        </section>
      </main>

      <Footer />
    </div>
  );
}
