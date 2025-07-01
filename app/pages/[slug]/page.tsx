"use client";
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

interface PageSection {
  title: string;
  content: string;
}

interface PageData {
  title: string;
  sections: PageSection[];
}

export default function PageViewer() {
  const params = useParams();
  const slug = typeof params?.slug === 'string' ? params.slug : Array.isArray(params?.slug) ? params.slug[0] : '';
  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    const fetchPage = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('pages').select('*').eq('slug', slug).single();
      if (!error && data) setPage(data);
      setLoading(false);
    };
    fetchPage();
  }, [slug]);

  if (loading) return <div>Loading...</div>;
  if (!page) return <div>Page not found.</div>;

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