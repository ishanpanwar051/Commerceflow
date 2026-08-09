import fs from 'fs';
import path from 'path';

// Subcategory-isolated clean image generator for all 627 products
const SUBCATEGORY_POOLS = {
  // Electronics
  smartphones: [
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1567581935884-3349723552ca?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1533228876829-65c94e7b5025?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1556656793-08538906a9f8?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=800&q=80',
  ],
  laptops: [
    'https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1544731612-de7f96afe55f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1585241645927-c7a8e5840c42?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
  ],
  tablets: [
    'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?auto=format&fit=crop&w=800&q=80',
  ],
  monitors: [
    'https://images.unsplash.com/photo-1616588589676-62b3bd4ff6d2?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=800&q=80',
  ],
  keyboards: [
    'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=800&q=80',
  ],
  consoles: [
    'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?auto=format&fit=crop&w=800&q=80',
  ],
  headphones: [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80',
  ],
  cameras: [
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1606986628253-6d8d2f1b6f1c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?auto=format&fit=crop&w=800&q=80',
  ],

  // Footwear
  runningShoes: [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=800&q=80',
  ],
  casualSneakers: [
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&w=800&q=80',
  ],
  oxfordShoes: [
    'https://images.unsplash.com/photo-1614252369475-531eba835eb1?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1449247709967-d4461a6a6103?auto=format&fit=crop&w=800&q=80',
  ],
  chelseaBoots: [
    'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=800&q=80',
  ],
  sportSandals: [
    'https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&w=800&q=80',
  ],
  slippers: [
    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80',
  ],

  // Groceries
  dairy: [
    'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=800&q=80',
  ],
  grains: [
    'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
  ],
  vegetables: [
    'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cf?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1598170845058-128a34a49470?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1447175008436-08417189295a?auto=format&fit=crop&w=800&q=80',
  ],
  fruits: [
    'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=800&q=80',
  ],

  // Home
  sofas: [
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
  ],
  beds: [
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
  ],
  dining: [
    'https://images.unsplash.com/photo-1617098900591-3f90928e8c54?auto=format&fit=crop&w=800&q=80',
  ],
  officeChairs: [
    'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&w=800&q=80',
  ]
};

function getBestImageForProduct(name, categoryName) {
  const lowerName = name.toLowerCase();

  // Smartphones
  if (lowerName.includes('iphone')) return SUBCATEGORY_POOLS.smartphones[0];
  if (lowerName.includes('samsung galaxy s26 ultra')) return SUBCATEGORY_POOLS.smartphones[2];
  if (lowerName.includes('samsung galaxy s26')) return SUBCATEGORY_POOLS.smartphones[3];
  if (lowerName.includes('pixel')) return SUBCATEGORY_POOLS.smartphones[4];
  if (lowerName.includes('oneplus')) return SUBCATEGORY_POOLS.smartphones[6];
  if (lowerName.includes('xiaomi')) return SUBCATEGORY_POOLS.smartphones[7];
  if (lowerName.includes('nothing')) return SUBCATEGORY_POOLS.smartphones[8];
  if (lowerName.includes('realme')) return SUBCATEGORY_POOLS.smartphones[9];
  if (lowerName.includes('vivo')) return SUBCATEGORY_POOLS.smartphones[10];
  if (lowerName.includes('oppo find')) return SUBCATEGORY_POOLS.smartphones[11];
  if (categoryName.includes('Electronics') && (lowerName.includes('phone') || lowerName.includes('pro'))) return SUBCATEGORY_POOLS.smartphones[1];

  // Laptops
  if (lowerName.includes('macbook pro')) return SUBCATEGORY_POOLS.laptops[0];
  if (lowerName.includes('macbook air')) return SUBCATEGORY_POOLS.laptops[1];
  if (lowerName.includes('dell xps')) return SUBCATEGORY_POOLS.laptops[2];
  if (lowerName.includes('thinkpad')) return SUBCATEGORY_POOLS.laptops[4];
  if (lowerName.includes('legion')) return SUBCATEGORY_POOLS.laptops[5];
  if (lowerName.includes('spectre')) return SUBCATEGORY_POOLS.laptops[6];
  if (lowerName.includes('omen')) return SUBCATEGORY_POOLS.laptops[7];
  if (lowerName.includes('rog strix') || lowerName.includes('predator')) return SUBCATEGORY_POOLS.laptops[8];
  if (lowerName.includes('zenbook')) return SUBCATEGORY_POOLS.laptops[9];
  if (lowerName.includes('surface laptop')) return SUBCATEGORY_POOLS.laptops[11];
  if (categoryName.includes('Electronics') && lowerName.includes('laptop')) return SUBCATEGORY_POOLS.laptops[0];

  // Tablets
  if (lowerName.includes('ipad pro')) return SUBCATEGORY_POOLS.tablets[0];
  if (lowerName.includes('ipad air')) return SUBCATEGORY_POOLS.tablets[1];
  if (lowerName.includes('ipad mini')) return SUBCATEGORY_POOLS.tablets[2];
  if (lowerName.includes('tab') || lowerName.includes('tablet') || lowerName.includes('pad')) return SUBCATEGORY_POOLS.tablets[3];

  // Monitors
  if (lowerName.includes('monitor') || lowerName.includes('display')) return SUBCATEGORY_POOLS.monitors[0];

  // Keyboards
  if (lowerName.includes('keyboard') || lowerName.includes('keychron')) return SUBCATEGORY_POOLS.keyboards[0];

  // Consoles
  if (lowerName.includes('playstation') || lowerName.includes('xbox') || lowerName.includes('switch') || lowerName.includes('deck')) return SUBCATEGORY_POOLS.consoles[0];

  // Headphones
  if (lowerName.includes('headphone') || lowerName.includes('wh-1000') || lowerName.includes('airpods') || lowerName.includes('buds') || lowerName.includes('quietcomfort')) return SUBCATEGORY_POOLS.headphones[0];

  // Cameras
  if (lowerName.includes('camera') || lowerName.includes('sony alpha') || lowerName.includes('canon') || lowerName.includes('nikon') || lowerName.includes('fujifilm') || lowerName.includes('gopro')) return SUBCATEGORY_POOLS.cameras[0];

  // Footwear
  if (lowerName.includes('running') || lowerName.includes('pegasus') || lowerName.includes('ultraboost')) return SUBCATEGORY_POOLS.runningShoes[0];
  if (lowerName.includes('sneaker') || lowerName.includes('air force') || lowerName.includes('stan smith') || lowerName.includes('samba')) return SUBCATEGORY_POOLS.casualSneakers[0];
  if (lowerName.includes('oxford') || lowerName.includes('brogue')) return SUBCATEGORY_POOLS.oxfordShoes[0];
  if (lowerName.includes('boot') || lowerName.includes('chelsea')) return SUBCATEGORY_POOLS.chelseaBoots[0];
  if (lowerName.includes('sandal')) return SUBCATEGORY_POOLS.sportSandals[0];
  if (lowerName.includes('slipper') || lowerName.includes('slide')) return SUBCATEGORY_POOLS.slippers[0];

  // Groceries
  if (lowerName.includes('milk') || lowerName.includes('yogurt') || lowerName.includes('curd') || lowerName.includes('paneer') || lowerName.includes('cheese') || lowerName.includes('butter') || lowerName.includes('ghee')) return SUBCATEGORY_POOLS.dairy[0];
  if (lowerName.includes('rice') || lowerName.includes('flour') || lowerName.includes('quinoa') || lowerName.includes('oats') || lowerName.includes('atta') || lowerName.includes('poha')) return SUBCATEGORY_POOLS.grains[0];
  if (lowerName.includes('potato') || lowerName.includes('onion') || lowerName.includes('tomato') || lowerName.includes('carrot') || lowerName.includes('cucumber') || lowerName.includes('broccoli') || lowerName.includes('spinach')) return SUBCATEGORY_POOLS.vegetables[0];
  if (lowerName.includes('apple') || lowerName.includes('banana') || lowerName.includes('orange') || lowerName.includes('mango') || lowerName.includes('grape') || lowerName.includes('watermelon') || lowerName.includes('fruit')) return SUBCATEGORY_POOLS.fruits[0];

  // Home
  if (lowerName.includes('sofa') || lowerName.includes('couch')) return SUBCATEGORY_POOLS.sofas[0];
  if (lowerName.includes('bed')) return SUBCATEGORY_POOLS.beds[0];
  if (lowerName.includes('dining')) return SUBCATEGORY_POOLS.dining[0];
  if (lowerName.includes('chair')) return SUBCATEGORY_POOLS.officeChairs[0];

  // Default clean fallback based on category
  if (categoryName.includes('Electronics')) return SUBCATEGORY_POOLS.smartphones[0];
  if (categoryName.includes('Shoes')) return SUBCATEGORY_POOLS.runningShoes[0];
  if (categoryName.includes('Groceries')) return SUBCATEGORY_POOLS.grains[0];
  if (categoryName.includes('Home')) return SUBCATEGORY_POOLS.sofas[0];
  return SUBCATEGORY_POOLS.smartphones[0];
}

console.log('Subcategory engine compiled.');
