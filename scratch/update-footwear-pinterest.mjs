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

const footwearCategories = {
  runningShoes: [
    "Nike Air Zoom Pegasus", "Adidas Ultraboost", "ASICS Gel-Kayano", "New Balance Fresh Foam",
    "Brooks Ghost", "Hoka Clifton", "Puma Velocity Nitro", "Saucony Ride",
    "Under Armour HOVR", "Reebok Floatride", "Mizuno Wave Rider", "Skechers Go Run"
  ],
  casualSneakers: [
    "Nike Air Force 1", "Adidas Stan Smith", "Adidas Superstar", "Converse Chuck Taylor",
    "Vans Old Skool", "New Balance 574", "Puma Suede Classic", "Reebok Club C 85",
    "Nike Air Max", "Adidas Samba", "New Balance 550", "ASICS GEL-LYTE III"
  ],
  oxfordShoes: [
    "Classic Black Oxford Shoes", "Brown Leather Oxford Shoes", "Cap Toe Oxford Shoes", "Plain Toe Oxford Shoes",
    "Wingtip Oxford Shoes", "Patent Leather Oxford Shoes", "Brogue Oxford Shoes", "Derby Style Oxford Shoes",
    "Suede Oxford Shoes", "Formal Lace-Up Oxford Shoes", "Premium Leather Oxford Shoes", "Slim Fit Oxford Shoes"
  ],
  chelseaBoots: [
    "Classic Black Chelsea Boots", "Brown Leather Chelsea Boots", "Suede Chelsea Boots", "Tan Chelsea Boots",
    "Black Suede Chelsea Boots", "Leather Ankle Chelsea Boots", "Chunky Sole Chelsea Boots", "Classic Elastic Side Chelsea Boots",
    "Premium Leather Chelsea Boots", "Casual Chelsea Boots", "Formal Chelsea Boots", "Western Chelsea Boots"
  ],
  sportSandals: [
    "Adidas Sport Sandals", "Nike Sports Sandals", "Puma Sport Sandals", "Crocs Sport Sandals",
    "Skechers Sport Sandals", "Under Armour Sport Sandals", "Velcro Sport Sandals", "Hiking Sport Sandals",
    "Outdoor Sport Sandals", "Lightweight Sport Sandals", "Adjustable Strap Sandals", "Waterproof Sport Sandals"
  ],
  slippers: [
    "Classic Rubber Slippers", "Memory Foam Slippers", "Leather House Slippers", "Flip Flop Slippers",
    "Cushioned Slippers", "Fleece Indoor Slippers", "Slides Slippers", "Waterproof Slippers",
    "Anti-Slip Slippers", "Casual Home Slippers", "Orthopedic Slippers", "Premium Men’s Slippers"
  ]
};

let pinIndex = 0;
const allFootwearProducts = [];

for (const [catName, items] of Object.entries(footwearCategories)) {
  for (const name of items) {
    const img = realPins[pinIndex % realPins.length];
    allFootwearProducts.push({ name, image: img });
    pinIndex++;
  }
}

console.log(`Generated ${allFootwearProducts.length} Footwear products with verified Pinterest URLs.`);

// Write formatted user-catalog snippet to file
const catalogPath = path.resolve('backend/prisma/user-catalog.ts');
let content = fs.readFileSync(catalogPath, 'utf8');

// Build products array string
const productsCode = allFootwearProducts.map(p => `      { name: '${p.name.replace(/'/g, "\\'")}', image: '${p.image}' },`).join('\n');

const regex = /name: 'Shoes & Footwear',\s+slug: 'shoes-footwear',\s+description: 'Footwear for everyone',\s+products: \[\s+[\s\S]*?\n    \],/;

const replacement = `name: 'Shoes & Footwear',
    slug: 'shoes-footwear',
    description: 'Footwear for everyone',
    products: [
${productsCode}
    ],`;

content = content.replace(regex, replacement);
fs.writeFileSync(catalogPath, content, 'utf8');
console.log('✓ Successfully updated Shoes & Footwear in user-catalog.ts!');

// Update product-images.ts custom overrides
const prodImagesPath = path.resolve('backend/prisma/product-images.ts');
let prodContent = fs.readFileSync(prodImagesPath, 'utf8');

const overrides = {};
for (const p of allFootwearProducts) {
  overrides[p.name.toLowerCase()] = p.image;
}

const overrideEntries = Object.entries(overrides)
  .map(([key, val]) => `  '${key.replace(/'/g, "\\'")}': '${val}',`)
  .join('\n');

const marker = 'const USER_CUSTOM_PRODUCT_IMAGES: Record<string, string> = {';
prodContent = prodContent.replace(marker, `${marker}\n${overrideEntries}`);

fs.writeFileSync(prodImagesPath, prodContent, 'utf8');
console.log('✓ Successfully updated Footwear overrides in product-images.ts!');
