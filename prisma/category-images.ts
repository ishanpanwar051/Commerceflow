/**
 * Proper category images mapping
 * Each category gets relevant, appropriate imagery from Unsplash
 */

export const CATEGORY_IMAGES: Record<string, { main: string; subcategories: Record<string, string> }> = {
  'electronics': {
    main: 'photo-1498049794561-7780e7231661', // Laptop on desk
    subcategories: {
      'phones': 'photo-1511707171634-5f897ff02aa9',
      'laptops': 'photo-1517336714731-489689fd1ca8',
      'tablets': 'photo-1544244015-0df4b3ffc6b0',
      'monitors': 'photo-1527443224154-c4a3942d3acf',
      'keyboards': 'photo-1587829741301-dc798b83add3',
      'mouse': 'photo-1527864550417-7fd91fc51a46',
      'gaming': 'photo-1542751371-adc38448a05e',
      'cameras': 'photo-1502920917128-1aa500764cbd',
      'earbuds': 'photo-1590658268037-6bf12165a8df',
      'headphones': 'photo-1505740420928-5e560c06d30e',
      'speakers': 'photo-1608043152269-423dbba4e7e1',
      'smart-watches': 'photo-1523275335684-37898b6baf30',
      'power-banks': 'photo-1609091839311-d5365f9ff1c5',
      'chargers': 'photo-1591290619762-bf2ddd9e1f84',
      'ssd': 'photo-1531492746076-161ca9bcad58',
      'routers': 'photo-1606904825846-647eb07f5be2',
    },
  },
  'fashion-men': {
    main: 'photo-1490114538077-0a7f8cb49891', // Men's fashion
    subcategories: {
      't-shirts': 'photo-1521572163474-6864f9cf17ab',
      'shirts': 'photo-1596755094514-f87e34085b2c',
      'jeans': 'photo-1542272604-787c3835535d',
      'trousers': 'photo-1473966968600-fa801b869a1a',
      'suits': 'photo-1594938298603-c8148c4dae35',
      'jackets': 'photo-1551028719-00167b16eac5',
      'sweaters': 'photo-1434389677669-e08b4cac3105',
      'shorts': 'photo-1591195853828-11db59a44f6b',
      'innerwear': 'photo-1618354691373-d851c5c3a990',
      'socks': 'photo-1586363104862-3a5e2ab60d99',
      'belts': 'photo-1624222247344-550fb60583e2',
      'wallets': 'photo-1627123424574-724758594e93',
      'sunglasses': 'photo-1511499767150-a48a237f0083',
      'watches': 'photo-1523275335684-37898b6baf30',
      'ties': 'photo-1589756823695-278bc04f2b8c',
      'caps': 'photo-1588850561407-ed78c282e89b',
    },
  },
  'fashion-women': {
    main: 'photo-1490481651871-ab68de25d43d', // Women's fashion
    subcategories: {
      'dresses': 'photo-1595777457583-95e059d581b8',
      'tops': 'photo-1594633313593-bab3825d0caf',
      'jeans': 'photo-1541099649105-f69ad21f3246',
      'skirts': 'photo-1583496661160-fb5886a0aaaa',
      'kurtas': 'photo-1610030469839-a7f686ad29a0',
      'sarees': 'photo-1610030469839-a7f686ad29a0',
      'leggings': 'photo-1594633313593-bab3825d0cae',
      'jackets': 'photo-1578932750294-f5075e85f44a',
      'handbags': 'photo-1548036328-c9fa89d128fa',
      'jewelry': 'photo-1515562141207-7a88fb7ce338',
      'watches': 'photo-1523170335258-f5ed11844a49',
      'sunglasses': 'photo-1574258495973-f010dfbb5371',
      'scarves': 'photo-1601924994987-69e26d50dc26',
      'heels': 'photo-1543163521-1bf539c55dd2',
      'flats': 'photo-1543163521-1bf539c55dd2',
      'clutches': 'photo-1566150905458-1bf1fc113f0d',
    },
  },
  'kids': {
    main: 'photo-1503454537195-1dcabb73ffb9', // Kids items
    subcategories: {
      'boys-clothing': 'photo-1519340241574-2cec6aef0c01',
      'girls-clothing': 'photo-1518831959646-742c3a14ebf7',
      'baby-gear': 'photo-1584462329972-ced462419c67',
      'school-supplies': 'photo-1454165804606-c3d57bc86b40',
      'toys': 'photo-1560582861-45078880e48e',
      'shoes': 'photo-1514090458221-6e05f6d1495d',
      'backpacks': 'photo-1553062407-98eeb64c6a62',
      'accessories': 'photo-1596461404969-9ae70f2830c1',
    },
  },
  'shoes': {
    main: 'photo-1549298916-b41d501d3772', // Shoes
    subcategories: {
      'running-shoes': 'photo-1542291026-7eec264c27ff',
      'casual-shoes': 'photo-1549298916-b41d501d3772',
      'formal-shoes': 'photo-1614252235316-8c857d38b5f4',
      'sports-shoes': 'photo-1606107557195-0e29a4b5b4aa',
      'sandals': 'photo-1603487742131-4160ec999306',
      'slippers': 'photo-1631459977773-f4bc03e0c6e5',
      'boots': 'photo-1608256246200-53e635b5b65f',
      'flip-flops': 'photo-1626387346567-67baf04e5ac7',
    },
  },
  'sports': {
    main: 'photo-1517836357463-d25dfeac3438', // Sports
    subcategories: {
      'cricket': 'photo-1540747913346-19e32dc3e97e',
      'football': 'photo-1579952363873-27f3bade9f55',
      'basketball': 'photo-1546519638-68e109498ffc',
      'tennis': 'photo-1554068865-24cecd4e34b8',
      'badminton': 'photo-1626224583764-f87db24ac4ea',
      'swimming': 'photo-1560359106-1e0bb6e8e484',
      'cycling': 'photo-1517649763962-0c623066013b',
      'yoga': 'photo-1544367567-0f2fcb009e0b',
      'gym-equipment': 'photo-1517836357463-d25dfeac3438',
      'camping': 'photo-1478131143081-80f7f84ca84d',
    },
  },
  'beauty': {
    main: 'photo-1596462502278-27bfdc403348', // Beauty products
    subcategories: {
      'makeup': 'photo-1512496015851-a90fb38ba796',
      'skincare': 'photo-1571875257727-256c39da42af',
      'haircare': 'photo-1522338242992-e1a54906a8da',
      'fragrance': 'photo-1541643600914-78b084683601',
      'bath-&-body': 'photo-1608248543803-ba4f8c70ae0b',
      'nail-care': 'photo-1610992015732-2449b76344bc',
      'tools-&-brushes': 'photo-1616394584738-fc6e612e71b9',
      'beauty-appliances': 'photo-1620916566398-39f1143ab7be',
    },
  },
  'home-decor': {
    main: 'photo-1556911220-bff31c812dba', // Home decor
    subcategories: {
      'wall-art': 'photo-1513161455079-7dc1de15ef3e',
      'cushions': 'photo-1555041469-a586c61ea9bc',
      'curtains': 'photo-1600585154340-be6161a56a0c',
      'rugs': 'photo-1600210492486-724fe5c67fb0',
      'lamps': 'photo-1513506003901-1e6a229e2d15',
      'clocks': 'photo-1563861826100-9cb868fdbe1c',
      'vases': 'photo-1578500494198-246f612d3b3d',
      'candles': 'photo-1602874801006-c4b8f20b6fc5',
      'frames': 'photo-1513161455079-7dc1de15ef3e',
      'plants': 'photo-1463320726281-696a485928c7',
    },
  },
  'kitchen': {
    main: 'photo-1556911220-bff31c812dba', // Kitchen
    subcategories: {
      'cookware': 'photo-1584990347449-31e163942e30',
      'utensils': 'photo-1584990347449-31e163942e30',
      'appliances': 'photo-1556911220-bff31c812dba',
      'storage': 'photo-1585659722983-3a675dabf23d',
      'bakeware': 'photo-1556911220-e15b29be8c8f',
      'barware': 'photo-1569718212165-3a8278d5f624',
      'coffee-&-tea': 'photo-1514432324607-a09d9b4aefdd',
      'water-bottles': 'photo-1602143407151-7111542de6e8',
    },
  },
  'furniture': {
    main: 'photo-1555041469-a586c61ea9bc', // Furniture
    subcategories: {
      'sofas': 'photo-1555041469-a586c61ea9bc',
      'beds': 'photo-1505693416388-ac5ce068fe85',
      'tables': 'photo-1595515106969-1ce29566ff1c',
      'chairs': 'photo-1506439773649-6e0eb8cfb237',
      'wardrobes': 'photo-1595428773946-be2faece70c8',
      'bookshelves': 'photo-1594620302200-9a762244a156',
      'desks': 'photo-1518455027359-f3f8164ba6bd',
      'cabinets': 'photo-1595516004008-61212697ffc0',
      'mattresses': 'photo-1505691938895-1758d7feb511',
      'storage': 'photo-1595428773946-be2faece70c8',
    },
  },
  'books': {
    main: 'photo-1512820790803-83ca734da794', // Books
    subcategories: {
      'fiction': 'photo-1512820790803-83ca734da794',
      'non-fiction': 'photo-1495446815901-a7297e633e8d',
      'academic': 'photo-1524995997946-a1c2e315a42f',
      'children': 'photo-1503455637927-730bce8583c0',
      'comics': 'photo-1612178537253-bccd437b730e',
      'self-help': 'photo-1544947950-fa07a98d237f',
      'business': 'photo-1507003211169-0a1dd7228f2d',
      'science': 'photo-1532012197267-da84d127e765',
      'history': 'photo-1461360228754-6e81c478b882',
      'biography': 'photo-1519682337058-a94d519337bc',
    },
  },
  'toys': {
    main: 'photo-1560582861-45078880e48e', // Toys
    subcategories: {
      'action-figures': 'photo-1560582861-45078880e48e',
      'board-games': 'photo-1611891487033-45a2e7ef5026',
      'puzzles': 'photo-1584464491033-06628f3a6b7b',
      'dolls': 'photo-1587318108621-3aab250eb656',
      'remote-control': 'photo-1587407627257-27c7127e7b57',
      'educational': 'photo-1515162816999-a0c47dc192f7',
      'building-blocks': 'photo-1558060370-d644479cb6f7',
      'outdoor-play': 'photo-1593784991095-a205069470b6',
    },
  },
  'fitness': {
    main: 'photo-1517836357463-d25dfeac3438', // Fitness
    subcategories: {
      'gym-equipment': 'photo-1534438327276-14e5300c3a48',
      'weights': 'photo-1574680096145-d05b474e2155',
      'yoga-mats': 'photo-1544367567-0f2fcb009e0b',
      'resistance-bands': 'photo-1598266663439-2056e6900339',
      'protein': 'photo-1593095948071-474c5cc2989d',
      'vitamins': 'photo-1550572017-4a776480c921',
      'fitness-trackers': 'photo-1575203373056-5c7355c2562d',
      'water-bottles': 'photo-1523362628745-0c100150b504',
    },
  },
  'groceries': {
    main: 'photo-1542838132-92c53300491e', // Groceries
    subcategories: {
      'snacks': 'photo-1599490659213-e2b9527bd087',
      'beverages': 'photo-1571934811356-5cc061b6821f',
      'cooking-oil': 'photo-1474979266404-7eaacbcd87c5',
      'spices': 'photo-1596040033229-a0b6e2e4b174',
      'rice-&-grains': 'photo-1586201375761-83865001e31c',
      'dairy': 'photo-1563636619-e9143da7973b',
      'bread-&-bakery': 'photo-1509440159596-0249088772ff',
      'cleaning-supplies': 'photo-1585421514738-01798e348b17',
    },
  },
  'pet-supplies': {
    main: 'photo-1450778869180-41d0601e046e', // Pet supplies
    subcategories: {
      'dog-food': 'photo-1587300003388-59208cc962cb',
      'cat-food': 'photo-1514888286974-6c03e2ca1dba',
      'pet-toys': 'photo-1535930891776-0c2dfb7fda1a',
      'pet-beds': 'photo-1586671267731-da2cf3ceeb80',
      'collars': 'photo-1601758228041-f3b2795255f1',
      'grooming': 'photo-1570458436416-b8fcccfe883b',
      'bowls': 'photo-1591768575556-3e749c0a9815',
      'aquariums': 'photo-1520990556298-e2826a0feb8c',
    },
  },
  'automotive': {
    main: 'photo-1486262715619-67b85e0b08d3', // Automotive
    subcategories: {
      'car-care': 'photo-1619405399517-d7fce0f13302',
      'interior': 'photo-1549399542-7e3f8b79c341',
      'exterior': 'photo-1486262715619-67b85e0b08d3',
      'lubricants': 'photo-1487754180451-c456f719a1fc',
      'tools': 'photo-1584464491033-06628f3a6b7b',
      'helmets': 'photo-1558981852-426c6c22a060',
      'riding-gear': 'photo-1558980664-769d59546b3d',
      'bike-accessories': 'photo-1517649763962-0c623066013b',
    },
  },
  'office-supplies': {
    main: 'photo-1484480974693-6ca0a78fb36b', // Office supplies
    subcategories: {
      'notebooks': 'photo-1531346590917-e4d21e14e7f4',
      'pens': 'photo-1564939558297-fc396f18e5c7',
      'printers': 'photo-1612815154858-60aa4c59eaa6',
      'paper': 'photo-1587293852726-70cdb56c2866',
      'folders': 'photo-1544717297-fa95b6ee9643',
      'desk-organizers': 'photo-1588880331179-bc9b93a8cb5e',
      'staplers': 'photo-1624969862293-b749659ccc4e',
      'whiteboards': 'photo-1581344558702-25e2a3aef16d',
    },
  },
};

export function getCategoryImage(categorySlug: string): string {
  const imageId = CATEGORY_IMAGES[categorySlug]?.main;
  return imageId ? `https://images.unsplash.com/${imageId}?auto=format&fit=crop&w=800&q=80` : 
    `https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=800&q=80`;
}

export function getSubcategoryImage(categorySlug: string, subcategorySlug: string): string {
  const imageId = CATEGORY_IMAGES[categorySlug]?.subcategories[subcategorySlug];
  return imageId ? `https://images.unsplash.com/${imageId}?auto=format&fit=crop&w=800&q=80` : 
    getCategoryImage(categorySlug);
}
