import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  const [sections, setSections] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/sections')
      .then(res => res.json())
      .then(setSections)
      .catch(console.error);
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>My Portfolio</h1>
      <h2>Available Sections</h2>
      <ul>
        {sections.map((section, idx) => (
          <li key={idx}>
            <Link to={`/${section.id}`}>{section.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
