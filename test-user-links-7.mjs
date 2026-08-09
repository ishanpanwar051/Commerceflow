import fetch from 'node-fetch';

const links = [
  { name: 'Galaxy S25 Ultra', url: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80' },
  { name: 'iPhone 17 Pro Max', url: 'https://images.unsplash.com/photo-1592286927505-2fd0a4f6c1c4?auto=format&fit=crop&w=800&q=80' },
  { name: 'OnePlus 13', url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80' },
  { name: 'Xiaomi 16 Pro', url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80' },
  { name: 'Pixel 10 Pro', url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80' },
  { name: 'Nothing Phone 3', url: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?auto=format&fit=crop&w=800&q=80' },
  { name: 'Realme GT 7', url: 'https://images.unsplash.com/photo-1567581935884-3349723552ca?auto=format&fit=crop&w=800&q=80' },
  { name: 'Vivo X200 Pro', url: 'https://images.unsplash.com/photo-1605236453806-6ff36851218e?auto=format&fit=crop&w=800&q=80' },
  { name: 'Oppo Find N5', url: 'https://images.unsplash.com/photo-1616348436168-de43ad0db179?auto=format&fit=crop&w=800&q=80' },
  { name: 'Moto Edge 60', url: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?auto=format&fit=crop&w=800&q=80' },
  { name: 'MacBook Pro 16"', url: 'https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=800&q=80' },
  { name: 'XPS 15', url: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80' },
  { name: 'Spectre x360 16', url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80' },
  { name: 'ThinkPad X1 Carbon Gen 12', url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80' },
  { name: 'ZenBook Pro Duo', url: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80' },
  { name: 'Predator Helios 18', url: 'https://images.unsplash.com/photo-1593642634315-48f5414c3ad9?auto=format&fit=crop&w=800&q=80' },
  { name: 'Surface Laptop 7', url: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=800&q=80' },
  { name: 'Galaxy Book 4 Ultra', url: 'https://images.unsplash.com/photo-1602080858428-57174f9431cf?auto=format&fit=crop&w=800&q=80' },
  { name: 'iPad Pro M4 13"', url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80' },
  { name: 'Galaxy Tab S10 Ultra', url: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=800&q=80' },
  { name: 'Surface Pro 11', url: 'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?auto=format&fit=crop&w=800&q=80' },
  { name: 'Lenovo Tab P14', url: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=800&q=80' },
  { name: 'Xiaomi Pad 7 Pro', url: 'https://images.unsplash.com/photo-1569770218135-bea267ed7e84?auto=format&fit=crop&w=800&q=80' },
  { name: 'OnePlus Pad 3', url: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=800&q=80' },
  { name: 'UltraSharp 49"', url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80' },
  { name: 'ROG Swift OLED PG49WCD', url: 'https://images.unsplash.com/photo-1616588589676-62b3bd4ff6d2?auto=format&fit=crop&w=800&q=80' },
  { name: 'Predator X34 V2', url: 'https://images.unsplash.com/photo-1551645120-d70bfe84c826?auto=format&fit=crop&w=800&q=80' },
  { name: 'ThinkVision P44w', url: 'https://images.unsplash.com/photo-1593642634524-b40b5baae6bb?auto=format&fit=crop&w=800&q=80' },
  { name: 'Pro Display XDR 2', url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80' },
  { name: 'Dell S2722QC', url: 'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?auto=format&fit=crop&w=800&q=80' },
  { name: 'LG UltraGear 45"', url: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=800&q=80' },
  { name: 'MX Mechanical Mini', url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80' },
  { name: 'BlackWidow V4 Pro', url: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=800&q=80' },
  { name: 'K70 RGB Pro', url: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=800&q=80' },
  { name: 'Huntsman V3 Pro', url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80' },
  { name: 'RK Royal Kludge R75', url: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=800&q=80' },
  { name: 'Keychron Q6', url: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=800&q=80' },
  { name: 'Logitech G915', url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80' },
  { name: 'MX Master 4S', url: 'https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=800&q=80' },
  { name: 'G502 X Plus', url: 'https://images.unsplash.com/photo-1563297007-0686b7003af7?auto=format&fit=crop&w=800&q=80' },
  { name: 'Viper V3 Pro', url: 'https://images.unsplash.com/photo-1629429408209-1f912961dbd8?auto=format&fit=crop&w=800&q=80' },
  { name: 'DeathAdder V3 Pro', url: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80' },
  { name: 'Model O 2 Pro', url: 'https://images.unsplash.com/photo-1629429408209-1f912961dbd8?auto=format&fit=crop&w=800&q=80' },
  { name: 'Superlight 3', url: 'https://images.unsplash.com/photo-1629429408209-1f912961dbd8?auto=format&fit=crop&w=800&q=80' },
  { name: 'G Pro X Superlight 2', url: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80' },
  { name: 'PlayStation 6 Console', url: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80' },
  { name: 'Xbox Series Z Pro', url: 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?auto=format&fit=crop&w=800&q=80' },
  { name: 'Nintendo Switch 3 OLED', url: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?auto=format&fit=crop&w=800&q=80' },
  { name: 'ROG Ally X Handheld', url: 'https://images.unsplash.com/photo-1592840496694-26d035b52b7c?auto=format&fit=crop&w=800&q=80' },
  { name: 'Steam Deck OLED 1TB', url: 'https://images.unsplash.com/photo-1639815188546-c43c240ff4df?auto=format&fit=crop&w=800&q=80' },
  { name: 'PS VR3 Gaming Headset', url: 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?auto=format&fit=crop&w=800&q=80' },
  { name: 'DualSense Edge Wireless', url: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80' },
  { name: 'Sony A1 II Mirrorless', url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80' },
  { name: 'Canon EOS R5 Mark II', url: 'https://images.unsplash.com/photo-1606986628253-6d8d2f1b6f1c?auto=format&fit=crop&w=800&q=80' },
  { name: 'Nikon Z9 Professional', url: 'https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?auto=format&fit=crop&w=800&q=80' },
  { name: 'Fujifilm GFX200', url: 'https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?auto=format&fit=crop&w=800&q=80' },
  { name: 'DJI Osmo Pocket 4', url: 'https://images.unsplash.com/photo-1495707303710-4f5c0b2d4b5a?auto=format&fit=crop&w=800&q=80' },
  { name: 'GoPro Hero 14 Black', url: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80' },
  { name: 'Sony ZV-E10 II', url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80' },
  { name: 'AirPods Pro 3 Wireless', url: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80' },
  { name: 'Galaxy Buds 4 Pro', url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80' },
  { name: 'Sony WF-1000XM6 Wireless', url: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=800&q=80' },
  { name: 'Bose QuietComfort Earbuds 3', url: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=800&q=80' },
  { name: 'JBL Tour Pro 3', url: 'https://images.unsplash.com/photo-1598331668826-20cecc596b86?auto=format&fit=crop&w=800&q=80' },
  { name: 'Nothing Ear 4', url: 'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?auto=format&fit=crop&w=800&q=80' },
  { name: 'Sony WH-1000XM6 Noise Cancelling', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80' },
  { name: 'Bose QuietComfort Ultra 2', url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80' },
  { name: 'Sennheiser Momentum 5', url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80' },
  { name: 'Audio-Technica ATH-M50xBT3', url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80' },
  { name: 'JBL Tour One M3', url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80' },
  { name: 'Beats Studio Pro+', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80' },
  { name: 'Apple HomePod 3 Smart', url: 'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?auto=format&fit=crop&w=800&q=80' },
  { name: 'Sonos Era 300 Spatial', url: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80' },
  { name: 'JBL Charge 6 Portable', url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80' },
  { name: 'Marshall Stanmore IV Bluetooth', url: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80' },
  { name: 'Apple Watch Ultra 3 Titanium', url: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?auto=format&fit=crop&w=800&q=80' },
  { name: 'Galaxy Watch 8 Pro LTE', url: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=800&q=80' },
  { name: 'Pixel Watch 4 Stainless', url: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80' },
  { name: 'Garmin Fenix 9 Solar', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80' },
  { name: 'Amazfit T-Rex 4', url: 'https://images.unsplash.com/photo-1544117519-31a4b719223d?auto=format&fit=crop&w=800&q=80' },
  { name: 'Anker Prime 27650mAh 250W', url: 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?auto=format&fit=crop&w=800&q=80' },
  { name: 'UGREEN 25000mAh 145W', url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80' },
  { name: 'Baseus Blade 2 Slim 100W', url: 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?auto=format&fit=crop&w=800&q=80' },
  { name: 'Anker GaNPrime 200W Multi-Port', url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80' },
  { name: 'UGREEN Nexode 160W Desktop', url: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=800&q=80' },
  { name: 'Baseus 100W GaN', url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80' },
  { name: 'Samsung 65W Trio', url: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=800&q=80' },
  { name: 'Apple 140W USB-C', url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80' },
  { name: 'Samsung 990 Pro 4TB NVMe', url: 'https://images.unsplash.com/photo-1597852074816-d933c7d2b988?auto=format&fit=crop&w=800&q=80' },
  { name: 'WD Black SN850X 4TB', url: 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?auto=format&fit=crop&w=800&q=80' },
  { name: 'Seagate FireCuda 540 2TB', url: 'https://images.unsplash.com/photo-1597852074816-d933c7d2b988?auto=format&fit=crop&w=800&q=80' },
  { name: 'Crucial T700 4TB', url: 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?auto=format&fit=crop&w=800&q=80' },
  { name: 'TP-Link Deco BE95 WiFi 7 Mesh', url: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=800&q=80' },
  { name: 'Netgear Orbi 970', url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80' },
  { name: 'Google Nest WiFi Pro 6E', url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80' },
];

async function verify() {
  console.log(`Testing ${links.length} tech image links...\n`);
  let ok = 0;
  for (const item of links) {
    try {
      const res = await fetch(item.url, { method: 'HEAD' });
      if (res.status === 200) {
        ok++;
      } else {
        console.log(`[${res.status}] ${item.name} -> ${item.url}`);
      }
    } catch (e) {
      console.log(`[ERR] ${item.name} -> ${e.message}`);
    }
  }
  console.log(`\nVerified: ${ok}/${links.length} returned 200 OK.`);
}

verify();
