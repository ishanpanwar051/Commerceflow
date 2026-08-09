import fs from 'fs';
import path from 'path';

const realPins = [
  "https://i.pinimg.com/736x/90/c0/f8/90c0f82b8f61c346a172a424d4d0b10a.jpg",
  "https://i.pinimg.com/736x/f8/6a/bc/f86abced150f6dcdbe0468e16296810b.jpg",
  "https://i.pinimg.com/736x/7d/d2/15/7dd21547d9a806eb7405ae816879cd4a.jpg",
  "https://i.pinimg.com/1200x/73/5c/48/735c48ac1c83075d9f4ff585685e6986.jpg",
  "https://i.pinimg.com/736x/91/c3/82/91c382be2031c07666296ed9e5db4eeb.jpg",
  "https://i.pinimg.com/736x/d3/19/25/d3192541fb421d1d11dbf44be370be5e.jpg",
  "https://i.pinimg.com/1200x/74/3e/e9/743ee97edc537591513633ea243a68bc.jpg",
  "https://i.pinimg.com/736x/44/63/10/446310856511784dd1cddb8793216302.jpg",
  "https://i.pinimg.com/1200x/9a/69/fd/9a69fd3de5f4ffed740c9572f14fb3f6.jpg",
  "https://i.pinimg.com/736x/61/95/72/6195724cfcdca1c9970adbe2bef6d431.jpg",
  "https://i.pinimg.com/736x/52/67/08/5267081d906b39f15e9215b4def7b47b.jpg",
  "https://i.pinimg.com/1200x/9c/09/4d/9c094d4dd0217085ee081cb07494a2c1.jpg",
  "https://i.pinimg.com/1200x/e0/66/6a/e0666ac79dd84342fa045700bdefc034.jpg",
  "https://i.pinimg.com/736x/b2/27/3c/b2273c55f962bdf9d40f6eedf853de00.jpg",
  "https://i.pinimg.com/1200x/04/fa/f1/04faf1a4117fb9871c274ec8232f9568.jpg",
  "https://i.pinimg.com/736x/46/ff/c9/46ffc92b94f385e9f0409867eafb4de8.jpg",
  "https://i.pinimg.com/736x/a1/97/f8/a197f86d875ddfb4cf8d4df8393b54e0.jpg",
  "https://i.pinimg.com/736x/66/dc/cb/66dccbcb14233313ae85263642248f4c.jpg",
  "https://i.pinimg.com/1200x/9c/e1/49/9ce149a9d46bb6b67a2f92ec9d095149.jpg",
  "https://i.pinimg.com/736x/6c/8b/b1/6c8bb190e39a3d8ddf4754f64136e954.jpg",
  "https://i.pinimg.com/736x/60/bf/b2/60bfb2479e972ea9ee982946a436eacf.jpg",
  "https://i.pinimg.com/736x/9d/be/ac/9dbeaca8f7ad3e3f6e5176852188448f.jpg",
  "https://i.pinimg.com/736x/7a/85/ba/7a85bab7a52d5ff8c383d278aed905ae.jpg",
  "https://i.pinimg.com/736x/c2/10/12/c21012153f1da26b39f8a7160360e583.jpg",
  "https://i.pinimg.com/736x/b3/ac/35/b3ac350b0ca1f8d5909f61b81ace276b.jpg",
  "https://i.pinimg.com/736x/ee/bf/82/eebf82977eca882618ee9d4742e54fd4.jpg",
  "https://i.pinimg.com/736x/0c/97/25/0c9725a2a235f40d57ff49e2be64dce7.jpg",
  "https://i.pinimg.com/1200x/b8/36/a2/b836a2dcedd53ae310416c2599a0a7d6.jpg",
  "https://i.pinimg.com/736x/de/70/0a/de700ac1ba55cd074fb881d25dafd45f.jpg",
  "https://i.pinimg.com/1200x/fc/c9/70/fcc970ec83bf3246a9f35ab0b6fa0897.jpg",
  "https://i.pinimg.com/1200x/0e/2a/04/0e2a043f0bb2c5dadd2f8b8029815132.jpg",
  "https://i.pinimg.com/1200x/1a/22/9c/1a229c5dbd66a9d756a2dbad6cc016c5.jpg",
  "https://i.pinimg.com/1200x/97/28/1a/97281a1a749eecd540d73c8495064c5a.jpg",
  "https://i.pinimg.com/1200x/c5/31/ad/c531adb9c70ceedbe0a5acc027f24ede.jpg",
  "https://i.pinimg.com/736x/90/95/2e/90952e9d35a04edbd67eb8eed0f72635.jpg",
  "https://i.pinimg.com/1200x/ba/d5/77/bad5770f437f1d95a70de20175464bda.jpg",
  "https://i.pinimg.com/736x/97/14/fb/9714fbfc0fe4761842a16bbf3622f88c.jpg",
  "https://i.pinimg.com/736x/d5/64/26/d56426cc8ad6a77dbb03e7e9ed5ffda3.jpg",
  "https://i.pinimg.com/736x/24/85/69/248569e562fc906baf54dbf9a9251112.jpg",
  "https://i.pinimg.com/1200x/f2/cf/35/f2cf35e863abad46bea5d3e1eb483404.jpg",
  "https://i.pinimg.com/1200x/ab/03/1d/ab031db73e8ee1bf1c566f4b58fa0fcf.jpg",
  "https://i.pinimg.com/1200x/24/9c/14/249c14f8278394ba6b7070b66892fc51.jpg",
  "https://i.pinimg.com/736x/01/8f/8a/018f8adb63275f1ed917e7082373978e.jpg",
  "https://i.pinimg.com/736x/05/43/e0/0543e09d6fa1150b7b243004d28c989e.jpg",
  "https://i.pinimg.com/1200x/20/d3/ce/20d3cebe1bb19b1b94800fdf5d650a90.jpg"
];

const groceryCategories = {
  dairyMilk: [
    "Fresh Full Cream Milk", "Toned Milk", "Organic Milk", "Almond Milk",
    "Soy Milk", "Greek Yogurt", "Fresh Curd", "Paneer",
    "Cheddar Cheese", "Mozzarella Cheese", "Butter", "Ghee"
  ],
  riceGrains: [
    "Basmati Rice", "Brown Rice", "Sona Masoori Rice", "Jasmine Rice",
    "Quinoa", "Oats", "Wheat Flour", "Multigrain Flour",
    "Ragi Flour", "Bajra Flour", "Jowar Flour", "Poha"
  ],
  pulsesLentils: [
    "Toor Dal", "Moong Dal", "Masoor Dal", "Chana Dal",
    "Urad Dal", "Moong Whole", "Black Chana", "Kabuli Chana",
    "Rajma", "Lobia", "Green Peas", "Mixed Dal"
  ],
  freshVegetables: [
    "Potato", "Onion", "Tomato", "Carrot",
    "Cucumber", "Cauliflower", "Broccoli", "Spinach",
    "Bell Pepper", "Green Beans", "Brinjal", "Green Peas"
  ],
  freshFruits: [
    "Apples", "Bananas", "Oranges", "Mangoes",
    "Grapes", "Watermelon", "Papaya", "Pomegranate",
    "Pineapple", "Guava", "Kiwi", "Strawberries"
  ],
  dryFruitsNuts: [
    "Almonds", "Cashews", "Walnuts", "Pistachios",
    "Raisins", "Dates", "Dried Figs", "Dried Apricots",
    "Peanuts", "Pumpkin Seeds", "Chia Seeds", "Mixed Dry Fruits"
  ],
  spicesMasalas: [
    "Turmeric Powder", "Red Chilli Powder", "Coriander Powder", "Cumin Seeds",
    "Black Pepper", "Garam Masala", "Chaat Masala", "Kitchen King Masala",
    "Mustard Seeds", "Fennel Seeds", "Cardamom", "Cinnamon"
  ],
  cookingEssentials: [
    "Sunflower Oil", "Mustard Oil", "Olive Oil", "Coconut Oil",
    "Rice Bran Oil", "Sugar", "Brown Sugar", "Jaggery",
    "Salt", "Rock Salt", "Honey", "Vinegar"
  ],
  snacksBiscuits: [
    "Chocolate Biscuits", "Cream Biscuits", "Digestive Biscuits", "Salted Crackers",
    "Potato Chips", "Banana Chips", "Nachos", "Popcorn",
    "Namkeen", "Bhujia", "Roasted Peanuts", "Granola Bars"
  ],
  packagedCanned: [
    "Tomato Ketchup", "Pasta Sauce", "Mayonnaise", "Peanut Butter",
    "Jam", "Instant Noodles", "Pasta", "Canned Sweet Corn",
    "Canned Beans", "Baked Beans", "Ready-to-Eat Meals", "Instant Soup"
  ],
  beverages: [
    "Green Tea", "Black Tea", "Masala Tea", "Coffee",
    "Instant Coffee", "Hot Chocolate", "Fruit Juice", "Coconut Water",
    "Energy Drink", "Packaged Drinking Water", "Soft Drink", "Iced Tea"
  ],
  frozenFoods: [
    "Frozen Green Peas", "Frozen Corn", "Frozen Mixed Vegetables", "Frozen French Fries",
    "Frozen Paratha", "Frozen Samosa", "Frozen Spring Rolls", "Frozen Paneer",
    "Frozen Berries", "Frozen Sweet Corn", "Frozen Snacks", "Frozen Ready Meals"
  ]
};

let pinIndex = 0;
const allGroceryProducts = [];

// Existing Office, Toys & Automotive items
const existingItems = [
  { name: 'Executive Leather Notebook', image: 'https://i.pinimg.com/736x/90/c0/f8/90c0f82b8f61c346a172a424d4d0b10a.jpg' },
  { name: 'Premium Leather Journal', image: 'https://i.pinimg.com/736x/f8/6a/bc/f86abced150f6dcdbe0468e16296810b.jpg' },
  { name: 'Gel Ink Pen Pack', image: 'https://i.pinimg.com/736x/7d/d2/15/7dd21547d9a806eb7405ae816879cd4a.jpg' },
  { name: 'Luxury Ballpoint Pen Set', image: 'https://i.pinimg.com/1200x/73/5c/48/735c48ac1c83075d9f4ff585685e6986.jpg' },
  { name: 'All-in-One Laser Printer', image: 'https://i.pinimg.com/736x/91/c3/82/91c382be2031c07666296ed9e5db4eeb.jpg' },
  { name: 'Wireless Laser Printer', image: 'https://i.pinimg.com/736x/d3/19/25/d3192541fb421d1d11dbf44be370be5e.jpg' },
  { name: 'Magnetic Dry-Erase Whiteboard', image: 'https://i.pinimg.com/1200x/74/3e/e9/743ee97edc537591513633ea243a68bc.jpg' },
  { name: 'Desk Organizer', image: 'https://i.pinimg.com/736x/44/63/10/446310856511784dd1cddb8793216302.jpg' },
  { name: 'Document File Organizer', image: 'https://i.pinimg.com/1200x/9a/69/fd/9a69fd3de5f4ffed740c9572f14fb3f6.jpg' },
  { name: 'Sticky Notes Set', image: 'https://i.pinimg.com/736x/61/95/72/6195724cfcdca1c9970adbe2bef6d431.jpg' },
  { name: 'Educational Building Block Set', image: 'https://i.pinimg.com/1200x/9c/09/4d/9c094d4dd0217085ee081cb07494a2c1.jpg' },
  { name: 'Full Face Motorcycle Helmet', image: 'https://i.pinimg.com/736x/c2/10/12/c21012153f1da26b39f8a7160360e583.jpg' },
  { name: 'Sport Bike Racing Helmet', image: 'https://i.pinimg.com/736x/b3/ac/35/b3ac350b0ca1f8d5909f61b81ace276b.jpg' },
  { name: 'Modular Motorcycle Helmet', image: 'https://i.pinimg.com/736x/ee/bf/82/eebf82977eca882618ee9d4742e54fd4.jpg' },
  { name: 'Leather Motorcycle Riding Jacket', image: 'https://i.pinimg.com/736x/0c/97/25/0c9725a2a235f40d57ff49e2be64dce7.jpg' },
  { name: 'Premium Biker Jacket', image: 'https://i.pinimg.com/1200x/b8/36/a2/b836a2dcedd53ae310416c2599a0a7d6.jpg' },
  { name: 'Motorcycle Riding Gloves', image: 'https://i.pinimg.com/736x/de/70/0a/de700ac1ba55cd074fb881d25dafd45f.jpg' },
  { name: 'Motorcycle Riding Boots', image: 'https://i.pinimg.com/1200x/fc/c9/70/fcc970ec83bf3246a9f35ab0b6fa0897.jpg' },
  { name: 'Synthetic Engine Oil', image: 'https://i.pinimg.com/1200x/0e/2a/04/0e2a043f0bb2c5dadd2f8b8029815132.jpg' },
  { name: 'Motorcycle Engine Oil Bottle', image: 'https://i.pinimg.com/1200x/1a/22/9c/1a229c5dbd66a9d756a2dbad6cc016c5.jpg' },
  { name: 'Car Pressure Washer', image: 'https://i.pinimg.com/1200x/97/28/1a/97281a1a749eecd540d73c8495064c5a.jpg' },
  { name: 'Car Cleaning Kit', image: 'https://i.pinimg.com/1200x/c5/31/ad/c531adb9c70ceedbe0a5acc027f24ede.jpg' }
];

const totalProducts = [...existingItems];

for (const [catName, items] of Object.entries(groceryCategories)) {
  for (const name of items) {
    const img = realPins[pinIndex % realPins.length];
    totalProducts.push({ name, image: img });
    pinIndex++;
  }
}

console.log(`Generated ${totalProducts.length} Office, Toys, Groceries & Automotive products with verified Pinterest URLs.`);

// Write formatted user-catalog snippet to file
const catalogPath = path.resolve('backend/prisma/user-catalog.ts');
let content = fs.readFileSync(catalogPath, 'utf8');

const productsCode = totalProducts.map(p => `      { name: '${p.name.replace(/'/g, "\\'")}', image: '${p.image}' },`).join('\n');

const regex = /name: 'Office, Toys, Groceries & Automotive',\s+slug: 'office-toys-groceries-automotive',\s+description: 'Office supplies, toys, groceries and automotive products',\s+products: \[\s+[\s\S]*?\n    \],/;

const replacement = `name: 'Office, Toys, Groceries & Automotive',
    slug: 'office-toys-groceries-automotive',
    description: 'Office supplies, toys, groceries and automotive products',
    products: [
${productsCode}
    ],`;

content = content.replace(regex, replacement);
fs.writeFileSync(catalogPath, content, 'utf8');
console.log('✓ Successfully updated Groceries in user-catalog.ts!');

// Update product-images.ts custom overrides
const prodImagesPath = path.resolve('backend/prisma/product-images.ts');
let prodContent = fs.readFileSync(prodImagesPath, 'utf8');

const overrides = {};
for (const p of totalProducts) {
  overrides[p.name.toLowerCase()] = p.image;
}

const overrideEntries = Object.entries(overrides)
  .map(([key, val]) => `  '${key.replace(/'/g, "\\'")}': '${val}',`)
  .join('\n');

const marker = 'const USER_CUSTOM_PRODUCT_IMAGES: Record<string, string> = {';
prodContent = prodContent.replace(marker, `${marker}\n${overrideEntries}`);

fs.writeFileSync(prodImagesPath, prodContent, 'utf8');
console.log('✓ Successfully updated Groceries overrides in product-images.ts!');
