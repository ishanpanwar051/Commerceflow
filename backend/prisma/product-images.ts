import { imagePools } from './image-pools';

type ProductInfo = {
  name: string;
  brand?: string;
  categorySlug: string;
  subcategory?: string;
};

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function toUnsplashUrl(photoId: string): string {
  if (photoId.startsWith('http')) return photoId;
  return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=800&q=80`;
}

// User-provided explicit product image overrides
const USER_CUSTOM_PRODUCT_IMAGES: Record<string, string> = {
  'notebook': 'photo-1544816155-12df9643f363',
  'gel ink pen': 'photo-1583485088034-697b5bc54ccd',
  'pen': 'photo-1583485088034-697b5bc54ccd',
  'laser printer': 'photo-1612815154858-60aa4c59eaa6',
  'printer': 'photo-1612815154858-60aa4c59eaa6',
  'dry-erase': 'photo-1586953208448-b95a79798f07',
  'whiteboard': 'photo-1586953208448-b95a79798f07',
  'building block': 'photo-1596461404969-9ae70f2830c1',
  'off-road car': 'photo-1594787318286-3d835c1d207f',
  'jigsaw': 'photo-1610890716171-6b1bb98ffd09',
  'puzzle': 'photo-1610890716171-6b1bb98ffd09',
  'motorcycle helmet': 'photo-1558981806-ec527fa84c39',
  'helmet': 'photo-1558981806-ec527fa84c39',
  'riding jacket': 'photo-1551028719-00167b16eac5',
  'engine oil': 'photo-1625047509248-ec889cbff17f',
  'pressure washer': 'photo-1607860108855-64acf2078ed9',
  'cricket': 'photo-1531415074968-036ba1b575da',
  'football': 'photo-1579952363873-27f3bade9f55',
  'yoga mat': 'photo-1601925260368-ae2f83cf8b7f',
  'yoga': 'photo-1601925260368-ae2f83cf8b7f',
  'dumbbell': 'photo-1583454110551-21f2fa2afe61',
  'weight': 'photo-1583454110551-21f2fa2afe61',
  'protein': 'photo-1593095948071-474c5cc2989d',
  'lipstick': 'photo-1586495777744-4413f21062fa',
  'serum': 'photo-1620916566398-39f1143ab7be',
  'shampoo': 'photo-1556229010-6c3f2c9ca5f8',
  'sofa': 'photo-1555041469-a586c61ea9bc',
  'bed': 'photo-1505693416388-ac5ce068fe85',
  'dining table': 'photo-1617098900591-3f90928e8c54',
  'office chair': 'photo-1580480055273-228ff5388ef8',
  'mesh chair': 'photo-1580480055273-228ff5388ef8',
  'bookshelf': 'photo-1594620302200-9a762244a156',
  'cookware': 'photo-1556911220-e15b29be8c8f',
  'knife set': 'photo-1593618998160-e34014e67546',
  'pressure cooker': 'photo-1585515320310-259814833e62',
  'french press': 'photo-1572119865084-43c285814d63',
  'coffee maker': 'photo-1572119865084-43c285814d63',
  'wall art': 'photo-1549490349-8643362247b5',
  'cushion': 'photo-1584100936595-c0654b55a2e2',
  'curtain': 'photo-1616486338812-3dadae4b4ace',
  'rug': 'photo-1600166898405-da9535204843',
  'running shoe': 'photo-1542291026-7eec264c27ff',
  'sneaker': 'photo-1495555961986-6d4c1ecb7be3',
  'canvas shoe': 'photo-1525966222134-fcfa99b8ae77',
  'oxford': 'photo-1614252369475-531eba835eb1',
  'derby': 'photo-1449247709967-d4461a6a6103',
  'chelsea': 'photo-1638247025967-b4e38f787b76',
  'boot': 'photo-1638247025967-b4e38f787b76',
  'sandal': 'photo-1603487742131-4160ec999306',
  'maxi dress': 'photo-1572804013309-59a88b7e92f1',
  'cocktail dress': 'photo-1566174053879-31528523f8ae',
  'dress': 'photo-1572804013309-59a88b7e92f1',
  'silk blouse': 'photo-1585487000160-6ebcfceb0d03',
  'top': 'photo-1585487000160-6ebcfceb0d03',
  'banarasi saree': 'photo-1610030469983-98e550d6193c',
  'saree': 'photo-1610030469983-98e550d6193c',
  'kurta': 'photo-1617627143750-d86bc21e42bb',
  'anarkali': 'photo-1594633312681-425c7b97ccd1',
  'denim jeans': 'photo-1541099649105-f69ad21f3246',
  'a-line skirt': 'photo-1583496661160-fb5886a0aaaa',
  'skirt': 'photo-1583496661160-fb5886a0aaaa',
  'legging': 'photo-1506629082955-511b1aa562c8',
  'trench coat': 'photo-1591047139829-d91aecb6caea',
  'denim jacket': 'photo-1543076447-215ad9ba6923',
  'blazer': 'photo-1551488831-00ddcb6c6bd3',
  'handbag': 'photo-1584917865442-de89df76afd3',
  'clutch': 'photo-1566150905458-1bf1fc113f0d',
  'necklace': 'photo-1599643478518-a784e5dc4c8f',
  'earring': 'photo-1535632066927-ab7c9ab60908',
  'high heel': 'photo-1543163521-1bf539c55dd2',
  'heel': 'photo-1543163521-1bf539c55dd2',
  'flat': 'photo-1560343090-f0409e92791a',
  'loafer': 'photo-1560343090-f0409e92791a',
  'crew neck': 'photo-1521572163474-6864f9cf17ab',
  't-shirt': 'photo-1521572163474-6864f9cf17ab',
  'graphic printed tee': 'photo-1503341504253-dff4815485f1',
  'polo t-shirt': 'photo-1583743814966-8936f5b7be1a',
  'polo': 'photo-1583743814966-8936f5b7be1a',
  'oxford shirt': 'photo-1602810318383-e386cc2a3ccf',
  'denim shirt': 'photo-1495105787522-5334e3ffa0ef',
  'linen shirt': 'photo-1596755389378-c31d21fd1273',
  'shirt': 'photo-1602810318383-e386cc2a3ccf',
  'slim fit denim jeans': 'photo-1542272604-787c3835535d',
  'tapered blue jeans': 'photo-1475178626620-a4d074967452',
  'black jeans': 'photo-1541099649105-f69ad21f3246',
  'jean': 'photo-1542272604-787c3835535d',
  'chino': 'photo-1624378439575-d8705ad7ae80',
  'trouser': 'photo-1598808503746-f34c53b9323e',
  'cargo': 'photo-1517438476312-10d79c077509',
  'single breasted blazer': 'photo-1507679799987-c73779587ccf',
  'tuxedo': 'photo-1594938298603-c8148c4dae35',
  'wool suit': 'photo-1555069519-127aadedf1ee',
  'suit': 'photo-1594938298603-c8148c4dae35',
  'bomber jacket': 'photo-1551028719-00167b16eac5',
  'puffer jacket': 'photo-1548883354-7622d03aca27',
  'sweater': 'photo-1576566588028-4147f3842f27',
  'hoodie': 'photo-1556821840-3a63f95609a7',
  'belt': 'photo-1624222247344-550fb60583dc',
  'wallet': 'photo-1627123424574-724758594e93',
  'aviator': 'photo-1511499767150-a48a237f0083',
  'sunglasses': 'photo-1511499767150-a48a237f0083',
  'chronograph': 'photo-1524805444758-089113d48a6d',
  'watch': 'photo-1524805444758-089113d48a6d',
  's25 ultra': 'photo-1610945415295-d9bbf067e59c',
  'iphone 17': 'photo-1511707171634-5f897ff02aa9',
  'oneplus 13': 'photo-1598327105666-5b89351aff97',
  'xiaomi 16': 'photo-1511707171634-5f897ff02aa9',
  'pixel 10': 'photo-1598327105666-5b89351aff97',
  'nothing phone': 'photo-1556656793-08538906a9f8',
  'realme gt': 'photo-1567581935884-3349723552ca',
  'vivo x200': 'photo-1605236453806-6ff36851218e',
  'oppo find': 'photo-1616348436168-de43ad0db179',
  'moto edge': 'photo-1546054454-aa26e2b734c7',

  'macbook pro': 'photo-1517336714731-489689fd1ca8',
  'xps 15': 'photo-1593642632823-8f785ba67e45',
  'spectre x360': 'photo-1496181133206-80ce9b88a853',
  'thinkpad x1': 'photo-1588872657578-7efd1f1555ed',
  'zenbook pro': 'photo-1525547719571-a2d4ac8945e2',
  'predator helios': 'photo-1593642634315-48f5414c3ad9',
  'surface laptop': 'photo-1531297484001-80022131f5a1',
  'galaxy book': 'photo-1602080858428-57174f9431cf',

  'ipad pro': 'photo-1544244015-0df4b3ffc6b0',
  'galaxy tab': 'photo-1561154464-82e9adf32764',
  'surface pro': 'photo-1585790050230-5dd28404ccb9',
  'lenovo tab': 'photo-1567581935884-3349723552ca',
  'xiaomi pad': 'photo-1544244015-0df4b3ffc6b0',
  'oneplus pad': 'photo-1561154464-82e9adf32764',

  'ultrasharp': 'photo-1527443224154-c4a3942d3acf',
  'rog swift': 'photo-1616588589676-62b3bd4ff6d2',
  'predator x34': 'photo-1551645120-d70bfe84c826',
  'thinkvision': 'photo-1593642634524-b40b5baae6bb',
  'pro display': 'photo-1527443224154-c4a3942d3acf',
  'dell s2722qc': 'photo-1585792180666-f7347c490ee2',
  'ultragear': 'photo-1593640408182-31c70c8268f5',

  'mx mechanical': 'photo-1587829741301-dc798b83add3',
  'blackwidow': 'photo-1595225476474-87563907a212',
  'k70 rgb': 'photo-1618384887929-16ec33fab9ef',
  'huntsman': 'photo-1587829741301-dc798b83add3',
  'royal kludge': 'photo-1595225476474-87563907a212',
  'keychron': 'photo-1618384887929-16ec33fab9ef',
  'logitech g915': 'photo-1587829741301-dc798b83add3',

  'mx master': 'photo-1527814050087-3793815479db',
  'g502 x': 'photo-1563297007-0686b7003af7',
  'viper v3': 'photo-1615663245857-ac93bb7c39e7',
  'deathadder': 'photo-1527814050087-3793815479db',
  'model o': 'photo-1563297007-0686b7003af7',
  'superlight': 'photo-1615663245857-ac93bb7c39e7',

  'playstation 6': 'photo-1606813907291-d86efa9b94db',
  'xbox series': 'photo-1621259182978-fbf93132d53d',
  'nintendo switch': 'photo-1578303512597-81e6cc155b3e',
  'rog ally': 'photo-1592840496694-26d035b52b48',
  'steam deck': 'photo-1639815188546-c43c240ff4df',
  'ps vr3': 'photo-1622979135225-d2ba269cf1ac',
  'dualsense edge': 'photo-1606813907291-d86efa9b94db',

  'sony a1 ii': 'photo-1516035069371-29a1b244cc32',
  'canon eos': 'photo-1516035069371-29a1b244cc32',
  'nikon z9': 'photo-1510127034890-ba27508e9f1c',
  'fujifilm gfx': 'photo-1512790182412-b19e6d62bc39',
  'osmo pocket': 'photo-1495707303710-4f5c0b2d4b5a',
  'gopro hero': 'photo-1502920917128-1aa500764cbd',
  'sony zv': 'photo-1516035069371-29a1b244cc32',

  'airpods pro 3': 'photo-1600294037681-c80b4cb5b434',
  'galaxy buds 4': 'photo-1590658268037-6bf12165a8df',
  'sony wf-1000xm6': 'photo-1606220945770-b5b6c2c55bf1',
  'bose quietcomfort earbuds': 'photo-1606220945770-b5b6c2c55bf1',
  'jbl tour pro': 'photo-1598331668826-20cecc596b86',
  'nothing ear': 'photo-1588423771073-b8903fbb85b5',

  'sony wh-1000xm6': 'photo-1505740420928-5e560c06d30e',
  'bose quietcomfort ultra': 'photo-1546435770-a3e426bf472b',
  'sennheiser momentum': 'photo-1484704849700-f032a568e944',
  'ath-m50x': 'photo-1583394838336-acd977736f90',
  'jbl tour one': 'photo-1546435770-a3e426bf472b',
  'beats studio': 'photo-1505740420928-5e560c06d30e',

  'homepod 3': 'photo-1589492477829-5e65395b66cc',
  'sonos era': 'photo-1545454675-3531b543be5d',
  'jbl charge': 'photo-1608043152269-423dbba4e7e1',
  'marshall stanmore': 'photo-1545454675-3531b543be5d',

  'watch ultra 3': 'photo-1434493789847-2f02dc6ca35d',
  'galaxy watch 8': 'photo-1579586337278-3befd40fd17a',
  'pixel watch 4': 'photo-1508685096489-7aacd43bd3b1',
  'garmin fenix': 'photo-1523275335684-37898b6baf30',
  'amazfit t-rex': 'photo-1544117519-31a4b719223d',

  'anker prime 27650': 'photo-1609081219090-a6d81d3085bf',
  'ugreen 25000': 'photo-1583863788434-e58a36330cf0',
  'baseus blade': 'photo-1609081219090-a6d81d3085bf',

  'anker ganprime': 'photo-1583863788434-e58a36330cf0',
  'ugreen nexode': 'photo-1585338107529-13afc5f02586',
  'baseus 100w': 'photo-1583863788434-e58a36330cf0',
  'samsung 65w': 'photo-1585338107529-13afc5f02586',
  'apple 140w': 'photo-1583863788434-e58a36330cf0',

  '990 pro 4tb': 'photo-1597852074816-d933c7d2b988',
  'sn850x': 'photo-1544652478-6653e09f18a2',
  'firecuda 540': 'photo-1597852074816-d933c7d2b988',
  'crucial t700': 'photo-1544652478-6653e09f18a2',

  'deco be95': 'photo-1601784551446-20c9e07cdbdb',
  'orbi 970': 'photo-1544197150-b99a580bb7a8',
  'nest wifi pro': 'photo-1544197150-b99a580bb7a8',
};

// Granular Unsplash pools per product type / model keyword
const PHOTO_POOLS: Record<string, string[]> = {
  // Headphones & Earbuds
  headphone: ['photo-1505740420928-5e560c06d30e', 'photo-1546435770-a3e426bf472b', 'photo-1484704849700-f032a568e944', 'photo-1583394838336-acd977736f90'],
  earbud: ['photo-1590658268037-6bf12165a8df', 'photo-1606220588913-b3aacb4d2f46', 'photo-1572569511254-d8f925fe2cbb'],

  // Phones & Mobile
  phone: ['photo-1511707171634-5f897ff02aa9', 'photo-1598327105666-5b89351aff97', 'photo-1565849904461-04a58ad377e0', 'photo-1512058564366-18510be2db19'],

  // Laptops
  laptop: ['photo-1517336714731-489689fd1ca8', 'photo-1496181133206-80ce9b88a853', 'photo-1593642632823-8f785ba67e45', 'photo-1588872657578-7efd1f1555ed'],

  // Tablets
  tablet: ['photo-1544244015-0df4b3ffc6b0', 'photo-1561154464-82e9adf32764', 'photo-1585790050230-5dd28404ccb9'],

  // Monitors
  monitor: ['photo-1527443224154-c4a3942d3acf', 'photo-1586210579191-33b45e38fa2c', 'photo-1547119957-637f8679db1e'],

  // Keyboards
  keyboard: ['photo-1587829741301-dc798b83add3', 'photo-1618384887929-16ec33fab9ef', 'photo-1595225476474-87563907a212'],

  // Mouse
  mouse: ['photo-1615663245857-ac93bb7c39e7', 'photo-1527864550417-7fd91fc51a46', 'photo-1629429408209-1f912961dbd8'],

  // Gaming
  gaming: ['photo-1607604276583-eef5d076aa5f', 'photo-1605901309584-818e25960a8f', 'photo-1550745165-9bc0b252726f', 'photo-1592840496694-26d035b52b48'],

  // Cameras
  camera: ['photo-1516035069371-29a1b244cc32', 'photo-1526170375885-4d8ecf77b99f', 'photo-1502920917128-1aa500764cbd'],

  // Speakers & HomePod
  speaker: ['photo-1545454675-3531b543be5d', 'photo-1608043152269-423dbba4e7e1', 'photo-1508700115892-45ecd05ae2ad'],

  // Smart Watches
  watch: ['photo-1508685096489-7aacd43bd3b1', 'photo-1579586337278-3befd40fd17a', 'photo-1523275335684-37898b6baf30'],

  // Power Banks & Chargers
  charger: ['photo-1583863788434-e58a36330cf0', 'photo-1585338107529-13afc5f02586', 'photo-1609081219090-a6d81d3085bf'],

  // SSD / Storage
  ssd: ['photo-1597852074816-d933c7d2b988', 'photo-1544652478-6653e09f18a2', 'photo-1587202372775-e229f172b9d7'],

  // Routers
  router: ['photo-1544197150-b99a580bb7a8', 'photo-1601784551446-20c9e07cdbdb', 'photo-1563770660941-20978e870e26'],

  // Fashion Men
  't-shirt': ['photo-1521572267360-ee0c2909d518', 'photo-1583743814966-8936f5b7be1a', 'photo-1618354691373-d851c5c3a990'],
  shirt: ['photo-1596755094514-f87e34085b2c', 'photo-1602810318383-e386cc2a3ccf', 'photo-1620012253295-c15cc3e65df4'],
  jean: ['photo-1541099649105-f69ad21f3246', 'photo-1582552938357-32b906df40cb', 'photo-1604176354204-9268737828e4'],
  trouser: ['photo-1624378439575-d8705ad7ae80', 'photo-1473966968600-fa801b869a1a', 'photo-1506629082955-511b1aa562c8'],
  suit: ['photo-1507679799987-c73779587ccf', 'photo-1594938298603-c8148c4dae35', 'photo-1617137968427-85924c800a22'],
  jacket: ['photo-1551028719-00167b16eac5', 'photo-1544441893-675973e31985', 'photo-1548883354-7622d03aca27'],

  // Fashion Women
  dress: ['photo-1595777457583-95e059d581b8', 'photo-1572804013309-59a88b7e92f1', 'photo-1515886657613-9f3515b0c78f'],
  skirt: ['photo-1583496661160-fb5886a0aaaa', 'photo-1572804013309-59a88b7e92f1'],
  kurta: ['photo-1610030469983-98e550d6193c', 'photo-1617627143750-d86bc21e42bb'],
  saree: ['photo-1610030469983-98e550d6193c', 'photo-1617627143750-d86bc21e42bb'],
  handbag: ['photo-1584917865442-de89df76afd3', 'photo-1590874103328-eac38a683ce7'],

  // Shoes
  shoe: ['photo-1542291026-7eec264c27ff', 'photo-1525966222134-fcfa99b8ae77', 'photo-1614252235316-8c857d38b5f4'],

  // Home & Kitchen
  sofa: ['photo-1555041469-a586c61ea9bc', 'photo-1586023492125-27b2c045efd7'],
  bed: ['photo-1505693416388-ac5ce068fe85'],
  cookware: ['photo-1556911220-e15b29be8c8f', 'photo-1584992236310-6edddc08acff'],

  // Sports & Fitness
  sports: ['photo-1579952363873-27f3bade9f55', 'photo-1574629810360-7efbbe195018'],
  yoga: ['photo-1544367567-0f2fcb009e0b', 'photo-1506126613408-eca07ce68773'],

  // Automotive
  helmet: ['photo-1558981806-ec527fa84c39', 'photo-1542282088-fe8426682b8f'],
  car: ['photo-1492144534655-ae79c964c9d7', 'photo-1503376780353-7e6692767b70'],

  // Office
  office: ['photo-1544716278-ca5e3f4abd8c', 'photo-1517842645767-c639042777db'],
};

// Keyword aliases mapping model names, subcategories, and search terms to PHOTO_POOLS keys
const KEYWORD_ALIASES: Record<string, string> = {
  // Headphone & Earbud models
  'wh-1000xm6': 'headphone',
  'wh-1000xm5': 'headphone',
  'quietcomfort': 'headphone',
  'momentum': 'headphone',
  'ath-m50x': 'headphone',
  'tour one': 'headphone',
  'studio pro': 'headphone',
  'crown anc': 'headphone',
  'h9i': 'headphone',
  'headphone': 'headphone',

  'airpods': 'earbud',
  'buds': 'earbud',
  'wf-1000xm6': 'earbud',
  'tour pro': 'earbud',
  'earbud': 'earbud',
  'earphone': 'earbud',

  // Gaming models
  'playstation': 'gaming',
  'xbox': 'gaming',
  'nintendo': 'gaming',
  'dualsense': 'gaming',
  'steam deck': 'gaming',
  'rog ally': 'gaming',
  'ps vr': 'gaming',
  'game': 'gaming',
  'gaming': 'gaming',

  // Speaker models
  'homepod': 'speaker',
  'sonos': 'speaker',
  'jbl': 'speaker',
  'marshall': 'speaker',
  'echo': 'speaker',
  'speaker': 'speaker',

  // Cameras
  'sony a1': 'camera',
  'eos': 'camera',
  'nikon': 'camera',
  'fujifilm': 'camera',
  'osmo': 'camera',
  'gopro': 'camera',
  'lumix': 'camera',
  'camera': 'camera',

  // Routers
  'deco': 'router',
  'tp-link': 'router',
  'archer': 'router',
  'nighthawk': 'router',
  'mesh': 'router',
  'router': 'router',

  // SSD
  '990 pro': 'ssd',
  'sn850': 'ssd',
  'ssd': 'ssd',
  'crucial t700': 'ssd',
  'sabrent': 'ssd',

  // Chargers & Power
  'ganprime': 'charger',
  'anker': 'charger',
  'charger': 'charger',
  'power bank': 'charger',

  // Phones & Tablets & Laptops & Monitors
  'iphone': 'phone',
  'galaxy s': 'phone',
  'pixel': 'phone',
  'oneplus': 'phone',
  'xiaomi': 'phone',
  'phone': 'phone',
  'smartphone': 'phone',

  'macbook': 'laptop',
  'xps': 'laptop',
  'thinkpad': 'laptop',
  'spectre': 'laptop',
  'zenbook': 'laptop',
  'predator': 'laptop',
  'surface laptop': 'laptop',
  'laptop': 'laptop',

  'ipad': 'tablet',
  'galaxy tab': 'tablet',
  'surface pro': 'tablet',
  'tablet': 'tablet',

  'ultrasharp': 'monitor',
  'rog swift': 'monitor',
  'pro display': 'monitor',
  'monitor': 'monitor',

  'keyboard': 'keyboard',
  'mouse': 'mouse',

  // Clothing & Footwear
  't-shirt': 't-shirt',
  'shirt': 'shirt',
  'jean': 'jean',
  'trouser': 'trouser',
  'suit': 'suit',
  'jacket': 'jacket',
  'dress': 'dress',
  'skirt': 'skirt',
  'kurta': 'kurta',
  'saree': 'saree',
  'handbag': 'handbag',
  'shoe': 'shoe',
  'sneaker': 'shoe',
  'boot': 'shoe',
  'sandal': 'shoe',

  // Home & Sports & Auto & Office
  'sofa': 'sofa',
  'bed': 'bed',
  'cookware': 'cookware',
  'cricket': 'sports',
  'football': 'sports',
  'yoga': 'yoga',
  'helmet': 'helmet',
  'car': 'car',
  'printer': 'office',
  'stapler': 'office',
  'whiteboard': 'office',
};

const CATEGORY_DEFAULT_IMAGE: Record<string, string> = {
  electronics: 'photo-1498049860654-af1a5c566876',
  'fashion-men': 'photo-1617137968427-85924c800a22',
  'fashion-women': 'photo-1483985988355-763728e1935b',
  kids: 'photo-1515488042361-ee00e0ddd4e4',
  shoes: 'photo-1542291026-7eec264c27ff',
  sports: 'photo-1461896836934-ffe607ba8211',
  beauty: 'photo-1522337360788-8b13dee7a37e',
  'home-decor': 'photo-1513694203232-719a280e022f',
  kitchen: 'photo-1556911220-e15b29be8c8f',
  furniture: 'photo-1555041469-a586c61ea9bc',
  books: 'photo-1497633762265-9d179a990aa6',
  toys: 'photo-1566576912321-d58ddd7a6088',
  fitness: 'photo-1517838277536-f5f99be501cd',
  groceries: 'photo-1542838132-92c53300491e',
  'pet-supplies': 'photo-1583511655857-d19b40a7a54e',
  automotive: 'photo-1503376780353-7e6692767b70',
  'office-supplies': 'photo-1456735190827-d1262f71b8a3',
};

export function getCategoryImage(categorySlug: string): string {
  const catKey = (categorySlug || '').toLowerCase();
  const photoId = CATEGORY_DEFAULT_IMAGE[catKey] || 'photo-1498049860654-af1a5c566876';
  return toUnsplashUrl(photoId);
}

export function getProductImages(product: ProductInfo, productIndex: number = 0) {
  const nameLower = (product.name || '').toLowerCase();
  const subLower = (product.subcategory || '').toLowerCase();
  const catKey = (product.categorySlug || '').toLowerCase();

  // 0. Explicit user-provided image overrides
  for (const [customKey, photoId] of Object.entries(USER_CUSTOM_PRODUCT_IMAGES)) {
    if (nameLower.includes(customKey) || subLower.includes(customKey)) {
      return Array.from({ length: 4 }).map((_, order) => ({
        url: toUnsplashUrl(photoId),
        alt: `${product.name} — view ${order + 1}`,
        order,
      }));
    }
  }

  let pool: string[] = [];

  // 1. Search model / subcategory aliases in product name and subcategory
  for (const [alias, poolKey] of Object.entries(KEYWORD_ALIASES)) {
    if (nameLower.includes(alias) || subLower.includes(alias)) {
      if (PHOTO_POOLS[poolKey] && PHOTO_POOLS[poolKey].length > 0) {
        pool = PHOTO_POOLS[poolKey];
        break;
      }
    }
  }

  // 2. Subcategory matching fallback
  if (pool.length === 0 && subLower.length > 0) {
    for (const [poolKey, photos] of Object.entries(PHOTO_POOLS)) {
      if (subLower.includes(poolKey) || poolKey.includes(subLower)) {
        pool = photos;
        break;
      }
    }
  }

  // 3. Main category pool from image-pools.ts
  if (pool.length === 0 && imagePools[catKey] && imagePools[catKey].length > 0) {
    pool = imagePools[catKey];
  }

  // 4. Ultimate fallback pool
  if (pool.length === 0) {
    pool = [
      'photo-1498049860654-af1a5c566876',
      'photo-1505740420928-5e560c06d30e',
      'photo-1523275335684-37898b6baf30',
      'photo-1517336714731-489689fd1ca8',
      'photo-1542291026-7eec264c27ff',
    ];
  }

  const identity = `${product.name}:${product.brand || 'generic'}:${productIndex}`;
  const hash = simpleHash(identity);

  return Array.from({ length: 4 }).map((_, order) => {
    const photoIdx = (hash + order * 3 + productIndex * 7) % pool.length;
    const photoId = pool[photoIdx];
    return {
      url: toUnsplashUrl(photoId),
      alt: `${product.name} — view ${order + 1}`,
      order,
    };
  });
}
