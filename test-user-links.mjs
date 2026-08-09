import fetch from 'node-fetch';

const links = [
  { name: 'Executive Leather Notebook', url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80' },
  { name: 'Gel Ink Pens 10-Pack', url: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=800&q=80' },
  { name: 'All-in-One Laser Printer', url: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=800&q=80' },
  { name: 'Magnetic Dry-Erase Whiteboard', url: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=800&q=80' },
  { name: 'Educational Building Blocks Set', url: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80' },
  { name: 'Remote Control Off-Road Car', url: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=800&q=80' },
  { name: '1000-Piece Jigsaw Puzzle', url: 'https://images.unsplash.com/photo-1606503153255-59d8b8b821b7?auto=format&fit=crop&w=800&q=80' },
  { name: 'Full Face Motorcycle Helmet', url: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80' },
  { name: 'Leather Riding Jacket', url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80' },
  { name: 'Synthetic 5W-40 Engine Oil 4L', url: 'https://images.unsplash.com/photo-1625047509248-ec889cbff17f?auto=format&fit=crop&w=800&q=80' },
  { name: 'Car Pressure Washer Tool', url: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=800&q=80' },
  { name: 'Sony WH-1000XM6', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80' },
];

async function verify() {
  console.log('Testing user provided image links...\n');
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
