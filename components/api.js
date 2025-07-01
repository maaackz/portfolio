// === client/src/api.js ===
export async function getPage(slug) {
  const res = await fetch(`/api/pages/${slug}`);
  if (!res.ok) throw new Error('Page not found');
  return await res.json();
}

export async function savePage(slug, data) {
  const res = await fetch(`/api/pages/${slug}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await res.json();
}