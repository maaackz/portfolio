import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function CategoryViewer() {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);

  useEffect(() => {
    fetch('/api/structure')
      .then(res => res.json())
      .then(data => {
        const cat = data.categories.find(c => c.slug === slug);
        setCategory(cat);
      })
      .catch(console.error);
  }, [slug]);

  if (!category) return <div>Loading category...</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>{category.title}</h1>
      <ul>
        {category.pages.map((p, idx) => (
          <li key={idx}>
            <Link to={`/${slug}/${p}`}>{p}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
