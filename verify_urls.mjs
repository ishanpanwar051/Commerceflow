import fetch from 'node-fetch';

const urls = {
  'Smartphone': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
  'Laptop': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
  'Keyboard': 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
  'Controller': 'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&w=800&q=80',
  'Nike Shoe': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80'
};

async function test() {
  for (const [name, url] of Object.entries(urls)) {
    const res = await fetch(url);
    console.log(`${name}: HTTP ${res.status}, Type: ${res.headers.get('content-type')}`);
  }
}

test();
