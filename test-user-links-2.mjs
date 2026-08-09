import fetch from 'node-fetch';

const links = [
  { name: 'English Willow Cricket Bat', url: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=800&q=80' },
  { name: 'Official Size 5 Football', url: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80' },
  { name: 'Anti-Burst Yoga Mat', url: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=800&q=80' },
  { name: 'Adjustable Dumbbell Set', url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=80' },
  { name: 'Whey Protein Isolate', url: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=800&q=80' },
  { name: 'Matte Liquid Lipstick', url: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80' },
  { name: 'Vitamin C Serum 30ml', url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80' },
  { name: 'Hydrating Shampoo 500ml', url: 'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=800&q=80' },
  { name: 'Eau de Parfum 100ml Spray', url: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80' },
];

async function verify() {
  console.log('Testing second batch of user provided image links...\n');
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
