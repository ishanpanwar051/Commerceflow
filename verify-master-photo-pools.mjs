import fetch from 'node-fetch';

const POOLS = {
  // Electronics
  phone: [
    'photo-1511707171634-5f897ff02aa9', // iPhone/Smartphone
    'photo-1598327105666-5b89351aff97', // Samsung/Android phone
    'photo-1565849904461-04a58ad377e0', // Smartphone desk
    'photo-1512058564366-18510be2db19', // Phone in hand
    'photo-1574944985070-8f3ebc6b79d2', // Smartphone display
  ],
  laptop: [
    'photo-1517336714731-489689fd1ca8', // MacBook desk
    'photo-1496181133206-80ce9b88a853', // Laptop desk
    'photo-1593642632823-8f785ba67e45', // Dell XPS laptop
    'photo-1588872657578-7efd1f1555ed', // ThinkPad laptop
    'photo-1525547719571-a2d4ac8945e2', // ASUS dual screen laptop
  ],
  tablet: [
    'photo-1544244015-0df4b3ffc6b0', // iPad with stylus
    'photo-1561154464-82e9adf32764', // Android tablet
    'photo-1585790050230-5dd28404ccb9', // Tablet desk
  ],
  monitor: [
    'photo-1527443224154-c4a3942d3acf', // Ultrawide monitor
    'photo-1586210579191-33b45e38fa2c', // Monitor desk setup
    'photo-1547119957-637f8679db1e', // Display monitor
  ],
  keyboard: [
    'photo-1587829741301-dc798b83add3', // Mechanical keyboard
    'photo-1618384887929-16ec33fab9ef', // RGB Gaming keyboard
    'photo-1595225476474-87563907a212', // Custom mechanical keyboard
  ],
  mouse: [
    'photo-1615663245857-ac93bb7c39e7', // Gaming mouse
    'photo-1527864550417-7fd91fc51a46', // Ergonomic mouse
    'photo-1629429408209-1f912961dbd8', // Wireless mouse
  ],
  gaming: [
    'photo-1606813907291-d86efa9b94db', // PS5 controller/console
    'photo-1621259182978-fbf93132d53d', // Xbox Series X
    'photo-1578303512597-81e6cc155b3e', // Nintendo Switch
    'photo-1639815188546-c43c240ff4df', // Steam Deck
    'photo-1607604276583-eef5d076aa5f', // Gaming setup
  ],
  camera: [
    'photo-1516035069371-29a1b244cc32', // Mirrorless camera
    'photo-1526170375885-4d8ecf77b99f', // Professional DSLR camera
    'photo-1502920917128-1aa500764cbd', // Action camera / GoPro
    'photo-1510127034890-ba27508e9f1c', // Nikon camera lens
    'photo-1512790182412-b19e6d62bc39', // Fujifilm camera
  ],
  earbud: [
    'photo-1600294037681-c80b4cb5b434', // AirPods Pro
    'photo-1590658268037-6bf12165a8df', // Wireless earbuds
    'photo-1606220945770-b5b6c2c55bf1', // Sony earbuds
    'photo-1588423771073-b8903fbb85b5', // Nothing Ear
    'photo-1572569511254-d8f925fe2cbb', // Earbud case
  ],
  headphone: [
    'photo-1505740420928-5e560c06d30e', // Yellow Sony headphones
    'photo-1546435770-a3e426bf472b', // Bose headphones
    'photo-1484704849700-f032a568e944', // Over-ear headphones
    'photo-1583394838336-acd977736f90', // Studio headphones
  ],
  speaker: [
    'photo-1589492477829-5e65395b66cc', // Smart speaker
    'photo-1545454675-3531b543be5d', // Bluetooth speaker
    'photo-1608043152269-423dbba4e7e1', // Portable JBL speaker
    'photo-1508700115892-45ecd05ae2ad', // Studio speaker
  ],
  watch: [
    'photo-1523275335684-37898b6baf30', // Minimalist watch
    'photo-1508685096489-7aacd43bd3b1', // Smart watch
    'photo-1579586337278-3befd40fd17a', // Galaxy watch
    'photo-1524805444758-089113d48a6d', // Chronograph luxury watch
    'photo-1434493789847-2f02dc6ca35d', // Apple Watch Ultra
    'photo-1544117519-31a4b719223d', // Sports smartwatch
  ],
  charger: [
    'photo-1583863788434-e58a36330cf0', // GaN charger
    'photo-1585338107529-13afc5f02586', // USB-C charger desktop
    'photo-1609081219090-a6d81d3085bf', // Power bank
  ],
  ssd: [
    'photo-1597852074816-d933c7d2b988', // M.2 NVMe SSD stick
    'photo-1544652478-6653e09f18a2', // Internal SSD storage
    'photo-1587202372775-e229f172b9d7', // SSD drive
  ],
  router: [
    'photo-1601784551446-20c9e07cdbdb', // Mesh WiFi router
    'photo-1544197150-b99a580bb7a8', // Modern router
    'photo-1563770660941-20978e870e26', // Router unit
  ],

  // Fashion & Accessories
  sunglasses: [
    'photo-1511499767150-a48a237f0083', // Aviator sunglasses
    'photo-1572635196237-14b3f281503f', // Stylish sunglasses
    'photo-1508296695146-257a814070b4', // Designer sunglasses
  ],
  wallet: [
    'photo-1627123424574-724758594e93', // Leather wallet
    'photo-1553062407-98eeb64c6a62', // Pocket wallet
  ],
  belt: [
    'photo-1624222247344-550fb60583dc', // Classic leather belt
  ],
  socks: [
    'photo-1586350977771-b3b0abd50c82', // Cotton socks
  ],
  't-shirt': [
    'photo-1521572163474-6864f9cf17ab', // Black t-shirt
    'photo-1503341504253-dff4815485f1', // Graphic tee
    'photo-1583743814966-8936f5b7be1a', // Polo shirt
    'photo-1618354691373-d851c5c3a990', // Plain t-shirt
  ],
  shirt: [
    'photo-1602810318383-e386cc2a3ccf', // Oxford formal shirt
    'photo-1495105787522-5334e3ffa0ef', // Denim shirt
    'photo-1596755389378-c31d21fd1273', // Linen shirt
  ],
  jean: [
    'photo-1542272604-787c3835535d', // Slim fit jeans
    'photo-1475178626620-a4d074967452', // Blue jeans
    'photo-1541099649105-f69ad21f3246', // Black denim jeans
  ],
  trouser: [
    'photo-1624378439575-d8705ad7ae80', // Chino pants
    'photo-1598808503746-f34c53b9323e', // Formal trousers
    'photo-1517438476312-10d79c077509', // Cargo pants
  ],
  suit: [
    'photo-1507679799987-c73779587ccf', // Single breasted suit
    'photo-1594938298603-c8148c4dae35', // Tuxedo suit
    'photo-1555069519-127aadedf1ee', // Slim fit wool suit
  ],
  jacket: [
    'photo-1551028719-00167b16eac5', // Leather bomber jacket
    'photo-1548883354-7622d03aca27', // Puffer jacket
    'photo-1543076447-215ad9ba6923', // Denim jacket
  ],
  dress: [
    'photo-1572804013309-59a88b7e92f1', // Floral maxi dress
    'photo-1566174053879-31528523f8ae', // Cocktail evening dress
    'photo-1595777457583-95e059d581b8', // Summer dress
  ],
  skirt: [
    'photo-1583496661160-fb5886a0aaaa', // Pleated A-line skirt
  ],
  kurta: [
    'photo-1583391733956-6c78276477e2', // Cotton kurta
    'photo-1617627143750-d86bc21e42bb', // Ethnic kurta
  ],
  saree: [
    'photo-1610030469983-98e550d6193c', // Banarasi saree
  ],
  handbag: [
    'photo-1584917865442-de89df76afd3', // Leather handbag
    'photo-1566150905458-1bf1fc113f0d', // Evening clutch
  ],

  // Shoes & Footwear
  shoe: [
    'photo-1542291026-7eec264c27ff', // Running shoes (Red Nike)
    'photo-1495555961986-6d4c1ecb7be3', // Retro leather sneakers
    'photo-1525966222134-fcfa99b8ae77', // Vans slip-on canvas
    'photo-1614252369475-531eba835eb1', // Oxford shoes
    'photo-1638247025967-b4e38f787b76', // Chelsea boots
    'photo-1603487742131-4160ec999306', // Sport sandals
    'photo-1543163521-1bf539c55dd2', // Stiletto heels / slippers
  ],

  // Home & Kitchen & Furniture
  sofa: [
    'photo-1555041469-a586c61ea9bc', // 3-Seater fabric sofa
  ],
  bed: [
    'photo-1505693416388-ac5ce068fe85', // Queen size bed
  ],
  table: [
    'photo-1617098900591-3f90928e8c54', // Solid wood dining table
  ],
  chair: [
    'photo-1580480055273-228ff5388ef8', // Ergonomic mesh office chair
  ],
  bookshelf: [
    'photo-1594620302200-9a762244a156', // Wooden bookshelf
  ],
  cookware: [
    'photo-1556911220-e15b29be8c8f', // Non-stick cookware set
    'photo-1593618998160-e34014e67546', // Chef knife set
    'photo-1585515320310-259814833e62', // Pressure cooker
    'photo-1572119865084-43c285814d63', // French press
  ],
  decor: [
    'photo-1549490349-8643362247b5', // Canvas wall art
    'photo-1584100936595-c0654b55a2e2', // Velvet cushion
    'photo-1616486338812-3dadae4b4ace', // Blackout curtain
    'photo-1600166898405-da9535204843', // Area rug
    'photo-1507473885765-e6ed057f782c', // Desk lamp
  ],

  // Sports & Fitness
  sports: [
    'photo-1531415074968-036ba1b575da', // Cricket bat
    'photo-1579952363873-27f3bade9f55', // Football size 5
  ],
  fitness: [
    'photo-1601925260368-ae2f83cf8b7f', // Yoga mat
    'photo-1583454110551-21f2fa2afe61', // Dumbbell set
    'photo-1593095948071-474c5cc2989d', // Whey protein
  ],

  // Beauty
  beauty: [
    'photo-1586495777744-4413f21062fa', // Liquid lipstick
    'photo-1620916566398-39f1143ab7be', // Vitamin C serum
    'photo-1556229010-6c3f2c9ca5f8', // Shampoo bottle
    'photo-1541643600914-78b084683601', // Parfum bottle
  ],

  // Office
  office: [
    'photo-1544816155-12df9643f363', // Leather notebook
    'photo-1583485088034-697b5bc54ccd', // Gel pens
    'photo-1612815154858-60aa4c59eaa6', // Laser printer
    'photo-1586953208448-b95a79798f07', // Whiteboard
  ],

  // Automotive
  auto: [
    'photo-1558981806-ec527fa84c39', // Motorcycle helmet
    'photo-1551028719-00167b16eac5', // Riding jacket
    'photo-1625047509248-ec889cbff17f', // Engine oil
    'photo-1607860108855-64acf2078ed9', // Car pressure washer
  ],
};

async function verifyAllPools() {
  console.log('Testing master photo pools HTTP response status...\n');
  let total = 0;
  let ok = 0;
  let fail = 0;

  for (const [poolKey, photos] of Object.entries(POOLS)) {
    for (const photoId of photos) {
      total++;
      const url = `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=800&q=80`;
      try {
        const res = await fetch(url, { method: 'HEAD' });
        if (res.status === 200) {
          ok++;
        } else {
          fail++;
          console.log(`❌ [${res.status}] Pool '${poolKey}' -> ${photoId}`);
        }
      } catch (e) {
        fail++;
        console.log(`❌ [ERR] Pool '${poolKey}' -> ${photoId} (${e.message})`);
      }
    }
  }

  console.log(`\nVerified: ${ok}/${total} photos returned 200 OK. ${fail} failures.`);
}

verifyAllPools();
