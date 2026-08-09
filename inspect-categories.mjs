import fetch from 'node-fetch';

async function test() {
  const res = await fetch('https://commerceflow-api-1s7i.onrender.com/api/v1/categories');
  const json = await res.json();
  const cats = json.data || [];
  console.log('Total categories:', cats.length);
  const parentCats = cats.filter(c => !c.parentId);
  console.log('Parent categories (no parentId):', parentCats.length);
  parentCats.forEach(c => console.log(' -', c.name, 'id:', c.id, 'parentId:', c.parentId));
}

test();
