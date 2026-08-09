import fs from 'fs';
import path from 'path';

const EXACT_PRODUCT_IMAGES = {
  // Electronics - Smartphones
  'iPhone 17 Pro Max': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
  'iPhone 17 Pro': 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=800&q=80',
  'Samsung Galaxy S26 Ultra': 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80',
  'Samsung Galaxy S26+': 'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=80',
  'Google Pixel 10 Pro XL': 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80',
  'Google Pixel 10 Pro': 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=800&q=80',
  'OnePlus 13': 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?auto=format&fit=crop&w=800&q=80',
  'Xiaomi 16 Pro': 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?auto=format&fit=crop&w=800&q=80',
  'Nothing Phone 3': 'https://images.unsplash.com/photo-1567581935884-3349723552ca?auto=format&fit=crop&w=800&q=80',
  'Realme GT 7 Pro': 'https://images.unsplash.com/photo-1533228876829-65c94e7b5025?auto=format&fit=crop&w=800&q=80',
  'Vivo X200 Pro': 'https://images.unsplash.com/photo-1556656793-08538906a9f8?auto=format&fit=crop&w=800&q=80',
  'OPPO Find N5': 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=800&q=80',

  // Electronics - Laptops
  'MacBook Pro 16-inch': 'https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
  'MacBook Air 15-inch': 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80',
  'Dell XPS 16': 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80',
  'Dell XPS 14': 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80',
  'Lenovo ThinkPad X1 Carbon': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80',
  'Lenovo Legion Pro 7': 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80',
  'HP Spectre x360': 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80',
  'HP Omen 16': 'https://images.unsplash.com/photo-1544731612-de7f96afe55f?auto=format&fit=crop&w=800&q=80',
  'ASUS ROG Strix G16': 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=800&q=80',
  'ASUS Zenbook 14': 'https://images.unsplash.com/photo-1585241645927-c7a8e5840c42?auto=format&fit=crop&w=800&q=80',
  'Acer Predator Helios Neo 16': 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=800&q=80',
  'Microsoft Surface Laptop': 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',

  // Electronics - Tablets
  'iPad Pro 13-inch': 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80',
  'iPad Air': 'https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=800&q=80',
  'iPad Mini': 'https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?auto=format&fit=crop&w=800&q=80',
  'Samsung Galaxy Tab S10 Ultra': 'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?auto=format&fit=crop&w=800&q=80',
  'Samsung Galaxy Tab S10+': 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
  'Google Pixel Tablet': 'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?auto=format&fit=crop&w=800&q=80',
  'OnePlus Pad 2': 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=800&q=80',
  'Xiaomi Pad 7 Pro': 'https://images.unsplash.com/photo-1569770218135-bea267ed7e84?auto=format&fit=crop&w=800&q=80',
  'Lenovo Tab Extreme': 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80',
  'Microsoft Surface Pro': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
  'Redmi Pad Pro': 'https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=800&q=80',
  'OPPO Pad 3 Pro': 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80',

  // Electronics - Monitors
  'Samsung Odyssey OLED G9': 'https://images.unsplash.com/photo-1616588589676-62b3bd4ff6d2?auto=format&fit=crop&w=800&q=80',
  'LG UltraGear OLED Gaming Monitor': 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
  'Dell UltraSharp 4K Monitor': 'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?auto=format&fit=crop&w=800&q=80',
  'ASUS ROG Swift Gaming Monitor': 'https://images.unsplash.com/photo-1551645120-d70bfe84c826?auto=format&fit=crop&w=800&q=80',
  'Acer Predator Gaming Monitor': 'https://images.unsplash.com/photo-1593642634524-b40b5baae6bb?auto=format&fit=crop&w=800&q=80',
  'BenQ 4K Monitor': 'https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=800&q=80',
  'MSI MPG Gaming Monitor': 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=800&q=80',
  'Gigabyte AORUS Gaming Monitor': 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
  'Apple Studio Display': 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
  'LG UltraWide Monitor': 'https://images.unsplash.com/photo-1616588589676-62b3bd4ff6d2?auto=format&fit=crop&w=800&q=80',
  'Samsung Smart Monitor': 'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?auto=format&fit=crop&w=800&q=80',
  'Dell Alienware Gaming Monitor': 'https://images.unsplash.com/photo-1551645120-d70bfe84c826?auto=format&fit=crop&w=800&q=80',

  // Keyboards
  'Logitech MX Mechanical': 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
  'Keychron Q1 Pro': 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=800&q=80',
  'Razer BlackWidow V4': 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=800&q=80',
  'Corsair K100 RGB': 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
  'SteelSeries Apex Pro': 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=800&q=80',
  'ASUS ROG Strix Scope': 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=800&q=80',
  'Apple Magic Keyboard': 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
  'Logitech G915': 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=800&q=80',
  'HyperX Alloy Origins': 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=800&q=80',
  'Keychron K2': 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
  'Royal Kludge RK84': 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=800&q=80',
  'NuPhy Air75': 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=800&q=80',

  // Consoles
  'PlayStation 5': 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80',
  'PlayStation 5 Slim': 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80',
  'PlayStation 5 Pro': 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80',
  'Xbox Series X': 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?auto=format&fit=crop&w=800&q=80',
  'Xbox Series S': 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?auto=format&fit=crop&w=800&q=80',
  'Nintendo Switch OLED': 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?auto=format&fit=crop&w=800&q=80',
  'Nintendo Switch Lite': 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?auto=format&fit=crop&w=800&q=80',
  'Nintendo Switch 2': 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?auto=format&fit=crop&w=800&q=80',
  'Steam Deck OLED': 'https://images.unsplash.com/photo-1639815188546-c43c240ff4df?auto=format&fit=crop&w=800&q=80',
  'ASUS ROG Ally X': 'https://images.unsplash.com/photo-1592840496694-26c035b52b7c?auto=format&fit=crop&w=800&q=80',
  'Lenovo Legion Go': 'https://images.unsplash.com/photo-1639815188546-c43c240ff4df?auto=format&fit=crop&w=800&q=80',
  'MSI Claw': 'https://images.unsplash.com/photo-1592840496694-26c035b52b7c?auto=format&fit=crop&w=800&q=80',

  // Headphones
  'Sony WH-1000XM6': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
  'Apple AirPods Max': 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
  'Bose QuietComfort Ultra': 'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80',
  'Sennheiser Momentum 4': 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80',
  'JBL Tour One M3': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
  'Beats Studio Pro': 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
  'Samsung Galaxy Buds3 Pro': 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
  'Apple AirPods Pro': 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80',
  'Sony WF-1000XM5': 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=800&q=80',
  'Nothing Ear': 'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?auto=format&fit=crop&w=800&q=80',
  'OnePlus Buds Pro': 'https://images.unsplash.com/photo-1598331668826-20cecc596b86?auto=format&fit=crop&w=800&q=80',
  'Bose QuietComfort Earbuds': 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80',

  // Cameras
  'Sony Alpha A7 IV': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
  'Sony Alpha A7R V': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
  'Canon EOS R5': 'https://images.unsplash.com/photo-1606986628253-6d8d2f1b6f1c?auto=format&fit=crop&w=800&q=80',
  'Canon EOS R6 Mark II': 'https://images.unsplash.com/photo-1606986628253-6d8d2f1b6f1c?auto=format&fit=crop&w=800&q=80',
  'Nikon Z8': 'https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?auto=format&fit=crop&w=800&q=80',
  'Nikon Z6 III': 'https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?auto=format&fit=crop&w=800&q=80',
  'Fujifilm X-T5': 'https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?auto=format&fit=crop&w=800&q=80',
  'Fujifilm X100VI': 'https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?auto=format&fit=crop&w=800&q=80',
  'Panasonic Lumix S5 II': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
  'GoPro HERO13 Black': 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80',
  'DJI Osmo Action 5 Pro': 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80',
  'Insta360 X5': 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80',
};

// Update user-catalog.ts with exact matching
const catalogPath = path.resolve('backend/prisma/user-catalog.ts');
let catalogContent = fs.readFileSync(catalogPath, 'utf8');

let replaceCount = 0;
for (const [prodName, imgUrl] of Object.entries(EXACT_PRODUCT_IMAGES)) {
  const targetRegex = new RegExp(`{\\s*name:\\s*'${prodName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}',\\s*image:\\s*'[^']+'\\s*}`, 'g');
  if (targetRegex.test(catalogContent)) {
    catalogContent = catalogContent.replace(targetRegex, `{ name: '${prodName}', image: '${imgUrl}' }`);
    replaceCount++;
  }
}

fs.writeFileSync(catalogPath, catalogContent, 'utf8');
console.log(`✓ Updated ${replaceCount} exact product images in user-catalog.ts!`);
