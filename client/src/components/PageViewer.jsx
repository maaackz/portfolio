// === client/src/components/PageViewer.jsx ===
import React, { useEffect, useState } from 'react';
import { getPage } from '../api';

import { useParams } from 'react-router-dom';

export default function PageViewer() {
  const { slug } = useParams(); // <-- gets /:slug from the URL
  const [page, setPage] = useState(null);

  useEffect(() => {
    if (!slug) return;
    getPage(slug).then(setPage).catch(console.error);
  }, [slug]);

  if (!page) return <div>Loading...</div>;

  return (
    <div>
      <h1>{page.title}</h1>
      {page.sections.map((sec, idx) => (
        <div key={idx}>
          <h2>{sec.title}</h2>
          <p>{sec.content}</p>
        </div>
      ))}
    </div>
  );
}
