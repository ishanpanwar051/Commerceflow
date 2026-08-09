import fetch from 'node-fetch';

const links = [
  { name: 'High-Performance Running Shoes', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80' },
  { name: 'Retro Leather Casual Sneakers', url: 'https://images.unsplash.com/photo-1495555961986-6d4c1ecb7be3?auto=format&fit=crop&w=800&q=80' },
  { name: 'Slip-On Canvas Shoes', url: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80' },
  { name: 'Genuine Leather Oxford Shoes', url: 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?auto=format&fit=crop&w=800&q=80' },
  { name: 'Derby Dress Shoes', url: 'https://images.unsplash.com/photo-1449247709967-d4461a6a6103?auto=format&fit=crop&w=800&q=80' },
  { name: 'Chelsea Leather Boots', url: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&w=800&q=80' },
  { name: 'Outdoor Sport Sandals', url: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&w=800&q=80' },
  { name: 'Memory Foam Slippers', url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80' },
  { name: 'Flip Flops', url: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&w=800&q=80' },
];

async function verify() {
  console.log('Testing batch 4 user provided image links...\n');
  for (const item of links) {
    try {
      const res = await fetch(item.url, { method: 'HEAD' });
      console.log(`[${res.status}] ${item.name} -> ${item.url}`);
    } catch (e) {
      console.log(`[ERR] ${item.name} -> ${e.message}`);
    }
  }
}

verify();
