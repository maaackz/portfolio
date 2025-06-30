import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();

  const handleNav = (section) => (e) => {
    e.preventDefault();
    navigate('/', { state: { scrollTo: section } });
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