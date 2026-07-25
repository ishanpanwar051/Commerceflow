import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { getProductImages } from './product-images';

const prisma = new PrismaClient();

function slugify(text: string) {
  return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
}

function randomInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randomFloat(min: number, max: number, decimals = 2) { return parseFloat((Math.random() * (max - min) + min).toFixed(decimals)); }
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function pickN<T>(arr: T[], n: number): T[] { const shuffled = [...arr].sort(() => 0.5 - Math.random()); return shuffled.slice(0, n); }



interface CategoryDef {
  name: string;
  slug: string;
  description: string;
  subcategories: string[];
}

const CATEGORIES: CategoryDef[] = [
  { name: 'Electronics', slug: 'electronics', description: 'Electronic devices and accessories', subcategories: ['Phones', 'Laptops', 'Tablets', 'Monitors', 'Keyboards', 'Mouse', 'Gaming', 'Cameras', 'Earbuds', 'Headphones', 'Speakers', 'Smart Watches', 'Power Banks', 'Chargers', 'SSD', 'Routers'] },
  { name: 'Fashion Men', slug: 'fashion-men', description: 'Men\'s clothing and accessories', subcategories: ['T-Shirts', 'Shirts', 'Jeans', 'Trousers', 'Suits', 'Jackets', 'Sweaters', 'Shorts', 'Innerwear', 'Socks', 'Belts', 'Wallets', 'Sunglasses', 'Watches', 'Ties', 'Caps'] },
  { name: 'Fashion Women', slug: 'fashion-women', description: 'Women\'s clothing and accessories', subcategories: ['Dresses', 'Tops', 'Jeans', 'Skirts', 'Kurtas', 'Sarees', 'Leggings', 'Jackets', 'Handbags', 'Jewelry', 'Watches', 'Sunglasses', 'Scarves', 'Heels', 'Flats', 'Clutches'] },
  { name: 'Kids', slug: 'kids', description: 'Kids clothing, toys and essentials', subcategories: ['Boys Clothing', 'Girls Clothing', 'Baby Gear', 'School Supplies', 'Toys', 'Shoes', 'Backpacks', 'Accessories'] },
  { name: 'Shoes', slug: 'shoes', description: 'Footwear for everyone', subcategories: ['Running Shoes', 'Casual Shoes', 'Formal Shoes', 'Sports Shoes', 'Sandals', 'Slippers', 'Boots', 'Flip Flops'] },
  { name: 'Sports', slug: 'sports', description: 'Sports equipment and activewear', subcategories: ['Cricket', 'Football', 'Basketball', 'Tennis', 'Badminton', 'Swimming', 'Cycling', 'Yoga', 'Gym Equipment', 'Camping'] },
  { name: 'Beauty', slug: 'beauty', description: 'Beauty and personal care products', subcategories: ['Makeup', 'Skincare', 'Haircare', 'Fragrance', 'Bath & Body', 'Nail Care', 'Tools & Brushes', 'Beauty Appliances'] },
  { name: 'Home Decor', slug: 'home-decor', description: 'Home decoration and interior products', subcategories: ['Wall Art', 'Cushions', 'Curtains', 'Rugs', 'Lamps', 'Clocks', 'Vases', 'Candles', 'Frames', 'Plants'] },
  { name: 'Kitchen', slug: 'kitchen', description: 'Kitchen appliances and cookware', subcategories: ['Cookware', 'Utensils', 'Appliances', 'Storage', 'Bakeware', 'Barware', 'Coffee & Tea', 'Water Bottles'] },
  { name: 'Furniture', slug: 'furniture', description: 'Home and office furniture', subcategories: ['Sofas', 'Beds', 'Tables', 'Chairs', 'Wardrobes', 'Bookshelves', 'Desks', 'Cabinets', 'Mattresses', 'Storage'] },
  { name: 'Books', slug: 'books', description: 'Books across all genres', subcategories: ['Fiction', 'Non-Fiction', 'Academic', 'Children', 'Comics', 'Self-Help', 'Business', 'Science', 'History', 'Biography'] },
  { name: 'Toys', slug: 'toys', description: 'Toys and games for all ages', subcategories: ['Action Figures', 'Board Games', 'Puzzles', 'Dolls', 'Remote Control', 'Educational', 'Building Blocks', 'Outdoor Play'] },
  { name: 'Fitness', slug: 'fitness', description: 'Fitness equipment and supplements', subcategories: ['Gym Equipment', 'Weights', 'Yoga Mats', 'Resistance Bands', 'Protein', 'Vitamins', 'Fitness Trackers', 'Water Bottles'] },
  { name: 'Groceries', slug: 'groceries', description: 'Daily groceries and essentials', subcategories: ['Snacks', 'Beverages', 'Cooking Oil', 'Spices', 'Rice & Grains', 'Dairy', 'Bread & Bakery', 'Cleaning Supplies'] },
  { name: 'Pet Supplies', slug: 'pet-supplies', description: 'Pet food, toys and accessories', subcategories: ['Dog Food', 'Cat Food', 'Pet Toys', 'Pet Beds', 'Collars', 'Grooming', 'Bowls', 'Aquariums'] },
  { name: 'Automotive', slug: 'automotive', description: 'Car and bike accessories', subcategories: ['Car Care', 'Interior', 'Exterior', 'Lubricants', 'Tools', 'Helmets', 'Riding Gear', 'Bike Accessories'] },
  { name: 'Office Supplies', slug: 'office-supplies', description: 'Office and stationery products', subcategories: ['Notebooks', 'Pens', 'Printers', 'Paper', 'Folders', 'Desk Organizers', 'Staplers', 'Whiteboards'] },
];

const BRANDS: Record<string, string[]> = {
  'Phones': ['Samsung', 'Apple', 'OnePlus', 'Xiaomi', 'Google', 'Nothing', 'Realme', 'Vivo', 'Oppo', 'Motorola'],
  'Laptops': ['Apple', 'Dell', 'HP', 'Lenovo', 'ASUS', 'Acer', 'Microsoft', 'Samsung', 'MSI', 'Razer'],
  'Tablets': ['Apple', 'Samsung', 'Microsoft', 'Lenovo', 'Xiaomi', 'OnePlus', 'Huawei', 'Amazon'],
  'Monitors': ['Dell', 'ASUS', 'LG', 'Samsung', 'Apple', 'Gigabyte', 'Acer', 'BenQ'],
  'Keyboards': ['Logitech', 'Razer', 'Corsair', 'Keychron', 'Royal Kludge', 'Ducky', 'SteelSeries', 'HyperX'],
  'Mouse': ['Logitech', 'Razer', 'SteelSeries', 'Glorious', 'Corsair', 'ASUS', 'HyperX', 'Finalmouse'],
  'Gaming': ['Sony', 'Microsoft', 'Nintendo', 'ASUS', 'Valve', 'Razer', 'SteelSeries', 'HyperX'],
  'Cameras': ['Sony', 'Canon', 'Nikon', 'Fujifilm', 'DJI', 'GoPro', 'Panasonic', 'Leica'],
  'Earbuds': ['Apple', 'Samsung', 'Sony', 'Bose', 'JBL', 'Nothing', 'OnePlus', 'Google'],
  'Headphones': ['Sony', 'Bose', 'Sennheiser', 'Audio-Technica', 'JBL', 'Beats', 'Skullcandy', 'Marshall', 'AKG', 'Philips'],
  'Speakers': ['Apple', 'Sonos', 'JBL', 'Marshall', 'Bose', 'Ultimate Ears', 'Sony', 'Denon'],
  'Smart Watches': ['Apple', 'Samsung', 'Google', 'Garmin', 'OnePlus', 'Amazfit', 'Mobvoi', 'Suunto'],
  'Power Banks': ['Anker', 'UGREEN', 'Baseus', 'Xiaomi', 'Samsung', 'RAVPower', 'Belkin', 'Aukey'],
  'Chargers': ['Anker', 'UGREEN', 'Baseus', 'Samsung', 'Apple', 'Belkin', 'Spigen', 'RAVPower'],
  'SSD': ['Samsung', 'WD', 'Seagate', 'Crucial', 'SK Hynix', 'Sabrent', 'Corsair', 'SanDisk'],
  'Routers': ['TP-Link', 'Netgear', 'ASUS', 'Linksys', 'Ubiquiti', 'Google', 'Amazon', 'Eero'],
  'T-Shirts': ['Nike', 'Adidas', 'Puma', 'Under Armour', 'Levi\'s', 'H&M', 'Zara', 'USPA', 'Tommy Hilfiger', 'Calvin Klein'],
};

const PRODUCT_NAMES: Record<string, string[]> = {
  'Phones': ['Galaxy S25 Ultra', 'iPhone 17 Pro Max', 'OnePlus 13', 'Xiaomi 16 Pro', 'Pixel 10 Pro', 'Nothing Phone 3', 'Realme GT 7', 'Vivo X200 Pro', 'Oppo Find N5', 'Moto Edge 60'],
  'Laptops': ['MacBook Pro 16"', 'XPS 15', 'Spectre x360 16', 'ThinkPad X1 Carbon Gen 12', 'ZenBook Pro Duo', 'Predator Helios 18', 'Surface Laptop 7', 'Galaxy Book 4 Ultra', 'Stealth 18', 'Blade 18'],
  'Tablets': ['iPad Pro M4 13"', 'Galaxy Tab S10 Ultra', 'Surface Pro 11', 'Lenovo Tab P14', 'Xiaomi Pad 7 Pro', 'OnePlus Pad 3', 'Huawei MatePad Pro', 'Amazon Fire Max 15'],
  'Monitors': ['UltraSharp 49"', 'ROG Swift OLED PG49WCD', 'Predator X34 V2', 'ThinkVision P44w', 'Pro Display XDR 2', 'GigaByte M32U', 'Dell S2722QC', 'LG UltraGear 45"'],
  'Keyboards': ['MX Mechanical Mini', 'BlackWidow V4 Pro', 'K70 RGB Pro', 'Huntsman V3 Pro', 'RK Royal Kludge R75', 'Keychron Q6', 'Logitech G915', 'Corsair K100'],
  'Mouse': ['MX Master 4S', 'G502 X Plus', 'Viper V3 Pro', 'DeathAdder V3 Pro', 'Model O 2 Pro', 'Superlight 3', 'ROG Keris II', 'G Pro X Superlight 2'],
  'Gaming': ['PlayStation 6', 'Xbox Series Z', 'Nintendo Switch 3', 'ROG Ally X', 'Steam Deck OLED', 'PS VR3', 'Xbox Controller Pro', 'DualSense Edge 2'],
  'Cameras': ['Sony A1 II', 'Canon EOS R5 Mark II', 'Nikon Z9', 'Fujifilm GFX200', 'DJI Osmo Pocket 4', 'GoPro Hero 14', 'Sony ZV-E10 II', 'Panasonic Lumix S5IIX'],
  'Earbuds': ['AirPods Pro 3', 'Galaxy Buds 4 Pro', 'WF-1000XM6', 'QuietComfort Earbuds 3', 'JBL Tour Pro 3', 'Nothing Ear 4', 'OnePlus Buds Pro 4', 'Pixel Buds Pro 3'],
  'Headphones': ['WH-1000XM6', 'QuietComfort Ultra 2', 'Momentum 5', 'ATH-M50xBT3', 'Tour One M3', 'Studio Pro+', 'Crown ANC 3', 'H9i 4th Gen'],
  'Speakers': ['HomePod 3', 'Sonos Era 300', 'JBL Charge 6', 'Marshall Stanmore IV', 'Bose SoundLink Max', 'Ultimate Ears Hyperboom 2', 'Sony SRS-RA5000', 'Denon Home 350'],
  'Smart Watches': ['Apple Watch Ultra 3', 'Galaxy Watch 8 Pro', 'Pixel Watch 4', 'Garmin Fenix 9', 'TicWatch Pro 6', 'OnePlus Watch 3', 'Amazfit T-Rex 4', 'Suunto Vertical'],
  'Power Banks': ['Anker Prime 27650', 'UGREEN 25000', 'Baseus Blade 2', 'Mi 20000mAh Pro', 'Samsung 20000', 'RAVPower 26800', 'Belkin BoostCharge 20K', 'Aukey 30000'],
  'Chargers': ['Anker GaNPrime 200W', 'UGREEN Nexode 160W', 'Baseus 100W GaN', 'Samsung 65W Trio', 'Apple 140W USB-C', 'Belkin BoostCharge Pro', 'Spigen ArcStation Pro', 'RAVPower 90W'],
  'SSD': ['Samsung 990 Pro 4TB', 'WD Black SN850X 4TB', 'Seagate FireCuda 540', 'Crucial T700 4TB', 'SK Hynix Platinum P41', 'Sabrent Rocket 5', 'Corsair MP700 Pro', 'SanDisk Extreme Pro'],
  'Routers': ['TP-Link Deco BE95', 'Netgear Orbi 970', 'ASUS ROG Rapture GT-BE98', 'Eero Pro 7', 'Linksys Velop MX4300', 'Ubiquiti Dream Machine Pro', 'Google Nest WiFi Pro', 'AmpliFi Alien'],
};

const FIRST_NAMES = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Ananya', 'Diya', 'Myra', 'Sara', 'Aadhya', 'Riya', 'Priya', 'Kavya', 'Neha', 'Tanvi', 'Shruti', 'Pooja', 'Anjali', 'Nandini', 'Meera', 'Lakshmi'];
const LAST_NAMES = ['Sharma', 'Verma', 'Patel', 'Singh', 'Kumar', 'Gupta', 'Reddy', 'Nair', 'Menon', 'Joshi', 'Deshmukh', 'Pillai', 'Rao', 'Chopra', 'Malhotra', 'Saxena', 'Mehta', 'Agarwal', 'Mishra', 'Kapoor', 'Khanna', 'Bhatt', 'Trivedi', 'Srinivasan', 'Iyer', 'Das'];

const REVIEW_TITLES = [
  'Absolutely love it!', 'Best purchase ever', 'Great quality', 'Excellent product', 'Very satisfied',
  'Good value for money', 'Exceeded expectations', 'Highly recommended', 'Perfect!', 'Worth every penny',
  'Amazing quality', 'Better than expected', 'Solid product', 'Happy with my purchase', 'Five stars!',
  'Not bad for the price', 'Decent product overall', 'Good but could be better', 'Exactly what I needed',
  'Superb performance', 'Outstanding quality', 'Very impressed', 'Love this!', 'Great find', 'Must buy!',
];

const REVIEW_COMMENTS = [
  'Been using this for a month now and it has been fantastic. The quality is top notch and the build is solid. Would definitely recommend to anyone looking for a great product.',
  'Ordered this after reading reviews and I am not disappointed. Delivery was fast and the product was well packaged. Works exactly as described.',
  'I compared several options before choosing this one. Best decision I made. The features are exactly what I needed and the price was reasonable.',
  'My second purchase of this brand. Consistent quality and excellent customer service. Will be buying more from them.',
  'Got this as a gift for my friend and they absolutely loved it. The packaging was premium and the product itself is beautiful.',
  'Good product overall. There are some minor issues but nothing major. For the price point, this is a great deal.',
  'Upgraded from an older model and the difference is night and day. So many improvements. Very happy with this purchase.',
  'The product arrived earlier than expected. Setup was straightforward and it works perfectly. Very happy customer here.',
  'I was skeptical at first but this exceeded my expectations. The build quality is excellent and it looks premium.',
  'Perfect for my needs. Does exactly what it says on the tin. No complaints at all. Would buy again.',
];

interface ProductSpec {
  name: string;
  categorySlug: string;
  subcategory: string;
  brand: string;
  price: number;
  description: string;
  specs: Record<string, string>;
  features: string[];
  box: string[];
  material?: string;
  weight?: number;
  dimensions?: string;
  warranty?: string;
}

function generateProductsForSubcategory(subcategory: string, categorySlug: string): ProductSpec[] {
  const names = PRODUCT_NAMES[subcategory] || Array.from({ length: 10 }, (_, i) => `${subcategory} ${pick(['Premium', 'Classic', 'Elite', 'Pro', 'Ultra', 'Essential', 'Deluxe', 'Prime', 'Style', 'Luxe'])} Edition ${i + 1}`);
  const brands = BRANDS[subcategory] || ['Generic'];
  const products: ProductSpec[] = [];

  for (let i = 0; i < Math.min(names.length, 10); i++) {
    const basePrice = subcategory === 'Phones' ? randomFloat(19999, 159999) :
      subcategory === 'Laptops' ? randomFloat(39999, 299999) :
      subcategory === 'Headphones' ? randomFloat(1999, 34999) :
      subcategory === 'Earbuds' ? randomFloat(1499, 24999) :
      subcategory === 'Speakers' ? randomFloat(1999, 89999) :
      subcategory === 'Smart Watches' ? randomFloat(4999, 69999) :
      subcategory === 'Monitors' ? randomFloat(14999, 199999) :
      subcategory === 'Cameras' ? randomFloat(29999, 399999) :
      subcategory === 'Gaming' ? randomFloat(29999, 79999) :
      subcategory === 'Tablets' ? randomFloat(14999, 119999) :
      subcategory === 'Power Banks' ? randomFloat(999, 5999) :
      subcategory === 'Chargers' ? randomFloat(999, 7999) :
      subcategory === 'SSD' ? randomFloat(2999, 24999) :
      subcategory === 'Routers' ? randomFloat(2999, 39999) :
      subcategory === 'Keyboards' ? randomFloat(1499, 24999) :
      subcategory === 'Mouse' ? randomFloat(999, 14999) :
      subcategory === 'T-Shirts' || subcategory === 'Tops' ? randomFloat(399, 2999) :
      subcategory === 'Jeans' || subcategory === 'Trousers' ? randomFloat(999, 4999) :
      subcategory === 'Dresses' || subcategory === 'Kurtas' || subcategory === 'Sarees' ? randomFloat(999, 8999) :
      subcategory === 'Shoes' || subcategory === 'Running Shoes' || subcategory === 'Casual Shoes' ? randomFloat(1499, 12999) :
      subcategory === 'Handbags' ? randomFloat(999, 15999) :
      subcategory === 'Jewelry' ? randomFloat(499, 49999) :
      subcategory === 'Skincare' || subcategory === 'Makeup' ? randomFloat(199, 4999) :
      subcategory === 'Sofas' || subcategory === 'Beds' ? randomFloat(9999, 89999) :
      subcategory === 'Tables' || subcategory === 'Chairs' ? randomFloat(2999, 39999) :
      subcategory === 'Cookware' ? randomFloat(499, 9999) :
      subcategory === 'Books' || subcategory.startsWith('Book') ? randomFloat(199, 2999) :
      subcategory === 'Toys' || subcategory === 'Action Figures' || subcategory === 'Board Games' ? randomFloat(299, 5999) :
      subcategory === 'Protein' || subcategory === 'Vitamins' ? randomFloat(599, 4999) :
      subcategory === 'Gym Equipment' || subcategory === 'Weights' ? randomFloat(999, 29999) :
      subcategory === 'Dog Food' || subcategory === 'Cat Food' ? randomFloat(299, 4999) :
      subcategory === 'Car Care' ? randomFloat(199, 3999) :
      categorySlug === 'fashion-men' ? randomFloat(399, 7999) :
      categorySlug === 'fashion-women' ? randomFloat(399, 8999) :
      randomFloat(199, 9999);

    const discountPercent = randomInt(0, 50);
    const originalPrice = discountPercent > 0 ? parseFloat((basePrice / (1 - discountPercent / 100)).toFixed(0)) : basePrice;

    const specs: Record<string, string> = {};
    if (subcategory === 'Phones') {
      specs['Processor'] = pick(['Snapdragon 8 Gen 4', 'A19 Bionic', 'Dimensity 9400', 'Exynos 2600']);
      specs['RAM'] = pick(['8 GB', '12 GB', '16 GB', '24 GB']);
      specs['Storage'] = pick(['128 GB', '256 GB', '512 GB', '1 TB']);
      specs['Display'] = pick(['6.8" AMOLED 120Hz', '6.9" LTPO OLED 144Hz', '6.7" Dynamic AMOLED 2X', '6.82" Super AMOLED']);
      specs['Battery'] = pick(['5000 mAh', '5500 mAh', '6000 mAh', '4800 mAh']);
      specs['Charging'] = pick(['65W Fast Charging', '100W Turbo Charging', '45W Fast Charging', '80W Super Charging']);
      specs['OS'] = pick(['Android 16', 'iOS 20', 'Android 15', 'One UI 7']);
      specs['IP Rating'] = pick(['IP68', 'IP69', 'IP67']);
    } else if (subcategory === 'Laptops') {
      specs['Processor'] = pick(['M4 Max', 'Core Ultra 9 285HX', 'Ryzen AI 9 HX 370', 'Snapdragon X Elite']);
      specs['RAM'] = pick(['16 GB', '32 GB', '64 GB', '128 GB']);
      specs['Storage'] = pick(['512 GB SSD', '1 TB SSD', '2 TB SSD', '4 TB SSD']);
      specs['Display'] = pick(['16.2" Liquid Retina XDR', '16" OLED 4K 120Hz', '16" mini-LED 165Hz', '15.6" 4K OLED']);
      specs['Battery'] = pick(['100 Wh', '99 Wh', '97 Wh', '86 Wh']);
      specs['Weight'] = pick(['2.1 kg', '1.8 kg', '2.4 kg', '1.6 kg']);
      specs['OS'] = pick(['macOS 16', 'Windows 12 Pro', 'Windows 12 Home']);
    } else if (subcategory === 'Headphones' || subcategory === 'Earbuds') {
      specs['Driver'] = pick(['40mm Neodymium', '50mm Beryllium', '30mm Dynamic', '11mm Dynamic']);
      specs['Noise Cancellation'] = pick(['Adaptive ANC', 'Hybrid ANC', 'Active NC', 'Premium ANC']);
      specs['Battery Life'] = pick(['40 hours', '60 hours', '30 hours', '50 hours']);
      specs['Charging'] = pick(['USB-C Fast Charge', 'Wireless Charging', 'USB-C', 'MagSafe Charging']);
      specs['Codec'] = pick(['LDAC, AAC, SBC', 'AAC, SBC, aptX HD', 'LDAC, aptX Adaptive', 'AAC, SBC, aptX Lossless']);
    }

    const features = [
      `Premium ${subcategory.toLowerCase()} with cutting-edge technology`,
      `${pick(['1 year', '2 year', '3 year'])} manufacturer warranty`,
      `${pick(['Free', 'Express'])} delivery available`,
      `${pick(['Easy returns within 15 days', 'Easy returns within 30 days', 'No questions asked returns'])}`,
    ];

    const box = [
      `1x ${names[i]}`,
      `1x ${pick(['Charging Cable', 'USB-C Cable', 'Power Adapter', 'Charging Case'])}`,
      `1x ${pick(['User Manual', 'Quick Start Guide', 'Documentation Kit'])}`,
      pick(['1x SIM Ejector Tool', '1x Warranty Card', '1x Carrying Case', '1x Cleaning Cloth']),
    ];

    products.push({
      name: names[i],
      categorySlug,
      subcategory,
      brand: brands[i % brands.length],
      price: basePrice,
      description: pick([
        `The ${names[i]} delivers exceptional ${subcategory.toLowerCase()} performance with cutting-edge technology and premium design. Perfect for everyday use.`,
        `Elevate your experience with the ${names[i]}. Featuring top-tier specs, stunning build quality, and intelligent features tailored for modern lifestyles.`,
        `${names[i]} combines style, power, and reliability in one complete package. Engineered to exceed expectations and built to last.`,
        `Discover the ${names[i]} — where innovation meets craftsmanship. Packed with advanced features and designed for maximum comfort and usability.`,
        `Uncompromising quality meets thoughtful design in the ${names[i]}. Every detail crafted to deliver the best ${subcategory.toLowerCase()} experience.`,
      ]),
      specs,
      features,
      box,
    });
  }

  return products;
}

const REVIEWER_AVATARS = [
  'https://i.pravatar.cc/150?u=1', 'https://i.pravatar.cc/150?u=2', 'https://i.pravatar.cc/150?u=3',
  'https://i.pravatar.cc/150?u=4', 'https://i.pravatar.cc/150?u=5', 'https://i.pravatar.cc/150?u=6',
  'https://i.pravatar.cc/150?u=7', 'https://i.pravatar.cc/150?u=8', 'https://i.pravatar.cc/150?u=9',
  'https://i.pravatar.cc/150?u=10', 'https://i.pravatar.cc/150?u=11', 'https://i.pravatar.cc/150?u=12',
  'https://i.pravatar.cc/150?u=13', 'https://i.pravatar.cc/150?u=14', 'https://i.pravatar.cc/150?u=15',
  'https://i.pravatar.cc/150?u=16', 'https://i.pravatar.cc/150?u=17', 'https://i.pravatar.cc/150?u=18',
  'https://i.pravatar.cc/150?u=19', 'https://i.pravatar.cc/150?u=20',
];



async function main() {
  console.log('🌱 Seeding comprehensive product database...');
  const hashedPassword = await bcrypt.hash('Admin@123', 12);

  // Create Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@commerceflow.dev' },
    update: {},
    create: { email: 'admin@commerceflow.dev', password: hashedPassword, firstName: 'Admin', lastName: 'User', role: 'ADMIN', isEmailVerified: true, avatar: REVIEWER_AVATARS[0] },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: { email: 'customer@example.com', password: hashedPassword, firstName: 'John', lastName: 'Doe', role: 'CUSTOMER', isEmailVerified: true, avatar: REVIEWER_AVATARS[1] },
  });

  const seller = await prisma.user.upsert({
    where: { email: 'seller@example.com' },
    update: {},
    create: { email: 'seller@example.com', password: hashedPassword, firstName: 'Jane', lastName: 'Baker', role: 'SELLER', isEmailVerified: true, avatar: REVIEWER_AVATARS[2] },
  });

  const deliveryBoy = await prisma.user.upsert({
    where: { email: 'delivery@example.com' },
    update: {},
    create: { email: 'delivery@example.com', password: hashedPassword, firstName: 'Mike', lastName: 'Rider', role: 'DELIVERY_BOY', isEmailVerified: true, avatar: REVIEWER_AVATARS[3] },
  });

  // Create more reviewer users
  const reviewerUsers = await Promise.all(
    FIRST_NAMES.slice(0, 20).map((first, i) =>
      prisma.user.upsert({
        where: { email: `reviewer${i}@example.com` },
        update: {},
      create: {
        email: `reviewer${i}@example.com`, password: hashedPassword,
        firstName: first, lastName: LAST_NAMES[i], role: 'CUSTOMER',
          isEmailVerified: true, avatar: REVIEWER_AVATARS[i],
        },
      })
    )
  );

  // Create Categories and Subcategories
  const categoryMap = new Map<string, string>();
  const subcategoryMap = new Map<string, string>();

  for (const cat of CATEGORIES) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { name: cat.name, slug: cat.slug, description: cat.description },
    });
    categoryMap.set(cat.slug, created.id);

    for (const sub of cat.subcategories) {
      const subSlug = slugify(sub);
      const existing = await prisma.category.findUnique({ where: { slug: subSlug } });
      if (!existing) {
        const subCat = await prisma.category.create({
          data: { name: sub, slug: subSlug, description: `${sub} products`, parentId: created.id },
        });
        subcategoryMap.set(subSlug, subCat.id);
      } else {
        await prisma.category.update({ where: { id: existing.id }, data: { parentId: created.id } });
        subcategoryMap.set(subSlug, existing.id);
      }
    }
  }

  // Generate all products
  const allProducts: Array<{
    productData: ProductSpec;
    images: { url: string; alt: string; order: number }[];
    categorySlug: string;
    subcategorySlug: string;
  }> = [];

  for (const cat of CATEGORIES) {
    for (const sub of cat.subcategories) {
      const subSlug = slugify(sub);
      const products = generateProductsForSubcategory(sub, cat.slug);

      for (let i = 0; i < products.length && allProducts.length < 120; i++) {
        const p = products[i];
        const imgs = getProductImages(
          { name: p.name, brand: p.brand, categorySlug: cat.slug, subcategory: sub },
          allProducts.length
        );

        allProducts.push({
          productData: p,
          images: imgs,
          categorySlug: cat.slug,
          subcategorySlug: subSlug,
        });
      }
    }
  }

  console.log(`Generating ${allProducts.length} products...`);

  let productIndex = 0;
  for (const item of allProducts) {
    const p = item.productData;
    const subCatId = subcategoryMap.get(item.subcategorySlug) || categoryMap.get(item.categorySlug)!;
    const categoryId = categoryMap.get(item.categorySlug)!;
    const uniqueId = `${productIndex}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const slug = slugify(p.name + '-' + p.brand + '-' + uniqueId);
    const sku = `${p.brand.substring(0, 3).toUpperCase()}-${String(productIndex + 1000).padStart(5, '0')}-${Math.random().toString(36).substring(2, 6)}`;
    const discountPercent = randomInt(5, 50);
    const originalPrice = parseFloat((p.price / (1 - discountPercent / 100)).toFixed(0));
    const stock = randomInt(10, 500);
    const soldCount = randomInt(100, 50000);
    const reviewCount = randomInt(50, 2500);
    const trendingScore = randomFloat(1, 100);
    const avgRating = randomFloat(3.5, 5.0);
    const isFeatured = productIndex < 20 || Math.random() > 0.8;
    const isBestSeller = soldCount > 5000 && Math.random() > 0.5;
    const isTopRated = avgRating > 4.5;
    const isNewArrival = productIndex < 30;

    const product = await prisma.product.create({
      data: {
        name: p.name,
        slug,
        description: p.description,
        longDescription: p.description + ' ' + pick([
          `Backed by ${p.warranty || 'comprehensive warranty'} and reliable customer support. Buy with confidence from ${p.sellerName || 'trusted sellers'} with easy returns and fast delivery across India.`,
          `Sourced from premium materials and manufactured to the highest standards. Includes ${pick(['free installation', 'setup guide', 'complimentary accessories', 'exclusive online support'])}. Order now for ${p.deliveryEstimate || 'fast delivery'} delivery.`,
          `${p.features?.slice(0, 3)?.join(', ') || 'Top-rated features'}. Covered by ${p.returnPolicy || 'hassle-free returns'}. Shop with peace of mind on CommerceFlow.`,
        ]),
        basePrice: Math.round(p.price * 100),
        originalPrice: Math.round(originalPrice * 100),
        discountPercent,
        brand: p.brand,
        sku,
        barcode: String(randomInt(100000000000, 999999999999)),
        categoryId: subCatId,
        weight: randomFloat(0.2, 5.0),
        dimensions: `${randomInt(10, 50)} x ${randomInt(10, 50)} x ${randomInt(2, 20)} cm`,
        material: p.material || pick(['Aluminum', 'Plastic', 'Stainless Steel', 'Glass', 'Leather', 'Cotton', 'Polyester', 'Wood']),
        warranty: p.warranty || pick(['1 Year Manufacturer Warranty', '2 Year International Warranty', '3 Year Extended Warranty', '1 Year Limited Warranty']),
        countryOfOrigin: pick(['China', 'India', 'USA', 'Japan', 'South Korea', 'Germany', 'Taiwan', 'Vietnam']),
        sellerName: pick(['Reliance Digital', 'Croma', 'Tata CLiQ', 'Flipkart Seller', 'Amazon India', 'Vijay Sales', 'Poorvika Mobiles', 'Bajaj Electronics']),
        returnPolicy: pick(['15 Days Easy Return', '30 Days Return Policy', '7 Days Replacement', 'No Questions Asked Returns within 15 Days']),
        deliveryEstimate: pick(['2-3 Business Days', '3-5 Business Days', 'Express 24 Hours', '1-2 Business Days', '4-6 Business Days']),
        gstPercent: pick([5, 12, 18, 28]),
        cashOnDelivery: Math.random() > 0.3,
        emiAvailable: Math.random() > 0.4,
        freeDelivery: Math.random() > 0.3,
        specifications: JSON.stringify(p.specs),
        keyFeatures: JSON.stringify(p.features),
        whatsInTheBox: JSON.stringify(p.box),
        tags: JSON.stringify([p.subcategory, p.brand, item.categorySlug, ...(isFeatured ? ['featured'] : []), ...(isBestSeller ? ['best-seller'] : []), ...(isNewArrival ? ['new-arrival'] : [])]),
        videoUrl: Math.random() > 0.8 ? `https://www.youtube.com/watch?v=example${productIndex}` : null,
        isFeatured,
        isNewArrival,
        isBestSeller,
        isTopRated,
        soldCount,
        wishlistCount: randomInt(100, 10000),
        questionsCount: randomInt(5, 200),
        trendingScore,
        seoMetaTitle: `${p.name} - ${p.brand} ${p.subcategory} | CommerceFlow`,
        seoDescription: `Buy ${p.name} by ${p.brand} at best price. ${p.description.substring(0, 100)}`,
        seoKeywords: `${p.name}, ${p.brand}, ${p.subcategory}, buy online, best price, ${item.categorySlug}`,
        images: {
          create: item.images,
        },
        inventory: { create: { stock, reservedStock: randomInt(0, 10), lowStockThreshold: 5 } },
      },
    });

    // Create reviews for the product (unique reviewers per product)
    const numReviews = randomInt(5, 15);
    const usedReviewers = new Set<string>();
    for (let r = 0; r < numReviews; r++) {
      let reviewer;
      let attempts = 0;
      do {
        reviewer = reviewerUsers[randomInt(0, reviewerUsers.length - 1)];
        attempts++;
      } while (usedReviewers.has(reviewer.id) && attempts < 20);
      if (usedReviewers.has(reviewer.id)) continue;
      usedReviewers.add(reviewer.id);
      
      const rating = Math.min(5, Math.max(1, Math.round(avgRating + randomFloat(-1, 1))));
      await prisma.review.create({
        data: {
          userId: reviewer.id,
          productId: product.id,
          rating,
          title: pick(REVIEW_TITLES),
          comment: pick(REVIEW_COMMENTS),
          isVerified: Math.random() > 0.3,
          helpfulCount: randomInt(0, 50),
          createdAt: new Date(Date.now() - randomInt(1, 365) * 24 * 60 * 60 * 1000),
        },
      });
    }

    productIndex++;
    if (productIndex % 20 === 0) {
      console.log(`Created ${productIndex} products with reviews...`);
    }
  }

  // Create Coupon
  await prisma.coupon.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10', description: '10% off your first order',
      discountType: 'PERCENTAGE', discountValue: 10, maxDiscount: 5000,
      usageLimit: 100, expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.coupon.upsert({
    where: { code: 'SAVE50' },
    update: {},
    create: {
      code: 'SAVE50', description: 'Flat ₹50 off on orders above ₹999',
      discountType: 'FLAT', discountValue: 5000, minOrderAmount: 99900, maxDiscount: 5000,
      usageLimit: 200, expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.coupon.upsert({
    where: { code: 'FREEDEL' },
    update: {},
    create: {
      code: 'FREEDEL', description: 'Free delivery on your next order',
      discountType: 'FLAT', discountValue: 5000, minOrderAmount: 49900,
      usageLimit: 500, expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    },
  });

  console.log(`\n✅ Seed completed successfully!`);
  console.log(`📦 Total products: ${productIndex}`);
  console.log(`📁 Categories: ${CATEGORIES.length} parent categories, ${CATEGORIES.reduce((s, c) => s + c.subcategories.length, 0)} subcategories`);
  console.log(`👤 Admin: admin@commerceflow.dev / Admin@123`);
  console.log(`👤 Customer: customer@example.com / Admin@123`);
  console.log(`👤 Seller: seller@example.com / Admin@123`);
  console.log(`👤 Delivery Boy: delivery@example.com / Admin@123`);
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
