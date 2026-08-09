import fetch from 'node-fetch';

const links = [
  { name: '3-Seater Fabric Sofa', url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80' },
  { name: 'Queen Size Storage Bed', url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80' },
  { name: 'Solid Wood Dining Table', url: 'https://images.unsplash.com/photo-1617098900591-3f90928e8c54?auto=format&fit=crop&w=800&q=80' },
  { name: 'Ergonomic Mesh Office Chair', url: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&w=800&q=80' },
  { name: 'Bookshelf', url: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?auto=format&fit=crop&w=800&q=80' },
  { name: 'Non-Stick Cookware Set', url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80' },
  { name: 'Chef Knife Set 5-Piece', url: 'https://images.unsplash.com/photo-1593618998160-e34014e67546?auto=format&fit=crop&w=800&q=80' },
  { name: 'Stainless Steel Pressure Cooker', url: 'https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=800&q=80' },
  { name: 'French Press Coffee Maker', url: 'https://images.unsplash.com/photo-1572119865084-43c285814d63?auto=format&fit=crop&w=800&q=80' },
  { name: 'Canvas Wall Art 3-Piece', url: 'https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=800&q=80' },
  { name: 'Velvet Cushion Covers', url: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80' },
  { name: 'Blackout Curtains', url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80' },
  { name: 'Handwoven Area Rug', url: 'https://images.unsplash.com/photo-1600166898405-da9535204843?auto=format&fit=crop&w=800&q=80' },
  { name: 'Minimalist Desk Lamp', url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80' },
];

async function verify() {
  console.log('Testing batch 3 user provided image links...\n');
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
