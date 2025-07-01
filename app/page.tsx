"use client";
import React, { useEffect, useState, useMemo, ChangeEvent } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Effects from '../components/Effects';
import ProjectCard from '../components/ProjectCard';
import CategoryFilter from '../components/CategoryFilter';
import { copyText as copyEmail, setupReveal } from '../components/homeUtils';
import { supabase } from '@/lib/supabaseClient';
import './globals.css';

// Types for Supabase data
interface Section {
  id: string;
  name: string;
  [key: string]: any;
}

interface Project {
  id: string;
  slug?: string;
  title?: string;
  link?: string;
  image?: string;
  type?: string;
  date?: string;
  category?: string;
  section?: string;
  categories?: string[];
  [key: string]: any;
}

interface Availability {
  status: string;
  color: string;
}

export default function HomePageCMS() {
  const [sections, setSections] = useState<Section[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [availability, setAvailability] = useState<Availability>({ status: '', color: '#00ff00' });

  useEffect(() => {
    setupReveal();
    // Fetch sections from Supabase
    supabase.from('sections').select('*').then(({ data, error }) => {
      if (!error) setSections(data || []);
    });
    // Fetch projects from Supabase
    supabase.from('projects').select('*').then(({ data, error }) => {
      if (!error) {
        setProjects(data || []);
        setFilteredProjects(data || []);
      }
    });
    // Fetch availability from Supabase (if you have a table for it)
    supabase.from('availability').select('*').single().then(({ data, error }) => {
      if (!error && data) setAvailability(data);
    });
  }, []);

  // Filter projects when activeCategory or search changes
  useEffect(() => {
    let filtered = projects;
    if (activeCategory !== 'all') {
      filtered = filtered.filter(project =>
        (project.categories && project.categories.includes(activeCategory)) || 
        project.category === activeCategory || 
        project.section === activeCategory
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

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const titles = ['designer', 'developer', 'writer', 'poet', 'creative'];
  const [currentTitle, setCurrentTitle] = useState<string>(titles[0]);
  const [animating, setAnimating] = useState<boolean>(false);

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
    if (copyButton) {
      copyButton.textContent = "copied.";
      setTimeout(() => {
        if (copyButton) copyButton.textContent = "copy.";
      }, 5000);
    }
  };

  // Compute project counts for each category and for 'all'
  const projectCounts = useMemo(() => {
    const counts: { [key: string]: number } = { all: projects.length };
    sections.forEach(section => {
      counts[section.id] = projects.filter(
        p => (p.categories && p.categories.includes(section.id)) || 
             p.category === section.id || 
             p.section === section.id
      ).length;
    });
    return counts;
  }, [projects, sections]);

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
                  <div className="img-outline" key={`${i}-${n}`}>
                    <div className="squiggly">
                      <img src={`/images/film-carousel/${n}.jpg`} alt={`film ${n}`}/>
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
                categories={p.categories}
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