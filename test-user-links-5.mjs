import fetch from 'node-fetch';

const links = [
  { name: 'Floral Summer Maxi Dress', url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80' },
  { name: 'Cocktail Evening Dress', url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80' },
  { name: 'Silk Blouse Top', url: 'https://images.unsplash.com/photo-1564257577054-3e6b8a8c1e8c?auto=format&fit=crop&w=800&q=80' },
  { name: 'Designer Banarasi Saree', url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80' },
  { name: 'Embroidered Cotton Kurta', url: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=800&q=80' },
  { name: 'Anarkali Suit Set', url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=80' },
  { name: 'High-Waisted Denim Jeans', url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80' },
  { name: 'Pleated A-Line Skirt', url: 'https://images.unsplash.com/photo-1583496661160-fb5886a13d27?auto=format&fit=crop&w=800&q=80' },
  { name: 'Ankle-Length Leggings', url: 'https://images.unsplash.com/photo-1506629905607-d9c297d9a7f7?auto=format&fit=crop&w=800&q=80' },
  { name: 'Trench Coat', url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80' },
  { name: 'Fitted Denim Jacket', url: 'https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=800&q=80' },
  { name: 'Oversized Blazer', url: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=800&q=80' },
  { name: 'Structured Leather Handbag', url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80' },
  { name: 'Evening Clutch', url: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=800&q=80' },
  { name: 'Gold Plated Necklace Set', url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80' },
  { name: 'Crystal Earrings', url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80' },
  { name: 'Stiletto High Heels', url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80' },
  { name: 'Leather Loafers/Flats', url: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=800&q=80' },
  { name: 'Ankle Boots', url: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=800&q=80' },
  { name: 'Comfort Sandals', url: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&w=800&q=80' },
];

async function verify() {
  console.log('Testing batch 5 user provided image links...\n');
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
