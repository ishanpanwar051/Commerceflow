import fetch from 'node-fetch';

const links = [
  { name: 'Cotton Crew Neck T-Shirt', url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80' },
  { name: 'Graphic Printed Tee', url: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=800&q=80' },
  { name: 'Slim Fit Polo T-Shirt', url: 'https://images.unsplash.com/photo-1625910513413-5fc45fdf2f3b?auto=format&fit=crop&w=800&q=80' },
  { name: 'Formal Oxford Shirt', url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80' },
  { name: 'Casual Denim Shirt', url: 'https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?auto=format&fit=crop&w=800&q=80' },
  { name: 'Linen Button-Down Shirt', url: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=800&q=80' },
  { name: 'Slim Fit Denim Jeans', url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=80' },
  { name: 'Tapered Blue Jeans', url: 'https://images.unsplash.com/photo-1475178626620-a4d074967452?auto=format&fit=crop&w=800&q=80' },
  { name: 'Regular Fit Black Jeans', url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80' },
  { name: 'Stretch Chino Pants', url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80' },
  { name: 'Tailored Formal Trousers', url: 'https://images.unsplash.com/photo-1598808503746-f34c53b9323e?auto=format&fit=crop&w=800&q=80' },
  { name: 'Cargo Pants', url: 'https://images.unsplash.com/photo-1517438476312-10d79c077509?auto=format&fit=crop&w=800&q=80' },
  { name: 'Single Breasted Blazer', url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80' },
  { name: 'Tuxedo Suit 2-Piece', url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80' },
  { name: 'Slim Fit Wool Suit', url: 'https://images.unsplash.com/photo-1555069519-127aadedf1ee?auto=format&fit=crop&w=800&q=80' },
  { name: 'Leather Bomber Jacket', url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80' },
  { name: 'Puffer Winter Jacket', url: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=800&q=80' },
  { name: 'Wool Crewneck Sweater', url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80' },
  { name: 'Zip Hoodie', url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80' },
  { name: 'Leather Belt', url: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=800&q=80' },
  { name: 'Bi-Fold Wallet', url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80' },
  { name: 'Aviator Sunglasses', url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80' },
  { name: 'Chronograph Watch', url: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80' },
  { name: 'Silk Tie', url: 'https://images.unsplash.com/photo-1589756823695-278bc923f962?auto=format&fit=crop&w=800&q=80' },
  { name: 'Baseball Cap', url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80' },
];

async function verify() {
  console.log('Testing batch 6 user provided image links...\n');
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
