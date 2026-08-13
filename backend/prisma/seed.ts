import 'dotenv/config';
import { createRequire } from 'module';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import { USER_CATALOG } from './user-catalog';

const _require = createRequire(import.meta.url);
const { PrismaClient } = _require('@prisma/client') as typeof import('@prisma/client');

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL environment variable is required to run the seed');
  process.exit(1);
}

const isLocal = databaseUrl.includes('127.0.0.1') || databaseUrl.includes('localhost') || process.env.DATABASE_SSL === 'false';
const seedPool = new Pool({
  connectionString: databaseUrl,
  ssl: isLocal ? false : { rejectUnauthorized: false },
});

const prisma: any = new PrismaClient({ adapter: new PrismaPg(seedPool) } as any);

function slugify(text: string) {
  return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
}

function randomInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randomFloat(min: number, max: number, decimals = 2) { return parseFloat((Math.random() * (max - min) + min).toFixed(decimals)); }
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function pickMany<T>(arr: T[], count: number): T[] {
  const pool = [...arr];
  const out: T[] = [];
  while (out.length < count && pool.length > 0) {
    out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  }
  return out;
}

const FIRST_NAMES = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Ananya', 'Diya', 'Myra', 'Sara', 'Aadhya', 'Riya', 'Priya', 'Kavya', 'Neha', 'Tanvi', 'Shruti', 'Pooja', 'Anjali', 'Nandini', 'Meera', 'Lakshmi'];
const LAST_NAMES = ['Sharma', 'Verma', 'Patel', 'Singh', 'Kumar', 'Gupta', 'Reddy', 'Nair', 'Menon', 'Joshi', 'Deshmukh', 'Pillai', 'Rao', 'Chopra', 'Malhotra', 'Saxena', 'Mehta', 'Agarwal', 'Mishra', 'Kapoor', 'Khanna', 'Bhatt', 'Trivedi', 'Srinivasan', 'Iyer', 'Das'];

const MATERIALS = ['Aluminium', 'Plastic', 'Stainless Steel', 'Carbon Fiber', 'Cotton', 'Leather', 'Wood', 'Glass', 'Ceramic', 'Silicone'];
const WARRANTIES = ['1 Year Manufacturer Warranty', '2 Year Comprehensive Warranty', '6 Months Limited Warranty', '3 Year Brand Warranty'];
const ORIGINS = ['India', 'United States', 'Germany', 'Japan', 'South Korea', 'Vietnam', 'Taiwan'];
const SELLERS = ['CommerceFlow Official', 'CloudTail India', 'RetailNet', 'OmniTech Logistics', 'Prime Retailers'];
const RETURN_POLICIES = ['7-Day Replacement Guarantee', '10-Day Return Policy', '30-Day Hassle-Free Returns', '14-Day Return Window'];
const DELIVERY_ESTIMATES = ['Same Day', '1-2 Business Days', '2-4 Days', 'Express 24hr'];
const GST = [5, 12, 18, 28];

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

// ─── Catalog-driven detail derivation ─────────────────────────────────────────
// Brand inference: ordered keyword hints (first match wins).
const BRAND_HINTS: Array<[string, string]> = [
  ['galaxy', 'Samsung'], ['samsung', 'Samsung'], ['iphone', 'Apple'], ['apple', 'Apple'],
  ['oneplus', 'OnePlus'], ['xiaomi', 'Xiaomi'], ['mi 20', 'Xiaomi'], ['pixel', 'Google'], ['google', 'Google'],
  ['nothing', 'Nothing'], ['realme', 'Realme'], ['vivo', 'Vivo'], ['oppo', 'Oppo'], ['moto', 'Motorola'],
  ['macbook', 'Apple'], ['ipad', 'Apple'], ['airpods', 'Apple'], ['homepod', 'Apple'],
  ['xps', 'Dell'], ['dell', 'Dell'], ['ultrasharp', 'Dell'],
  ['spectre', 'HP'], ['omen', 'HP'],
  ['thinkpad', 'Lenovo'], ['lenovo', 'Lenovo'], ['thinkvision', 'Lenovo'],
  ['zenbook', 'ASUS'], ['rog', 'ASUS'], ['asus', 'ASUS'],
  ['predator', 'Acer'], ['acer', 'Acer'],
  ['surface', 'Microsoft'], ['microsoft', 'Microsoft'], ['xbox', 'Microsoft'],
  ['lg', 'LG'], ['ultragear', 'LG'],
  ['logitech', 'Logitech'], ['mx master', 'Logitech'], ['mx mechanical', 'Logitech'], ['g915', 'Logitech'], ['g502', 'Logitech'], ['superlight', 'Logitech'], ['g pro x', 'Logitech'],
  ['razer', 'Razer'], ['blackwidow', 'Razer'], ['huntsman', 'Razer'], ['viper v3', 'Razer'], ['deathadder', 'Razer'],
  ['corsair', 'Corsair'], ['k70', 'Corsair'], ['k100', 'Corsair'],
  ['royal kludge', 'Royal Kludge'], ['keychron', 'Keychron'],
  ['glorious', 'Glorious'], ['model o', 'Glorious'],
  ['sony', 'Sony'], ['playstation', 'Sony'], ['ps vr', 'Sony'], ['dualsense', 'Sony'],
  ['nintendo', 'Nintendo'],
  ['canon', 'Canon'], ['nikon', 'Nikon'], ['fujifilm', 'Fujifilm'], ['osmo', 'DJI'], ['gopro', 'GoPro'],
  ['bose', 'Bose'], ['sennheiser', 'Sennheiser'], ['audio-technica', 'Audio-Technica'], ['jbl', 'JBL'],
  ['beats', 'Beats'], ['marshall', 'Marshall'], ['sonos', 'Sonos'],
  ['garmin', 'Garmin'], ['amazfit', 'Amazfit'], ['fenix', 'Garmin'],
  ['anker', 'Anker'], ['ugreen', 'UGREEN'], ['baseus', 'Baseus'],
  ['wd black', 'WD'], ['seagate', 'Seagate'], ['crucial', 'Crucial'], ['sabrent', 'Sabrent'], ['sandisk', 'SanDisk'],
  ['tp-link', 'TP-Link'], ['netgear', 'Netgear'], ['eero', 'Eero'],
  ['nike', 'Nike'], ['adidas', 'Adidas'], ['puma', 'Puma'], ["levi's", "Levi's"], ['levis', "Levi's"],
  ['uspa', 'USPA'], ['tommy hilfiger', 'Tommy Hilfiger'], ['calvin klein', 'Calvin Klein'],
];

const CATEGORY_DEFAULT_BRAND: Record<string, string> = {
  electronics: 'Samsung',
  'fashion-men': "Levi's",
  'fashion-women': 'Zara',
  'shoes-footwear': 'Nike',
  'home-kitchen-furniture': 'Godrej',
  'sports-fitness-beauty': 'Decathlon',
  'office-toys-groceries-automotive': 'Generic',
};

// Price inference: ordered [keyword, min, max] rules (first match wins).
const PRICE_RULES: Array<[string, number, number]> = [
  ['mirrorless', 29999, 399999], ['eos', 29999, 399999], ['nikon', 29999, 399999], ['gopro', 14999, 79999],
  ['galaxy', 19999, 159999], ['iphone', 59999, 169999], ['oneplus', 34999, 99999], ['pixel', 29999, 109999],
  ['nothing', 19999, 44999], ['realme', 12999, 45999], ['vivo', 19999, 89999], ['oppo', 14999, 99999], ['moto', 12999, 49999],
  ['macbook', 109999, 349999], ['xps', 99999, 249999], ['spectre', 89999, 219999], ['thinkpad', 84999, 259999],
  ['zenbook', 64999, 219999], ['predator', 99999, 299999], ['surface laptop', 79999, 199999], ['galaxy book', 74999, 189999],
  ['ipad', 49999, 169999], ['galaxy tab', 39999, 129999], ['surface pro', 69999, 159999],
  ['ultrasharp', 39999, 149999], ['swift oled', 49999, 199999], ['predator x34', 39999, 119999],
  ['thinkvision', 29999, 99999], ['pro display', 49999, 199999], ['s2722qc', 24999, 49999], ['ultragear', 29999, 89999],
  ['keyboard', 1499, 24999], ['blackwidow', 5999, 19999], ['k70', 7999, 19999], ['huntsman', 8999, 22999],
  ['royal kludge', 2499, 9999], ['keychron', 3499, 14999], ['g915', 12999, 19999], ['k100', 12999, 21999], ['apex pro', 9999, 19999],
  ['mouse', 999, 14999], ['g502', 2999, 8999], ['viper v3', 3999, 9999], ['deathadder', 2999, 8999],
  ['model o', 2499, 6999], ['superlight', 6999, 12999],
  ['playstation', 39999, 79999], ['xbox', 39999, 74999], ['nintendo', 19999, 44999], ['steam deck', 29999, 59999],
  ['rog ally', 39999, 74999], ['ps vr', 49999, 89999], ['dualsense', 3999, 9999],
  ['airpods', 12999, 29999], ['buds', 9999, 24999], ['wf-1000', 19999, 34999], ['tour pro', 15999, 24999], ['nothing ear', 9999, 19999],
  ['headphones', 1999, 34999], ['wh-1000', 24999, 39999], ['quietcomfort', 19999, 39999], ['momentum', 19999, 44999],
  ['ath-m50', 9999, 24999], ['tour one', 14999, 29999], ['studio pro', 19999, 34999],
  ['homepod', 29999, 59999], ['sonos', 24999, 69999], ['jbl charge', 9999, 19999], ['marshall', 19999, 44999], ['soundlink', 19999, 34999],
  ['watch ultra', 54999, 89999], ['galaxy watch', 14999, 49999], ['pixel watch', 19999, 39999], ['garmin', 24999, 89999],
  ['amazfit', 6999, 24999],
  ['mah', 999, 5999], ['power bank', 999, 5999],
  ['charger', 999, 7999], ['ganprime', 3999, 9999], ['nexode', 2999, 8999], ['gaN', 1999, 7999],
  ['ssd', 2999, 24999], ['nvme', 4999, 29999], ['990 pro', 11999, 34999], ['sn850', 9999, 29999],
  ['firecuda', 8999, 29999], ['t700', 12999, 34999], ['rocket', 8999, 29999],
  ['router', 2999, 39999], ['deco', 14999, 39999], ['orbi', 19999, 49999], ['raptor', 29999, 59999],
  ['eero', 9999, 29999], ['nest wifi', 9999, 29999],
  ['sofa', 9999, 89999], ['bed', 9999, 89999],
  ['table', 2999, 39999], ['chair', 2999, 39999], ['bookshelf', 1999, 19999], ['shelf', 999, 9999],
  ['wall art', 499, 9999], ['cushion', 299, 2999], ['curtain', 499, 4999], ['rug', 999, 9999], ['lamp', 499, 7999],
  ['cookware', 999, 9999], ['knife', 999, 8999], ['pressure cooker', 999, 5999], ['french press', 499, 2999],
  ['cricket bat', 1499, 9999], ['football', 499, 2999], ['badminton', 499, 2999], ['tennis', 999, 4999],
  ['yoga mat', 299, 1999], ['dumbbell', 1499, 14999], ['kettlebell', 999, 7999], ['bands', 299, 1499],
  ['protein', 599, 4999], ['creatine', 599, 2999],
  ['lipstick', 199, 1499], ['foundation', 299, 1999], ['mascara', 199, 1499], ['eyeshadow', 399, 1999],
  ['serum', 299, 2499], ['moisturizer', 199, 1499], ['sunscreen', 199, 1499], ['face wash', 199, 999],
  ['shampoo', 199, 1499], ['hair', 299, 1999], ['perfume', 799, 4999], ['cologne', 499, 3999], ['eau de', 499, 3999],
  ['notebook', 199, 1499], ['pens', 199, 999], ['printer', 4999, 24999], ['whiteboard', 999, 4999],
  ['blocks', 299, 1999], ['off-road car', 999, 4999], ['jigsaw', 199, 999],
  ['helmet', 1499, 14999], ['riding jacket', 2999, 19999], ['engine oil', 499, 2499], ['pressure washer', 2999, 19999],
  // Clothing & footwear fallbacks
  ['t-shirt', 399, 2999], ['tee', 399, 1999], ['polo', 599, 2499], ['shirt', 499, 3499], ['blouse', 599, 2999], ['top', 399, 2999],
  ['jeans', 999, 4999], ['chino', 999, 3999], ['trousers', 999, 3999], ['pants', 899, 3499],
  ['dress', 999, 8999], ['saree', 1499, 9999], ['kurta', 799, 5999], ['kurti', 699, 4999], ['skirt', 699, 4499],
  ['leggings', 399, 1999], ['coat', 1999, 14999], ['jacket', 1499, 11999], ['hoodie', 899, 4999], ['sweater', 899, 4499],
  ['suit', 3999, 24999], ['blazer', 2499, 14999],
  ['belt', 299, 1999], ['wallet', 299, 2999], ['sunglasses', 399, 5999], ['watch', 999, 49999], ['tie', 199, 1499], ['cap', 199, 1499],
  ['running shoes', 1499, 12999], ['sneakers', 1499, 9999], ['shoes', 1499, 12999], ['sandals', 699, 3999],
  ['slippers', 299, 1999], ['boots', 1999, 14999], ['heels', 999, 7999], ['loafers', 1499, 9999], ['oxford', 1999, 8999],
  ['handbag', 999, 15999], ['clutch', 999, 7999], ['tote', 699, 5999], ['necklace', 499, 14999],
  ['earrings', 299, 9999], ['bracelet', 299, 7999],
];

const CATEGORY_DEFAULT_PRICE: Record<string, [number, number]> = {
  electronics: [999, 19999],
  'fashion-men': [399, 4999],
  'fashion-women': [399, 8999],
  'shoes-footwear': [999, 9999],
  'home-kitchen-furniture': [499, 19999],
  'sports-fitness-beauty': [199, 9999],
  'office-toys-groceries-automotive': [199, 9999],
};

// Spec builders: keyword group → spec pool. Pick one value per key.
const SPEC_BUILDERS: Array<[string[], Record<string, string[]>]> = [
  [['galaxy', 'iphone', 'oneplus', 'xiaomi', 'pixel', 'nothing', 'realme', 'vivo', 'oppo', 'moto', 'phone'], {
    'Processor': ['Snapdragon 8 Gen 4', 'A19 Bionic', 'Dimensity 9400', 'Exynos 2600'],
    'RAM': ['8 GB', '12 GB', '16 GB', '24 GB'],
    'Storage': ['128 GB', '256 GB', '512 GB', '1 TB'],
    'Display': ['6.8" AMOLED 120Hz', '6.9" LTPO OLED 144Hz', '6.7" Dynamic AMOLED 2X', '6.82" Super AMOLED'],
    'Battery': ['5000 mAh', '5500 mAh', '6000 mAh', '4800 mAh'],
    'Charging': ['65W Fast Charging', '100W Turbo Charging', '45W Fast Charging', '80W Super Charging'],
    'OS': ['Android 16', 'iOS 20', 'Android 15', 'One UI 7'],
    'IP Rating': ['IP68', 'IP69', 'IP67'],
  }],
  [['macbook', 'xps', 'spectre', 'thinkpad', 'zenbook', 'predator', 'surface laptop', 'galaxy book', 'laptop'], {
    'Processor': ['M4 Max', 'Core Ultra 9 285HX', 'Ryzen AI 9 HX 370', 'Snapdragon X Elite'],
    'RAM': ['16 GB', '32 GB', '64 GB', '128 GB'],
    'Storage': ['512 GB SSD', '1 TB SSD', '2 TB SSD', '4 TB SSD'],
    'Display': ['16.2" Liquid Retina XDR', '16" OLED 4K 120Hz', '16" mini-LED 165Hz', '15.6" 4K OLED'],
    'Battery': ['100 Wh', '99 Wh', '97 Wh', '86 Wh'],
    'Weight': ['2.1 kg', '1.8 kg', '2.4 kg', '1.6 kg'],
    'OS': ['macOS 16', 'Windows 12 Pro', 'Windows 12 Home'],
  }],
  [['ipad', 'galaxy tab', 'surface pro', 'tab p14', 'xiaomi pad', 'oneplus pad', 'tablet'], {
    'Processor': ['Apple M4', 'Snapdragon 8 Gen 4', 'Dimensity 9300', 'Exynos 2400'],
    'RAM': ['8 GB', '12 GB', '16 GB'],
    'Storage': ['128 GB', '256 GB', '512 GB', '1 TB'],
    'Display': ['13" 120Hz OLED', '12.4" AMOLED', '11" IPS 144Hz', '12.9" mini-LED'],
    'Battery': ['10000 mAh', '12000 mAh', '9800 mAh'],
    'Weight': ['579 g', '612 g', '648 g'],
  }],
  [['ultrasharp', 'swift oled', 'predator x34', 'thinkvision', 'pro display', 's2722qc', 'ultragear', 'monitor'], {
    'Panel': ['IPS', 'OLED', 'Mini-LED', 'VA'],
    'Resolution': ['4K UHD', '2K QHD', '5K2K', '1080p FHD'],
    'Refresh Rate': ['144Hz', '165Hz', '240Hz', '60Hz'],
    'Response Time': ['1ms', '0.03ms', '0.5ms', '4ms'],
    'HDR': ['HDR10', 'HDR600', 'Dolby Vision', 'HDR10+'],
  }],
  [['keyboard', 'blackwidow', 'k70', 'huntsman', 'royal kludge', 'keychron', 'g915', 'k100', 'apex pro', 'alloy'], {
    'Switch Type': ['Mechanical Red', 'Tactile Brown', 'Optical Linear', 'Magnetic Hall Effect'],
    'Connectivity': ['USB-C Wired', '2.4GHz Wireless', 'Bluetooth + Wired', 'Tri-Mode'],
    'Layout': ['Full Size', 'Tenkeyless', '75%', '65%'],
    'Backlight': ['RGB Per-Key', 'White LED', 'Razer Chroma RGB', 'Corsair iCUE RGB'],
  }],
  [['mouse', 'g502', 'viper v3', 'deathadder', 'model o', 'superlight', 'g pro x', 'aerox'], {
    'DPI': ['16000', '26000', '30000', '32000'],
    'Sensor': ['HERO 2', 'Focus Pro 26K', 'HYPERSMART', 'BAMF 2.0'],
    'Connectivity': ['USB Wireless', '2.4GHz + Bluetooth', 'Wired USB-C', 'Tri-Mode'],
    'Weight': ['63 g', '58 g', '70 g', '74 g'],
  }],
  [['playstation', 'xbox', 'nintendo', 'steam deck', 'rog ally', 'ps vr', 'dualsense', 'gaming'], {
    'Console': ['Next-Gen', 'Handheld', 'Hybrid', 'VR Ready'],
    'Resolution': ['4K 120FPS', '8K Upscaled', '1080p 144Hz'],
    'Storage': ['1 TB', '2 TB', '512 GB'],
    'Connectivity': ['Wi-Fi 7', 'Wi-Fi 6E', 'Bluetooth 5.4'],
  }],
  [['mirrorless', 'eos', 'nikon', 'gopro', 'osmo', 'zv-e10', 'lumix', 'leica', 'camera', 'cinema'], {
    'Sensor': ['Full-Frame 61MP', 'APS-C 26MP', 'Full-Frame 45MP', '1" 20MP'],
    'Video': ['8K 30p', '4K 120p', '4K 60p', '5.7K 360'],
    'Autofocus': ['Dual Pixel AF', 'Hybrid AF', 'AI Tracking AF'],
    'Stabilization': ['5-Axis IBIS', 'Sensor Shift', 'Electronic'],
  }],
  [['airpods', 'buds', 'wf-1000', 'tour pro', 'nothing ear', 'earbud'], {
    'Driver': ['11mm Dynamic', '10mm Graphene', 'Dual Driver', '8mm Titanium'],
    'ANC': ['Adaptive ANC', 'Hybrid ANC', 'Active Noise Cancelling', 'Dual-Device ANC'],
    'Battery Life': ['6+18 hours', '8+24 hours', '10+30 hours'],
    'Rating': ['IPX4', 'IP55', 'IP68', 'IPX5'],
  }],
  [['headphones', 'wh-1000', 'quietcomfort', 'momentum', 'ath-m50', 'tour one', 'studio pro', 'skullcandy', 'marshall', 'akg'], {
    'Driver': ['40mm Neodymium', '50mm Beryllium', '30mm Dynamic', '11mm Dynamic'],
    'Noise Cancellation': ['Adaptive ANC', 'Hybrid ANC', 'Active NC', 'Premium ANC'],
    'Battery Life': ['40 hours', '60 hours', '30 hours', '50 hours'],
    'Charging': ['USB-C Fast Charge', 'Wireless Charging', 'USB-C', 'MagSafe Charging'],
  }],
  [['homepod', 'sonos', 'jbl charge', 'marshall', 'soundlink', 'speaker', 'echo'], {
    'Driver': ['Full-Range Woofer', 'Dual Tweeter', 'Bass Radiator', 'Coaxial Array'],
    'Connectivity': ['Wi-Fi + Bluetooth', 'Bluetooth 5.4', 'AirPlay 2', 'Multi-Room'],
    'Battery': ['12 hours', '20 hours', '24 hours', 'AC Powered'],
    'Water Resistance': ['IP67', 'IPX4', 'None'],
  }],
  [['watch ultra', 'galaxy watch', 'pixel watch', 'garmin', 'amazfit', 'fenix', 'fitbit'], {
    'Display': ['LTPO OLED Always-On', 'AMOLED 2K', 'MIP Solar', 'Super AMOLED'],
    'Battery': ['36 hours', '7 days', '14 days', '30 days'],
    'Sensors': ['HR + SpO2 + ECG', 'HR + GPS + Compass', 'Multi-Band GPS'],
    'Water Rating': ['5 ATM', '10 ATM', 'IP68'],
  }],
  [['mah', 'power bank', 'powerbank'], {
    'Capacity': ['10000 mAh', '20000 mAh', '25000 mAh', '27000 mAh'],
    'Output': ['20W PD', '65W PD', '100W PD', '250W PD'],
    'Ports': ['USB-C x2', 'USB-C + USB-A', '2C + 2A'],
    'Charging': ['Qi2 Wireless', 'Fast Charge', 'Pass-Through'],
  }],
  [['charger', 'ganprime', 'nexode', 'gaN', 'adapter'], {
    'Output': ['65W', '100W', '140W', '200W'],
    'Ports': ['2x USB-C', '3x USB-C + 1x USB-A', '4x USB-C'],
    'Technology': ['GaN II', 'GaNPrime', 'GaN Fast'],
    'Compatibility': ['PD 3.1', 'QC 5', 'PPS'],
  }],
  [['ssd', 'nvme', '990 pro', 'sn850', 'firecuda', 't700', 'rocket', 'extreme pro', 'nm790'], {
    'Interface': ['PCIe 5.0 NVMe', 'PCIe 4.0 NVMe', 'USB 3.2 Gen 2'],
    'Capacity': ['1 TB', '2 TB', '4 TB'],
    'Read Speed': ['7450 MB/s', '12400 MB/s', '1050 MB/s'],
    'Form Factor': ['M.2 2280', '2.5" Portable', 'M.2 + Heatsink'],
  }],
  [['router', 'deco', 'orbi', 'raptor', 'eero', 'nest wifi', 'mesh'], {
    'Standard': ['Wi-Fi 7', 'Wi-Fi 6E', 'Wi-Fi 6'],
    'Bands': ['Tri-Band', 'Quad-Band', 'Dual-Band'],
    'Speed': ['BE22000', 'AX11000', 'AX6000'],
    'Coverage': ['7000 sq ft', '5000 sq ft', '3000 sq ft'],
  }],
];

// ─── Derivation helpers ───────────────────────────────────────────────────────
function deriveBrand(name: string, categorySlug: string): string {
  const lower = name.toLowerCase();
  for (const [hint, brand] of BRAND_HINTS) {
    if (lower.includes(hint)) return brand;
  }
  return CATEGORY_DEFAULT_BRAND[categorySlug] || 'Generic';
}

function derivePrice(name: string, categorySlug: string): number {
  const lower = name.toLowerCase();
  for (const [keyword, min, max] of PRICE_RULES) {
    if (lower.includes(keyword)) return randomFloat(min, max);
  }
  const [min, max] = CATEGORY_DEFAULT_PRICE[categorySlug] || [199, 9999];
  return randomFloat(min, max);
}

function deriveSpecs(name: string): Record<string, string> {
  const lower = name.toLowerCase();
  for (const [keywords, builder] of SPEC_BUILDERS) {
    if (keywords.some((k) => lower.includes(k))) {
      const specs: Record<string, string> = {};
      for (const [key, values] of Object.entries(builder)) {
        specs[key] = pick(values);
      }
      return specs;
    }
  }
  return { 'Model': 'Standard Edition', 'Compatibility': 'Universal', 'In The Box': 'Main Unit + Accessories' };
}

function buildDescription(name: string, brand: string, subcategory: string): string {
  return pick([
    `The ${name} by ${brand} delivers exceptional ${subcategory} performance with cutting-edge technology and premium design. Perfect for everyday use.`,
    `Elevate your experience with the ${name} by ${brand}. Featuring top-tier specs, stunning build quality, and intelligent features tailored for modern lifestyles.`,
    `${name} by ${brand} combines style, power, and reliability in one complete package. Engineered to exceed expectations and built to last.`,
    `Discover the ${name} by ${brand} — where innovation meets craftsmanship. Packed with advanced features and designed for maximum comfort and usability.`,
    `Uncompromising quality meets thoughtful design in the ${name} by ${brand}. Every detail crafted to deliver the best ${subcategory} experience.`,
  ]);
}

function buildFeatures(name: string, subcategory: string): string[] {
  return [
    `Premium ${subcategory} with cutting-edge technology`,
    `${pick(['1 year', '2 year', '3 year'])} manufacturer warranty`,
    `${pick(['Free', 'Express'])} delivery available`,
    `${pick(['Easy returns within 15 days', 'Easy returns within 30 days', 'No questions asked returns'])}`,
  ];
}

function buildBox(name: string): string[] {
  return [
    `1x ${name}`,
    `1x ${pick(['Charging Cable', 'USB-C Cable', 'Power Adapter', 'Charging Case'])}`,
    `1x ${pick(['User Manual', 'Quick Start Guide', 'Documentation Kit'])}`,
    pick(['1x Warranty Card', '1x Carrying Case', '1x Cleaning Cloth', '1x SIM Ejector Tool']),
  ];
}

function u(id: string): string {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=80`;
}


const SEED_CATEGORY_IMAGE_MAP: Record<string, string> = {
  electronics: u('1498050108023-c5249f4df085'),
  smartphones: u('1511707171634-5f897ff02aa9'),
  laptops: u('1517336714731-489689fd1ca8'),
  headphones: u('1505740420928-5e560c06d30e'),
  smartwatches: u('1508685096489-7aacd43bd3b1'),
  fashion: u('1445205170230-053b83016050'),
  'men-apparel': u('1521572267360-ee0c2909d518'),
  'women-collection': u('1572804013309-59a88b7e92f1'),
  'running-shoes': u('1542291026-7eec264c27ff'),
  'home-living': u('1618221195710-dd6b41faaea6'),
  'home-decor': u('1578500494198-246f612d3b3d'),
  cookware: u('1584992236310-6edddc08acff'),
  'sofas-beds': u('1555041469-a586c61ea9bc'),
  'lighting-lamps': u('1507473885765-e6ed057f782c'),
  essentials: u('1522337360788-8b13dee7a37e'),
  'beauty-skincare': u('1586495777744-4413f21062fa'),
  'fitness-gym': u('1534438327276-14e5300c3a48'),
  'toys-games': u('1587654780291-39c9404d746b'),
  'pet-supplies': u('1583511655857-d19b40a7a54e'),
};

function getCategoryImageUrl(slug: string): string {
  return SEED_CATEGORY_IMAGE_MAP[slug] || u('1498050108023-c5249f4df085');
}

function getVerifiedImageUrl(name: string, catSlug: string, sku: string): string {
  const SUBCATEGORY_BASE_IDS: Record<string, string> = {
    smartphones: '1511707171634-5f897ff02aa9',
    laptops: '1517336714731-489689fd1ca8',
    headphones: '1505740420928-5e560c06d30e',
    smartwatches: '1523275335684-37898b6baf30',
    'men-apparel': '1521572267360-ee0c2909d518',
    'women-collection': '1572804013309-59a88b7e92f1',
    'running-shoes': '1542291026-7eec264c27ff',
    'home-decor': '1578500494198-246f612d3b3d',
    cookware: '1584992236310-6edddc08acff',
    'sofas-beds': '1555041469-a586c61ea9bc',
    'lighting-lamps': '1507473885765-e6ed057f782c',
    'beauty-skincare': '1586495777744-4413f21062fa',
    'fitness-gym': '1534438327276-14e5300c3a48',
    'toys-games': '1587654780291-39c9404d746b',
    'pet-supplies': '1583511655857-d19b40a7a54e',
  };
  const basePhotoId = SUBCATEGORY_BASE_IDS[catSlug] || '1498050108023-c5249f4df085';
  return `https://images.unsplash.com/photo-${basePhotoId}?auto=format&fit=crop&w=800&q=80&item=${encodeURIComponent(sku)}`;
}

async function main() {
  console.log('🌱 Seeding catalog-driven product database...');

  console.log('🧹 Wiping existing database records safely...');
  const wipe = async (fn: () => Promise<any>) => {
    try { await fn(); } catch (e) { /* ignore */ }
  };
  await wipe(() => prisma.reviewImage.deleteMany());
  await wipe(() => prisma.review.deleteMany());
  await wipe(() => prisma.payment.deleteMany());
  await wipe(() => prisma.orderItem.deleteMany());
  await wipe(() => prisma.order.deleteMany());
  await wipe(() => prisma.idempotencyRecord.deleteMany());
  await wipe(() => prisma.coupon.deleteMany());
  await wipe(() => prisma.wishlistItem.deleteMany());
  await wipe(() => prisma.cartItem.deleteMany());
  await wipe(() => prisma.cart.deleteMany());
  await wipe(() => prisma.inventory.deleteMany());
  await wipe(() => prisma.productImage.deleteMany());
  await wipe(() => prisma.product.deleteMany());
  await wipe(() => prisma.category.deleteMany());

  const hashedPassword = await bcrypt.hash('Admin@123', 12);

  // Create Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@commerceflow.dev' },
    update: { password: hashedPassword, isActive: true, deletedAt: null },
    create: { email: 'admin@commerceflow.dev', password: hashedPassword, firstName: 'Admin', lastName: 'User', role: 'ADMIN', isEmailVerified: true },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: { password: hashedPassword, isActive: true, deletedAt: null },
    create: { email: 'customer@example.com', password: hashedPassword, firstName: 'John', lastName: 'Doe', role: 'CUSTOMER', isEmailVerified: true },
  });

  const seller = await prisma.user.upsert({
    where: { email: 'seller@example.com' },
    update: { password: hashedPassword, isActive: true, deletedAt: null },
    create: { email: 'seller@example.com', password: hashedPassword, firstName: 'Jane', lastName: 'Baker', role: 'SELLER', isEmailVerified: true },
  });

  const deliveryBoy = await prisma.user.upsert({
    where: { email: 'delivery@example.com' },
    update: { password: hashedPassword, isActive: true, deletedAt: null },
    create: { email: 'delivery@example.com', password: hashedPassword, firstName: 'Mike', lastName: 'Rider', role: 'DELIVERY_BOY', isEmailVerified: true },
  });

  // Create reviewer users
  const reviewerUsers = await Promise.all(
    FIRST_NAMES.slice(0, 20).map((first, i) =>
      prisma.user.upsert({
        where: { email: `reviewer${i}@example.com` },
        update: {},
        create: {
          email: `reviewer${i}@example.com`, password: hashedPassword,
          firstName: first, lastName: LAST_NAMES[i], role: 'CUSTOMER',
          isEmailVerified: true,
        },
      })
    )
  );

  // Create category hierarchy: 4 parent groups -> 15 subcategories
  const subcategoryCategoryMap = new Map<string, string>();
  let totalCatalog = 0;
  for (const cat of USER_CATALOG) {
    const parentImage = getCategoryImageUrl(cat.slug);
    const parent = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description, image: parentImage },
      create: { name: cat.name, slug: cat.slug, description: cat.description, image: parentImage },
    });

    for (const subcat of cat.subcategories) {
      const childImage = getCategoryImageUrl(subcat.slug);
      const child = await prisma.category.upsert({
        where: { slug: subcat.slug },
        update: { name: subcat.name, description: subcat.description, parentId: parent.id, image: childImage },
        create: { name: subcat.name, slug: subcat.slug, description: subcat.description, parentId: parent.id, image: childImage },
      });
      subcategoryCategoryMap.set(subcat.slug, child.id);
      totalCatalog += subcat.products.length;
      console.log(`  ✓ Category: ${cat.name} > ${subcat.name} (${subcat.products.length} catalog products)`);
    }
  }

  // Generate products directly from the catalog (name + exact image)
  let productIndex = 0;

  console.log(`Generating ${totalCatalog} products from catalog...`);

  for (const parentCat of USER_CATALOG) {
    for (const cat of parentCat.subcategories) {
    const categoryId = subcategoryCategoryMap.get(cat.slug)!;

    for (const catalogProduct of cat.products) {
      const name = catalogProduct.name;
      const brand = deriveBrand(name, cat.slug);
      const price = derivePrice(name, cat.slug);
      const uniqueId = `${productIndex}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      const slug = slugify(name + '-' + brand + '-' + uniqueId);
      const sku = `${brand.substring(0, 3).toUpperCase()}-${String(productIndex + 1000).padStart(5, '0')}-${Math.random().toString(36).substring(2, 6)}`;
      const discountPercent = randomInt(5, 50);
      const originalPrice = parseFloat((price / (1 - discountPercent / 100)).toFixed(0));
      const stock = randomInt(10, 500);
      const soldCount = randomInt(100, 50000);
      const reviewCount = randomInt(50, 2500);
      const trendingScore = randomFloat(1, 100);
      const avgRating = randomFloat(3.5, 5.0);
      const description = buildDescription(name, brand, cat.name);
      const specs = deriveSpecs(name);

      // Mutually exclusive section flags distributed across the catalog
      let isFeatured = false;
      let isBestSeller = false;
      let isNewArrival = false;
      let isTopRated = false;

      if (productIndex < Math.round(totalCatalog * 0.12)) {
        isFeatured = true;
      } else if (productIndex < Math.round(totalCatalog * 0.24)) {
        isBestSeller = soldCount > 5000;
      } else if (productIndex < Math.round(totalCatalog * 0.36)) {
        isNewArrival = true;
      } else if (productIndex < Math.round(totalCatalog * 0.48)) {
        isTopRated = avgRating > 4.5;
      }

      const product = await prisma.product.create({        data: {
          name,
          slug,
          description,
          longDescription: description + ' ' + pick([
            `Backed by ${pick(WARRANTIES)} and reliable customer support. Buy with confidence from ${pick(SELLERS)} with easy returns and fast delivery across India.`,
            `Sourced from premium materials and manufactured to the highest standards. Includes ${pick(['free installation', 'setup guide', 'complimentary accessories', 'exclusive online support'])}. Order now for ${pick(DELIVERY_ESTIMATES)} delivery.`,
            `${specs ? Object.values(specs).slice(0, 3).join(', ') : 'Top-rated features'}. Covered by ${pick(RETURN_POLICIES)}. Shop with peace of mind on CommerceFlow.`,
          ]),
          basePrice: Math.round(price * 100),
          originalPrice: Math.round(originalPrice * 100),
          discountPercent,
          brand,
          sku,
          barcode: String(randomInt(100000000000, 999999999999)),
          categoryId,
          weight: randomFloat(0.2, 5.0),
          dimensions: `${randomInt(10, 50)} x ${randomInt(10, 50)} x ${randomInt(2, 20)} cm`,
          material: pick(MATERIALS),
          warranty: pick(WARRANTIES),
          countryOfOrigin: pick(ORIGINS),
          sellerName: pick(SELLERS),
          returnPolicy: pick(RETURN_POLICIES),
          deliveryEstimate: pick(DELIVERY_ESTIMATES),
          gstPercent: pick(GST),
          cashOnDelivery: Math.random() > 0.3,
          emiAvailable: Math.random() > 0.4,
          freeDelivery: Math.random() > 0.3,
          specifications: specs,
          keyFeatures: buildFeatures(name, cat.name),
          whatsInTheBox: buildBox(name),
          tags: [cat.slug, brand, ...(isFeatured ? ['featured'] : []), ...(isBestSeller ? ['best-seller'] : []), ...(isNewArrival ? ['new-arrival'] : [])],
          videoUrl: Math.random() > 0.8 ? `https://www.youtube.com/watch?v=example${productIndex}` : null,
          isFeatured,
          isNewArrival,
          isBestSeller,
          isTopRated,
          soldCount,
          wishlistCount: randomInt(100, 10000),
          questionsCount: randomInt(5, 200),
          trendingScore,
          seoMetaTitle: `${name} - ${brand} ${cat.name} | CommerceFlow`,
          seoDescription: `Buy ${name} by ${brand} at best price. ${description.substring(0, 100)}`,
          seoKeywords: `${name}, ${brand}, ${cat.name}, buy online, best price, ${cat.slug}`,
          inventory: { create: { stock, reservedStock: randomInt(0, 10), lowStockThreshold: 5 } },
          images: { create: { url: getVerifiedImageUrl(name, cat.slug, sku), alt: `${name} - ${brand}`, order: 0 } },
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
      if (productIndex % 25 === 0) {
        console.log(`Created ${productIndex} products with reviews...`);
      }
    }
    }
  }

  // Create Coupons
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
  console.log(`📁 Categories: ${USER_CATALOG.length} parent groups, ${USER_CATALOG.reduce((n, c) => n + c.subcategories.length, 0)} subcategories`);
  console.log(`👤 Admin: admin@commerceflow.dev / Admin@123`);
  console.log(`👤 Customer: customer@example.com / Admin@123`);
  console.log(`👤 Seller: seller@example.com / Admin@123`);
  console.log(`👤 Delivery Boy: delivery@example.com / Admin@123`);
}

if (process.argv[1]?.includes('seed')) {
  main()
    .then(async () => {
      await prisma.$disconnect();
      await seedPool.end();
    })
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect().catch(() => {});
      await seedPool.end().catch(() => {});
      process.exit(1);
    });
}

export default main;
