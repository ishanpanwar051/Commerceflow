import { PrismaClient } from '@prisma/client';
import { getProductImages } from './product-images';

const prisma = new PrismaClient();

function randomInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randomFloat(min: number, max: number, decimals = 2) { return parseFloat((Math.random() * (max - min) + min).toFixed(decimals)); }
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const categories = [
  { name: 'Electronics', slug: 'electronics', description: 'Electronic devices and accessories' },
  { name: 'Clothing', slug: 'clothing', description: 'Apparel and fashion items' },
  { name: 'Home & Kitchen', slug: 'home-kitchen', description: 'Home improvement and kitchen essentials' },
  { name: 'Sports & Outdoors', slug: 'sports-outdoors', description: 'Sports equipment and outdoor gear' },
  { name: 'Books & Media', slug: 'books-media', description: 'Books, e-books, and media content' },
  { name: 'Beauty & Health', slug: 'beauty-health', description: 'Beauty products and health essentials' },
];

const productData: Record<string, { name: string; slug: string; basePrice: number; sku: string; description: string; stock: number; featured: boolean }[]> = {
  'electronics': [
    { name: 'Wireless Headphones', slug: 'wireless-headphones', basePrice: 79.99, sku: 'WH-001', description: 'Premium wireless headphones with noise cancellation and crystal-clear audio.', stock: 50, featured: true },
    { name: 'Bluetooth Speaker', slug: 'bluetooth-speaker', basePrice: 49.99, sku: 'BS-001', description: 'Portable Bluetooth speaker with deep bass and 12-hour battery life.', stock: 30, featured: true },
    { name: 'USB-C Hub', slug: 'usb-c-hub', basePrice: 34.99, sku: 'UC-001', description: '7-in-1 USB-C hub with HDMI, USB 3.0, SD card reader, and more.', stock: 100, featured: false },
    { name: 'Smart Watch', slug: 'smart-watch', basePrice: 199.99, sku: 'SW-002', description: 'Fitness smart watch with heart rate monitor, GPS, and 7-day battery.', stock: 40, featured: true },
    { name: 'Wireless Mouse', slug: 'wireless-mouse', basePrice: 29.99, sku: 'WM-003', description: 'Ergonomic wireless mouse with silent clicks and long battery life.', stock: 150, featured: false },
    { name: 'Mechanical Keyboard', slug: 'mechanical-keyboard', basePrice: 89.99, sku: 'MK-004', description: 'RGB mechanical keyboard with Cherry MX switches and aluminum frame.', stock: 60, featured: false },
    { name: '4K Monitor 27"', slug: '4k-monitor-27', basePrice: 449.99, sku: 'MN-005', description: '27-inch 4K UHD monitor with HDR10, IPS panel, and USB-C connectivity.', stock: 20, featured: true },
    { name: 'Webcam HD', slug: 'webcam-hd', basePrice: 59.99, sku: 'WC-006', description: '1080p HD webcam with auto-focus, built-in mic, and privacy cover.', stock: 80, featured: false },
    { name: 'Portable Charger', slug: 'portable-charger', basePrice: 39.99, sku: 'PC-007', description: '20000mAh portable power bank with fast charging and dual USB ports.', stock: 120, featured: false },
    { name: 'Laptop Stand', slug: 'laptop-stand', basePrice: 44.99, sku: 'LS-008', description: 'Adjustable aluminum laptop stand with ergonomic design and cable management.', stock: 90, featured: false },
    { name: 'Noise Cancelling Earbuds', slug: 'noise-cancelling-earbuds', basePrice: 129.99, sku: 'EB-009', description: 'True wireless earbuds with active noise cancellation and IPX5 rating.', stock: 45, featured: true },
    { name: 'External SSD 1TB', slug: 'external-ssd-1tb', basePrice: 109.99, sku: 'SS-010', description: '1TB portable SSD with USB 3.2, 1050MB/s read speed, and rugged design.', stock: 35, featured: false },
    { name: 'Tablet Stand', slug: 'tablet-stand', basePrice: 24.99, sku: 'TS-011', description: 'Adjustable tablet stand for desks, compatible with all tablets up to 12.9".', stock: 70, featured: false },
    { name: 'Gaming Headset', slug: 'gaming-headset', basePrice: 69.99, sku: 'GH-012', description: 'Surround sound gaming headset with noise-cancelling mic and RGB lighting.', stock: 55, featured: true },
  ],
  'clothing': [
    { name: 'Cotton T-Shirt', slug: 'cotton-tshirt', basePrice: 19.99, sku: 'CT-001', description: 'Soft 100% organic cotton t-shirt available in multiple colors.', stock: 200, featured: true },
    { name: 'Denim Jacket', slug: 'denim-jacket', basePrice: 89.99, sku: 'DJ-001', description: 'Classic denim jacket with a modern fit.', stock: 25, featured: false },
    { name: 'Running Shoes', slug: 'running-shoes', basePrice: 119.99, sku: 'RS-002', description: 'Lightweight running shoes with responsive cushioning and breathable mesh.', stock: 60, featured: true },
    { name: 'Winter Parka', slug: 'winter-parka', basePrice: 149.99, sku: 'WP-003', description: 'Insulated winter parka with waterproof shell and faux fur hood.', stock: 30, featured: false },
    { name: 'Slim Fit Chinos', slug: 'slim-fit-chinos', basePrice: 54.99, sku: 'CH-004', description: 'Stretch cotton chinos with a modern slim fit, perfect for casual and office wear.', stock: 80, featured: false },
    { name: 'Wool Sweater', slug: 'wool-sweater', basePrice: 69.99, sku: 'WS-005', description: 'Merino wool sweater with ribbed cuffs and a classic crew neck.', stock: 45, featured: true },
    { name: 'Leather Belt', slug: 'leather-belt', basePrice: 34.99, sku: 'LB-006', description: 'Genuine leather belt with a brushed metal buckle, 1.5 inches wide.', stock: 100, featured: false },
    { name: 'Casual Blazer', slug: 'casual-blazer', basePrice: 129.99, sku: 'CB-007', description: 'Unstructured casual blazer in stretch cotton, perfect for smart-casual occasions.', stock: 20, featured: false },
    { name: 'Athletic Shorts', slug: 'athletic-shorts', basePrice: 29.99, sku: 'AS-008', description: 'Moisture-wicking athletic shorts with zip pockets and built-in liner.', stock: 150, featured: false },
    { name: 'Polo Shirt', slug: 'polo-shirt', basePrice: 39.99, sku: 'PS-009', description: 'Classic pique polo shirt with a two-button placket and embroidered logo.', stock: 90, featured: false },
    { name: 'Hooded Sweatshirt', slug: 'hooded-sweatshirt', basePrice: 59.99, sku: 'HS-010', description: 'French terry hoodie with adjustable drawstring hood and kangaroo pocket.', stock: 65, featured: true },
    { name: 'Formal Dress Shoes', slug: 'formal-dress-shoes', basePrice: 139.99, sku: 'FD-011', description: 'Oxford dress shoes in polished leather with leather sole and padded insole.', stock: 35, featured: false },
    { name: 'Cashmere Scarf', slug: 'cashmere-scarf', basePrice: 49.99, sku: 'CS-012', description: 'Luxurious cashmere scarf in a classic herringbone pattern.', stock: 40, featured: false },
  ],
  'home-kitchen': [
    { name: 'Chef\'s Knife Set', slug: 'chefs-knife-set', basePrice: 89.99, sku: 'CK-001', description: 'Professional 5-piece chef knife set with stainless steel blades and ergonomic handles.', stock: 40, featured: true },
    { name: 'Cast Iron Skillet', slug: 'cast-iron-skillet', basePrice: 44.99, sku: 'CI-002', description: 'Pre-seasoned 12-inch cast iron skillet with heat-resistant handle cover.', stock: 55, featured: false },
    { name: 'French Press', slug: 'french-press', basePrice: 29.99, sku: 'FP-003', description: '34oz borosilicate glass French press with stainless steel plunger and filter.', stock: 70, featured: false },
    { name: 'Cutting Board Set', slug: 'cutting-board-set', basePrice: 39.99, sku: 'CB-004', description: 'Set of 3 bamboo cutting boards in different sizes with juice grooves.', stock: 85, featured: false },
    { name: 'Nonstick Cookware Set', slug: 'nonstick-cookware-set', basePrice: 199.99, sku: 'CW-005', description: '10-piece nonstick cookware set with tempered glass lids and soft-grip handles.', stock: 25, featured: true },
    { name: 'Kitchen Scale', slug: 'kitchen-scale', basePrice: 24.99, sku: 'KS-006', description: 'Digital kitchen scale with 11lb capacity, tare function, and LCD display.', stock: 90, featured: false },
    { name: 'Electric Kettle', slug: 'electric-kettle', basePrice: 34.99, sku: 'EK-007', description: '1.7L stainless steel electric kettle with auto shut-off and boil-dry protection.', stock: 65, featured: false },
    { name: 'Food Storage Set', slug: 'food-storage-set', basePrice: 32.99, sku: 'FS-008', description: '24-piece BPA-free food storage container set in assorted sizes.', stock: 110, featured: false },
    { name: 'Waffle Maker', slug: 'waffle-maker', basePrice: 49.99, sku: 'WM-009', description: 'Belgian waffle maker with nonstick plates, adjustable browning control, and indicator lights.', stock: 30, featured: false },
    { name: 'Mixing Bowl Set', slug: 'mixing-bowl-set', basePrice: 27.99, sku: 'MB-010', description: 'Set of 5 stainless steel mixing bowls with lids, graduated sizes from 1 to 5 quarts.', stock: 75, featured: false },
    { name: 'Sous Vide Immersion Cooker', slug: 'sous-vide-cooker', basePrice: 79.99, sku: 'SV-011', description: 'Precision sous vide cooker with 1000W power, Wi-Fi connectivity, and recipe app.', stock: 20, featured: true },
    { name: 'Glass Meal Prep Containers', slug: 'glass-meal-prep-containers', basePrice: 35.99, sku: 'MP-012', description: 'Set of 6 glass meal prep containers with leak-proof lids, oven and microwave safe.', stock: 60, featured: false },
    { name: 'Herb Garden Kit', slug: 'herb-garden-kit', basePrice: 22.99, sku: 'HG-013', description: 'Indoor herb garden kit with 6 herb varieties, biodegradable pots, and soil discs.', stock: 45, featured: false },
  ],
  'sports-outdoors': [
    { name: 'Yoga Mat', slug: 'yoga-mat', basePrice: 39.99, sku: 'YM-001', description: 'Non-slip yoga mat with alignment lines, 6mm thick, and carrying strap included.', stock: 80, featured: false },
    { name: 'Resistance Bands Set', slug: 'resistance-bands-set', basePrice: 24.99, sku: 'RB-002', description: 'Set of 5 resistance bands with different tension levels, door anchor, and carrying bag.', stock: 120, featured: false },
    { name: 'Insulated Water Bottle', slug: 'insulated-water-bottle', basePrice: 34.99, sku: 'WB-003', description: '32oz vacuum insulated stainless steel water bottle, keeps drinks cold for 24 hours.', stock: 200, featured: true },
    { name: 'Camping Tent 4-Person', slug: 'camping-tent-4-person', basePrice: 179.99, sku: 'CT-004', description: '4-person waterproof camping tent with easy setup, rainfly, and storage pockets.', stock: 15, featured: true },
    { name: 'Adjustable Dumbbells', slug: 'adjustable-dumbbells', basePrice: 249.99, sku: 'AD-005', description: 'Adjustable dumbbell set from 5 to 52.5 lbs, replaces 15 sets of dumbbells.', stock: 10, featured: true },
    { name: 'Running Hydration Vest', slug: 'running-hydration-vest', basePrice: 59.99, sku: 'HV-006', description: 'Lightweight hydration vest with 2L bladder, multiple pockets, and reflective details.', stock: 35, featured: false },
    { name: 'Foam Roller', slug: 'foam-roller', basePrice: 29.99, sku: 'FR-007', description: 'High-density foam roller for muscle recovery, 18 inches long with textured surface.', stock: 65, featured: false },
    { name: 'Hiking Backpack 40L', slug: 'hiking-backpack-40l', basePrice: 89.99, sku: 'HB-008', description: '40-liter hiking backpack with rain cover, hydration sleeve, and adjustable suspension.', stock: 25, featured: true },
    { name: 'Jump Rope', slug: 'jump-rope', basePrice: 14.99, sku: 'JR-009', description: 'Speed jump rope with ball bearings, adjustable length, and foam handles.', stock: 150, featured: false },
    { name: 'Sleeping Bag 3-Season', slug: 'sleeping-bag-3-season', basePrice: 69.99, sku: 'SB-010', description: '3-season mummy sleeping bag rated to 20°F with compression sack included.', stock: 30, featured: false },
    { name: 'Paddle Ball Set', slug: 'paddle-ball-set', basePrice: 19.99, sku: 'PB-011', description: 'Beach paddle ball set with 2 paddles, 2 balls, and a mesh carrying bag.', stock: 100, featured: false },
    { name: 'Fitness Tracker', slug: 'fitness-tracker', basePrice: 99.99, sku: 'FT-012', description: 'Advanced fitness tracker with heart rate, SpO2, sleep tracking, and 14-day battery.', stock: 50, featured: true },
  ],
  'books-media': [
    { name: 'The Art of Programming', slug: 'art-of-programming', basePrice: 49.99, sku: 'BK-001', description: 'Comprehensive guide to software engineering best practices and design patterns.', stock: 100, featured: true },
    { name: 'Mindfulness Journal', slug: 'mindfulness-journal', basePrice: 16.99, sku: 'BK-002', description: 'Daily guided mindfulness journal with prompts, gratitude logs, and meditation tips.', stock: 200, featured: false },
    { name: 'Cookbook: World Cuisines', slug: 'cookbook-world-cuisines', basePrice: 34.99, sku: 'BK-003', description: 'Explore 200+ recipes from 50 countries with stunning photography and step-by-step instructions.', stock: 60, featured: false },
    { name: 'Starter Guitar Book + DVD', slug: 'starter-guitar-book', basePrice: 24.99, sku: 'BK-004', description: 'Learn guitar from scratch with this beginner-friendly book and instructional DVD.', stock: 40, featured: false },
    { name: 'Sci-Fi Trilogy Box Set', slug: 'sci-fi-trilogy-box-set', basePrice: 39.99, sku: 'BK-005', description: 'Award-winning science fiction trilogy in a collectible box set with exclusive artwork.', stock: 75, featured: true },
    { name: 'Language Learning Bundle', slug: 'language-learning-bundle', basePrice: 59.99, sku: 'BK-006', description: 'Complete language learning set with textbook, workbook, audio CDs, and online access.', stock: 30, featured: false },
    { name: 'Self-Help Bestseller', slug: 'self-help-bestseller', basePrice: 22.99, sku: 'BK-007', description: 'Transform your habits and productivity with this #1 bestselling self-help guide.', stock: 150, featured: false },
    { name: 'Children\'s Encyclopedia', slug: 'childrens-encyclopedia', basePrice: 29.99, sku: 'BK-008', description: 'Illustrated encyclopedia for kids covering science, history, nature, and space.', stock: 45, featured: false },
    { name: 'Sketchbook Premium', slug: 'sketchbook-premium', basePrice: 18.99, sku: 'BK-009', description: 'Hardcover sketchbook with 200 pages of acid-free, 100gsm paper, perfect for all media.', stock: 80, featured: false },
    { name: 'Business Strategy Guide', slug: 'business-strategy-guide', basePrice: 44.99, sku: 'BK-010', description: 'Strategic frameworks and case studies from top business schools and industry leaders.', stock: 35, featured: true },
    { name: 'Poetry Collection', slug: 'poetry-collection', basePrice: 15.99, sku: 'BK-011', description: 'Curated collection of contemporary poetry exploring love, loss, and human connection.', stock: 55, featured: false },
    { name: 'Photography Masterclass', slug: 'photography-masterclass', basePrice: 49.99, sku: 'BK-012', description: 'Learn professional photography techniques with this comprehensive guide and online resources.', stock: 25, featured: false },
  ],
  'beauty-health': [
    { name: 'Vitamin C Serum', slug: 'vitamin-c-serum', basePrice: 28.99, sku: 'BH-001', description: '20% Vitamin C serum with hyaluronic acid and vitamin E for bright, even skin.', stock: 90, featured: true },
    { name: 'Essential Oils Set', slug: 'essential-oils-set', basePrice: 32.99, sku: 'BH-002', description: 'Set of 8 pure essential oils including lavender, peppermint, tea tree, and eucalyptus.', stock: 60, featured: false },
    { name: 'Organic Face Moisturizer', slug: 'organic-face-moisturizer', basePrice: 24.99, sku: 'BH-003', description: 'Organic, hypoallergenic face moisturizer with SPF 30, suitable for all skin types.', stock: 75, featured: false },
    { name: 'Hair Growth Kit', slug: 'hair-growth-kit', basePrice: 44.99, sku: 'BH-004', description: 'Hair growth kit with biotin shampoo, conditioner, and scalp treatment serum.', stock: 40, featured: true },
    { name: 'Electric Toothbrush', slug: 'electric-toothbrush', basePrice: 49.99, sku: 'BH-005', description: 'Sonic electric toothbrush with 5 cleaning modes, 2-minute timer, and USB charging.', stock: 55, featured: false },
    { name: 'Beard Grooming Set', slug: 'beard-grooming-set', basePrice: 34.99, sku: 'BH-006', description: 'Complete beard grooming set with oil, balm, brush, comb, and mustache scissors.', stock: 45, featured: false },
    { name: 'Lip Balm Set', slug: 'lip-balm-set', basePrice: 12.99, sku: 'BH-007', description: 'Set of 6 natural lip balms in assorted flavors, made with beeswax and shea butter.', stock: 200, featured: false },
    { name: 'Retinol Night Cream', slug: 'retinol-night-cream', basePrice: 38.99, sku: 'BH-008', description: 'Anti-aging retinol night cream with peptides and ceramides for younger-looking skin.', stock: 50, featured: true },
    { name: 'Shampoo Bar Set', slug: 'shampoo-bar-set', basePrice: 18.99, sku: 'BH-009', description: 'Set of 2 solid shampoo bars, sulfate-free and made with natural ingredients.', stock: 80, featured: false },
    { name: 'Sunscreen SPF 50', slug: 'sunscreen-spf-50', basePrice: 19.99, sku: 'BH-010', description: 'Broad-spectrum SPF 50 sunscreen, water-resistant, reef-safe, and non-greasy formula.', stock: 120, featured: false },
    { name: 'Deodorant Natural', slug: 'deodorant-natural', basePrice: 14.99, sku: 'BH-011', description: 'Aluminum-free natural deodorant available in lavender, citrus, and unscented.', stock: 100, featured: false },
    { name: 'Collagen Peptide Powder', slug: 'collagen-peptide-powder', basePrice: 42.99, sku: 'BH-012', description: 'Hydrolyzed collagen peptide powder, unflavored, supports skin, hair, nails, and joints.', stock: 65, featured: true },
    { name: 'Aromatherapy Diffuser', slug: 'aromatherapy-diffuser', basePrice: 29.99, sku: 'BH-013', description: 'Ultrasonic aromatherapy diffuser with LED lights, timer settings, and auto shut-off.', stock: 35, featured: false },
  ],
};

function getSubcategoryForProduct(catSlug: string, productName: string): string {
  const map: Record<string, Record<string, string>> = {
    electronics: {
      'Wireless Headphones': 'Headphones',
      'Bluetooth Speaker': 'Speakers',
      'USB-C Hub': 'Chargers',
      'Smart Watch': 'Smart Watches',
      'Wireless Mouse': 'Mouse',
      'Mechanical Keyboard': 'Keyboards',
      '4K Monitor': 'Monitors',
      'Webcam HD': 'Cameras',
      'Portable Charger': 'Power Banks',
      'Laptop Stand': 'Laptops',
      'Noise Cancelling Earbuds': 'Earbuds',
      'External SSD': 'SSD',
      'Tablet Stand': 'Tablets',
      'Gaming Headset': 'Gaming',
    },
    clothing: {
      'Cotton T-Shirt': 'T-Shirts',
      'Denim Jacket': 'Jackets',
      'Running Shoes': 'Casual Shoes',
      'Winter Parka': 'Jackets',
      'Slim Fit Chinos': 'Trousers',
      'Wool Sweater': 'Sweaters',
      'Leather Belt': 'Belts',
      'Casual Blazer': 'Suits',
      'Athletic Shorts': 'Shorts',
      'Polo Shirt': 'Shirts',
      'Hooded Sweatshirt': 'Sweaters',
      'Formal Dress Shoes': 'Formal Shoes',
      'Cashmere Scarf': 'Scarves',
    },
    'home-kitchen': {
      'Chef\'s Knife Set': 'Utensils',
      'Cast Iron Skillet': 'Cookware',
      'French Press': 'Coffee & Tea',
      'Cutting Board Set': 'Utensils',
      'Nonstick Cookware Set': 'Cookware',
      'Kitchen Scale': 'Appliances',
      'Electric Kettle': 'Appliances',
      'Food Storage Set': 'Storage',
      'Waffle Maker': 'Bakeware',
      'Mixing Bowl Set': 'Utensils',
      'Sous Vide Immersion Cooker': 'Appliances',
      'Glass Meal Prep Containers': 'Storage',
      'Herb Garden Kit': 'Cookware',
    },
    'sports-outdoors': {
      'Yoga Mat': 'Yoga',
      'Resistance Bands Set': 'Resistance Bands',
      'Insulated Water Bottle': 'Water Bottles',
      'Camping Tent 4-Person': 'Camping',
      'Adjustable Dumbbells': 'Weights',
      'Running Hydration Vest': 'Cycling',
      'Foam Roller': 'Gym Equipment',
      'Hiking Backpack 40L': 'Camping',
      'Jump Rope': 'Gym Equipment',
      'Sleeping Bag 3-Season': 'Camping',
      'Paddle Ball Set': 'Outdoor Play',
      'Fitness Tracker': 'Fitness Trackers',
    },
    'books-media': {
      'The Art of Programming': 'Non-Fiction',
      'Mindfulness Journal': 'Non-Fiction',
      'Cookbook: World Cuisines': 'Non-Fiction',
      'Starter Guitar Book + DVD': 'Educational',
      'Sci-Fi Trilogy Box Set': 'Fiction',
      'Language Learning Bundle': 'Educational',
      'Self-Help Bestseller': 'Self-Help',
      'Children\'s Encyclopedia': 'Children',
      'Sketchbook Premium': 'Non-Fiction',
      'Business Strategy Guide': 'Business',
      'Poetry Collection': 'Fiction',
      'Photography Masterclass': 'Non-Fiction',
    },
    'beauty-health': {
      'Vitamin C Serum': 'Skincare',
      'Essential Oils Set': 'Fragrance',
      'Organic Face Moisturizer': 'Skincare',
      'Hair Growth Kit': 'Haircare',
      'Electric Toothbrush': 'Beauty Appliances',
      'Beard Grooming Set': 'Tools & Brushes',
      'Lip Balm Set': 'Makeup',
      'Retinol Night Cream': 'Skincare',
      'Shampoo Bar Set': 'Haircare',
      'Sunscreen SPF 50': 'Skincare',
      'Deodorant Natural': 'Bath & Body',
      'Collagen Peptide Powder': 'Protein',
      'Aromatherapy Diffuser': 'Fragrance',
    },
  };
  for (const [key, sub] of Object.entries(map[catSlug] || {})) {
    if (productName.startsWith(key) || productName.includes(key)) return sub;
  }
  return catSlug === 'electronics' ? 'Laptops' :
    catSlug === 'clothing' ? 'T-Shirts' :
    catSlug === 'home-kitchen' ? 'Cookware' :
    catSlug === 'sports-outdoors' ? 'Running Shoes' :
    catSlug === 'books-media' ? 'Non-Fiction' :
    catSlug === 'beauty-health' ? 'Skincare' : 'Laptops';
}

async function main() {
  console.log('Seeding bulk products...');

  const categoryMap: Record<string, string> = {};

  for (const cat of categories) {
    const existing = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { description: cat.description },
      create: { name: cat.name, slug: cat.slug, description: cat.description },
    });
    categoryMap[cat.slug] = existing.id;
    console.log(`  ✓ Category: ${cat.name}`);
  }

  let totalCreated = 0;
  let totalSkipped = 0;

  for (const [catSlug, products] of Object.entries(productData)) {
    const categoryId = categoryMap[catSlug];
    if (!categoryId) {
      console.log(`  ✗ Category not found: ${catSlug}`);
      continue;
    }

    for (const product of products) {
      const existing = await prisma.product.findUnique({ where: { sku: product.sku } });
      if (existing) {
        totalSkipped++;
        continue;
      }

      const brands: Record<string, string[]> = {
        electronics: ['Sony', 'Samsung', 'Apple', 'OnePlus', 'Bose', 'JBL', 'Logitech', 'Dell'],
        clothing: ['Nike', 'Adidas', 'Puma', 'Levis', 'Tommy Hilfiger', 'Calvin Klein', 'H&M', 'Zara'],
        'home-kitchen': ['Prestige', 'Hawkins', 'Butterfly', 'Pigeon', 'Bajaj', 'Philips', 'Morphy Richards', 'Bosch'],
        'sports-outdoors': ['Puma', 'Nike', 'Decathlon', 'Adidas', 'Cosco', 'Reebok', 'Speedo', 'SG'],
        'books-media': ['Penguin', 'HarperCollins', 'Rupa', 'Oxford', 'Prentice Hall', 'O\'Reilly', 'Wiley', 'MIT Press'],
        'beauty-health': ['L\'Oreal', 'Lakme', 'Mamaearth', 'Plum', 'Biotique', 'Himalaya', 'Neutrogena', 'Nivea'],
      };
      const catBrands = brands[catSlug] || ['Generic'];
      const brand = catBrands[totalCreated % catBrands.length] || catBrands[0];

      const productImages = getProductImages(
        {
          name: product.name,
          brand,
          categorySlug: catSlug,
          subcategory: getSubcategoryForProduct(catSlug, product.name),
        },
        totalCreated
      );

      const discountPercent = product.featured ? randomInt(10, 30) : randomInt(0, 20);
      const originalPrice = discountPercent > 0 ? Math.round(product.basePrice * 100 / (1 - discountPercent / 100)) : product.basePrice * 100;
      const avgRating = randomFloat(3.5, 5.0);
      const soldCount = randomInt(100, 15000);
      const reviewCount = randomInt(20, 500);
      const trending = randomFloat(1, 100);
      const stock = product.stock;
      const inventoryData = { stock, reservedStock: 0, lowStockThreshold: 5 };

      await prisma.product.create({
        data: {
          name: product.name,
          slug: product.slug,
          description: product.description,
          longDescription: product.description + ' ' + product.description,
          basePrice: Math.round(product.basePrice * 100),
          originalPrice,
          discountPercent,
          brand,
          sku: product.sku,
          barcode: String(randomInt(100000000000, 999999999999)),
          categoryId,
          weight: randomFloat(0.2, 5.0),
          dimensions: `${randomInt(10, 50)} x ${randomInt(10, 50)} x ${randomInt(2, 20)} cm`,
          material: pick(['Aluminum', 'Plastic', 'Stainless Steel', 'Glass', 'Cotton', 'Polyester', 'Leather', 'Wood']),
          warranty: pick(['1 Year Manufacturer Warranty', '2 Year International Warranty', '3 Year Extended Warranty', '1 Year Limited Warranty']),
          countryOfOrigin: pick(['China', 'India', 'USA', 'Japan', 'South Korea', 'Germany', 'Taiwan', 'Vietnam']),
          sellerName: pick(['Reliance Digital', 'Croma', 'Tata CLiQ', 'Flipkart Seller', 'Amazon India', 'Vijay Sales', 'Poorvika Mobiles', 'Bajaj Electronics']),
          returnPolicy: pick(['15 Days Easy Return', '30 Days Return Policy', '7 Days Replacement', 'No Questions Asked Returns within 15 Days']),
          deliveryEstimate: pick(['2-3 Business Days', '3-5 Business Days', 'Express 24 Hours', '1-2 Business Days', '4-6 Business Days']),
          gstPercent: pick([5, 12, 18, 28]),
          cashOnDelivery: Math.random() > 0.3,
          emiAvailable: Math.random() > 0.4,
          freeDelivery: Math.random() > 0.3,
          specifications: { 'Feature': 'Standard', 'Compatibility': 'Universal' },
          keyFeatures: [`Premium ${product.name}`, 'High quality materials', 'Easy to use', 'Great value for money'],
          whatsInTheBox: [`1x ${product.name}`, '1x User Manual', '1x Warranty Card'],
          tags: [catSlug, ...(product.featured ? ['featured'] : []), 'new-arrival', 'best-seller'],
          isFeatured: product.featured,
          isNewArrival: true,
          isBestSeller: Math.random() > 0.6,
          isTopRated: avgRating > 4.5,
          soldCount,
          wishlistCount: randomInt(100, 5000),
          questionsCount: randomInt(5, 100),
          trendingScore: trending,
          seoMetaTitle: `${product.name} - Buy Online at Best Price | CommerceFlow`,
          seoDescription: `Buy ${product.name} online. ${product.description.substring(0, 100)}`,
          seoKeywords: `${product.name}, ${product.sku}, buy online, best price, India, ${catSlug}`,
          images: { create: productImages },
          inventory: { create: inventoryData },
        },
      });
      totalCreated++;
    }
  }

  console.log(`\n✅ Done! Created: ${totalCreated}, Skipped (already exist): ${totalSkipped}`);
  console.log(`   Total products now: ${totalCreated + totalSkipped}`);
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
