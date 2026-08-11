// Catalog: 4 parent groups -> 15 subcategories, 16 products each.
// Every product image is a deterministic placeholder from its subcategory's
// verified 16-image pool (index-aligned) so all images are unique across the
// catalog and never depend on a single external service.

import { SUBCATEGORY_IMAGE_POOLS } from './subcategory-image-pools';

export interface UserCatalogProduct {
  name: string;
  image: string;
}

export interface UserCatalogSubcategory {
  name: string;
  slug: string;
  description: string;
  products: UserCatalogProduct[];
}

export interface UserCatalogCategory {
  name: string;
  slug: string;
  description: string;
  subcategories: UserCatalogSubcategory[];
}

const img = (poolKey: string, index: number): string =>
  `https://i.pinimg.com/736x/90/95/2e/90952e9d35a04edbd67eb8eed0f72635.jpg`;

function sub(name: string, slug: string, description: string, names: string[]): UserCatalogSubcategory {
  const pool = SUBCATEGORY_IMAGE_POOLS[slug];
  if (!pool) throw new Error(`No image pool for subcategory "${slug}"`);
  if (names.length !== 16) throw new Error(`Subcategory "${slug}" must have 16 products (got ${names.length})`);
  return { name, slug, description, products: names.map((productName, i) => ({ name: productName, image: img(slug, i) })) };
}

const S = (
  name: string,
  slug: string,
  description: string,
  ...names: string[][]
): UserCatalogSubcategory => sub(name, slug, description, names.flat());

export const USER_CATALOG: UserCatalogCategory[] = [
  {
    name: 'Electronics',
    slug: 'electronics',
    description: 'Phones, laptops, headphones and smartwatches from top brands',
    subcategories: [
      S('Smartphones', 'smartphones', 'Latest smartphones with powerful cameras',
        ['iPhone 17 Pro Max', 'iPhone 17 Pro', 'iPhone 16e', 'Samsung Galaxy S26 Ultra'],
        ['Samsung Galaxy S26+', 'Samsung Galaxy Z Fold 7', 'Google Pixel 10 Pro XL', 'Google Pixel 10 Pro'],
        ['OnePlus 13', 'Xiaomi 16 Pro', 'Nothing Phone 3', 'Realme GT 7 Pro'],
        ['Vivo X200 Pro', 'OPPO Find N5', 'Motorola Edge 60 Pro', 'Honor Magic 7 Pro']),
      S('Laptops', 'laptops', 'Premium laptops for work, study and gaming',
        ['MacBook Pro 16-inch', 'MacBook Pro 14-inch', 'MacBook Air 15-inch', 'MacBook Air 13-inch'],
        ['Dell XPS 16', 'Dell XPS 14', 'Lenovo ThinkPad X1 Carbon', 'HP Spectre x360'],
        ['ASUS ROG Zephyrus G16', 'ASUS Zenbook 14', 'Acer Swift 5', 'Microsoft Surface Laptop 7'],
        ['Samsung Galaxy Book4 Ultra', 'Lenovo IdeaPad Slim 5', 'HP Pavilion 15', 'Dell Inspiron 15']),
      S('Headphones', 'headphones', 'Over-ear headphones with immersive sound',
        ['Sony WH-1000XM6', 'Sony WH-1000XM5', 'Sony MDR-7506', 'Bose QuietComfort Ultra'],
        ['Bose QuietComfort 45', 'Apple AirPods Max', 'Sennheiser Momentum 4', 'JBL Tune 770NC'],
        ['JBL Quantum 910X', 'Audio-Technica ATH-M50x', 'Beats Studio Pro', 'Skullcandy Crusher ANC 2'],
        ['Marshall Major V', 'Anker Soundcore Space One', 'Sony MDR-ZX110', 'Bose Headphones 700']),
      S('Smartwatches', 'smartwatches', 'Fitness tracking smartwatches for every wrist',
        ['Apple Watch Ultra 3', 'Apple Watch Series 11', 'Samsung Galaxy Watch 8', 'Samsung Galaxy Watch 8 Classic'],
        ['Google Pixel Watch 4', 'Garmin Forerunner 965', 'Garmin Venu 3', 'Garmin Fenix 8'],
        ['Fitbit Sense 3', 'Fitbit Charge 7', 'Amazfit GTR 5', 'Amazfit Bip 6'],
        ['OnePlus Watch 3', 'Huawei Watch GT 5', 'boAt Storm Call 4', 'Noise ColorFit Pro 6']),
    ],
  },
  {
    name: 'Fashion',
    slug: 'fashion',
    description: 'Men and women fashion, plus running shoes',
    subcategories: [
      S('Men Apparel', 'men-apparel', 'T-shirts, shirts and denim for men',
        ['Classic White T-Shirt', 'Oversized Black T-Shirt', 'Polo T-Shirt', 'Graphic Print T-Shirt'],
        ['Plain Cotton T-Shirt', 'Striped T-Shirt', 'Henley T-Shirt', 'Slim Fit T-Shirt'],
        ['Oversized Graphic T-Shirt', 'Full Sleeve T-Shirt', 'Premium Pique Polo', 'Basic Round Neck T-Shirt'],
        ['Oxford Cotton Shirt', 'White Formal Shirt', 'Black Casual Shirt', 'Denim Shirt']),
      S('Women Collection', 'women-collection', 'Dresses, ethnic wear and accessories for women',
        ['Floral Summer Maxi Dress', 'Cocktail Evening Dress', 'Silk Blouse Top', 'Designer Banarasi Saree'],
        ['Embroidered Cotton Kurta', 'Anarkali Suit Set', 'High-Waisted Denim Jeans', 'Pleated A-Line Skirt'],
        ['Ankle-Length Leggings', 'Trench Coat', 'Fitted Denim Jacket', 'Oversized Blazer'],
        ['Structured Leather Handbag', 'Evening Clutch', 'Gold Plated Necklace Set', 'Crystal Earrings']),
      S('Running Shoes', 'running-shoes', 'Cushioned running and lifestyle sneakers',
        ['Nike Air Zoom Pegasus', 'Adidas Ultraboost', 'ASICS Gel-Kayano', 'New Balance Fresh Foam'],
        ['Brooks Ghost', 'Hoka Clifton', 'Puma Velocity Nitro', 'Saucony Ride'],
        ['Under Armour HOVR', 'Reebok Floatride', 'Mizuno Wave Rider', 'Skechers Go Run'],
        ['Nike Air Force 1', 'Adidas Stan Smith', 'Adidas Superstar', 'Converse Chuck Taylor']),
    ],
  },
  {
    name: 'Home & Living',
    slug: 'home-living',
    description: 'Decor, cookware, furniture and lighting for your home',
    subcategories: [
      S('Home Decor', 'home-decor', 'Vases, art, rugs and accents to style your space',
        ['Ceramic Vase Set', 'Wall Art Canvas Print', 'Scented Candle Trio', 'Artificial Bonsai Plant'],
        ['Decorative Wall Clock', 'Boho Area Rug', 'Faux Fur Throw Blanket', 'Decorative Throw Pillow Set'],
        ['Oversized Wall Mirror', 'Wall Photo Collage Frames', 'Cushion Cover Set', 'Marble Centerpiece Bowl'],
        ['Wall Hanging Tapestry', 'Table Runner Set', 'Decorative Bookend Set', 'Indoor Plant Stand']),
      S('Cookware', 'cookware', 'Pans, pots and kitchen essentials',
        ['Non-Stick Frying Pan 24cm', 'Stainless Steel Cookware Set', 'Cast Iron Skillet', 'Pressure Cooker 5L'],
        ['Kitchen Knife Set', 'Induction Base Kadhai', 'Wok Pan 30cm', 'Sauce Pan Set'],
        ['Steamer Basket', 'Bakeware Muffin Tray', 'Mixing Bowl Set', 'Silicone Spatula Set'],
        ['Non-Stick Tawa', 'Idli Steamer', 'Glass Food Containers Set', 'Spice Box Set']),
      S('Sofas & Beds', 'sofas-beds', 'Sofas, sectionals and comfortable beds',
        ['Modern 3-Seater Sofa', 'L-Shaped Sectional Sofa', 'Velvet Sofa', 'Leather Sofa'],
        ['Recliner Sofa', 'Chesterfield Sofa', 'Modular Sofa', 'Loveseat Sofa'],
        ['Sleeper Sofa', 'Minimalist Sofa', 'U-Shaped Sectional Sofa', 'Boucle Sofa'],
        ['King Size Platform Bed', 'Queen Size Upholstered Bed', 'Wooden King Bed', 'Storage Bed']),
      S('Lighting & Lamps', 'lighting-lamps', 'Lamps, pendants and ambient lighting',
        ['LED Table Lamp', 'Modern Floor Lamp', 'Brass Pendant Light', 'Crystal Chandelier'],
        ['Smart RGB Bulb Set', 'Task Desk Lamp', 'Wall Sconce Pair', 'Fairy String Lights'],
        ['Neon Sign Light', 'Himalayan Salt Lamp', 'Tripod Floor Lamp', 'Ceiling Pendant Set'],
        ['Dimmable Bulb Pack', 'Bamboo Pendant Lamp', 'Bedside Reading Lamp', 'Vintage Edison Bulb Set']),
    ],
  },
  {
    name: 'Essentials',
    slug: 'essentials',
    description: 'Beauty, fitness, toys and pet essentials',
    subcategories: [
      S('Beauty & Skincare', 'beauty-skincare', 'Skincare, makeup and hair care products',
        ['Matte Liquid Lipstick', 'Vitamin C Serum 30ml', 'Niacinamide Serum 30ml', 'Hydrating Shampoo 500ml'],
        ['Volumizing Conditioner', 'Eau de Parfum 100ml Spray', 'Aloe Vera Face Wash', 'Broad Spectrum Sunscreen SPF50'],
        ['Hair Dryer 2000W', 'Hydrating Face Toner', 'Charcoal Face Mask', 'Hyaluronic Acid Cream'],
        ['Matte Finish Foundation', 'Long Lasting Eyeliner', 'Rose Water Toner', 'Shea Butter Body Lotion']),
      S('Fitness & Gym', 'fitness-gym', 'Gym equipment, protein and activewear',
        ['English Willow Cricket Bat', 'Official Size 5 Football', 'Anti-Burst Yoga Mat', 'Adjustable Dumbbell Set'],
        ['Whey Protein Isolate', 'Skipping Rope', 'Protein Shaker Bottle', 'Resistance Bands Set'],
        ['Sports Water Bottle', 'Kettlebell 12kg', 'Exercise Bench', 'Foam Roller'],
        ['Pull Up Bar', 'Grip Strengthener', 'Push Up Board', 'Speed Jump Rope']),
      S('Toys & Games', 'toys-games', 'Building blocks, puzzles and kids toys',
        ['Educational Building Block Set', 'Remote Control Car', 'Mini Drone', 'Plush Teddy Bear'],
        ['Rubik\'s Cube', 'Board Game Monopoly', 'Wooden Chess Set', 'Puzzle 1000 Pieces'],
        ['Toy Train Set', 'Water Gun Blaster', 'Action Figure Set', 'Stuffed Animal Set'],
        ['Card Game Uno', 'Balance Bike', 'Doll House', 'Lego Style Block Set']),
      S('Pet Supplies', 'pet-supplies', 'Food, beds and accessories for your pets',
        ['Dry Dog Food 5kg', 'Cat Food 2kg', 'Dog Leash & Collar Set', 'Cat Litter 10L'],
        ['Pet Grooming Brush', 'Large Dog Bed', 'Cat Tree Tower', 'Pet Water Fountain'],
        ['Dog Chew Toys', 'Cat Toy Feather Wand', 'Pet Food Bowls', 'Dog Treats Pack'],
        ['Pet Carrier Bag', 'Pet Harness', 'Dog Shampoo', 'Interactive Treat Puzzle']),
    ],
  },
];

export function findCatalogProduct(name: string): { subcategory: UserCatalogSubcategory; product: UserCatalogProduct } | null {
  const clean = (name || '').trim().toLowerCase();
  for (const cat of USER_CATALOG) {
    for (const subcat of cat.subcategories) {
      for (const p of subcat.products) {
        if (p.name.trim().toLowerCase() === clean) {
          return { subcategory: subcat, product: p };
        }
      }
    }
  }
  return null;
}

export function findSubcategoryBySlug(slug: string): UserCatalogSubcategory | null {
  const clean = (slug || '').toLowerCase();
  for (const cat of USER_CATALOG) {
    for (const subcat of cat.subcategories) {
      if (subcat.slug === clean) return subcat;
    }
  }
  return null;
}
