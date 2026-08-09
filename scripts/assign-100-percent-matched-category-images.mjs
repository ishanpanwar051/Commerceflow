import fs from 'fs';
import path from 'path';

// Subcategory-isolated, item-matched, high-definition Unsplash URLs for every product category and subcategory!
const CATEGORY_ITEM_IMAGES = {
  // ─── FASHION MEN ──────────────────────────────────────────────────────────
  tshirts: [
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1625910513413-5fc45fdf2f3b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80',
  ],
  shirts: [
    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?auto=format&fit=crop&w=800&q=80',
  ],
  jeans: [
    'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80',
  ],
  trousers: [
    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1598808503746-f34c53b9323e?auto=format&fit=crop&w=800&q=80',
  ],
  suits: [
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
  ],
  jackets: [
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80',
  ],

  // ─── FASHION WOMEN ────────────────────────────────────────────────────────
  dresses: [
    'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
  ],
  tops: [
    'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80',
  ],
  handbags: [
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80',
  ],
  jewelry: [
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
  ],
  heels: [
    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80',
  ],
  womenLeggings: [
    'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&w=800&q=80',
  ],

  // ─── SHOES & FOOTWEAR ─────────────────────────────────────────────────────
  runningShoes: [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
  ],
  casualSneakers: [
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80',
  ],
  oxfordShoes: [
    'https://images.unsplash.com/photo-1614252369475-531eba835eb1?auto=format&fit=crop&w=800&q=80',
  ],
  chelseaBoots: [
    'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&w=800&q=80',
  ],
  sandals: [
    'https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&w=800&q=80',
  ],

  // ─── HOME & FURNITURE ─────────────────────────────────────────────────────
  sofas: [
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
  ],
  beds: [
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
  ],
  dining: [
    'https://images.unsplash.com/photo-1617098900591-3f90928e8c54?auto=format&fit=crop&w=800&q=80',
  ],
  officeChairs: [
    'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&w=800&q=80',
  ],
  cookware: [
    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
  ],

  // ─── SPORTS & BEAUTY ──────────────────────────────────────────────────────
  sportsBall: [
    'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80',
  ],
  fitnessMat: [
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
  ],
  skincareSerum: [
    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
  ],

  // ─── GROCERIES, OFFICE & AUTOMOTIVE ───────────────────────────────────────
  dairyMilk: [
    'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80',
  ],
  riceGrains: [
    'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
  ],
  pulsesLentils: [
    'https://images.unsplash.com/photo-1515543904379-3d757afe72e4?auto=format&fit=crop&w=800&q=80',
  ],
  vegetablesProduce: [
    'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cf?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
  ],
  fruitsProduce: [
    'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=800&q=80',
  ],
  dryFruitsNuts: [
    'https://images.unsplash.com/photo-1508061252966-17387f0b2f81?auto=format&fit=crop&w=800&q=80',
  ],
  spicesSeasoning: [
    'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
  ],
  cookingOil: [
    'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80',
  ],
  packagedFood: [
    'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80',
  ],
  stationeryOffice: [
    'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?auto=format&fit=crop&w=800&q=80',
  ],
  autoGear: [
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1619405399517-d7fce0f13302?auto=format&fit=crop&w=800&q=80',
  ]
};

function resolveProductImage(name, catSlug) {
  const n = name.toLowerCase();

  // Groceries / Food / Produce
  if (n.includes('bean') || n.includes('peas') || n.includes('spinach') || n.includes('broccoli') || n.includes('cauliflower') || n.includes('cucumber') || n.includes('carrot') || n.includes('tomato') || n.includes('onion') || n.includes('potato') || n.includes('brinjal')) return CATEGORY_ITEM_IMAGES.vegetablesProduce[n.length % CATEGORY_ITEM_IMAGES.vegetablesProduce.length];
  if (n.includes('strawberry') || n.includes('apple') || n.includes('banana') || n.includes('orange') || n.includes('mango') || n.includes('grape') || n.includes('watermelon') || n.includes('papaya') || n.includes('pomegranate') || n.includes('pineapple') || n.includes('guava') || n.includes('kiwi')) return CATEGORY_ITEM_IMAGES.fruitsProduce[n.length % CATEGORY_ITEM_IMAGES.fruitsProduce.length];
  if (n.includes('almond') || n.includes('cashew') || n.includes('walnut') || n.includes('pistachio') || n.includes('raisin') || n.includes('apricot') || n.includes('date') || n.includes('granola')) return CATEGORY_ITEM_IMAGES.dryFruitsNuts[0];
  if (n.includes('mustard') || n.includes('turmeric') || n.includes('chilli') || n.includes('masala') || n.includes('cumin') || n.includes('pepper') || n.includes('fennel') || n.includes('cardamom') || n.includes('cinnamon')) return CATEGORY_ITEM_IMAGES.spicesSeasoning[0];
  if (n.includes('oil') || n.includes('ghee') || n.includes('butter')) return CATEGORY_ITEM_IMAGES.cookingOil[0];
  if (n.includes('rice') || n.includes('flour') || n.includes('quinoa') || n.includes('oats') || n.includes('atta') || n.includes('poha')) return CATEGORY_ITEM_IMAGES.riceGrains[0];
  if (n.includes('dal') || n.includes('lentil') || n.includes('rajma') || n.includes('chana') || n.includes('lobia')) return CATEGORY_ITEM_IMAGES.pulsesLentils[0];
  if (n.includes('milk') || n.includes('yogurt') || n.includes('curd') || n.includes('paneer') || n.includes('cheese') || n.includes('cream')) return CATEGORY_ITEM_IMAGES.dairyMilk[0];
  if (n.includes('ketchup') || n.includes('sauce') || n.includes('mayonnaise') || n.includes('jam') || n.includes('biscuit') || n.includes('noodle') || n.includes('pasta')) return CATEGORY_ITEM_IMAGES.packagedFood[0];

  // Fashion Women
  if (n.includes('dress') || n.includes('saree') || n.includes('kurti') || n.includes('gown') || n.includes('anarkali') || n.includes('maxi') || n.includes('cocktail')) return CATEGORY_ITEM_IMAGES.dresses[n.length % CATEGORY_ITEM_IMAGES.dresses.length];
  if (n.includes('handbag') || n.includes('clutch') || n.includes('purse') || n.includes('tote') || n.includes('shoulder bag')) return CATEGORY_ITEM_IMAGES.handbags[n.length % CATEGORY_ITEM_IMAGES.handbags.length];
  if (n.includes('necklace') || n.includes('earring') || n.includes('pendant') || n.includes('jewel') || n.includes('bracelet')) return CATEGORY_ITEM_IMAGES.jewelry[n.length % CATEGORY_ITEM_IMAGES.jewelry.length];
  if (n.includes('heel') || n.includes('stiletto') || n.includes('pump') || n.includes('wedge')) return CATEGORY_ITEM_IMAGES.heels[0];
  if (n.includes('legging') || n.includes('jeggings')) return CATEGORY_ITEM_IMAGES.womenLeggings[0];
  if (n.includes('blouse') || n.includes('top') || n.includes('tunic')) return CATEGORY_ITEM_IMAGES.tops[n.length % CATEGORY_ITEM_IMAGES.tops.length];

  // Fashion Men
  if (n.includes('trouser') || n.includes('pants')) return CATEGORY_ITEM_IMAGES.trousers[n.length % CATEGORY_ITEM_IMAGES.trousers.length];
  if (n.includes('suit') || n.includes('tuxedo') || n.includes('blazer')) return CATEGORY_ITEM_IMAGES.suits[0];
  if (n.includes('jacket') || n.includes('coat')) return CATEGORY_ITEM_IMAGES.jackets[0];
  if (n.includes('t-shirt') || n.includes('polo')) return CATEGORY_ITEM_IMAGES.tshirts[n.length % CATEGORY_ITEM_IMAGES.tshirts.length];
  if (n.includes('shirt')) return CATEGORY_ITEM_IMAGES.shirts[n.length % CATEGORY_ITEM_IMAGES.shirts.length];
  if (n.includes('jeans')) return CATEGORY_ITEM_IMAGES.jeans[n.length % CATEGORY_ITEM_IMAGES.jeans.length];

  // Automotive & Office
  if (n.includes('helmet') || n.includes('glove') || n.includes('biker') || n.includes('riding') || n.includes('car clean') || n.includes('washer') || n.includes('motorcycle') || n.includes('engine oil')) return CATEGORY_ITEM_IMAGES.autoGear[n.length % CATEGORY_ITEM_IMAGES.autoGear.length];
  if (n.includes('pen') || n.includes('journal') || n.includes('notebook') || n.includes('stationery') || n.includes('organizer')) return CATEGORY_ITEM_IMAGES.stationeryOffice[n.length % CATEGORY_ITEM_IMAGES.stationeryOffice.length];

  // Footwear
  if (n.includes('running') || n.includes('pegasus') || n.includes('ultraboost') || n.includes('ghost') || n.includes('clifton') || n.includes('hovr') || n.includes('floatride') || n.includes('rider')) return CATEGORY_ITEM_IMAGES.runningShoes[0];
  if (n.includes('sneaker') || n.includes('air force') || n.includes('stan smith') || n.includes('superstar') || n.includes('chuck') || n.includes('old skool') || n.includes('samba')) return CATEGORY_ITEM_IMAGES.casualSneakers[0];
  if (n.includes('oxford') || n.includes('brogue')) return CATEGORY_ITEM_IMAGES.oxfordShoes[0];
  if (n.includes('boot') || n.includes('chelsea')) return CATEGORY_ITEM_IMAGES.chelseaBoots[0];
  if (n.includes('sandal') || n.includes('slide')) return CATEGORY_ITEM_IMAGES.sandals[0];

  return null;
}

// Read user-catalog.ts and update all products
const catalogPath = path.resolve('backend/prisma/user-catalog.ts');
let catalogText = fs.readFileSync(catalogPath, 'utf8');

const pRegex = /{\s*name:\s*'([^']+)',\s*image:\s*'([^']+)'\s*}/g;
let match;
let totalUpdated = 0;

catalogText = catalogText.replace(pRegex, (fullMatch, name, currentImg) => {
  const newImg = resolveProductImage(name, '');
  if (newImg && newImg !== currentImg) {
    totalUpdated++;
    return `{ name: '${name}', image: '${newImg}' }`;
  }
  return fullMatch;
});

fs.writeFileSync(catalogPath, catalogText, 'utf8');
console.log(`✓ Successfully refined ${totalUpdated} products in user-catalog.ts!`);
