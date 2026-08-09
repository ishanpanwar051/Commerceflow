import fetch from 'node-fetch';

const photoIds = [
  'photo-1511707171634-5f897ff02aa9', // Smartphone
  'photo-1598327105666-5b89351aff97', // Android phone
  'photo-1517336714731-489689fd1ca8', // MacBook Laptop
  'photo-1588872657578-7efd1f1555ed', // Dell Laptop
  'photo-1593642632823-8f785ba67e45', // Dell XPS Laptop
  'photo-1607604276583-eef5d076aa5f', // PlayStation DualSense Controller
  'photo-1605901309584-818e25960a8f', // Xbox Controller
  'photo-1550745165-9bc0b252726f', // Retro Consoles
  'photo-1505740420928-5e560c06d30e', // Black Headphones
  'photo-1546435770-a3e426bf472b', // Over-Ear Headphones
  'photo-1590658268037-6bf12165a8df', // Earbuds
  'photo-1508685096489-7aacd43bd3b1', // Smartwatch
  'photo-1579586337278-3befd40fd17a', // Apple Watch
  'photo-1527443224154-c4a3942d3acf', // Computer Monitor
  'photo-1615663245857-ac93bb7c39e7', // Gaming Mouse
  'photo-1542291026-7eec264c27ff', // Red Nike Shoe
  'photo-1525966222134-fcfa99b8ae77', // Vans Sneakers
  'photo-1614252235316-8c857d38b5f4', // Formal Leather Shoes
  'photo-1521572267360-ee0c2909d518', // White T-Shirt
  'photo-1583743814966-8936f5b7be1a', // Black T-Shirt
  'photo-1596755094514-f87e34085b2c', // Formal Shirt
  'photo-1542272604-780c36856d62', // Blue Jeans
  'photo-1595777457583-95e059d581b8', // Dress
  'photo-1555041469-a586c61ea9bc', // Green Sofa
  'photo-1505693416388-ac5ce068fe85', // Bed
  'photo-1513694203232-719a280e022f', // Home Decor
  'photo-1556911220-e15b29be8c8f', // Kitchenware
  'photo-1522337360788-8b13dee7a37e', // Makeup
  'photo-1517838277536-f5f99be501cd', // Gym Dumbbells
  'photo-1515488042361-ee00e0ddd4e4', // Toys
  'photo-1497633762265-9d179a990aa6', // Books
  'photo-1542838132-92c53300491e', // Groceries
  'photo-1583511655857-d19b40a7a54e', // Dog Pet
  'photo-1503376780353-7e6692767b70', // Car
  'photo-1456735190827-d1262f71b8a3', // Office
];

async function run() {
  console.log(`Checking ${photoIds.length} photo IDs...`);
  let valid = 0;
  for (const id of photoIds) {
    const url = `https://images.unsplash.com/${id}?auto=format&fit=crop&w=400&q=80`;
    try {
      const res = await fetch(url, { method: 'HEAD' });
      if (res.status === 200) {
        valid++;
      } else {
        console.log(`❌ FAILED: ${id} -> Status ${res.status}`);
      }
    } catch (e) {
      console.log(`❌ ERROR: ${id}`, e.message);
    }
  }
  console.log(`✅ VERIFIED ${valid} / ${photoIds.length} photo IDs!`);
}

run();
