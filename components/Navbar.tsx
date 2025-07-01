"use client";
import React from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  // Scroll to section by id (only on homepage)
  const handleNav = (section: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (pathname === '/' || pathname === '/home') {
      if (section === 'root') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const el = document.getElementById(section);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // On other pages, navigate to homepage with hash
      if (section === 'root') {
        router.push('/');
      } else {
        router.push('/#' + section);
      }
    }
  };

  return (
    <header>
      <nav className="navbar-vertical">
        <span className="home nowrap">
          <span style={{ cursor: 'pointer' }} onClick={handleNav('root')}><h1 className="name">max m.</h1></span>
          <h2 className="job">developer.</h2>
        </span>
        <ul className="links nowrap">
          <li className="link"><a href="#about" onClick={handleNav('about')}>about.</a></li>
          <li className="link"><a href="#work" onClick={handleNav('work')}>work.</a></li>
          <li className="link"><a href="#contact" onClick={handleNav('contact')}>contact.</a></li>
        </ul>
      </nav>
    </header>
  );
} 