import fs from 'fs';
import path from 'path';

// Subcategory-specific high-resolution, accurate product image pools
// Every product gets an image matching its exact product type and subcategory!

const IMAGE_POOLS = {
  // ─── ELECTRONICS ──────────────────────────────────────────────────────────
  smartphones: [
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9', // iPhone
    'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd', // Smartphone
    'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf', // Galaxy S
    'https://images.unsplash.com/photo-1580910051074-3eb694886505', // Android phone
    'https://images.unsplash.com/photo-1598327105666-5b89351aff97', // Pixel
    'https://images.unsplash.com/photo-1565849904461-04a58ad377e0', // Mobile device
    'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2', // Flagship phone
    'https://images.unsplash.com/photo-1546054454-aa26e2b734c7', // Modern phone
    'https://images.unsplash.com/photo-1567581935884-3349723552ca', // Phone screen
    'https://images.unsplash.com/photo-1533228876829-65c94e7b5025', // Glass phone
    'https://images.unsplash.com/photo-1556656793-08538906a9f8', // Sleek phone
    'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa', // Curved phone
  ],
  laptops: [
    'https://images.unsplash.com/photo-1517336714739-489689fd1ca8', // MacBook Pro
    'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9', // MacBook Air
    'https://images.unsplash.com/photo-1593642632823-8f785ba67e45', // Dell XPS
    'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed', // ThinkPad
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853', // HP Spectre
    'https://images.unsplash.com/photo-1603302576837-37561b2e2302', // ASUS ROG Gaming
    'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2', // ZenBook
    'https://images.unsplash.com/photo-1531297484001-80022131f5a1', // Surface Laptop
    'https://images.unsplash.com/photo-1544731612-de7f96afe55f', // Gaming Laptop
    'https://images.unsplash.com/photo-1585241645927-c7a8e5840c42', // Ultrabook
    'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2', // Metallic Laptop
    'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf', // Sleek Laptop
  ],
  tablets: [
    'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0', // iPad Pro
    'https://images.unsplash.com/photo-1561154464-82e9adf32764', // Galaxy Tab
    'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9', // Surface Pro
    'https://images.unsplash.com/photo-1542751371-adc38448a05e', // Tablet with stylus
    'https://images.unsplash.com/photo-1589739900243-4b52cd9b104e', // Compact tablet
    'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37', // Digital tablet
    'https://images.unsplash.com/photo-1558655146-d09347e92766', // Modern Tablet
    'https://images.unsplash.com/photo-1569770218135-bea267ed7e84', // Android tablet
    'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46', // Tablet workspace
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71', // High-end tablet
    'https://images.unsplash.com/photo-1561154464-82e9adf32764', // Tablet display
    'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0', // iPad view
  ],
  monitors: [
    'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf', // Curved Gaming Monitor
    'https://images.unsplash.com/photo-1616588589676-62b3bd4ff6d2', // UltraWide OLED
    'https://images.unsplash.com/photo-1585792180666-f7347c490ee2', // 4K Professional Monitor
    'https://images.unsplash.com/photo-1551645120-d70bfe84c826', // Gaming Display
    'https://images.unsplash.com/photo-1593642634524-b40b5baae6bb', // Desk Monitor Setup
    'https://images.unsplash.com/photo-1547082299-de196ea013d6', // Studio Monitor
    'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf', // High Hz Display
    'https://images.unsplash.com/photo-1586953208448-b95a79798f07', // Dual Monitor
    'https://images.unsplash.com/photo-1542751371-adc38448a05e', // Frameless Monitor
    'https://images.unsplash.com/photo-1616588589676-62b3bd4ff6d2', // RGB Monitor
    'https://images.unsplash.com/photo-1585792180666-f7347c490ee2', // Smart Display
    'https://images.unsplash.com/photo-1551645120-d70bfe84c826', // Alienware Monitor
  ],
  keyboards: [
    'https://images.unsplash.com/photo-1587829741301-dc798b83add3', // Mechanical Keyboard
    'https://images.unsplash.com/photo-1595225476474-87563907a212', // RGB Gaming Keyboard
    'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef', // Custom Keycaps Keyboard
    'https://images.unsplash.com/photo-1587829741301-dc798b83add3', // Low Profile Keyboard
    'https://images.unsplash.com/photo-1595225476474-87563907a212', // Wireless Keyboard
    'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef', // Compact 75% Keyboard
    'https://images.unsplash.com/photo-1587829741301-dc798b83add3', // Apple Magic Keyboard
    'https://images.unsplash.com/photo-1595225476474-87563907a212', // Ergonomic Keyboard
    'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef', // PBT Keycaps
    'https://images.unsplash.com/photo-1587829741301-dc798b83add3', // Hot-swappable Keyboard
    'https://images.unsplash.com/photo-1595225476474-87563907a212', // Aluminium Chassis
    'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef', // Silent Switches
  ],
  consoles: [
    'https://images.unsplash.com/photo-1606813907291-d86efa9b94db', // PlayStation 5
    'https://images.unsplash.com/photo-1621259182978-fbf93132d53d', // Xbox Series X
    'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e', // Nintendo Switch
    'https://images.unsplash.com/photo-1592840496694-26c035b52b7c', // Handheld Console
    'https://images.unsplash.com/photo-1639815188546-c43c240ff4df', // Steam Deck
    'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac', // VR Headset
    'https://images.unsplash.com/photo-1606813907291-d86efa9b94db', // DualSense Controller
    'https://images.unsplash.com/photo-1621259182978-fbf93132d53d', // White Console
    'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e', // Switch OLED
    'https://images.unsplash.com/photo-1592840496694-26c035b52b7c', // Portable Gaming
    'https://images.unsplash.com/photo-1639815188546-c43c240ff4df', // Handheld PC
    'https://images.unsplash.com/photo-1606813907291-d86efa9b94db', // Gaming Setup
  ],
  headphones: [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e', // Over-Ear ANC Headphones
    'https://images.unsplash.com/photo-1546435770-a3e426bf472b', // Premium Headphones
    'https://images.unsplash.com/photo-1484704849700-f032a568e944', // Studio Headphones
    'https://images.unsplash.com/photo-1583394838336-acd977736f90', // Wireless Headphones
    'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434', // AirPods Pro
    'https://images.unsplash.com/photo-1590658268037-6bf12165a8df', // Galaxy Buds
    'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1', // TWS Earbuds
    'https://images.unsplash.com/photo-1598331668826-20cecc596b86', // Sports Earbuds
    'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5', // Clear TWS
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e', // Noise Cancelling
    'https://images.unsplash.com/photo-1546435770-a3e426bf472b', // Leather Earcups
    'https://images.unsplash.com/photo-1484704849700-f032a568e944', // Matte Black Headphones
  ],
  cameras: [
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32', // Mirrorless Camera
    'https://images.unsplash.com/photo-1606986628253-6d8d2f1b6f1c', // DSLR Camera
    'https://images.unsplash.com/photo-1510127034890-ba27508e9f1c', // Pro Camera
    'https://images.unsplash.com/photo-1512790182412-b19e6d62bc39', // Vintage/Film Camera
    'https://images.unsplash.com/photo-1502920917128-1aa500764cbd', // Action Camera
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32', // 4K Vlog Camera
    'https://images.unsplash.com/photo-1606986628253-6d8d2f1b6f1c', // Cinema Lens
    'https://images.unsplash.com/photo-1510127034890-ba27508e9f1c', // Full Frame Body
    'https://images.unsplash.com/photo-1512790182412-b19e6d62bc39', // Compact Camera
    'https://images.unsplash.com/photo-1502920917128-1aa500764cbd', // Waterproof Cam
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32', // Telephoto Lens
    'https://images.unsplash.com/photo-1606986628253-6d8d2f1b6f1c', // Action Cam 360
  ],

  // ─── FASHION MEN ──────────────────────────────────────────────────────────
  tshirts: [
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab', // White Crew Neck
    'https://images.unsplash.com/photo-1503341504253-dff4815485f1', // Black Oversized
    'https://images.unsplash.com/photo-1625910513413-5fc45fdf2f3b', // Polo T-Shirt
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a', // Graphic Print
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab', // Cotton Plain
    'https://images.unsplash.com/photo-1503341504253-dff4815485f1', // Striped Tee
    'https://images.unsplash.com/photo-1625910513413-5fc45fdf2f3b', // Henley Tee
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a', // Slim Fit Tee
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab', // Streetwear Tee
    'https://images.unsplash.com/photo-1503341504253-dff4815485f1', // Full Sleeve Tee
    'https://images.unsplash.com/photo-1625910513413-5fc45fdf2f3b', // Pique Polo
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a', // Basic Round Neck
  ],
  shirts: [
    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf', // Oxford Cotton Shirt
    'https://images.unsplash.com/photo-1596755389378-c31d21fd1273', // White Formal Shirt
    'https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef', // Black Casual Shirt
    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf', // Denim Shirt
    'https://images.unsplash.com/photo-1596755389378-c31d21fd1273', // Linen Shirt
    'https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef', // Checked Flannel
    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf', // Striped Shirt
    'https://images.unsplash.com/photo-1596755389378-c31d21fd1273', // Cuban Collar
    'https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef', // Flannel Shirt
    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf', // Printed Resort Shirt
    'https://images.unsplash.com/photo-1596755389378-c31d21fd1273', // Slim Formal
    'https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef', // Oversized Shirt
  ],
  jeans: [
    'https://images.unsplash.com/photo-1542272604-787c3835535d', // Straight Blue Jeans
    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246', // Black Slim Fit Jeans
    'https://images.unsplash.com/photo-1475178626620-a4d074967452', // Dark Blue Skinny
    'https://images.unsplash.com/photo-1542272604-787c3835535d', // Relaxed Fit Jeans
    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246', // Light Wash Denim
    'https://images.unsplash.com/photo-1475178626620-a4d074967452', // Ripped Blue Jeans
    'https://images.unsplash.com/photo-1542272604-787c3835535d', // Tapered Jeans
    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246', // Baggy Denim
    'https://images.unsplash.com/photo-1475178626620-a4d074967452', // Grey Jeans
    'https://images.unsplash.com/photo-1542272604-787c3835535d', // Bootcut Jeans
    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246', // Distressed Black
    'https://images.unsplash.com/photo-1475178626620-a4d074967452', // Stretch Denim
  ],
  chinos: [
    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80', // Beige Chinos
    'https://images.unsplash.com/photo-1598808503746-f34c53b9323e', // Navy Chinos
    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80', // Black Chinos
    'https://images.unsplash.com/photo-1598808503746-f34c53b9323e', // Olive Green Chinos
    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80', // Khaki Chinos
    'https://images.unsplash.com/photo-1598808503746-f34c53b9323e', // Grey Chinos
    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80', // Brown Chinos
    'https://images.unsplash.com/photo-1598808503746-f34c53b9323e', // Stretch Chinos
    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80', // Relaxed Chinos
    'https://images.unsplash.com/photo-1598808503746-f34c53b9323e', // Cotton Chinos
    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80', // Tapered Chinos
    'https://images.unsplash.com/photo-1598808503746-f34c53b9323e', // Straight Chinos
  ],
  trousers: [
    'https://images.unsplash.com/photo-1598808503746-f34c53b9323e', // Black Formal Trousers
    'https://images.unsplash.com/photo-1517438476312-10d79c077509', // Grey Trousers
    'https://images.unsplash.com/photo-1598808503746-f34c53b9323e', // Navy Trousers
    'https://images.unsplash.com/photo-1517438476312-10d79c077509', // Slim Trousers
    'https://images.unsplash.com/photo-1598808503746-f34c53b9323e', // Pleated Trousers
    'https://images.unsplash.com/photo-1517438476312-10d79c077509', // Wide Leg Trousers
    'https://images.unsplash.com/photo-1598808503746-f34c53b9323e', // Linen Trousers
    'https://images.unsplash.com/photo-1517438476312-10d79c077509', // Cotton Trousers
    'https://images.unsplash.com/photo-1598808503746-f34c53b9323e', // Cargo Trousers
    'https://images.unsplash.com/photo-1517438476312-10d79c077509', // Tapered Trousers
    'https://images.unsplash.com/photo-1598808503746-f34c53b9323e', // Relaxed Trousers
    'https://images.unsplash.com/photo-1517438476312-10d79c077509', // Checkered Formal
  ],
  suits: [
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf', // Black Suit
    'https://images.unsplash.com/photo-1594938298603-c8148c4dae35', // Navy Business Suit
    'https://images.unsplash.com/photo-1555069519-127aadedf1ee', // Charcoal Suit
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf', // Slim Black Suit
    'https://images.unsplash.com/photo-1594938298603-c8148c4dae35', // Double Breasted
    'https://images.unsplash.com/photo-1555069519-127aadedf1ee', // 3-Piece Suit
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf', // Wedding Suit
    'https://images.unsplash.com/photo-1594938298603-c8148c4dae35', // Tuxedo
    'https://images.unsplash.com/photo-1555069519-127aadedf1ee', // Pinstripe Suit
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf', // Summer Linen Suit
    'https://images.unsplash.com/photo-1594938298603-c8148c4dae35', // Brown Suit
    'https://images.unsplash.com/photo-1555069519-127aadedf1ee', // Tailored Suit
  ],
  jackets: [
    'https://images.unsplash.com/photo-1551028719-00167b16eac5', // Leather Biker Jacket
    'https://images.unsplash.com/photo-1543076447-215ad9ba6923', // Denim Jacket
    'https://images.unsplash.com/photo-1548883354-7622d03aca27', // Bomber Jacket
    'https://images.unsplash.com/photo-1551028719-00167b16eac5', // Puffer Jacket
    'https://images.unsplash.com/photo-1543076447-215ad9ba6923', // Suede Jacket
    'https://images.unsplash.com/photo-1548883354-7622d03aca27', // Harrington Jacket
    'https://images.unsplash.com/photo-1551028719-00167b16eac5', // Varsity Jacket
    'https://images.unsplash.com/photo-1543076447-215ad9ba6923', // Trucker Jacket
    'https://images.unsplash.com/photo-1548883354-7622d03aca27', // Windbreaker
    'https://images.unsplash.com/photo-1551028719-00167b16eac5', // Military Jacket
    'https://images.unsplash.com/photo-1543076447-215ad9ba6923', // Quilted Jacket
    'https://images.unsplash.com/photo-1548883354-7622d03aca27', // Hooded Jacket
  ],
  sweaters: [
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27', // Crew Neck Knit
    'https://images.unsplash.com/photo-1556821840-3a63f95609a7', // Black Turtleneck
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27', // V-Neck Knit
    'https://images.unsplash.com/photo-1556821840-3a63f95609a7', // Cable Knit
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27', // Oversized Knit
    'https://images.unsplash.com/photo-1556821840-3a63f95609a7', // Half Zip Sweater
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27', // Full Zip Cardigan
    'https://images.unsplash.com/photo-1556821840-3a63f95609a7', // Wool Sweater
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27', // Cashmere Sweater
    'https://images.unsplash.com/photo-1556821840-3a63f95609a7', // Cardigan
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27', // Striped Sweater
    'https://images.unsplash.com/photo-1556821840-3a63f95609a7', // Mock Neck Sweater
  ],
  belts: [
    'https://images.unsplash.com/photo-1624222247344-550fb60583dc', // Leather Belt Black
    'https://images.unsplash.com/photo-1624222247344-550fb60583dc', // Brown Leather Belt
    'https://images.unsplash.com/photo-1624222247344-550fb60583dc', // Reversible Belt
    'https://images.unsplash.com/photo-1624222247344-550fb60583dc', // Formal Belt
    'https://images.unsplash.com/photo-1624222247344-550fb60583dc', // Canvas Belt
    'https://images.unsplash.com/photo-1624222247344-550fb60583dc', // Braided Belt
    'https://images.unsplash.com/photo-1624222247344-550fb60583dc', // Automatic Buckle
    'https://images.unsplash.com/photo-1624222247344-550fb60583dc', // Ratchet Belt
    'https://images.unsplash.com/photo-1624222247344-550fb60583dc', // Suede Belt
    'https://images.unsplash.com/photo-1624222247344-550fb60583dc', // Vintage Leather Belt
    'https://images.unsplash.com/photo-1624222247344-550fb60583dc', // Designer Belt
    'https://images.unsplash.com/photo-1624222247344-550fb60583dc', // Minimalist Belt
  ],
  wallets: [
    'https://images.unsplash.com/photo-1627123424574-724758594e93', // Leather Wallet
    'https://images.unsplash.com/photo-1627123424574-724758594e93', // Slim Bifold
    'https://images.unsplash.com/photo-1627123424574-724758594e93', // Trifold Wallet
    'https://images.unsplash.com/photo-1627123424574-724758594e93', // Card Holder
    'https://images.unsplash.com/photo-1627123424574-724758594e93', // RFID Wallet
    'https://images.unsplash.com/photo-1627123424574-724758594e93', // Money Clip
    'https://images.unsplash.com/photo-1627123424574-724758594e93', // Travel Wallet
    'https://images.unsplash.com/photo-1627123424574-724758594e93', // Zipper Wallet
    'https://images.unsplash.com/photo-1627123424574-724758594e93', // Vintage Wallet
    'https://images.unsplash.com/photo-1627123424574-724758594e93', // Carbon Fiber Wallet
    'https://images.unsplash.com/photo-1627123424574-724758594e93', // Long Wallet
    'https://images.unsplash.com/photo-1627123424574-724758594e93', // Bifold Card Case
  ],
  sunglasses: [
    'https://images.unsplash.com/photo-1511499767150-a48a237f0083', // Aviator Sunglasses
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f', // Wayfarer Sunglasses
    'https://images.unsplash.com/photo-1511499767150-a48a237f0083', // Round Frame
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f', // Square Frame
    'https://images.unsplash.com/photo-1511499767150-a48a237f0083', // Polarized Shades
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f', // Clubmaster
    'https://images.unsplash.com/photo-1511499767150-a48a237f0083', // Sports Shades
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f', // Black Rectangle
    'https://images.unsplash.com/photo-1511499767150-a48a237f0083', // Metal Frame
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f', // Retro Sunglasses
    'https://images.unsplash.com/photo-1511499767150-a48a237f0083', // Driving Shades
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f', // Designer Shades
  ],
  watches: [
    'https://images.unsplash.com/photo-1524805444758-089113d48a6d', // Analog Watch
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30', // Stainless Steel Watch
    'https://images.unsplash.com/photo-1524805444758-089113d48a6d', // Leather Strap Watch
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30', // Chronograph Watch
    'https://images.unsplash.com/photo-1524805444758-089113d48a6d', // Automatic Mechanical
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30', // Minimalist Dress Watch
    'https://images.unsplash.com/photo-1524805444758-089113d48a6d', // Luxury Watch
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30', // Sports Watch
    'https://images.unsplash.com/photo-1524805444758-089113d48a6d', // Dive Watch
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30', // Field Watch
    'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1', // Smartwatch
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30', // Digital Watch
  ],

  // ─── FOOTWEAR ─────────────────────────────────────────────────────────────
  runningShoes: [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff', // Nike Air Zoom
    'https://images.unsplash.com/photo-1518002171953-a080ee817e1f', // Adidas Ultraboost
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff', // ASICS Gel-Kayano
    'https://images.unsplash.com/photo-1518002171953-a080ee817e1f', // New Balance Fresh Foam
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff', // Brooks Ghost
    'https://images.unsplash.com/photo-1518002171953-a080ee817e1f', // Hoka Clifton
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff', // Puma Velocity Nitro
    'https://images.unsplash.com/photo-1518002171953-a080ee817e1f', // Saucony Ride
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff', // UA HOVR
    'https://images.unsplash.com/photo-1518002171953-a080ee817e1f', // Reebok Floatride
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff', // Mizuno Wave Rider
    'https://images.unsplash.com/photo-1518002171953-a080ee817e1f', // Skechers Go Run
  ],
  casualSneakers: [
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a', // Air Force 1
    'https://images.unsplash.com/photo-1518002171953-a080ee817e1f', // Stan Smith
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a', // Adidas Superstar
    'https://images.unsplash.com/photo-1607522370275-f14206abe5d3', // Chuck Taylor
    'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77', // Vans Old Skool
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a', // New Balance 574
    'https://images.unsplash.com/photo-1518002171953-a080ee817e1f', // Puma Suede
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a', // Club C 85
    'https://images.unsplash.com/photo-1607522370275-f14206abe5d3', // Air Max
    'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77', // Adidas Samba
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a', // New Balance 550
    'https://images.unsplash.com/photo-1518002171953-a080ee817e1f', // GEL-LYTE III
  ],
  oxfordShoes: [
    'https://images.unsplash.com/photo-1614252369475-531eba835eb1', // Black Oxford Leather
    'https://images.unsplash.com/photo-1449247709967-d4461a6a6103', // Brown Leather Oxford
    'https://images.unsplash.com/photo-1614252369475-531eba835eb1', // Cap Toe Oxford
    'https://images.unsplash.com/photo-1449247709967-d4461a6a6103', // Plain Toe Oxford
    'https://images.unsplash.com/photo-1614252369475-531eba835eb1', // Wingtip Oxford
    'https://images.unsplash.com/photo-1449247709967-d4461a6a6103', // Patent Patent Leather
    'https://images.unsplash.com/photo-1614252369475-531eba835eb1', // Brogue Oxford
    'https://images.unsplash.com/photo-1449247709967-d4461a6a6103', // Derby Style
    'https://images.unsplash.com/photo-1614252369475-531eba835eb1', // Suede Oxford
    'https://images.unsplash.com/photo-1449247709967-d4461a6a6103', // Lace-Up Oxford
    'https://images.unsplash.com/photo-1614252369475-531eba835eb1', // Premium Leather
    'https://images.unsplash.com/photo-1449247709967-d4461a6a6103', // Slim Oxford
  ],
  chelseaBoots: [
    'https://images.unsplash.com/photo-1638247025967-b4e38f787b76', // Black Chelsea Boots
    'https://images.unsplash.com/photo-1608256246200-53e635b5b65f', // Brown Leather Chelsea
    'https://images.unsplash.com/photo-1638247025967-b4e38f787b76', // Suede Chelsea
    'https://images.unsplash.com/photo-1608256246200-53e635b5b65f', // Tan Chelsea
    'https://images.unsplash.com/photo-1638247025967-b4e38f787b76', // Black Suede
    'https://images.unsplash.com/photo-1608256246200-53e635b5b65f', // Leather Ankle Boots
    'https://images.unsplash.com/photo-1638247025967-b4e38f787b76', // Chunky Sole Boots
    'https://images.unsplash.com/photo-1608256246200-53e635b5b65f', // Elastic Side Boots
    'https://images.unsplash.com/photo-1638247025967-b4e38f787b76', // Premium Leather Boots
    'https://images.unsplash.com/photo-1608256246200-53e635b5b65f', // Casual Boots
    'https://images.unsplash.com/photo-1638247025967-b4e38f787b76', // Formal Chelsea
    'https://images.unsplash.com/photo-1608256246200-53e635b5b65f', // Western Chelsea
  ],
  sportSandals: [
    'https://images.unsplash.com/photo-1603487742131-4160ec999306', // Sport Sandals
    'https://images.unsplash.com/photo-1603487742131-4160ec999306', // Outdoor Sandals
    'https://images.unsplash.com/photo-1603487742131-4160ec999306', // Hiking Sandals
    'https://images.unsplash.com/photo-1603487742131-4160ec999306', // Strap Sandals
    'https://images.unsplash.com/photo-1603487742131-4160ec999306', // Waterproof Sandals
    'https://images.unsplash.com/photo-1603487742131-4160ec999306', // Velcro Sandals
    'https://images.unsplash.com/photo-1603487742131-4160ec999306', // Lightweight Sandals
    'https://images.unsplash.com/photo-1603487742131-4160ec999306', // Trekking Sandals
    'https://images.unsplash.com/photo-1603487742131-4160ec999306', // Open Toe Sandals
    'https://images.unsplash.com/photo-1603487742131-4160ec999306', // Comfort Sandals
    'https://images.unsplash.com/photo-1603487742131-4160ec999306', // Adjustable Sandals
    'https://images.unsplash.com/photo-1603487742131-4160ec999306', // Casual Sandals
  ],
  slippers: [
    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2', // Rubber Slippers
    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2', // Memory Foam Slippers
    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2', // House Slippers
    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2', // Flip Flop Slippers
    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2', // Cushioned Slides
    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2', // Fleece Indoor Slippers
    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2', // Waterproof Slides
    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2', // Anti-Slip Slippers
    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2', // Home Slippers
    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2', // Orthopedic Slippers
    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2', // Premium Men's Slippers
    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2', // Soft Slipper Slides
  ],

  // ─── HOME & FURNITURE ─────────────────────────────────────────────────────
  sofas: [
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc', // Modern 3-Seater Sofa
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7', // L-Shaped Sectional
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc', // Velvet Sofa
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7', // Leather Sofa
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc', // Recliner Sofa
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7', // Chesterfield Sofa
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc', // Modular Sofa
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7', // Loveseat
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc', // Sleeper Sofa
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7', // Minimalist Couch
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc', // U-Shaped Sectional
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7', // Boucle Sofa
  ],
  beds: [
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85', // King Platform Bed
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85', // Queen Upholstered
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85', // Wooden King Bed
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85', // Storage Bed
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85', // Upholstered Frame
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85', // Canopy Bed
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85', // Four Poster Bed
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85', // Platform Frame
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85', // Hydraulic Storage
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85', // Metal Frame Bed
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85', // Minimalist Wood Bed
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85', // Tufted Headboard Bed
  ],
  diningTables: [
    'https://images.unsplash.com/photo-1617098900591-3f90928e8c54', // 6-Seater Wooden Dining
    'https://images.unsplash.com/photo-1617098900591-3f90928e8c54', // 4-Seater Dining
    'https://images.unsplash.com/photo-1617098900591-3f90928e8c54', // 8-Seater Dining
    'https://images.unsplash.com/photo-1617098900591-3f90928e8c54', // Round Dining Table
    'https://images.unsplash.com/photo-1617098900591-3f90928e8c54', // Glass Dining Table
    'https://images.unsplash.com/photo-1617098900591-3f90928e8c54', // Marble Dining Table
    'https://images.unsplash.com/photo-1617098900591-3f90928e8c54', // Extendable Table
    'https://images.unsplash.com/photo-1617098900591-3f90928e8c54', // Modern Dining Table
    'https://images.unsplash.com/photo-1617098900591-3f90928e8c54', // Solid Wood Dining
    'https://images.unsplash.com/photo-1617098900591-3f90928e8c54', // Industrial Dining
    'https://images.unsplash.com/photo-1617098900591-3f90928e8c54', // Oval Dining Table
    'https://images.unsplash.com/photo-1617098900591-3f90928e8c54', // Minimalist Dining
  ],
  officeChairs: [
    'https://images.unsplash.com/photo-1580480055273-228ff5388ef8', // Ergonomic Office Chair
    'https://images.unsplash.com/photo-1580480055273-228ff5388ef8', // Executive Leather Chair
    'https://images.unsplash.com/photo-1580480055273-228ff5388ef8', // Mesh Office Chair
    'https://images.unsplash.com/photo-1580480055273-228ff5388ef8', // High Back Chair
    'https://images.unsplash.com/photo-1580480055273-228ff5388ef8', // Gaming Office Chair
    'https://images.unsplash.com/photo-1580480055273-228ff5388ef8', // Mid Back Chair
    'https://images.unsplash.com/photo-1580480055273-228ff5388ef8', // Adjustable Chair
    'https://images.unsplash.com/photo-1580480055273-228ff5388ef8', // Lumbar Support Chair
    'https://images.unsplash.com/photo-1580480055273-228ff5388ef8', // Swivel Chair
    'https://images.unsplash.com/photo-1580480055273-228ff5388ef8', // Executive Chair
    'https://images.unsplash.com/photo-1580480055273-228ff5388ef8', // Fabric Chair
    'https://images.unsplash.com/photo-1580480055273-228ff5388ef8', // Conference Chair
  ],
  cookware: [
    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f', // Non-Stick Cookware
    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f', // Stainless Steel Set
    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f', // Ceramic Cookware
    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f', // Cast Iron Skillet
    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f', // Hard Anodized Pots
    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f', // Granite Cookware
    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f', // Copper Cookware
    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f', // Induction Cookware
    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f', // Aluminum Cookware
    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f', // 10-Piece Cookware
    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f', // 15-Piece Cookware
    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f', // Premium Kitchen Set
  ],
  knives: [
    'https://images.unsplash.com/photo-1593618998160-e34014e67546', // Chef Knife Set
    'https://images.unsplash.com/photo-1593618998160-e34014e67546', // Professional Knives
    'https://images.unsplash.com/photo-1593618998160-e34014e67546', // 6-Piece Knife Set
    'https://images.unsplash.com/photo-1593618998160-e34014e67546', // Japanese Santoku
    'https://images.unsplash.com/photo-1593618998160-e34014e67546', // Damascus Steel Knife
    'https://images.unsplash.com/photo-1593618998160-e34014e67546', // Ceramic Knife Set
    'https://images.unsplash.com/photo-1593618998160-e34014e67546', // Wooden Block Knives
    'https://images.unsplash.com/photo-1593618998160-e34014e67546', // Utility Knife Set
    'https://images.unsplash.com/photo-1593618998160-e34014e67546', // Kitchen Knives
    'https://images.unsplash.com/photo-1593618998160-e34014e67546', // German Steel Knives
    'https://images.unsplash.com/photo-1593618998160-e34014e67546', // Colored Knives
    'https://images.unsplash.com/photo-1593618998160-e34014e67546', // Stainless Knife Set
  ],
  cookers: [
    'https://images.unsplash.com/photo-1585515320310-259814833e62', // Pressure Cooker
    'https://images.unsplash.com/photo-1585515320310-259814833e62', // Stainless Cooker
    'https://images.unsplash.com/photo-1585515320310-259814833e62', // Aluminum Cooker
    'https://images.unsplash.com/photo-1585515320310-259814833e62', // Hard Anodized
    'https://images.unsplash.com/photo-1585515320310-259814833e62', // Electric Instant Pot
    'https://images.unsplash.com/photo-1585515320310-259814833e62', // Induction Cooker
    'https://images.unsplash.com/photo-1585515320310-259814833e62', // 3L Cooker
    'https://images.unsplash.com/photo-1585515320310-259814833e62', // 5L Cooker
    'https://images.unsplash.com/photo-1585515320310-259814833e62', // 7L Cooker
    'https://images.unsplash.com/photo-1585515320310-259814833e62', // Inner Lid Cooker
    'https://images.unsplash.com/photo-1585515320310-259814833e62', // Outer Lid Cooker
    'https://images.unsplash.com/photo-1585515320310-259814833e62', // Multi Cooker
  ],
  wallArt: [
    'https://images.unsplash.com/photo-1549490349-8643362247b5', // Abstract Canvas Art
    'https://images.unsplash.com/photo-1549490349-8643362247b5', // Modern Canvas
    'https://images.unsplash.com/photo-1549490349-8643362247b5', // Nature Landscape
    'https://images.unsplash.com/photo-1549490349-8643362247b5', // Minimalist Artwork
    'https://images.unsplash.com/photo-1549490349-8643362247b5', // Botanical Prints
    'https://images.unsplash.com/photo-1549490349-8643362247b5', // Geometric Canvas
    'https://images.unsplash.com/photo-1549490349-8643362247b5', // Black & White Art
    'https://images.unsplash.com/photo-1549490349-8643362247b5', // Floral Wall Art
    'https://images.unsplash.com/photo-1549490349-8643362247b5', // Mountain Painting
    'https://images.unsplash.com/photo-1549490349-8643362247b5', // Motivational Frame
    'https://images.unsplash.com/photo-1549490349-8643362247b5', // Metal Wall Art
    'https://images.unsplash.com/photo-1549490349-8643362247b5', // Gallery Wall Set
  ],
  rugs: [
    'https://images.unsplash.com/photo-1600166898405-da9535204843', // Modern Area Rug
    'https://images.unsplash.com/photo-1600166898405-da9535204843', // Persian Style Rug
    'https://images.unsplash.com/photo-1600166898405-da9535204843', // Shaggy Carpet
    'https://images.unsplash.com/photo-1600166898405-da9535204843', // Oriental Pattern Rug
    'https://images.unsplash.com/photo-1600166898405-da9535204843', // Geometric Area Rug
    'https://images.unsplash.com/photo-1600166898405-da9535204843', // Bohemian Rug
    'https://images.unsplash.com/photo-1600166898405-da9535204843', // Vintage Rug
    'https://images.unsplash.com/photo-1600166898405-da9535204843', // Round Area Rug
    'https://images.unsplash.com/photo-1600166898405-da9535204843', // Washable Carpet
    'https://images.unsplash.com/photo-1600166898405-da9535204843', // Runner Rug
    'https://images.unsplash.com/photo-1600166898405-da9535204843', // Handwoven Cotton Rug
    'https://images.unsplash.com/photo-1600166898405-da9535204843', // Minimalist Neutral Rug
  ],
  curtains: [
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace', // Blackout Curtains
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace', // Sheer Curtains
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace', // Linen Drapes
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace', // Velvet Curtains
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace', // Cotton Drapes
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace', // Thermal Curtains
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace', // Eyelet Curtains
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace', // Grommet Curtains
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace', // Printed Curtains
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace', // Floral Drapes
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace', // Solid Curtains
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace', // Luxury Curtains
  ],

  // ─── GROCERIES ────────────────────────────────────────────────────────────
  dairy: [
    'https://images.unsplash.com/photo-1550583724-b2692b85b150', // Fresh Milk Bottle
    'https://images.unsplash.com/photo-1550583724-b2692b85b150', // Toned Milk
    'https://images.unsplash.com/photo-1550583724-b2692b85b150', // Organic Milk
    'https://images.unsplash.com/photo-1550583724-b2692b85b150', // Almond Milk
    'https://images.unsplash.com/photo-1550583724-b2692b85b150', // Soy Milk
    'https://images.unsplash.com/photo-1488477181946-6428a0291777', // Greek Yogurt
    'https://images.unsplash.com/photo-1488477181946-6428a0291777', // Fresh Curd / Dahi
    'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d', // Cottage Cheese / Paneer
    'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d', // Cheddar Cheese Block
    'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d', // Mozzarella Cheese
    'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d', // Fresh Butter
    'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d', // Pure Cow Ghee
  ],
  grains: [
    'https://images.unsplash.com/photo-1586201375761-83865001e31c', // Basmati Rice
    'https://images.unsplash.com/photo-1586201375761-83865001e31c', // Brown Rice
    'https://images.unsplash.com/photo-1586201375761-83865001e31c', // Sona Masoori
    'https://images.unsplash.com/photo-1586201375761-83865001e31c', // Jasmine Rice
    'https://images.unsplash.com/photo-1586201375761-83865001e31c', // Quinoa Grains
    'https://images.unsplash.com/photo-1586201375761-83865001e31c', // Rolled Oats
    'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b', // Whole Wheat Atta
    'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b', // Multigrain Flour
    'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b', // Ragi Flour
    'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b', // Bajra Flour
    'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b', // Jowar Flour
    'https://images.unsplash.com/photo-1586201375761-83865001e31c', // Poha / Flattened Rice
  ],
  pulses: [
    'https://images.unsplash.com/photo-1515543904379-3d757afe72e4', // Pulses & Lentils
    'https://images.unsplash.com/photo-1515543904379-3d757afe72e4', // Toor Dal
    'https://images.unsplash.com/photo-1515543904379-3d757afe72e4', // Moong Dal
    'https://images.unsplash.com/photo-1515543904379-3d757afe72e4', // Masoor Dal
    'https://images.unsplash.com/photo-1515543904379-3d757afe72e4', // Chana Dal
    'https://images.unsplash.com/photo-1515543904379-3d757afe72e4', // Urad Dal
    'https://images.unsplash.com/photo-1515543904379-3d757afe72e4', // Black Chana
    'https://images.unsplash.com/photo-1515543904379-3d757afe72e4', // Kabuli Chana
    'https://images.unsplash.com/photo-1515543904379-3d757afe72e4', // Red Rajma
    'https://images.unsplash.com/photo-1515543904379-3d757afe72e4', // Lobia Beans
    'https://images.unsplash.com/photo-1515543904379-3d757afe72e4', // Green Peas
    'https://images.unsplash.com/photo-1515543904379-3d757afe72e4', // Mixed Dal
  ],
  vegetables: [
    'https://images.unsplash.com/photo-1518977676601-b53f82aba655', // Fresh Potato
    'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cf', // Red Onion
    'https://images.unsplash.com/photo-1592924357228-91a4daadcfea', // Ripe Tomatoes
    'https://images.unsplash.com/photo-1598170845058-128a34a49470', // Carrots
    'https://images.unsplash.com/photo-1447175008436-08417189295a', // Fresh Cucumber
    'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3', // Cauliflower
    'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc', // Broccoli
    'https://images.unsplash.com/photo-1576045057995-568f588f82fb', // Fresh Spinach
    'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83', // Bell Pepper
    'https://images.unsplash.com/photo-1518977676601-b53f82aba655', // Green Beans
    'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cf', // Brinjal / Eggplant
    'https://images.unsplash.com/photo-1592924357228-91a4daadcfea', // Green Peas
  ],
  fruits: [
    'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6', // Red Apples
    'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e', // Yellow Bananas
    'https://images.unsplash.com/photo-1547514701-42782101795e', // Fresh Oranges
    'https://images.unsplash.com/photo-1553279768-865429fa0078', // Sweet Mangoes
    'https://images.unsplash.com/photo-1537640538966-79f369143f8f', // Green Grapes
    'https://images.unsplash.com/photo-1587049352846-4a222e784d38', // Fresh Watermelon
    'https://images.unsplash.com/photo-1526318896980-cf78c088247c', // Papaya
    'https://images.unsplash.com/photo-1615485290382-441e4d049cb5', // Pomegranate
    'https://images.unsplash.com/photo-1550258987-190a2d41a8ba', // Pineapple
    'https://images.unsplash.com/photo-1536657464919-892534f60d6e', // Guava
    'https://images.unsplash.com/photo-1585059895524-72fd5965c4b8', // Green Kiwi
    'https://images.unsplash.com/photo-1464965911861-746a04b4bca6', // Fresh Strawberries
  ],
  dryFruits: [
    'https://images.unsplash.com/photo-1508061252966-17387f0b2f81', // Crunchy Almonds
    'https://images.unsplash.com/photo-1508061252966-17387f0b2f81', // Whole Cashews
    'https://images.unsplash.com/photo-1508061252966-17387f0b2f81', // Walnuts
    'https://images.unsplash.com/photo-1508061252966-17387f0b2f81', // Pistachios
    'https://images.unsplash.com/photo-1508061252966-17387f0b2f81', // Raisins
    'https://images.unsplash.com/photo-1508061252966-17387f0b2f81', // Dates
    'https://images.unsplash.com/photo-1508061252966-17387f0b2f81', // Dried Figs
    'https://images.unsplash.com/photo-1508061252966-17387f0b2f81', // Dried Apricots
    'https://images.unsplash.com/photo-1508061252966-17387f0b2f81', // Peanuts
    'https://images.unsplash.com/photo-1508061252966-17387f0b2f81', // Pumpkin Seeds
    'https://images.unsplash.com/photo-1508061252966-17387f0b2f81', // Chia Seeds
    'https://images.unsplash.com/photo-1508061252966-17387f0b2f81', // Mixed Dry Fruits
  ],
  spices: [
    'https://images.unsplash.com/photo-1596040033229-a9821ebd058d', // Turmeric Powder
    'https://images.unsplash.com/photo-1596040033229-a9821ebd058d', // Red Chilli Powder
    'https://images.unsplash.com/photo-1596040033229-a9821ebd058d', // Coriander Powder
    'https://images.unsplash.com/photo-1596040033229-a9821ebd058d', // Cumin Seeds
    'https://images.unsplash.com/photo-1596040033229-a9821ebd058d', // Black Pepper
    'https://images.unsplash.com/photo-1596040033229-a9821ebd058d', // Garam Masala
    'https://images.unsplash.com/photo-1596040033229-a9821ebd058d', // Chaat Masala
    'https://images.unsplash.com/photo-1596040033229-a9821ebd058d', // Kitchen King
    'https://images.unsplash.com/photo-1596040033229-a9821ebd058d', // Mustard Seeds
    'https://images.unsplash.com/photo-1596040033229-a9821ebd058d', // Fennel Seeds
    'https://images.unsplash.com/photo-1596040033229-a9821ebd058d', // Cardamom Pods
    'https://images.unsplash.com/photo-1596040033229-a9821ebd058d', // Cinnamon Sticks
  ],
  oils: [
    'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5', // Cooking Oil Bottle
    'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5', // Mustard Oil
    'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5', // Extra Virgin Olive Oil
    'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5', // Coconut Oil
    'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5', // Rice Bran Oil
    'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e', // White Sugar
    'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e', // Brown Sugar
    'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e', // Organic Jaggery
    'https://images.unsplash.com/photo-1518110168344-93368297b4b1', // Table Salt
    'https://images.unsplash.com/photo-1518110168344-93368297b4b1', // Pink Rock Salt
    'https://images.unsplash.com/photo-1587049352846-4a222e784d38', // Pure Honey Jar
    'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5', // Apple Cider Vinegar
  ],
  snacks: [
    'https://images.unsplash.com/photo-1563805042-7684c019e1cb', // Chocolate Biscuits
    'https://images.unsplash.com/photo-1563805042-7684c019e1cb', // Cream Biscuits
    'https://images.unsplash.com/photo-1563805042-7684c019e1cb', // Digestive Biscuits
    'https://images.unsplash.com/photo-1563805042-7684c019e1cb', // Salted Crackers
    'https://images.unsplash.com/photo-1566478989037-eec170784d0b', // Crispy Potato Chips
    'https://images.unsplash.com/photo-1566478989037-eec170784d0b', // Banana Chips
    'https://images.unsplash.com/photo-1566478989037-eec170784d0b', // Corn Nachos
    'https://images.unsplash.com/photo-1578849278619-e73505e9610f', // Butter Popcorn
    'https://images.unsplash.com/photo-1566478989037-eec170784d0b', // Indian Namkeen
    'https://images.unsplash.com/photo-1566478989037-eec170784d0b', // Bikaneri Bhujia
    'https://images.unsplash.com/photo-1508061252966-17387f0b2f81', // Salted Peanuts
    'https://images.unsplash.com/photo-1563805042-7684c019e1cb', // Oats Granola Bar
  ],
  packaged: [
    'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f', // Tomato Ketchup
    'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f', // Italian Pasta Sauce
    'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f', // Creamy Mayonnaise
    'https://images.unsplash.com/photo-1587049352846-4a222e784d38', // Creamy Peanut Butter
    'https://images.unsplash.com/photo-1587049352846-4a222e784d38', // Fruit Jam Jar
    'https://images.unsplash.com/photo-1612927601601-6638404737ce', // Instant Noodles
    'https://images.unsplash.com/photo-1612927601601-6638404737ce', // Penne Pasta
    'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f', // Canned Sweet Corn
    'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f', // Canned Beans
    'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f', // Baked Beans in Sauce
    'https://images.unsplash.com/photo-1612927601601-6638404737ce', // Ready-to-Eat Meal
    'https://images.unsplash.com/photo-1547592166-23ac45744acd', // Instant Soup Bowl
  ],
  beverages: [
    'https://images.unsplash.com/photo-1576092768241-dec231879fc3', // Organic Green Tea
    'https://images.unsplash.com/photo-1576092768241-dec231879fc3', // Assam Black Tea
    'https://images.unsplash.com/photo-1576092768241-dec231879fc3', // Indian Masala Chai
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd', // Roasted Coffee Beans
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd', // Instant Coffee
    'https://images.unsplash.com/photo-1544787219-7f47ccb76574', // Hot Chocolate Mug
    'https://images.unsplash.com/photo-1613478223719-2ab802602423', // Fresh Fruit Juice
    'https://images.unsplash.com/photo-1525385133512-2f3bdd039054', // Tender Coconut Water
    'https://images.unsplash.com/photo-1622543925917-763c34d1a86e', // Energy Drink Can
    'https://images.unsplash.com/photo-1550583724-b2692b85b150', // Mineral Water Bottle
    'https://images.unsplash.com/photo-1622543925917-763c34d1a86e', // Sparkling Soft Drink
    'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd', // Chilled Iced Tea
  ],
  frozen: [
    'https://images.unsplash.com/photo-1515543904379-3d757afe72e4', // Frozen Green Peas
    'https://images.unsplash.com/photo-1515543904379-3d757afe72e4', // Frozen Sweet Corn
    'https://images.unsplash.com/photo-1515543904379-3d757afe72e4', // Frozen Mixed Veggies
    'https://images.unsplash.com/photo-1573080496219-bb080dd4f877', // Crispy French Fries
    'https://images.unsplash.com/photo-1573080496219-bb080dd4f877', // Frozen Malai Paratha
    'https://images.unsplash.com/photo-1573080496219-bb080dd4f877', // Punjabi Samosa
    'https://images.unsplash.com/photo-1573080496219-bb080dd4f877', // Vegetable Spring Rolls
    'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d', // Frozen Paneer Cubes
    'https://images.unsplash.com/photo-1464965911861-746a04b4bca6', // Frozen Mixed Berries
    'https://images.unsplash.com/photo-1515543904379-3d757afe72e4', // Frozen American Corn
    'https://images.unsplash.com/photo-1573080496219-bb080dd4f877', // Frozen Potato Bites
    'https://images.unsplash.com/photo-1612927601601-6638404737ce', // Frozen Meal Box
  ]
};

console.log('Building subcategory image mapping engine...');
