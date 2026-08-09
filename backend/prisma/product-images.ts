import { imagePools } from './image-pools';
import { USER_CATALOG, findCatalogProduct } from './user-catalog';

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

/**
 * Hosts that are NOT allowed as product/category images.
 *
 * The catalog was previously "enriched" by a script that rotated the same
 * handful of generic Pinterest CDN images across EVERY category (phones,
 * fashion, footwear, groceries, home — the same pin URL was assigned to a
 * notebook, a t-shirt AND a phone). Those URLs can never depict the product
 * reliably, they render inconsistently in real browsers, and they caused the
 * cross-category mismatches reported in production. They are hard-blocked here
 * so every resolution branch falls through to the verified Unsplash pools.
 */
const BLOCKED_IMAGE_HOSTS: string[] = [];

export function isBlockedImageUrl(url: string | null | undefined): boolean {
  if (!url) return true;
  try {
    return BLOCKED_IMAGE_HOSTS.some((host) => new URL(url).hostname === host);
  } catch {
    return true; // unparseable URL is never valid as an image
  }
}

function toUnsplashUrl(photoId: string): string {
  if (!photoId) return '';
  const trimmed = photoId.trim();
  if (trimmed.startsWith('http')) {
    // Preserve full URLs only when they come from an allowed, non-blocked host.
    if (isBlockedImageUrl(trimmed)) return '';
    return trimmed;
  }
  const cleanId = trimmed.replace(/[^\w-]/g, '');
  if (!cleanId) return '';
  return `https://images.unsplash.com/${cleanId}?auto=format&fit=crop&w=800&q=80`;
}

/** Pick `count` unique image URLs deterministically from a pool. */
function pickUniqueImages(
  pool: string[],
  identity: string,
  productIndex: number,
  count = 4,
): string[] {
    if (!pool || pool.length === 0) return [];
  const hash = simpleHash(identity);
  const seen = new Set<string>();
  const result: string[] = [];
  let step = 0;
  let guard = 0;
  while (result.length < count && guard < 200) {
    guard += 1;
    const idx = (hash + result.length * 3 + productIndex * 7 + step * 5) % pool.length;
    const url = toUnsplashUrl(pool[idx]);
    step += 1;
    if (url && !seen.has(url)) {
      seen.add(url);
      result.push(url);
    }
  }
  return result;
}

// User-provided explicit product image overrides
const USER_CUSTOM_PRODUCT_IMAGES: Record<string, string> = {
  'xiaomi pad 7 pro': 'https://images.unsplash.com/photo-1569770218135-bea267ed7e84?auto=format&fit=crop&w=800&q=80',
  'lenovo tab p14': 'https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=800&q=80',
  'deathadder v3 pro': 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80',
  'viper v3 pro': 'https://images.unsplash.com/photo-1629429408209-1f912961dbd8?auto=format&fit=crop&w=800&q=80',
  'g502 x plus': 'https://images.unsplash.com/photo-1563297007-0686b7003af7?auto=format&fit=crop&w=800&q=80',
  'mx master 4s': 'https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=800&q=80',
  'model o 2 pro': 'https://images.unsplash.com/photo-1629429408209-1f912961dbd8?auto=format&fit=crop&w=800&q=80',
  'g pro x superlight 2': 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80',
  'superlight 3': 'https://images.unsplash.com/photo-1629429408209-1f912961dbd8?auto=format&fit=crop&w=800&q=80',
  'sony wh-1000xm6 noise cancelling': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
  'executive leather notebook': 'https://i.pinimg.com/736x/90/c0/f8/90c0f82b8f61c346a172a424d4d0b10a.jpg',
  'premium leather journal': 'https://i.pinimg.com/736x/04/fa/33/04fa332e1b25caeb2d3f41e6081cc036.jpg',
  'gel ink pen pack': 'https://i.pinimg.com/1200x/56/90/6b/56906b484cbff51bab870f71be30d76a.jpg',
  'luxury ballpoint pen set': 'https://i.pinimg.com/736x/0d/18/3c/0d183c89e52f1da07091a03265d1c6cc.jpg',
  'all-in-one laser printer': 'https://i.pinimg.com/736x/91/c3/82/91c382be2031c07666296ed9e5db4eeb.jpg',
  'wireless laser printer': 'https://i.pinimg.com/736x/6d/90/dd/6d90dd9d83f45259cb9972f948ed0528.jpg',
  'magnetic dry-erase whiteboard': 'https://i.pinimg.com/1200x/df/d9/c7/dfd9c762d76443ff23d75ba6db7a8d52.jpg',
  'desk organizer': 'https://i.pinimg.com/1200x/9c/27/2a/9c272a151e946a5f6e82b00f1d3d8208.jpg',
  'document file organizer': 'https://i.pinimg.com/736x/17/67/c6/1767c6554d750bff3cd80b2334d49fbe.jpg',
  'sticky notes set': 'https://i.pinimg.com/736x/61/95/72/6195724cfcdca1c9970adbe2bef6d431.jpg',
  'educational building block set': 'https://i.pinimg.com/1200x/9c/09/4d/9c094d4dd0217085ee081cb07494a2c1.jpg',
  'full face motorcycle helmet': 'https://i.pinimg.com/1200x/f9/11/ad/f911ad7da3e9e200d1dfe15ec5c220c0.jpg',
  'sport bike racing helmet': 'https://i.pinimg.com/736x/c1/27/06/c127061fad7834931f9b8a1bf0e19eaf.jpg',
  'modular motorcycle helmet': 'https://i.pinimg.com/1200x/35/7c/c9/357cc9de5083ac8ad3914e4c7d89cfd3.jpg',
  'leather motorcycle riding jacket': 'https://i.pinimg.com/736x/0c/97/25/0c9725a2a235f40d57ff49e2be64dce7.jpg',
  'premium biker jacket': 'https://i.pinimg.com/1200x/a0/aa/04/a0aa04c014ea8684ce5344ccf9594289.jpg',
  'english willow cricket bat': 'https://i.pinimg.com/736x/8f/ae/29/8fae29b50269b647015941d2b0c5da70.jpg',
  'official size 5 football': 'https://i.pinimg.com/736x/3c/eb/83/3ceb8345436ddfeed76b421e669a0bc5.jpg',
  'anti-burst yoga mat': 'https://i.pinimg.com/736x/18/26/16/182616c7c012a82a569cd25d49ac2f9f.jpg',
  'adjustable dumbbell set': 'https://i.pinimg.com/736x/fd/8a/0f/fd8a0f1777dc88efa38e8ad81f8a14c0.jpg',
  'whey protein isolate': 'https://i.pinimg.com/736x/2b/11/42/2b1142d9a0be3e3fcba05ed73184702a.jpg',
  'matte liquid lipstick': 'https://i.pinimg.com/736x/6e/fd/ad/6efdadbcf8b9a972a37517574b743f29.jpg',
  'vitamin c serum 30ml': 'https://i.pinimg.com/736x/72/6f/b0/726fb07219ee1bc015dbca0b5ceee99c.jpg',
  'hydrating shampoo 500ml': 'https://i.pinimg.com/1200x/e7/73/3c/e7733c16f0f787c2493fa061e46b3efc.jpg',
  'eau de parfum 100ml spray': 'https://i.pinimg.com/736x/79/13/c6/7913c6429723d5ab11904e8a5e8e96c8.jpg',
  'skipping rope': 'https://i.pinimg.com/736x/30/71/5c/30715c525c71514484ae1d439e13b547.jpg',
  'protein shaker bottle': 'https://i.pinimg.com/736x/45/6f/30/456f304ad449ca559f24ac1db4d21630.jpg',
  'resistance bands set': 'https://i.pinimg.com/1200x/52/81/28/528128616a0aab11c6f6e08e8216c7a0.jpg',
  'sports water bottle': 'https://i.pinimg.com/1200x/39/a7/41/39a741abd3192dcbb7dd0e7ef98e44ce.jpg',
  'aloe vera face wash': 'https://i.pinimg.com/736x/d7/2d/eb/d72deb53c947f5490f50e979bbd0fa00.jpg',
  'broad spectrum sunscreen spf50': 'https://i.pinimg.com/736x/7b/ea/52/7bea52faf7c5fb40e281d8504c0b1311.jpg',
  'hair dryer 2000w': 'https://i.pinimg.com/1200x/11/a6/ec/11a6ecbacdc5ea97375e7264362b981e.jpg',
  'motorcycle riding gloves': 'https://i.pinimg.com/736x/de/70/0a/de700ac1ba55cd074fb881d25dafd45f.jpg',
  'motorcycle riding boots': 'https://i.pinimg.com/1200x/fc/c9/70/fcc970ec83bf3246a9f35ab0b6fa0897.jpg',
  'synthetic engine oil': 'https://i.pinimg.com/1200x/0e/2a/04/0e2a043f0bb2c5dadd2f8b8029815132.jpg',
  'motorcycle engine oil bottle': 'https://i.pinimg.com/1200x/1a/22/9c/1a229c5dbd66a9d756a2dbad6cc016c5.jpg',
  'car pressure washer': 'https://i.pinimg.com/1200x/97/28/1a/97281a1a749eecd540d73c8495064c5a.jpg',
  'car cleaning kit': 'https://i.pinimg.com/1200x/c5/31/ad/c531adb9c70ceedbe0a5acc027f24ede.jpg',
  'fresh full cream milk': 'https://i.pinimg.com/736x/90/c0/f8/90c0f82b8f61c346a172a424d4d0b10a.jpg',
  'toned milk': 'https://i.pinimg.com/736x/f8/6a/bc/f86abced150f6dcdbe0468e16296810b.jpg',
  'organic milk': 'https://i.pinimg.com/736x/7d/d2/15/7dd21547d9a806eb7405ae816879cd4a.jpg',
  'almond milk': 'https://i.pinimg.com/1200x/73/5c/48/735c48ac1c83075d9f4ff585685e6986.jpg',
  'soy milk': 'https://i.pinimg.com/736x/91/c3/82/91c382be2031c07666296ed9e5db4eeb.jpg',
  'greek yogurt': 'https://i.pinimg.com/736x/d3/19/25/d3192541fb421d1d11dbf44be370be5e.jpg',
  'fresh curd': 'https://i.pinimg.com/1200x/74/3e/e9/743ee97edc537591513633ea243a68bc.jpg',
  'paneer': 'https://i.pinimg.com/736x/44/63/10/446310856511784dd1cddb8793216302.jpg',
  'cheddar cheese': 'https://i.pinimg.com/1200x/9a/69/fd/9a69fd3de5f4ffed740c9572f14fb3f6.jpg',
  'mozzarella cheese': 'https://i.pinimg.com/736x/61/95/72/6195724cfcdca1c9970adbe2bef6d431.jpg',
  'butter': 'https://i.pinimg.com/736x/52/67/08/5267081d906b39f15e9215b4def7b47b.jpg',
  'ghee': 'https://i.pinimg.com/1200x/9c/09/4d/9c094d4dd0217085ee081cb07494a2c1.jpg',
  'basmati rice': 'https://i.pinimg.com/1200x/e0/66/6a/e0666ac79dd84342fa045700bdefc034.jpg',
  'brown rice': 'https://i.pinimg.com/736x/b2/27/3c/b2273c55f962bdf9d40f6eedf853de00.jpg',
  'sona masoori rice': 'https://i.pinimg.com/1200x/04/fa/f1/04faf1a4117fb9871c274ec8232f9568.jpg',
  'jasmine rice': 'https://i.pinimg.com/736x/46/ff/c9/46ffc92b94f385e9f0409867eafb4de8.jpg',
  'quinoa': 'https://i.pinimg.com/736x/a1/97/f8/a197f86d875ddfb4cf8d4df8393b54e0.jpg',
  'oats': 'https://i.pinimg.com/736x/66/dc/cb/66dccbcb14233313ae85263642248f4c.jpg',
  'wheat flour': 'https://i.pinimg.com/1200x/9c/e1/49/9ce149a9d46bb6b67a2f92ec9d095149.jpg',
  'multigrain flour': 'https://i.pinimg.com/736x/6c/8b/b1/6c8bb190e39a3d8ddf4754f64136e954.jpg',
  'ragi flour': 'https://i.pinimg.com/736x/60/bf/b2/60bfb2479e972ea9ee982946a436eacf.jpg',
  'bajra flour': 'https://i.pinimg.com/736x/9d/be/ac/9dbeaca8f7ad3e3f6e5176852188448f.jpg',
  'jowar flour': 'https://i.pinimg.com/736x/7a/85/ba/7a85bab7a52d5ff8c383d278aed905ae.jpg',
  'poha': 'https://i.pinimg.com/736x/c2/10/12/c21012153f1da26b39f8a7160360e583.jpg',
  'toor dal': 'https://i.pinimg.com/736x/b3/ac/35/b3ac350b0ca1f8d5909f61b81ace276b.jpg',
  'moong dal': 'https://i.pinimg.com/736x/ee/bf/82/eebf82977eca882618ee9d4742e54fd4.jpg',
  'masoor dal': 'https://i.pinimg.com/736x/0c/97/25/0c9725a2a235f40d57ff49e2be64dce7.jpg',
  'chana dal': 'https://i.pinimg.com/1200x/b8/36/a2/b836a2dcedd53ae310416c2599a0a7d6.jpg',
  'urad dal': 'https://i.pinimg.com/736x/de/70/0a/de700ac1ba55cd074fb881d25dafd45f.jpg',
  'moong whole': 'https://i.pinimg.com/1200x/fc/c9/70/fcc970ec83bf3246a9f35ab0b6fa0897.jpg',
  'black chana': 'https://i.pinimg.com/1200x/0e/2a/04/0e2a043f0bb2c5dadd2f8b8029815132.jpg',
  'kabuli chana': 'https://i.pinimg.com/1200x/1a/22/9c/1a229c5dbd66a9d756a2dbad6cc016c5.jpg',
  'rajma': 'https://i.pinimg.com/1200x/97/28/1a/97281a1a749eecd540d73c8495064c5a.jpg',
  'lobia': 'https://i.pinimg.com/1200x/c5/31/ad/c531adb9c70ceedbe0a5acc027f24ede.jpg',
  'green peas': 'https://i.pinimg.com/736x/7d/d2/15/7dd21547d9a806eb7405ae816879cd4a.jpg',
  'mixed dal': 'https://i.pinimg.com/1200x/ba/d5/77/bad5770f437f1d95a70de20175464bda.jpg',
  'potato': 'https://i.pinimg.com/736x/97/14/fb/9714fbfc0fe4761842a16bbf3622f88c.jpg',
  'onion': 'https://i.pinimg.com/736x/d5/64/26/d56426cc8ad6a77dbb03e7e9ed5ffda3.jpg',
  'tomato': 'https://i.pinimg.com/736x/24/85/69/248569e562fc906baf54dbf9a9251112.jpg',
  'carrot': 'https://i.pinimg.com/1200x/f2/cf/35/f2cf35e863abad46bea5d3e1eb483404.jpg',
  'cucumber': 'https://i.pinimg.com/1200x/ab/03/1d/ab031db73e8ee1bf1c566f4b58fa0fcf.jpg',
  'cauliflower': 'https://i.pinimg.com/1200x/24/9c/14/249c14f8278394ba6b7070b66892fc51.jpg',
  'broccoli': 'https://i.pinimg.com/736x/01/8f/8a/018f8adb63275f1ed917e7082373978e.jpg',
  'spinach': 'https://i.pinimg.com/736x/05/43/e0/0543e09d6fa1150b7b243004d28c989e.jpg',
  'bell pepper': 'https://i.pinimg.com/1200x/20/d3/ce/20d3cebe1bb19b1b94800fdf5d650a90.jpg',
  'green beans': 'https://i.pinimg.com/736x/90/c0/f8/90c0f82b8f61c346a172a424d4d0b10a.jpg',
  'brinjal': 'https://i.pinimg.com/736x/f8/6a/bc/f86abced150f6dcdbe0468e16296810b.jpg',
  'apples': 'https://i.pinimg.com/1200x/73/5c/48/735c48ac1c83075d9f4ff585685e6986.jpg',
  'bananas': 'https://i.pinimg.com/736x/91/c3/82/91c382be2031c07666296ed9e5db4eeb.jpg',
  'oranges': 'https://i.pinimg.com/736x/d3/19/25/d3192541fb421d1d11dbf44be370be5e.jpg',
  'mangoes': 'https://i.pinimg.com/1200x/74/3e/e9/743ee97edc537591513633ea243a68bc.jpg',
  'grapes': 'https://i.pinimg.com/736x/44/63/10/446310856511784dd1cddb8793216302.jpg',
  'watermelon': 'https://i.pinimg.com/1200x/9a/69/fd/9a69fd3de5f4ffed740c9572f14fb3f6.jpg',
  'papaya': 'https://i.pinimg.com/736x/61/95/72/6195724cfcdca1c9970adbe2bef6d431.jpg',
  'pomegranate': 'https://i.pinimg.com/736x/52/67/08/5267081d906b39f15e9215b4def7b47b.jpg',
  'pineapple': 'https://i.pinimg.com/1200x/9c/09/4d/9c094d4dd0217085ee081cb07494a2c1.jpg',
  'guava': 'https://i.pinimg.com/1200x/e0/66/6a/e0666ac79dd84342fa045700bdefc034.jpg',
  'kiwi': 'https://i.pinimg.com/736x/b2/27/3c/b2273c55f962bdf9d40f6eedf853de00.jpg',
  'strawberries': 'https://i.pinimg.com/1200x/04/fa/f1/04faf1a4117fb9871c274ec8232f9568.jpg',
  'almonds': 'https://i.pinimg.com/736x/46/ff/c9/46ffc92b94f385e9f0409867eafb4de8.jpg',
  'cashews': 'https://i.pinimg.com/736x/a1/97/f8/a197f86d875ddfb4cf8d4df8393b54e0.jpg',
  'walnuts': 'https://i.pinimg.com/736x/66/dc/cb/66dccbcb14233313ae85263642248f4c.jpg',
  'pistachios': 'https://i.pinimg.com/1200x/9c/e1/49/9ce149a9d46bb6b67a2f92ec9d095149.jpg',
  'raisins': 'https://i.pinimg.com/736x/6c/8b/b1/6c8bb190e39a3d8ddf4754f64136e954.jpg',
  'dates': 'https://i.pinimg.com/736x/60/bf/b2/60bfb2479e972ea9ee982946a436eacf.jpg',
  'dried figs': 'https://i.pinimg.com/736x/9d/be/ac/9dbeaca8f7ad3e3f6e5176852188448f.jpg',
  'dried apricots': 'https://i.pinimg.com/736x/7a/85/ba/7a85bab7a52d5ff8c383d278aed905ae.jpg',
  'peanuts': 'https://i.pinimg.com/736x/c2/10/12/c21012153f1da26b39f8a7160360e583.jpg',
  'pumpkin seeds': 'https://i.pinimg.com/736x/b3/ac/35/b3ac350b0ca1f8d5909f61b81ace276b.jpg',
  'chia seeds': 'https://i.pinimg.com/736x/ee/bf/82/eebf82977eca882618ee9d4742e54fd4.jpg',
  'mixed dry fruits': 'https://i.pinimg.com/736x/0c/97/25/0c9725a2a235f40d57ff49e2be64dce7.jpg',
  'turmeric powder': 'https://i.pinimg.com/1200x/b8/36/a2/b836a2dcedd53ae310416c2599a0a7d6.jpg',
  'red chilli powder': 'https://i.pinimg.com/736x/de/70/0a/de700ac1ba55cd074fb881d25dafd45f.jpg',
  'coriander powder': 'https://i.pinimg.com/1200x/fc/c9/70/fcc970ec83bf3246a9f35ab0b6fa0897.jpg',
  'cumin seeds': 'https://i.pinimg.com/1200x/0e/2a/04/0e2a043f0bb2c5dadd2f8b8029815132.jpg',
  'black pepper': 'https://i.pinimg.com/1200x/1a/22/9c/1a229c5dbd66a9d756a2dbad6cc016c5.jpg',
  'garam masala': 'https://i.pinimg.com/1200x/97/28/1a/97281a1a749eecd540d73c8495064c5a.jpg',
  'chaat masala': 'https://i.pinimg.com/1200x/c5/31/ad/c531adb9c70ceedbe0a5acc027f24ede.jpg',
  'kitchen king masala': 'https://i.pinimg.com/736x/90/95/2e/90952e9d35a04edbd67eb8eed0f72635.jpg',
  'mustard seeds': 'https://i.pinimg.com/1200x/ba/d5/77/bad5770f437f1d95a70de20175464bda.jpg',
  'fennel seeds': 'https://i.pinimg.com/736x/97/14/fb/9714fbfc0fe4761842a16bbf3622f88c.jpg',
  'cardamom': 'https://i.pinimg.com/736x/d5/64/26/d56426cc8ad6a77dbb03e7e9ed5ffda3.jpg',
  'cinnamon': 'https://i.pinimg.com/736x/24/85/69/248569e562fc906baf54dbf9a9251112.jpg',
  'sunflower oil': 'https://i.pinimg.com/1200x/f2/cf/35/f2cf35e863abad46bea5d3e1eb483404.jpg',
  'mustard oil': 'https://i.pinimg.com/1200x/ab/03/1d/ab031db73e8ee1bf1c566f4b58fa0fcf.jpg',
  'olive oil': 'https://i.pinimg.com/1200x/24/9c/14/249c14f8278394ba6b7070b66892fc51.jpg',
  'coconut oil': 'https://i.pinimg.com/736x/01/8f/8a/018f8adb63275f1ed917e7082373978e.jpg',
  'rice bran oil': 'https://i.pinimg.com/736x/05/43/e0/0543e09d6fa1150b7b243004d28c989e.jpg',
  'sugar': 'https://i.pinimg.com/1200x/20/d3/ce/20d3cebe1bb19b1b94800fdf5d650a90.jpg',
  'brown sugar': 'https://i.pinimg.com/736x/90/c0/f8/90c0f82b8f61c346a172a424d4d0b10a.jpg',
  'jaggery': 'https://i.pinimg.com/736x/f8/6a/bc/f86abced150f6dcdbe0468e16296810b.jpg',
  'salt': 'https://i.pinimg.com/736x/7d/d2/15/7dd21547d9a806eb7405ae816879cd4a.jpg',
  'rock salt': 'https://i.pinimg.com/1200x/73/5c/48/735c48ac1c83075d9f4ff585685e6986.jpg',
  'honey': 'https://i.pinimg.com/736x/91/c3/82/91c382be2031c07666296ed9e5db4eeb.jpg',
  'vinegar': 'https://i.pinimg.com/736x/d3/19/25/d3192541fb421d1d11dbf44be370be5e.jpg',
  'chocolate biscuits': 'https://i.pinimg.com/1200x/74/3e/e9/743ee97edc537591513633ea243a68bc.jpg',
  'cream biscuits': 'https://i.pinimg.com/736x/44/63/10/446310856511784dd1cddb8793216302.jpg',
  'digestive biscuits': 'https://i.pinimg.com/1200x/9a/69/fd/9a69fd3de5f4ffed740c9572f14fb3f6.jpg',
  'salted crackers': 'https://i.pinimg.com/736x/61/95/72/6195724cfcdca1c9970adbe2bef6d431.jpg',
  'potato chips': 'https://i.pinimg.com/736x/52/67/08/5267081d906b39f15e9215b4def7b47b.jpg',
  'banana chips': 'https://i.pinimg.com/1200x/9c/09/4d/9c094d4dd0217085ee081cb07494a2c1.jpg',
  'nachos': 'https://i.pinimg.com/1200x/e0/66/6a/e0666ac79dd84342fa045700bdefc034.jpg',
  'popcorn': 'https://i.pinimg.com/736x/b2/27/3c/b2273c55f962bdf9d40f6eedf853de00.jpg',
  'namkeen': 'https://i.pinimg.com/1200x/04/fa/f1/04faf1a4117fb9871c274ec8232f9568.jpg',
  'bhujia': 'https://i.pinimg.com/736x/46/ff/c9/46ffc92b94f385e9f0409867eafb4de8.jpg',
  'roasted peanuts': 'https://i.pinimg.com/736x/a1/97/f8/a197f86d875ddfb4cf8d4df8393b54e0.jpg',
  'granola bars': 'https://i.pinimg.com/736x/66/dc/cb/66dccbcb14233313ae85263642248f4c.jpg',
  'tomato ketchup': 'https://i.pinimg.com/1200x/9c/e1/49/9ce149a9d46bb6b67a2f92ec9d095149.jpg',
  'pasta sauce': 'https://i.pinimg.com/736x/6c/8b/b1/6c8bb190e39a3d8ddf4754f64136e954.jpg',
  'mayonnaise': 'https://i.pinimg.com/736x/60/bf/b2/60bfb2479e972ea9ee982946a436eacf.jpg',
  'peanut butter': 'https://i.pinimg.com/736x/9d/be/ac/9dbeaca8f7ad3e3f6e5176852188448f.jpg',
  'jam': 'https://i.pinimg.com/736x/7a/85/ba/7a85bab7a52d5ff8c383d278aed905ae.jpg',
  'instant noodles': 'https://i.pinimg.com/736x/c2/10/12/c21012153f1da26b39f8a7160360e583.jpg',
  'pasta': 'https://i.pinimg.com/736x/b3/ac/35/b3ac350b0ca1f8d5909f61b81ace276b.jpg',
  'canned sweet corn': 'https://i.pinimg.com/736x/ee/bf/82/eebf82977eca882618ee9d4742e54fd4.jpg',
  'canned beans': 'https://i.pinimg.com/736x/0c/97/25/0c9725a2a235f40d57ff49e2be64dce7.jpg',
  'baked beans': 'https://i.pinimg.com/1200x/b8/36/a2/b836a2dcedd53ae310416c2599a0a7d6.jpg',
  'ready-to-eat meals': 'https://i.pinimg.com/736x/de/70/0a/de700ac1ba55cd074fb881d25dafd45f.jpg',
  'instant soup': 'https://i.pinimg.com/1200x/fc/c9/70/fcc970ec83bf3246a9f35ab0b6fa0897.jpg',
  'green tea': 'https://i.pinimg.com/1200x/0e/2a/04/0e2a043f0bb2c5dadd2f8b8029815132.jpg',
  'black tea': 'https://i.pinimg.com/1200x/1a/22/9c/1a229c5dbd66a9d756a2dbad6cc016c5.jpg',
  'masala tea': 'https://i.pinimg.com/1200x/97/28/1a/97281a1a749eecd540d73c8495064c5a.jpg',
  'coffee': 'https://i.pinimg.com/1200x/c5/31/ad/c531adb9c70ceedbe0a5acc027f24ede.jpg',
  'instant coffee': 'https://i.pinimg.com/736x/90/95/2e/90952e9d35a04edbd67eb8eed0f72635.jpg',
  'hot chocolate': 'https://i.pinimg.com/1200x/ba/d5/77/bad5770f437f1d95a70de20175464bda.jpg',
  'fruit juice': 'https://i.pinimg.com/736x/97/14/fb/9714fbfc0fe4761842a16bbf3622f88c.jpg',
  'coconut water': 'https://i.pinimg.com/736x/d5/64/26/d56426cc8ad6a77dbb03e7e9ed5ffda3.jpg',
  'energy drink': 'https://i.pinimg.com/736x/24/85/69/248569e562fc906baf54dbf9a9251112.jpg',
  'packaged drinking water': 'https://i.pinimg.com/1200x/f2/cf/35/f2cf35e863abad46bea5d3e1eb483404.jpg',
  'soft drink': 'https://i.pinimg.com/1200x/ab/03/1d/ab031db73e8ee1bf1c566f4b58fa0fcf.jpg',
  'iced tea': 'https://i.pinimg.com/1200x/24/9c/14/249c14f8278394ba6b7070b66892fc51.jpg',
  'frozen green peas': 'https://i.pinimg.com/736x/01/8f/8a/018f8adb63275f1ed917e7082373978e.jpg',
  'frozen corn': 'https://i.pinimg.com/736x/05/43/e0/0543e09d6fa1150b7b243004d28c989e.jpg',
  'frozen mixed vegetables': 'https://i.pinimg.com/1200x/20/d3/ce/20d3cebe1bb19b1b94800fdf5d650a90.jpg',
  'frozen french fries': 'https://i.pinimg.com/736x/90/c0/f8/90c0f82b8f61c346a172a424d4d0b10a.jpg',
  'frozen paratha': 'https://i.pinimg.com/736x/f8/6a/bc/f86abced150f6dcdbe0468e16296810b.jpg',
  'frozen samosa': 'https://i.pinimg.com/736x/7d/d2/15/7dd21547d9a806eb7405ae816879cd4a.jpg',
  'frozen spring rolls': 'https://i.pinimg.com/1200x/73/5c/48/735c48ac1c83075d9f4ff585685e6986.jpg',
  'frozen paneer': 'https://i.pinimg.com/736x/91/c3/82/91c382be2031c07666296ed9e5db4eeb.jpg',
  'frozen berries': 'https://i.pinimg.com/736x/d3/19/25/d3192541fb421d1d11dbf44be370be5e.jpg',
  'frozen sweet corn': 'https://i.pinimg.com/1200x/74/3e/e9/743ee97edc537591513633ea243a68bc.jpg',
  'frozen snacks': 'https://i.pinimg.com/736x/44/63/10/446310856511784dd1cddb8793216302.jpg',
  'frozen ready meals': 'https://i.pinimg.com/1200x/9a/69/fd/9a69fd3de5f4ffed740c9572f14fb3f6.jpg',
  'modern 3-seater sofa': 'https://i.pinimg.com/736x/90/c0/f8/90c0f82b8f61c346a172a424d4d0b10a.jpg',
  'l-shaped sectional sofa': 'https://i.pinimg.com/736x/f8/6a/bc/f86abced150f6dcdbe0468e16296810b.jpg',
  'velvet sofa': 'https://i.pinimg.com/736x/7d/d2/15/7dd21547d9a806eb7405ae816879cd4a.jpg',
  'leather sofa': 'https://i.pinimg.com/1200x/73/5c/48/735c48ac1c83075d9f4ff585685e6986.jpg',
  'recliner sofa': 'https://i.pinimg.com/736x/91/c3/82/91c382be2031c07666296ed9e5db4eeb.jpg',
  'chesterfield sofa': 'https://i.pinimg.com/736x/d3/19/25/d3192541fb421d1d11dbf44be370be5e.jpg',
  'modular sofa': 'https://i.pinimg.com/1200x/74/3e/e9/743ee97edc537591513633ea243a68bc.jpg',
  'loveseat sofa': 'https://i.pinimg.com/736x/44/63/10/446310856511784dd1cddb8793216302.jpg',
  'sleeper sofa': 'https://i.pinimg.com/1200x/9a/69/fd/9a69fd3de5f4ffed740c9572f14fb3f6.jpg',
  'minimalist sofa': 'https://i.pinimg.com/736x/61/95/72/6195724cfcdca1c9970adbe2bef6d431.jpg',
  'u-shaped sectional sofa': 'https://i.pinimg.com/736x/52/67/08/5267081d906b39f15e9215b4def7b47b.jpg',
  'boucle sofa': 'https://i.pinimg.com/1200x/9c/09/4d/9c094d4dd0217085ee081cb07494a2c1.jpg',
  'king size platform bed': 'https://i.pinimg.com/1200x/e0/66/6a/e0666ac79dd84342fa045700bdefc034.jpg',
  'queen size upholstered bed': 'https://i.pinimg.com/736x/b2/27/3c/b2273c55f962bdf9d40f6eedf853de00.jpg',
  'wooden king bed': 'https://i.pinimg.com/1200x/04/fa/f1/04faf1a4117fb9871c274ec8232f9568.jpg',
  'storage bed': 'photo-1505693416388-ac5ce068fe85',
  'upholstered bed': 'https://i.pinimg.com/736x/a1/97/f8/a197f86d875ddfb4cf8d4df8393b54e0.jpg',
  'canopy bed': 'https://i.pinimg.com/736x/66/dc/cb/66dccbcb14233313ae85263642248f4c.jpg',
  'four poster bed': 'https://i.pinimg.com/1200x/9c/e1/49/9ce149a9d46bb6b67a2f92ec9d095149.jpg',
  'platform bed': 'https://i.pinimg.com/736x/6c/8b/b1/6c8bb190e39a3d8ddf4754f64136e954.jpg',
  'hydraulic storage bed': 'https://i.pinimg.com/736x/60/bf/b2/60bfb2479e972ea9ee982946a436eacf.jpg',
  'metal frame bed': 'https://i.pinimg.com/736x/9d/be/ac/9dbeaca8f7ad3e3f6e5176852188448f.jpg',
  'minimalist wooden bed': 'https://i.pinimg.com/736x/7a/85/ba/7a85bab7a52d5ff8c383d278aed905ae.jpg',
  'tufted headboard bed': 'https://i.pinimg.com/736x/c2/10/12/c21012153f1da26b39f8a7160360e583.jpg',
  '6-seater wooden dining table': 'https://i.pinimg.com/736x/b3/ac/35/b3ac350b0ca1f8d5909f61b81ace276b.jpg',
  '4-seater dining table': 'https://i.pinimg.com/736x/ee/bf/82/eebf82977eca882618ee9d4742e54fd4.jpg',
  '8-seater dining table': 'https://i.pinimg.com/736x/0c/97/25/0c9725a2a235f40d57ff49e2be64dce7.jpg',
  'round dining table': 'https://i.pinimg.com/1200x/b8/36/a2/b836a2dcedd53ae310416c2599a0a7d6.jpg',
  'glass dining table': 'https://i.pinimg.com/736x/de/70/0a/de700ac1ba55cd074fb881d25dafd45f.jpg',
  'marble dining table': 'https://i.pinimg.com/1200x/fc/c9/70/fcc970ec83bf3246a9f35ab0b6fa0897.jpg',
  'extendable dining table': 'https://i.pinimg.com/1200x/0e/2a/04/0e2a043f0bb2c5dadd2f8b8029815132.jpg',
  'modern dining table': 'https://i.pinimg.com/1200x/1a/22/9c/1a229c5dbd66a9d756a2dbad6cc016c5.jpg',
  'solid wood dining table': 'https://i.pinimg.com/1200x/97/28/1a/97281a1a749eecd540d73c8495064c5a.jpg',
  'industrial dining table': 'https://i.pinimg.com/1200x/c5/31/ad/c531adb9c70ceedbe0a5acc027f24ede.jpg',
  'oval dining table': 'https://i.pinimg.com/736x/90/95/2e/90952e9d35a04edbd67eb8eed0f72635.jpg',
  'minimalist dining table': 'https://i.pinimg.com/1200x/ba/d5/77/bad5770f437f1d95a70de20175464bda.jpg',
  'ergonomic office chair': 'https://i.pinimg.com/736x/97/14/fb/9714fbfc0fe4761842a16bbf3622f88c.jpg',
  'executive leather office chair': 'https://i.pinimg.com/736x/d5/64/26/d56426cc8ad6a77dbb03e7e9ed5ffda3.jpg',
  'mesh office chair': 'photo-1580480055273-228ff5388ef8',
  'high back office chair': 'https://i.pinimg.com/1200x/f2/cf/35/f2cf35e863abad46bea5d3e1eb483404.jpg',
  'gaming office chair': 'https://i.pinimg.com/1200x/ab/03/1d/ab031db73e8ee1bf1c566f4b58fa0fcf.jpg',
  'mid back office chair': 'https://i.pinimg.com/1200x/24/9c/14/249c14f8278394ba6b7070b66892fc51.jpg',
  'adjustable office chair': 'https://i.pinimg.com/736x/01/8f/8a/018f8adb63275f1ed917e7082373978e.jpg',
  'lumbar support chair': 'https://i.pinimg.com/736x/05/43/e0/0543e09d6fa1150b7b243004d28c989e.jpg',
  'swivel office chair': 'https://i.pinimg.com/1200x/20/d3/ce/20d3cebe1bb19b1b94800fdf5d650a90.jpg',
  'executive ergonomic chair': 'https://i.pinimg.com/736x/90/c0/f8/90c0f82b8f61c346a172a424d4d0b10a.jpg',
  'fabric office chair': 'https://i.pinimg.com/736x/f8/6a/bc/f86abced150f6dcdbe0468e16296810b.jpg',
  'conference office chair': 'https://i.pinimg.com/736x/7d/d2/15/7dd21547d9a806eb7405ae816879cd4a.jpg',
  'stainless steel cookware set': 'https://i.pinimg.com/1200x/73/5c/48/735c48ac1c83075d9f4ff585685e6986.jpg',
  'non-stick cookware set': 'https://i.pinimg.com/736x/91/c3/82/91c382be2031c07666296ed9e5db4eeb.jpg',
  'ceramic cookware set': 'https://i.pinimg.com/736x/d3/19/25/d3192541fb421d1d11dbf44be370be5e.jpg',
  'cast iron cookware set': 'https://i.pinimg.com/1200x/74/3e/e9/743ee97edc537591513633ea243a68bc.jpg',
  'hard anodized cookware set': 'https://i.pinimg.com/736x/44/63/10/446310856511784dd1cddb8793216302.jpg',
  'granite cookware set': 'https://i.pinimg.com/1200x/9a/69/fd/9a69fd3de5f4ffed740c9572f14fb3f6.jpg',
  'copper cookware set': 'https://i.pinimg.com/736x/61/95/72/6195724cfcdca1c9970adbe2bef6d431.jpg',
  'induction cookware set': 'https://i.pinimg.com/736x/52/67/08/5267081d906b39f15e9215b4def7b47b.jpg',
  'aluminum cookware set': 'https://i.pinimg.com/1200x/9c/09/4d/9c094d4dd0217085ee081cb07494a2c1.jpg',
  '10-piece cookware set': 'https://i.pinimg.com/1200x/e0/66/6a/e0666ac79dd84342fa045700bdefc034.jpg',
  '15-piece cookware set': 'https://i.pinimg.com/736x/b2/27/3c/b2273c55f962bdf9d40f6eedf853de00.jpg',
  'premium kitchen cookware set': 'https://i.pinimg.com/1200x/04/fa/f1/04faf1a4117fb9871c274ec8232f9568.jpg',
  'stainless steel knife set': 'https://i.pinimg.com/736x/46/ff/c9/46ffc92b94f385e9f0409867eafb4de8.jpg',
  'professional chef knife set': 'https://i.pinimg.com/736x/a1/97/f8/a197f86d875ddfb4cf8d4df8393b54e0.jpg',
  '6-piece kitchen knife set': 'https://i.pinimg.com/736x/66/dc/cb/66dccbcb14233313ae85263642248f4c.jpg',
  '8-piece knife set': 'https://i.pinimg.com/1200x/9c/e1/49/9ce149a9d46bb6b67a2f92ec9d095149.jpg',
  'japanese kitchen knife set': 'https://i.pinimg.com/736x/6c/8b/b1/6c8bb190e39a3d8ddf4754f64136e954.jpg',
  'damascus steel knife set': 'https://i.pinimg.com/736x/60/bf/b2/60bfb2479e972ea9ee982946a436eacf.jpg',
  'ceramic knife set': 'https://i.pinimg.com/736x/9d/be/ac/9dbeaca8f7ad3e3f6e5176852188448f.jpg',
  'wooden block knife set': 'https://i.pinimg.com/736x/7a/85/ba/7a85bab7a52d5ff8c383d278aed905ae.jpg',
  'chef knife & utility set': 'https://i.pinimg.com/736x/c2/10/12/c21012153f1da26b39f8a7160360e583.jpg',
  'premium kitchen knife set': 'https://i.pinimg.com/736x/b3/ac/35/b3ac350b0ca1f8d5909f61b81ace276b.jpg',
  'german steel knife set': 'https://i.pinimg.com/736x/ee/bf/82/eebf82977eca882618ee9d4742e54fd4.jpg',
  'colored kitchen knife set': 'https://i.pinimg.com/736x/0c/97/25/0c9725a2a235f40d57ff49e2be64dce7.jpg',
  'stainless steel pressure cooker': 'https://i.pinimg.com/1200x/b8/36/a2/b836a2dcedd53ae310416c2599a0a7d6.jpg',
  'aluminum pressure cooker': 'https://i.pinimg.com/736x/de/70/0a/de700ac1ba55cd074fb881d25dafd45f.jpg',
  'hard anodized pressure cooker': 'https://i.pinimg.com/1200x/fc/c9/70/fcc970ec83bf3246a9f35ab0b6fa0897.jpg',
  'electric pressure cooker': 'https://i.pinimg.com/1200x/0e/2a/04/0e2a043f0bb2c5dadd2f8b8029815132.jpg',
  'induction pressure cooker': 'https://i.pinimg.com/1200x/1a/22/9c/1a229c5dbd66a9d756a2dbad6cc016c5.jpg',
  '3-litre pressure cooker': 'https://i.pinimg.com/1200x/97/28/1a/97281a1a749eecd540d73c8495064c5a.jpg',
  '5-litre pressure cooker': 'https://i.pinimg.com/1200x/c5/31/ad/c531adb9c70ceedbe0a5acc027f24ede.jpg',
  '7-litre pressure cooker': 'https://i.pinimg.com/736x/90/95/2e/90952e9d35a04edbd67eb8eed0f72635.jpg',
  'inner lid pressure cooker': 'https://i.pinimg.com/1200x/ba/d5/77/bad5770f437f1d95a70de20175464bda.jpg',
  'outer lid pressure cooker': 'https://i.pinimg.com/736x/97/14/fb/9714fbfc0fe4761842a16bbf3622f88c.jpg',
  'multi-function pressure cooker': 'https://i.pinimg.com/736x/d5/64/26/d56426cc8ad6a77dbb03e7e9ed5ffda3.jpg',
  'premium pressure cooker': 'https://i.pinimg.com/736x/24/85/69/248569e562fc906baf54dbf9a9251112.jpg',
  'abstract wall art': 'https://i.pinimg.com/1200x/f2/cf/35/f2cf35e863abad46bea5d3e1eb483404.jpg',
  'modern canvas wall art': 'https://i.pinimg.com/1200x/ab/03/1d/ab031db73e8ee1bf1c566f4b58fa0fcf.jpg',
  'nature wall art': 'https://i.pinimg.com/1200x/24/9c/14/249c14f8278394ba6b7070b66892fc51.jpg',
  'minimalist wall art': 'https://i.pinimg.com/736x/01/8f/8a/018f8adb63275f1ed917e7082373978e.jpg',
  'botanical wall art': 'https://i.pinimg.com/736x/05/43/e0/0543e09d6fa1150b7b243004d28c989e.jpg',
  'geometric wall art': 'https://i.pinimg.com/1200x/20/d3/ce/20d3cebe1bb19b1b94800fdf5d650a90.jpg',
  'black and white wall art': 'https://i.pinimg.com/736x/90/c0/f8/90c0f82b8f61c346a172a424d4d0b10a.jpg',
  'floral wall art': 'https://i.pinimg.com/736x/f8/6a/bc/f86abced150f6dcdbe0468e16296810b.jpg',
  'mountain landscape art': 'https://i.pinimg.com/736x/7d/d2/15/7dd21547d9a806eb7405ae816879cd4a.jpg',
  'motivational wall art': 'https://i.pinimg.com/1200x/73/5c/48/735c48ac1c83075d9f4ff585685e6986.jpg',
  'metal wall art': 'https://i.pinimg.com/736x/91/c3/82/91c382be2031c07666296ed9e5db4eeb.jpg',
  'gallery wall art set': 'https://i.pinimg.com/736x/d3/19/25/d3192541fb421d1d11dbf44be370be5e.jpg',
  'modern area rug': 'https://i.pinimg.com/1200x/74/3e/e9/743ee97edc537591513633ea243a68bc.jpg',
  'persian style rug': 'https://i.pinimg.com/736x/44/63/10/446310856511784dd1cddb8793216302.jpg',
  'shaggy rug': 'https://i.pinimg.com/1200x/9a/69/fd/9a69fd3de5f4ffed740c9572f14fb3f6.jpg',
  'oriental rug': 'https://i.pinimg.com/736x/61/95/72/6195724cfcdca1c9970adbe2bef6d431.jpg',
  'geometric area rug': 'https://i.pinimg.com/736x/52/67/08/5267081d906b39f15e9215b4def7b47b.jpg',
  'bohemian rug': 'https://i.pinimg.com/1200x/9c/09/4d/9c094d4dd0217085ee081cb07494a2c1.jpg',
  'vintage rug': 'https://i.pinimg.com/1200x/e0/66/6a/e0666ac79dd84342fa045700bdefc034.jpg',
  'round area rug': 'https://i.pinimg.com/736x/b2/27/3c/b2273c55f962bdf9d40f6eedf853de00.jpg',
  'washable rug': 'https://i.pinimg.com/1200x/04/fa/f1/04faf1a4117fb9871c274ec8232f9568.jpg',
  'runner rug': 'https://i.pinimg.com/736x/46/ff/c9/46ffc92b94f385e9f0409867eafb4de8.jpg',
  'cotton handwoven rug': 'https://i.pinimg.com/736x/a1/97/f8/a197f86d875ddfb4cf8d4df8393b54e0.jpg',
  'minimalist neutral rug': 'https://i.pinimg.com/736x/66/dc/cb/66dccbcb14233313ae85263642248f4c.jpg',
  'blackout curtains': 'https://i.pinimg.com/1200x/9c/e1/49/9ce149a9d46bb6b67a2f92ec9d095149.jpg',
  'sheer curtains': 'https://i.pinimg.com/736x/6c/8b/b1/6c8bb190e39a3d8ddf4754f64136e954.jpg',
  'linen curtains': 'https://i.pinimg.com/736x/60/bf/b2/60bfb2479e972ea9ee982946a436eacf.jpg',
  'velvet curtains': 'https://i.pinimg.com/736x/9d/be/ac/9dbeaca8f7ad3e3f6e5176852188448f.jpg',
  'cotton curtains': 'https://i.pinimg.com/736x/7a/85/ba/7a85bab7a52d5ff8c383d278aed905ae.jpg',
  'thermal curtains': 'https://i.pinimg.com/736x/c2/10/12/c21012153f1da26b39f8a7160360e583.jpg',
  'eyelet curtains': 'https://i.pinimg.com/736x/b3/ac/35/b3ac350b0ca1f8d5909f61b81ace276b.jpg',
  'grommet curtains': 'https://i.pinimg.com/736x/ee/bf/82/eebf82977eca882618ee9d4742e54fd4.jpg',
  'printed curtains': 'https://i.pinimg.com/736x/0c/97/25/0c9725a2a235f40d57ff49e2be64dce7.jpg',
  'floral curtains': 'https://i.pinimg.com/1200x/b8/36/a2/b836a2dcedd53ae310416c2599a0a7d6.jpg',
  'solid color curtains': 'https://i.pinimg.com/736x/de/70/0a/de700ac1ba55cd074fb881d25dafd45f.jpg',
  'luxury window curtains': 'https://i.pinimg.com/1200x/fc/c9/70/fcc970ec83bf3246a9f35ab0b6fa0897.jpg',
  'nike air zoom pegasus': 'https://i.pinimg.com/736x/90/c0/f8/90c0f82b8f61c346a172a424d4d0b10a.jpg',
  'adidas ultraboost': 'https://i.pinimg.com/736x/f8/6a/bc/f86abced150f6dcdbe0468e16296810b.jpg',
  'asics gel-kayano': 'https://i.pinimg.com/736x/7d/d2/15/7dd21547d9a806eb7405ae816879cd4a.jpg',
  'new balance fresh foam': 'https://i.pinimg.com/1200x/73/5c/48/735c48ac1c83075d9f4ff585685e6986.jpg',
  'brooks ghost': 'https://i.pinimg.com/736x/91/c3/82/91c382be2031c07666296ed9e5db4eeb.jpg',
  'hoka clifton': 'https://i.pinimg.com/736x/d3/19/25/d3192541fb421d1d11dbf44be370be5e.jpg',
  'puma velocity nitro': 'https://i.pinimg.com/1200x/74/3e/e9/743ee97edc537591513633ea243a68bc.jpg',
  'saucony ride': 'https://i.pinimg.com/736x/44/63/10/446310856511784dd1cddb8793216302.jpg',
  'under armour hovr': 'https://i.pinimg.com/1200x/9a/69/fd/9a69fd3de5f4ffed740c9572f14fb3f6.jpg',
  'reebok floatride': 'https://i.pinimg.com/736x/61/95/72/6195724cfcdca1c9970adbe2bef6d431.jpg',
  'mizuno wave rider': 'https://i.pinimg.com/736x/52/67/08/5267081d906b39f15e9215b4def7b47b.jpg',
  'skechers go run': 'https://i.pinimg.com/1200x/9c/09/4d/9c094d4dd0217085ee081cb07494a2c1.jpg',
  'nike air force 1': 'https://i.pinimg.com/1200x/e0/66/6a/e0666ac79dd84342fa045700bdefc034.jpg',
  'adidas stan smith': 'https://i.pinimg.com/736x/b2/27/3c/b2273c55f962bdf9d40f6eedf853de00.jpg',
  'adidas superstar': 'https://i.pinimg.com/1200x/04/fa/f1/04faf1a4117fb9871c274ec8232f9568.jpg',
  'converse chuck taylor': 'https://i.pinimg.com/736x/46/ff/c9/46ffc92b94f385e9f0409867eafb4de8.jpg',
  'vans old skool': 'https://i.pinimg.com/736x/a1/97/f8/a197f86d875ddfb4cf8d4df8393b54e0.jpg',
  'new balance 574': 'https://i.pinimg.com/736x/66/dc/cb/66dccbcb14233313ae85263642248f4c.jpg',
  'puma suede classic': 'https://i.pinimg.com/1200x/9c/e1/49/9ce149a9d46bb6b67a2f92ec9d095149.jpg',
  'reebok club c 85': 'https://i.pinimg.com/736x/6c/8b/b1/6c8bb190e39a3d8ddf4754f64136e954.jpg',
  'nike air max': 'https://i.pinimg.com/736x/60/bf/b2/60bfb2479e972ea9ee982946a436eacf.jpg',
  'adidas samba': 'https://i.pinimg.com/736x/9d/be/ac/9dbeaca8f7ad3e3f6e5176852188448f.jpg',
  'new balance 550': 'https://i.pinimg.com/736x/7a/85/ba/7a85bab7a52d5ff8c383d278aed905ae.jpg',
  'asics gel-lyte iii': 'https://i.pinimg.com/736x/c2/10/12/c21012153f1da26b39f8a7160360e583.jpg',
  'classic black oxford shoes': 'https://i.pinimg.com/736x/b3/ac/35/b3ac350b0ca1f8d5909f61b81ace276b.jpg',
  'brown leather oxford shoes': 'https://i.pinimg.com/736x/ee/bf/82/eebf82977eca882618ee9d4742e54fd4.jpg',
  'cap toe oxford shoes': 'https://i.pinimg.com/736x/0c/97/25/0c9725a2a235f40d57ff49e2be64dce7.jpg',
  'plain toe oxford shoes': 'https://i.pinimg.com/1200x/b8/36/a2/b836a2dcedd53ae310416c2599a0a7d6.jpg',
  'wingtip oxford shoes': 'https://i.pinimg.com/736x/de/70/0a/de700ac1ba55cd074fb881d25dafd45f.jpg',
  'patent leather oxford shoes': 'https://i.pinimg.com/1200x/fc/c9/70/fcc970ec83bf3246a9f35ab0b6fa0897.jpg',
  'brogue oxford shoes': 'https://i.pinimg.com/1200x/0e/2a/04/0e2a043f0bb2c5dadd2f8b8029815132.jpg',
  'derby style oxford shoes': 'https://i.pinimg.com/1200x/1a/22/9c/1a229c5dbd66a9d756a2dbad6cc016c5.jpg',
  'suede oxford shoes': 'https://i.pinimg.com/1200x/97/28/1a/97281a1a749eecd540d73c8495064c5a.jpg',
  'formal lace-up oxford shoes': 'https://i.pinimg.com/1200x/c5/31/ad/c531adb9c70ceedbe0a5acc027f24ede.jpg',
  'premium leather oxford shoes': 'https://i.pinimg.com/736x/90/95/2e/90952e9d35a04edbd67eb8eed0f72635.jpg',
  'slim fit oxford shoes': 'https://i.pinimg.com/1200x/ba/d5/77/bad5770f437f1d95a70de20175464bda.jpg',
  'classic black chelsea boots': 'https://i.pinimg.com/736x/97/14/fb/9714fbfc0fe4761842a16bbf3622f88c.jpg',
  'brown leather chelsea boots': 'https://i.pinimg.com/736x/d5/64/26/d56426cc8ad6a77dbb03e7e9ed5ffda3.jpg',
  'suede chelsea boots': 'https://i.pinimg.com/736x/24/85/69/248569e562fc906baf54dbf9a9251112.jpg',
  'tan chelsea boots': 'https://i.pinimg.com/1200x/f2/cf/35/f2cf35e863abad46bea5d3e1eb483404.jpg',
  'black suede chelsea boots': 'https://i.pinimg.com/1200x/ab/03/1d/ab031db73e8ee1bf1c566f4b58fa0fcf.jpg',
  'leather ankle chelsea boots': 'https://i.pinimg.com/1200x/24/9c/14/249c14f8278394ba6b7070b66892fc51.jpg',
  'chunky sole chelsea boots': 'https://i.pinimg.com/736x/01/8f/8a/018f8adb63275f1ed917e7082373978e.jpg',
  'classic elastic side chelsea boots': 'https://i.pinimg.com/736x/05/43/e0/0543e09d6fa1150b7b243004d28c989e.jpg',
  'premium leather chelsea boots': 'https://i.pinimg.com/1200x/20/d3/ce/20d3cebe1bb19b1b94800fdf5d650a90.jpg',
  'casual chelsea boots': 'https://i.pinimg.com/736x/90/c0/f8/90c0f82b8f61c346a172a424d4d0b10a.jpg',
  'formal chelsea boots': 'https://i.pinimg.com/736x/f8/6a/bc/f86abced150f6dcdbe0468e16296810b.jpg',
  'western chelsea boots': 'https://i.pinimg.com/736x/7d/d2/15/7dd21547d9a806eb7405ae816879cd4a.jpg',
  'adidas sport sandals': 'https://i.pinimg.com/1200x/73/5c/48/735c48ac1c83075d9f4ff585685e6986.jpg',
  'nike sports sandals': 'https://i.pinimg.com/736x/91/c3/82/91c382be2031c07666296ed9e5db4eeb.jpg',
  'puma sport sandals': 'https://i.pinimg.com/736x/d3/19/25/d3192541fb421d1d11dbf44be370be5e.jpg',
  'crocs sport sandals': 'https://i.pinimg.com/1200x/74/3e/e9/743ee97edc537591513633ea243a68bc.jpg',
  'skechers sport sandals': 'https://i.pinimg.com/736x/44/63/10/446310856511784dd1cddb8793216302.jpg',
  'under armour sport sandals': 'https://i.pinimg.com/1200x/9a/69/fd/9a69fd3de5f4ffed740c9572f14fb3f6.jpg',
  'velcro sport sandals': 'https://i.pinimg.com/736x/61/95/72/6195724cfcdca1c9970adbe2bef6d431.jpg',
  'hiking sport sandals': 'https://i.pinimg.com/736x/52/67/08/5267081d906b39f15e9215b4def7b47b.jpg',
  'outdoor sport sandals': 'https://i.pinimg.com/1200x/9c/09/4d/9c094d4dd0217085ee081cb07494a2c1.jpg',
  'lightweight sport sandals': 'https://i.pinimg.com/1200x/e0/66/6a/e0666ac79dd84342fa045700bdefc034.jpg',
  'adjustable strap sandals': 'https://i.pinimg.com/736x/b2/27/3c/b2273c55f962bdf9d40f6eedf853de00.jpg',
  'waterproof sport sandals': 'https://i.pinimg.com/1200x/04/fa/f1/04faf1a4117fb9871c274ec8232f9568.jpg',
  'classic rubber slippers': 'https://i.pinimg.com/736x/46/ff/c9/46ffc92b94f385e9f0409867eafb4de8.jpg',
  'memory foam slippers': 'https://i.pinimg.com/736x/a1/97/f8/a197f86d875ddfb4cf8d4df8393b54e0.jpg',
  'leather house slippers': 'https://i.pinimg.com/736x/66/dc/cb/66dccbcb14233313ae85263642248f4c.jpg',
  'flip flop slippers': 'https://i.pinimg.com/1200x/9c/e1/49/9ce149a9d46bb6b67a2f92ec9d095149.jpg',
  'cushioned slippers': 'https://i.pinimg.com/736x/6c/8b/b1/6c8bb190e39a3d8ddf4754f64136e954.jpg',
  'fleece indoor slippers': 'https://i.pinimg.com/736x/60/bf/b2/60bfb2479e972ea9ee982946a436eacf.jpg',
  'slides slippers': 'https://i.pinimg.com/736x/9d/be/ac/9dbeaca8f7ad3e3f6e5176852188448f.jpg',
  'waterproof slippers': 'https://i.pinimg.com/736x/7a/85/ba/7a85bab7a52d5ff8c383d278aed905ae.jpg',
  'anti-slip slippers': 'https://i.pinimg.com/736x/c2/10/12/c21012153f1da26b39f8a7160360e583.jpg',
  'casual home slippers': 'https://i.pinimg.com/736x/b3/ac/35/b3ac350b0ca1f8d5909f61b81ace276b.jpg',
  'orthopedic slippers': 'https://i.pinimg.com/736x/ee/bf/82/eebf82977eca882618ee9d4742e54fd4.jpg',
  'premium men’s slippers': 'https://i.pinimg.com/736x/0c/97/25/0c9725a2a235f40d57ff49e2be64dce7.jpg',
  'classic white t-shirt': 'https://i.pinimg.com/736x/90/c0/f8/90c0f82b8f61c346a172a424d4d0b10a.jpg',
  'oversized black t-shirt': 'https://i.pinimg.com/736x/f8/6a/bc/f86abced150f6dcdbe0468e16296810b.jpg',
  'polo t-shirt': 'photo-1583743814966-8936f5b7be1a',
  'graphic print t-shirt': 'https://i.pinimg.com/1200x/73/5c/48/735c48ac1c83075d9f4ff585685e6986.jpg',
  'plain cotton t-shirt': 'https://i.pinimg.com/736x/91/c3/82/91c382be2031c07666296ed9e5db4eeb.jpg',
  'striped t-shirt': 'https://i.pinimg.com/736x/d3/19/25/d3192541fb421d1d11dbf44be370be5e.jpg',
  'henley t-shirt': 'https://i.pinimg.com/1200x/74/3e/e9/743ee97edc537591513633ea243a68bc.jpg',
  'slim fit t-shirt': 'https://i.pinimg.com/736x/44/63/10/446310856511784dd1cddb8793216302.jpg',
  'oversized graphic t-shirt': 'https://i.pinimg.com/1200x/9a/69/fd/9a69fd3de5f4ffed740c9572f14fb3f6.jpg',
  'full sleeve t-shirt': 'https://i.pinimg.com/736x/61/95/72/6195724cfcdca1c9970adbe2bef6d431.jpg',
  'premium pique polo': 'https://i.pinimg.com/736x/52/67/08/5267081d906b39f15e9215b4def7b47b.jpg',
  'basic round neck t-shirt': 'https://i.pinimg.com/1200x/9c/09/4d/9c094d4dd0217085ee081cb07494a2c1.jpg',
  'oxford cotton shirt': 'https://i.pinimg.com/1200x/e0/66/6a/e0666ac79dd84342fa045700bdefc034.jpg',
  'white formal shirt': 'https://i.pinimg.com/736x/b2/27/3c/b2273c55f962bdf9d40f6eedf853de00.jpg',
  'black casual shirt': 'https://i.pinimg.com/1200x/04/fa/f1/04faf1a4117fb9871c274ec8232f9568.jpg',
  'denim shirt': 'photo-1495105787522-5334e3ffa0ef',
  'linen shirt': 'photo-1596755389378-c31d21fd1273',
  'checked shirt': 'https://i.pinimg.com/736x/66/dc/cb/66dccbcb14233313ae85263642248f4c.jpg',
  'striped shirt': 'https://i.pinimg.com/1200x/9c/e1/49/9ce149a9d46bb6b67a2f92ec9d095149.jpg',
  'cuban collar shirt': 'https://i.pinimg.com/736x/6c/8b/b1/6c8bb190e39a3d8ddf4754f64136e954.jpg',
  'flannel shirt': 'https://i.pinimg.com/736x/60/bf/b2/60bfb2479e972ea9ee982946a436eacf.jpg',
  'printed casual shirt': 'https://i.pinimg.com/736x/9d/be/ac/9dbeaca8f7ad3e3f6e5176852188448f.jpg',
  'slim fit formal shirt': 'https://i.pinimg.com/736x/7a/85/ba/7a85bab7a52d5ff8c383d278aed905ae.jpg',
  'oversized casual shirt': 'https://i.pinimg.com/736x/c2/10/12/c21012153f1da26b39f8a7160360e583.jpg',
  'classic blue straight jeans': 'https://i.pinimg.com/736x/b3/ac/35/b3ac350b0ca1f8d5909f61b81ace276b.jpg',
  'black slim fit jeans': 'https://i.pinimg.com/736x/ee/bf/82/eebf82977eca882618ee9d4742e54fd4.jpg',
  'dark blue skinny jeans': 'https://i.pinimg.com/736x/0c/97/25/0c9725a2a235f40d57ff49e2be64dce7.jpg',
  'relaxed fit jeans': 'https://i.pinimg.com/1200x/b8/36/a2/b836a2dcedd53ae310416c2599a0a7d6.jpg',
  'light wash jeans': 'https://i.pinimg.com/736x/de/70/0a/de700ac1ba55cd074fb881d25dafd45f.jpg',
  'ripped blue jeans': 'https://i.pinimg.com/1200x/fc/c9/70/fcc970ec83bf3246a9f35ab0b6fa0897.jpg',
  'tapered fit jeans': 'https://i.pinimg.com/1200x/0e/2a/04/0e2a043f0bb2c5dadd2f8b8029815132.jpg',
  'baggy jeans': 'https://i.pinimg.com/1200x/1a/22/9c/1a229c5dbd66a9d756a2dbad6cc016c5.jpg',
  'grey denim jeans': 'https://i.pinimg.com/1200x/97/28/1a/97281a1a749eecd540d73c8495064c5a.jpg',
  'bootcut jeans': 'https://i.pinimg.com/1200x/c5/31/ad/c531adb9c70ceedbe0a5acc027f24ede.jpg',
  'distressed black jeans': 'https://i.pinimg.com/736x/90/95/2e/90952e9d35a04edbd67eb8eed0f72635.jpg',
  'stretch denim jeans': 'https://i.pinimg.com/1200x/ba/d5/77/bad5770f437f1d95a70de20175464bda.jpg',
  'beige slim fit chinos': 'https://i.pinimg.com/736x/97/14/fb/9714fbfc0fe4761842a16bbf3622f88c.jpg',
  'navy blue chinos': 'https://i.pinimg.com/736x/d5/64/26/d56426cc8ad6a77dbb03e7e9ed5ffda3.jpg',
  'black chinos': 'https://i.pinimg.com/736x/24/85/69/248569e562fc906baf54dbf9a9251112.jpg',
  'olive green chinos': 'https://i.pinimg.com/1200x/f2/cf/35/f2cf35e863abad46bea5d3e1eb483404.jpg',
  'khaki chinos': 'https://i.pinimg.com/1200x/ab/03/1d/ab031db73e8ee1bf1c566f4b58fa0fcf.jpg',
  'grey chinos': 'https://i.pinimg.com/1200x/24/9c/14/249c14f8278394ba6b7070b66892fc51.jpg',
  'brown chinos': 'https://i.pinimg.com/736x/01/8f/8a/018f8adb63275f1ed917e7082373978e.jpg',
  'slim stretch chinos': 'https://i.pinimg.com/736x/05/43/e0/0543e09d6fa1150b7b243004d28c989e.jpg',
  'relaxed fit chinos': 'https://i.pinimg.com/1200x/20/d3/ce/20d3cebe1bb19b1b94800fdf5d650a90.jpg',
  'cotton chinos': 'https://i.pinimg.com/736x/90/c0/f8/90c0f82b8f61c346a172a424d4d0b10a.jpg',
  'tapered chinos': 'https://i.pinimg.com/736x/f8/6a/bc/f86abced150f6dcdbe0468e16296810b.jpg',
  'classic straight chinos': 'https://i.pinimg.com/736x/7d/d2/15/7dd21547d9a806eb7405ae816879cd4a.jpg',
  'black formal trousers': 'https://i.pinimg.com/1200x/73/5c/48/735c48ac1c83075d9f4ff585685e6986.jpg',
  'grey formal trousers': 'https://i.pinimg.com/736x/91/c3/82/91c382be2031c07666296ed9e5db4eeb.jpg',
  'navy trousers': 'https://i.pinimg.com/736x/d3/19/25/d3192541fb421d1d11dbf44be370be5e.jpg',
  'slim fit trousers': 'https://i.pinimg.com/1200x/74/3e/e9/743ee97edc537591513633ea243a68bc.jpg',
  'pleated trousers': 'https://i.pinimg.com/736x/44/63/10/446310856511784dd1cddb8793216302.jpg',
  'wide leg trousers': 'https://i.pinimg.com/1200x/9a/69/fd/9a69fd3de5f4ffed740c9572f14fb3f6.jpg',
  'linen trousers': 'https://i.pinimg.com/736x/61/95/72/6195724cfcdca1c9970adbe2bef6d431.jpg',
  'cotton trousers': 'https://i.pinimg.com/736x/52/67/08/5267081d906b39f15e9215b4def7b47b.jpg',
  'cargo trousers': 'https://i.pinimg.com/1200x/9c/09/4d/9c094d4dd0217085ee081cb07494a2c1.jpg',
  'tapered trousers': 'https://i.pinimg.com/1200x/e0/66/6a/e0666ac79dd84342fa045700bdefc034.jpg',
  'relaxed fit trousers': 'https://i.pinimg.com/736x/b2/27/3c/b2273c55f962bdf9d40f6eedf853de00.jpg',
  'checkered formal trousers': 'https://i.pinimg.com/1200x/04/fa/f1/04faf1a4117fb9871c274ec8232f9568.jpg',
  'classic black suit': 'https://i.pinimg.com/736x/46/ff/c9/46ffc92b94f385e9f0409867eafb4de8.jpg',
  'navy blue business suit': 'https://i.pinimg.com/736x/a1/97/f8/a197f86d875ddfb4cf8d4df8393b54e0.jpg',
  'charcoal grey suit': 'https://i.pinimg.com/736x/66/dc/cb/66dccbcb14233313ae85263642248f4c.jpg',
  'slim fit black suit': 'https://i.pinimg.com/1200x/9c/e1/49/9ce149a9d46bb6b67a2f92ec9d095149.jpg',
  'double breasted suit': 'https://i.pinimg.com/736x/6c/8b/b1/6c8bb190e39a3d8ddf4754f64136e954.jpg',
  'three piece suit': 'https://i.pinimg.com/736x/60/bf/b2/60bfb2479e972ea9ee982946a436eacf.jpg',
  'grey wedding suit': 'https://i.pinimg.com/736x/9d/be/ac/9dbeaca8f7ad3e3f6e5176852188448f.jpg',
  'tuxedo suit': 'photo-1594938298603-c8148c4dae35',
  'pinstripe suit': 'https://i.pinimg.com/736x/c2/10/12/c21012153f1da26b39f8a7160360e583.jpg',
  'linen summer suit': 'https://i.pinimg.com/736x/b3/ac/35/b3ac350b0ca1f8d5909f61b81ace276b.jpg',
  'brown formal suit': 'https://i.pinimg.com/736x/ee/bf/82/eebf82977eca882618ee9d4742e54fd4.jpg',
  'modern tailored suit': 'https://i.pinimg.com/736x/0c/97/25/0c9725a2a235f40d57ff49e2be64dce7.jpg',
  'leather biker jacket': 'https://i.pinimg.com/1200x/b8/36/a2/b836a2dcedd53ae310416c2599a0a7d6.jpg',
  'denim jacket': 'photo-1543076447-215ad9ba6923',
  'bomber jacket': 'photo-1551028719-00167b16eac5',
  'puffer jacket': 'photo-1548883354-7622d03aca27',
  'suede jacket': 'https://i.pinimg.com/1200x/1a/22/9c/1a229c5dbd66a9d756a2dbad6cc016c5.jpg',
  'harrington jacket': 'https://i.pinimg.com/1200x/97/28/1a/97281a1a749eecd540d73c8495064c5a.jpg',
  'varsity jacket': 'https://i.pinimg.com/1200x/c5/31/ad/c531adb9c70ceedbe0a5acc027f24ede.jpg',
  'trucker jacket': 'https://i.pinimg.com/736x/90/95/2e/90952e9d35a04edbd67eb8eed0f72635.jpg',
  'windbreaker jacket': 'https://i.pinimg.com/1200x/ba/d5/77/bad5770f437f1d95a70de20175464bda.jpg',
  'military jacket': 'https://i.pinimg.com/736x/97/14/fb/9714fbfc0fe4761842a16bbf3622f88c.jpg',
  'quilted jacket': 'https://i.pinimg.com/736x/d5/64/26/d56426cc8ad6a77dbb03e7e9ed5ffda3.jpg',
  'casual hooded jacket': 'https://i.pinimg.com/736x/24/85/69/248569e562fc906baf54dbf9a9251112.jpg',
  'classic crew neck sweater': 'https://i.pinimg.com/1200x/f2/cf/35/f2cf35e863abad46bea5d3e1eb483404.jpg',
  'black turtleneck sweater': 'https://i.pinimg.com/1200x/ab/03/1d/ab031db73e8ee1bf1c566f4b58fa0fcf.jpg',
  'v-neck sweater': 'https://i.pinimg.com/1200x/24/9c/14/249c14f8278394ba6b7070b66892fc51.jpg',
  'cable knit sweater': 'https://i.pinimg.com/736x/01/8f/8a/018f8adb63275f1ed917e7082373978e.jpg',
  'oversized knit sweater': 'https://i.pinimg.com/736x/05/43/e0/0543e09d6fa1150b7b243004d28c989e.jpg',
  'half zip sweater': 'https://i.pinimg.com/1200x/20/d3/ce/20d3cebe1bb19b1b94800fdf5d650a90.jpg',
  'full zip sweater': 'https://i.pinimg.com/736x/90/c0/f8/90c0f82b8f61c346a172a424d4d0b10a.jpg',
  'wool sweater': 'photo-1576566588028-4147f3842f27',
  'cashmere sweater': 'https://i.pinimg.com/736x/7d/d2/15/7dd21547d9a806eb7405ae816879cd4a.jpg',
  'cardigan sweater': 'https://i.pinimg.com/1200x/73/5c/48/735c48ac1c83075d9f4ff585685e6986.jpg',
  'striped sweater': 'https://i.pinimg.com/736x/91/c3/82/91c382be2031c07666296ed9e5db4eeb.jpg',
  'mock neck sweater': 'https://i.pinimg.com/736x/d3/19/25/d3192541fb421d1d11dbf44be370be5e.jpg',
  'classic black leather belt': 'https://i.pinimg.com/1200x/74/3e/e9/743ee97edc537591513633ea243a68bc.jpg',
  'brown leather belt': 'https://i.pinimg.com/736x/44/63/10/446310856511784dd1cddb8793216302.jpg',
  'reversible leather belt': 'https://i.pinimg.com/1200x/9a/69/fd/9a69fd3de5f4ffed740c9572f14fb3f6.jpg',
  'formal dress belt': 'https://i.pinimg.com/736x/61/95/72/6195724cfcdca1c9970adbe2bef6d431.jpg',
  'casual canvas belt': 'https://i.pinimg.com/736x/52/67/08/5267081d906b39f15e9215b4def7b47b.jpg',
  'braided leather belt': 'https://i.pinimg.com/1200x/9c/09/4d/9c094d4dd0217085ee081cb07494a2c1.jpg',
  'automatic buckle belt': 'https://i.pinimg.com/1200x/e0/66/6a/e0666ac79dd84342fa045700bdefc034.jpg',
  'ratchet leather belt': 'https://i.pinimg.com/736x/b2/27/3c/b2273c55f962bdf9d40f6eedf853de00.jpg',
  'suede belt': 'https://i.pinimg.com/1200x/04/fa/f1/04faf1a4117fb9871c274ec8232f9568.jpg',
  'vintage leather belt': 'https://i.pinimg.com/736x/46/ff/c9/46ffc92b94f385e9f0409867eafb4de8.jpg',
  'designer style belt': 'https://i.pinimg.com/736x/a1/97/f8/a197f86d875ddfb4cf8d4df8393b54e0.jpg',
  'minimalist leather belt': 'https://i.pinimg.com/736x/66/dc/cb/66dccbcb14233313ae85263642248f4c.jpg',
  'classic leather wallet': 'https://i.pinimg.com/1200x/9c/e1/49/9ce149a9d46bb6b67a2f92ec9d095149.jpg',
  'slim leather wallet': 'https://i.pinimg.com/736x/6c/8b/b1/6c8bb190e39a3d8ddf4754f64136e954.jpg',
  'bifold wallet': 'https://i.pinimg.com/736x/60/bf/b2/60bfb2479e972ea9ee982946a436eacf.jpg',
  'trifold wallet': 'https://i.pinimg.com/736x/9d/be/ac/9dbeaca8f7ad3e3f6e5176852188448f.jpg',
  'minimalist card holder': 'https://i.pinimg.com/736x/7a/85/ba/7a85bab7a52d5ff8c383d278aed905ae.jpg',
  'rfid blocking wallet': 'https://i.pinimg.com/736x/c2/10/12/c21012153f1da26b39f8a7160360e583.jpg',
  'money clip wallet': 'https://i.pinimg.com/736x/b3/ac/35/b3ac350b0ca1f8d5909f61b81ace276b.jpg',
  'travel wallet': 'https://i.pinimg.com/736x/ee/bf/82/eebf82977eca882618ee9d4742e54fd4.jpg',
  'zipper leather wallet': 'https://i.pinimg.com/736x/0c/97/25/0c9725a2a235f40d57ff49e2be64dce7.jpg',
  'vintage leather wallet': 'https://i.pinimg.com/1200x/b8/36/a2/b836a2dcedd53ae310416c2599a0a7d6.jpg',
  'carbon fiber wallet': 'https://i.pinimg.com/736x/de/70/0a/de700ac1ba55cd074fb881d25dafd45f.jpg',
  'premium long wallet': 'https://i.pinimg.com/1200x/fc/c9/70/fcc970ec83bf3246a9f35ab0b6fa0897.jpg',
  'classic aviator sunglasses': 'https://i.pinimg.com/1200x/0e/2a/04/0e2a043f0bb2c5dadd2f8b8029815132.jpg',
  'wayfarer sunglasses': 'https://i.pinimg.com/1200x/1a/22/9c/1a229c5dbd66a9d756a2dbad6cc016c5.jpg',
  'round frame sunglasses': 'https://i.pinimg.com/1200x/97/28/1a/97281a1a749eecd540d73c8495064c5a.jpg',
  'square frame sunglasses': 'https://i.pinimg.com/1200x/c5/31/ad/c531adb9c70ceedbe0a5acc027f24ede.jpg',
  'polarized sunglasses': 'https://i.pinimg.com/736x/90/95/2e/90952e9d35a04edbd67eb8eed0f72635.jpg',
  'clubmaster sunglasses': 'https://i.pinimg.com/1200x/ba/d5/77/bad5770f437f1d95a70de20175464bda.jpg',
  'sports sunglasses': 'https://i.pinimg.com/736x/97/14/fb/9714fbfc0fe4761842a16bbf3622f88c.jpg',
  'black rectangle sunglasses': 'https://i.pinimg.com/736x/d5/64/26/d56426cc8ad6a77dbb03e7e9ed5ffda3.jpg',
  'metal frame sunglasses': 'https://i.pinimg.com/736x/24/85/69/248569e562fc906baf54dbf9a9251112.jpg',
  'retro sunglasses': 'https://i.pinimg.com/1200x/f2/cf/35/f2cf35e863abad46bea5d3e1eb483404.jpg',
  'driving sunglasses': 'https://i.pinimg.com/1200x/ab/03/1d/ab031db73e8ee1bf1c566f4b58fa0fcf.jpg',
  'luxury men’s sunglasses': 'https://i.pinimg.com/1200x/24/9c/14/249c14f8278394ba6b7070b66892fc51.jpg',
  'classic analog watch': 'https://i.pinimg.com/736x/01/8f/8a/018f8adb63275f1ed917e7082373978e.jpg',
  'stainless steel watch': 'https://i.pinimg.com/736x/05/43/e0/0543e09d6fa1150b7b243004d28c989e.jpg',
  'leather strap watch': 'https://i.pinimg.com/1200x/20/d3/ce/20d3cebe1bb19b1b94800fdf5d650a90.jpg',
  'chronograph watch': 'photo-1524805444758-089113d48a6d',
  'automatic mechanical watch': 'https://i.pinimg.com/736x/f8/6a/bc/f86abced150f6dcdbe0468e16296810b.jpg',
  'minimalist dress watch': 'https://i.pinimg.com/736x/7d/d2/15/7dd21547d9a806eb7405ae816879cd4a.jpg',
  'luxury men’s watch': 'https://i.pinimg.com/1200x/73/5c/48/735c48ac1c83075d9f4ff585685e6986.jpg',
  'sports watch': 'https://i.pinimg.com/736x/91/c3/82/91c382be2031c07666296ed9e5db4eeb.jpg',
  'dive watch': 'https://i.pinimg.com/736x/d3/19/25/d3192541fb421d1d11dbf44be370be5e.jpg',
  'field watch': 'https://i.pinimg.com/1200x/74/3e/e9/743ee97edc537591513633ea243a68bc.jpg',
  'smartwatch': 'https://i.pinimg.com/736x/44/63/10/446310856511784dd1cddb8793216302.jpg',
  'digital sports watch': 'https://i.pinimg.com/1200x/9a/69/fd/9a69fd3de5f4ffed740c9572f14fb3f6.jpg',
  'iphone 17 pro max': 'https://i.pinimg.com/736x/90/95/2e/90952e9d35a04edbd67eb8eed0f72635.jpg',
  'iphone 17 pro': 'https://i.pinimg.com/1200x/ba/d5/77/bad5770f437f1d95a70de20175464bda.jpg',
  'samsung galaxy s26 ultra': 'https://i.pinimg.com/736x/97/14/fb/9714fbfc0fe4761842a16bbf3622f88c.jpg',
  'samsung galaxy s26+': 'https://i.pinimg.com/736x/d5/64/26/d56426cc8ad6a77dbb03e7e9ed5ffda3.jpg',
  'google pixel 10 pro xl': 'https://i.pinimg.com/736x/24/85/69/248569e562fc906baf54dbf9a9251112.jpg',
  'google pixel 10 pro': 'https://i.pinimg.com/1200x/f2/cf/35/f2cf35e863abad46bea5d3e1eb483404.jpg',
  'oneplus 13': 'https://i.pinimg.com/1200x/ab/03/1d/ab031db73e8ee1bf1c566f4b58fa0fcf.jpg',
  'xiaomi 16 pro': 'https://i.pinimg.com/1200x/24/9c/14/249c14f8278394ba6b7070b66892fc51.jpg',
  'nothing phone 3': 'https://i.pinimg.com/736x/01/8f/8a/018f8adb63275f1ed917e7082373978e.jpg',
  'realme gt 7 pro': 'https://i.pinimg.com/736x/90/c0/f8/90c0f82b8f61c346a172a424d4d0b10a.jpg',
  'vivo x200 pro': 'https://i.pinimg.com/736x/05/43/e0/0543e09d6fa1150b7b243004d28c989e.jpg',
  'oppo find n5': 'https://i.pinimg.com/1200x/20/d3/ce/20d3cebe1bb19b1b94800fdf5d650a90.jpg',
  'macbook pro 16-inch': 'https://i.pinimg.com/736x/f8/6a/bc/f86abced150f6dcdbe0468e16296810b.jpg',
  'macbook air 15-inch': 'https://i.pinimg.com/736x/7d/d2/15/7dd21547d9a806eb7405ae816879cd4a.jpg',
  'dell xps 16': 'https://i.pinimg.com/1200x/73/5c/48/735c48ac1c83075d9f4ff585685e6986.jpg',
  'dell xps 14': 'https://i.pinimg.com/736x/91/c3/82/91c382be2031c07666296ed9e5db4eeb.jpg',
  'lenovo thinkpad x1 carbon': 'https://i.pinimg.com/736x/d3/19/25/d3192541fb421d1d11dbf44be370be5e.jpg',
  'lenovo legion pro 7': 'https://i.pinimg.com/1200x/74/3e/e9/743ee97edc537591513633ea243a68bc.jpg',
  'hp spectre x360': 'https://i.pinimg.com/736x/44/63/10/446310856511784dd1cddb8793216302.jpg',
  'hp omen 16': 'https://i.pinimg.com/1200x/9a/69/fd/9a69fd3de5f4ffed740c9572f14fb3f6.jpg',
  'asus rog strix g16': 'https://i.pinimg.com/736x/61/95/72/6195724cfcdca1c9970adbe2bef6d431.jpg',
  'asus zenbook 14': 'https://i.pinimg.com/736x/52/67/08/5267081d906b39f15e9215b4def7b47b.jpg',
  'acer predator helios neo 16': 'https://i.pinimg.com/1200x/9c/09/4d/9c094d4dd0217085ee081cb07494a2c1.jpg',
  'microsoft surface laptop': 'https://i.pinimg.com/1200x/e0/66/6a/e0666ac79dd84342fa045700bdefc034.jpg',
  'ipad pro 13-inch': 'https://i.pinimg.com/736x/b2/27/3c/b2273c55f962bdf9d40f6eedf853de00.jpg',
  'ipad air': 'https://i.pinimg.com/1200x/04/fa/f1/04faf1a4117fb9871c274ec8232f9568.jpg',
  'ipad mini': 'https://i.pinimg.com/736x/46/ff/c9/46ffc92b94f385e9f0409867eafb4de8.jpg',
  'samsung galaxy tab s10 ultra': 'https://i.pinimg.com/736x/a1/97/f8/a197f86d875ddfb4cf8d4df8393b54e0.jpg',
  'samsung galaxy tab s10+': 'https://i.pinimg.com/736x/66/dc/cb/66dccbcb14233313ae85263642248f4c.jpg',
  'google pixel tablet': 'https://i.pinimg.com/1200x/9c/e1/49/9ce149a9d46bb6b67a2f92ec9d095149.jpg',
  'oneplus pad 2': 'https://i.pinimg.com/736x/6c/8b/b1/6c8bb190e39a3d8ddf4754f64136e954.jpg',
  'lenovo tab extreme': 'https://i.pinimg.com/736x/9d/be/ac/9dbeaca8f7ad3e3f6e5176852188448f.jpg',
  'microsoft surface pro': 'https://i.pinimg.com/736x/7a/85/ba/7a85bab7a52d5ff8c383d278aed905ae.jpg',
  'redmi pad pro': 'https://i.pinimg.com/736x/c2/10/12/c21012153f1da26b39f8a7160360e583.jpg',
  'oppo pad 3 pro': 'https://i.pinimg.com/736x/b3/ac/35/b3ac350b0ca1f8d5909f61b81ace276b.jpg',
  'samsung odyssey oled g9': 'https://i.pinimg.com/736x/ee/bf/82/eebf82977eca882618ee9d4742e54fd4.jpg',
  'lg ultragear oled gaming monitor': 'https://i.pinimg.com/736x/0c/97/25/0c9725a2a235f40d57ff49e2be64dce7.jpg',
  'dell ultrasharp 4k monitor': 'https://i.pinimg.com/1200x/b8/36/a2/b836a2dcedd53ae310416c2599a0a7d6.jpg',
  'asus rog swift gaming monitor': 'https://i.pinimg.com/736x/de/70/0a/de700ac1ba55cd074fb881d25dafd45f.jpg',
  'acer predator gaming monitor': 'https://i.pinimg.com/1200x/fc/c9/70/fcc970ec83bf3246a9f35ab0b6fa0897.jpg',
  'benq 4k monitor': 'https://i.pinimg.com/1200x/0e/2a/04/0e2a043f0bb2c5dadd2f8b8029815132.jpg',
  'msi mpg gaming monitor': 'https://i.pinimg.com/1200x/1a/22/9c/1a229c5dbd66a9d756a2dbad6cc016c5.jpg',
  'gigabyte aorus gaming monitor': 'https://i.pinimg.com/1200x/97/28/1a/97281a1a749eecd540d73c8495064c5a.jpg',
  'apple studio display': 'https://i.pinimg.com/1200x/c5/31/ad/c531adb9c70ceedbe0a5acc027f24ede.jpg',
  'lg ultrawide monitor': 'https://i.pinimg.com/736x/90/95/2e/90952e9d35a04edbd67eb8eed0f72635.jpg',
  'samsung smart monitor': 'https://i.pinimg.com/1200x/ba/d5/77/bad5770f437f1d95a70de20175464bda.jpg',
  'dell alienware gaming monitor': 'https://i.pinimg.com/736x/97/14/fb/9714fbfc0fe4761842a16bbf3622f88c.jpg',
  'logitech mx mechanical': 'https://i.pinimg.com/736x/d5/64/26/d56426cc8ad6a77dbb03e7e9ed5ffda3.jpg',
  'keychron q1 pro': 'https://i.pinimg.com/736x/24/85/69/248569e562fc906baf54dbf9a9251112.jpg',
  'razer blackwidow v4': 'https://i.pinimg.com/1200x/f2/cf/35/f2cf35e863abad46bea5d3e1eb483404.jpg',
  'corsair k100 rgb': 'https://i.pinimg.com/1200x/ab/03/1d/ab031db73e8ee1bf1c566f4b58fa0fcf.jpg',
  'steelseries apex pro': 'https://i.pinimg.com/1200x/24/9c/14/249c14f8278394ba6b7070b66892fc51.jpg',
  'asus rog strix scope': 'https://i.pinimg.com/736x/01/8f/8a/018f8adb63275f1ed917e7082373978e.jpg',
  'apple magic keyboard': 'https://i.pinimg.com/736x/05/43/e0/0543e09d6fa1150b7b243004d28c989e.jpg',
  'logitech g915': 'https://i.pinimg.com/1200x/20/d3/ce/20d3cebe1bb19b1b94800fdf5d650a90.jpg',
  'hyperx alloy origins': 'https://i.pinimg.com/736x/90/c0/f8/90c0f82b8f61c346a172a424d4d0b10a.jpg',
  'keychron k2': 'https://i.pinimg.com/736x/f8/6a/bc/f86abced150f6dcdbe0468e16296810b.jpg',
  'royal kludge rk84': 'https://i.pinimg.com/736x/7d/d2/15/7dd21547d9a806eb7405ae816879cd4a.jpg',
  'nuphy air75': 'https://i.pinimg.com/1200x/73/5c/48/735c48ac1c83075d9f4ff585685e6986.jpg',
  'playstation 5': 'https://i.pinimg.com/736x/91/c3/82/91c382be2031c07666296ed9e5db4eeb.jpg',
  'playstation 5 slim': 'https://i.pinimg.com/736x/d3/19/25/d3192541fb421d1d11dbf44be370be5e.jpg',
  'playstation 5 pro': 'https://i.pinimg.com/1200x/74/3e/e9/743ee97edc537591513633ea243a68bc.jpg',
  'xbox series x': 'https://i.pinimg.com/736x/44/63/10/446310856511784dd1cddb8793216302.jpg',
  'xbox series s': 'https://i.pinimg.com/1200x/9a/69/fd/9a69fd3de5f4ffed740c9572f14fb3f6.jpg',
  'nintendo switch oled': 'https://i.pinimg.com/736x/61/95/72/6195724cfcdca1c9970adbe2bef6d431.jpg',
  'nintendo switch lite': 'https://i.pinimg.com/736x/52/67/08/5267081d906b39f15e9215b4def7b47b.jpg',
  'nintendo switch 2': 'https://i.pinimg.com/1200x/9c/09/4d/9c094d4dd0217085ee081cb07494a2c1.jpg',
  'steam deck oled': 'https://i.pinimg.com/1200x/e0/66/6a/e0666ac79dd84342fa045700bdefc034.jpg',
  'asus rog ally x': 'https://i.pinimg.com/736x/b2/27/3c/b2273c55f962bdf9d40f6eedf853de00.jpg',
  'lenovo legion go': 'https://i.pinimg.com/1200x/04/fa/f1/04faf1a4117fb9871c274ec8232f9568.jpg',
  'msi claw': 'https://i.pinimg.com/736x/46/ff/c9/46ffc92b94f385e9f0409867eafb4de8.jpg',
  'sony wh-1000xm6': 'https://i.pinimg.com/736x/a1/97/f8/a197f86d875ddfb4cf8d4df8393b54e0.jpg',
  'apple airpods max': 'https://i.pinimg.com/736x/66/dc/cb/66dccbcb14233313ae85263642248f4c.jpg',
  'bose quietcomfort ultra': 'photo-1546435770-a3e426bf472b',
  'sennheiser momentum 4': 'https://i.pinimg.com/736x/6c/8b/b1/6c8bb190e39a3d8ddf4754f64136e954.jpg',
  'jbl tour one m3': 'https://i.pinimg.com/736x/60/bf/b2/60bfb2479e972ea9ee982946a436eacf.jpg',
  'beats studio pro': 'https://i.pinimg.com/736x/9d/be/ac/9dbeaca8f7ad3e3f6e5176852188448f.jpg',
  'samsung galaxy buds3 pro': 'https://i.pinimg.com/736x/7a/85/ba/7a85bab7a52d5ff8c383d278aed905ae.jpg',
  'apple airpods pro': 'https://i.pinimg.com/736x/c2/10/12/c21012153f1da26b39f8a7160360e583.jpg',
  'sony wf-1000xm5': 'https://i.pinimg.com/736x/b3/ac/35/b3ac350b0ca1f8d5909f61b81ace276b.jpg',
  'nothing ear': 'photo-1588423771073-b8903fbb85b5',
  'oneplus buds pro': 'https://i.pinimg.com/736x/0c/97/25/0c9725a2a235f40d57ff49e2be64dce7.jpg',
  'bose quietcomfort earbuds': 'photo-1606220945770-b5b6c2c55bf1',
  'sony alpha a7 iv': 'https://i.pinimg.com/736x/de/70/0a/de700ac1ba55cd074fb881d25dafd45f.jpg',
  'sony alpha a7r v': 'https://i.pinimg.com/1200x/fc/c9/70/fcc970ec83bf3246a9f35ab0b6fa0897.jpg',
  'canon eos r5': 'https://i.pinimg.com/1200x/0e/2a/04/0e2a043f0bb2c5dadd2f8b8029815132.jpg',
  'canon eos r6 mark ii': 'https://i.pinimg.com/1200x/1a/22/9c/1a229c5dbd66a9d756a2dbad6cc016c5.jpg',
  'nikon z8': 'https://i.pinimg.com/1200x/97/28/1a/97281a1a749eecd540d73c8495064c5a.jpg',
  'nikon z6 iii': 'https://i.pinimg.com/1200x/c5/31/ad/c531adb9c70ceedbe0a5acc027f24ede.jpg',
  'fujifilm x-t5': 'https://i.pinimg.com/736x/90/95/2e/90952e9d35a04edbd67eb8eed0f72635.jpg',
  'fujifilm x100vi': 'https://i.pinimg.com/1200x/ba/d5/77/bad5770f437f1d95a70de20175464bda.jpg',
  'panasonic lumix s5 ii': 'https://i.pinimg.com/736x/97/14/fb/9714fbfc0fe4761842a16bbf3622f88c.jpg',
  'gopro hero13 black': 'https://i.pinimg.com/736x/d5/64/26/d56426cc8ad6a77dbb03e7e9ed5ffda3.jpg',
  'dji osmo action 5 pro': 'https://i.pinimg.com/736x/24/85/69/248569e562fc906baf54dbf9a9251112.jpg',
  'insta360 x5': 'https://i.pinimg.com/1200x/f2/cf/35/f2cf35e863abad46bea5d3e1eb483404.jpg',
  'gel ink pen': 'https://i.pinimg.com/736x/7d/d2/15/7dd21547d9a806eb7405ae816879cd4a.jpg',
  'magnetic whiteboard': 'https://i.pinimg.com/1200x/74/3e/e9/743ee97edc537591513633ea243a68bc.jpg',
  'office planning whiteboard': 'https://i.pinimg.com/1200x/74/3e/e9/743ee97edc537591513633ea243a68bc.jpg',
  'premium office stationery set': 'https://i.pinimg.com/736x/52/67/08/5267081d906b39f15e9215b4def7b47b.jpg',
  'educational building block': 'https://i.pinimg.com/1200x/9c/09/4d/9c094d4dd0217085ee081cb07494a2c1.jpg',
  'stem building blocks': 'https://i.pinimg.com/1200x/e0/66/6a/e0666ac79dd84342fa045700bdefc034.jpg',
  'educational kids puzzle': 'https://i.pinimg.com/736x/b2/27/3c/b2273c55f962bdf9d40f6eedf853de00.jpg',
  'board game set': 'https://i.pinimg.com/1200x/04/fa/f1/04faf1a4117fb9871c274ec8232f9568.jpg',
  'magnetic building tiles': 'https://i.pinimg.com/736x/46/ff/c9/46ffc92b94f385e9f0409867eafb4de8.jpg',
  'toy racing car': 'https://i.pinimg.com/736x/a1/97/f8/a197f86d875ddfb4cf8d4df8393b54e0.jpg',
  'stem learning toy': 'https://i.pinimg.com/736x/66/dc/cb/66dccbcb14233313ae85263642248f4c.jpg',
  'tem learning toy': 'https://i.pinimg.com/736x/66/dc/cb/66dccbcb14233313ae85263642248f4c.jpg',
  'kids construction toy set': 'https://i.pinimg.com/1200x/9c/e1/49/9ce149a9d46bb6b67a2f92ec9d095149.jpg',
  'interactive learning toy': 'https://i.pinimg.com/736x/6c/8b/b1/6c8bb190e39a3d8ddf4754f64136e954.jpg',
  'off-road car': 'https://i.pinimg.com/736x/60/bf/b2/60bfb2479e972ea9ee982946a436eacf.jpg',
  'remote control off-road car': 'https://i.pinimg.com/736x/60/bf/b2/60bfb2479e972ea9ee982946a436eacf.jpg',
  'rc monster truck': 'https://i.pinimg.com/736x/9d/be/ac/9dbeaca8f7ad3e3f6e5176852188448f.jpg',
  'cricket bat': 'photo-1531415074968-036ba1b575da',
  'size 5 football': 'photo-1579952363873-27f3bade9f55',
  'yoga mat': 'photo-1601925260368-ae2f83cf8b7f',
  'dumbbell set': 'photo-1583454110551-21f2fa2afe61',
  'whey protein': 'photo-1593095948071-474c5cc2989d',
  'liquid lipstick': 'photo-1586495777744-4413f21062fa',
  'vitamin c serum': 'photo-1620916566398-39f1143ab7be',
  'hydrating shampoo': 'photo-1556229010-6c3f2c9ca5f8',
  'eau de parfum': 'photo-1541643600914-78b084683601',
  'fabric sofa': 'photo-1555041469-a586c61ea9bc',
  'dining table': 'photo-1617098900591-3f90928e8c54',
  'bookshelf': 'photo-1594620302200-9a762244a156',
  'cookware set': 'photo-1556911220-e15b29be8c8f',
  'knife set': 'photo-1593618998160-e34014e67546',
  'pressure cooker': 'photo-1585515320310-259814833e62',
  'french press': 'photo-1572119865084-43c285814d63',
  'wall art': 'photo-1549490349-8643362247b5',
  'cushion cover': 'photo-1584100936595-c0654b55a2e2',
  'blackout curtain': 'photo-1616486338812-3dadae4b4ace',
  'area rug': 'photo-1600166898405-da9535204843',
  'desk lamp': 'photo-1507473885765-e6ed057f782c',
  'running shoe': 'photo-1542291026-7eec264c27ff',
  'casual sneaker': 'photo-1495555961986-6d4c1ecb7be3',
  'canvas shoe': 'photo-1525966222134-fcfa99b8ae77',
  'oxford shoe': 'photo-1614252369475-531eba835eb1',
  'derby dress': 'photo-1449247709967-d4461a6a6103',
  'chelsea boot': 'photo-1638247025967-b4e38f787b76',
  'maxi dress': 'photo-1572804013309-59a88b7e92f1',
  'cocktail dress': 'photo-1566174053879-31528523f8ae',
  'silk blouse': 'photo-1585487000160-6ebcfceb0d03',
  'banarasi saree': 'photo-1610030469983-98e550d6193c',
  'cotton kurta': 'https://i.pinimg.com/736x/90/c0/f8/90c0f82b8f61c346a172a424d4d0b10a.jpg',
  'anarkali suit': 'photo-1594633312681-425c7b97ccd1',
  'denim jeans': 'photo-1541099649105-f69ad21f3246',
  'a-line skirt': 'photo-1583496661160-fb5886a0aaaa',
  'ankle-length legging': 'photo-1506629082955-511b1aa562c8',
  'trench coat': 'photo-1591047139829-d91aecb6caea',
  'oversized blazer': 'photo-1551488831-00ddcb6c6bd3',
  'leather handbag': 'photo-1584917865442-de89df76afd3',
  'evening clutch': 'photo-1566150905458-1bf1fc113f0d',
  'necklace set': 'photo-1599643478518-a784e5dc4c8f',
  'crystal earring': 'photo-1535632066927-ab7c9ab60908',
  'high heel': 'photo-1543163521-1bf539c55dd2',
  'leather loafer': 'photo-1560343090-f0409e92791a',
  'ankle boot': 'photo-1608256246200-53e635b5b65f',
  'crew neck t-shirt': 'photo-1521572163474-6864f9cf17ab',
  'graphic printed tee': 'photo-1503341504253-dff4815485f1',
  'oxford shirt': 'photo-1602810318383-e386cc2a3ccf',
  'slim fit denim jeans': 'photo-1542272604-787c3835535d',
  'tapered blue jeans': 'photo-1475178626620-a4d074967452',
  'black jeans': 'photo-1541099649105-f69ad21f3246',
  'chino pants': 'photo-1624378439575-d8705ad7ae80',
  'formal trousers': 'photo-1598808503746-f34c53b9323e',
  'cargo pants': 'photo-1517438476312-10d79c077509',
  'single breasted blazer': 'photo-1507679799987-c73779587ccf',
  'wool suit': 'photo-1555069519-127aadedf1ee',
  'zip hoodie': 'photo-1556821840-3a63f95609a7',
  'leather belt': 'photo-1624222247344-550fb60583dc',
  'bi-fold wallet': 'photo-1627123424574-724758594e93',
  'aviator sunglasses': 'photo-1511499767150-a48a237f0083',
  'silk tie': 'photo-1589756823695-278bc923f962',
  'baseball cap': 'photo-1588850561407-ed78c282e89b',
  'galaxy s26 ultra': 'https://i.pinimg.com/736x/97/14/fb/9714fbfc0fe4761842a16bbf3622f88c.jpg',
  'galaxy s26+': 'https://i.pinimg.com/736x/d5/64/26/d56426cc8ad6a77dbb03e7e9ed5ffda3.jpg',
  'pixel 10 pro xl': 'https://i.pinimg.com/736x/24/85/69/248569e562fc906baf54dbf9a9251112.jpg',
  'pixel 10 pro': 'https://i.pinimg.com/1200x/f2/cf/35/f2cf35e863abad46bea5d3e1eb483404.jpg',
  'vivo x200': 'https://i.pinimg.com/736x/05/43/e0/0543e09d6fa1150b7b243004d28c989e.jpg',
  'oppo find': 'https://i.pinimg.com/1200x/20/d3/ce/20d3cebe1bb19b1b94800fdf5d650a90.jpg',
  'moto edge': 'photo-1546054454-aa26e2b734c7',
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
  'osmo pocket': 'https://i.pinimg.com/736x/f8/6a/bc/f86abced150f6dcdbe0468e16296810b.jpg',
  'gopro hero': 'photo-1502920917128-1aa500764cbd',
  'sony zv': 'photo-1516035069371-29a1b244cc32',
  'airpods pro 3': 'photo-1600294037681-c80b4cb5b434',
  'galaxy buds 4': 'photo-1590658268037-6bf12165a8df',
  'sony wf-1000xm6': 'photo-1606220945770-b5b6c2c55bf1',
  'jbl tour pro': 'photo-1598331668826-20cecc596b86',
  'wh-1000xm6': 'photo-1505740420928-5e560c06d30e',
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

  // Smart Watches & Watches
  watch: [
    'photo-1523275335684-37898b6baf30',
    'photo-1508685096489-7aacd43bd3b1',
    'photo-1579586337278-3befd40fd17a',
    'photo-1524805444758-089113d48a6d',
    'photo-1434493789847-2f02dc6ca35d',
    'photo-1544117519-31a4b719223d',
  ],

  // Sunglasses
  sunglasses: [
    'photo-1511499767150-a48a237f0083',
    'photo-1572635196237-14b3f281503f',
    'photo-1584036561566-baf8f5f1b144',
    'photo-1508296695146-257a814070b4',
  ],

  // Wallets
  wallet: [
    'photo-1627123424574-724758594e93',
    'photo-1553062407-98eeb64c6a62',
    'https://i.pinimg.com/736x/7d/d2/15/7dd21547d9a806eb7405ae816879cd4a.jpg',
  ],

  // Power Banks & Chargers
  charger: ['photo-1583863788434-e58a36330cf0', 'photo-1585338107529-13afc5f02586', 'photo-1609081219090-a6d81d3085bf'],

  // SSD / Storage
  ssd: ['photo-1597852074816-d933c7d2b988', 'photo-1544652478-6653e09f18a2', 'photo-1587202372775-e229f172b9d7'],

  // Routers
  router: ['photo-1544197150-b99a580bb7a8', 'photo-1601784551446-20c9e07cdbdb', 'photo-1563770660941-20978e870e26'],

  // Fashion Men
  't-shirt': ['photo-1521572267360-ee0c2909d518', 'photo-1583743814966-8936f5b7be1a', 'photo-1618354691373-d851c5c3a990', 'photo-1503341504253-dff4815485f1'],
  shirt: ['photo-1596755094514-f87e34085b2c', 'photo-1602810318383-e386cc2a3ccf', 'photo-1620012253295-c15cc3e65df4', 'photo-1495105787522-5334e3ffa0ef'],
  jean: ['photo-1541099649105-f69ad21f3246', 'photo-1582552938357-32b906df40cb', 'photo-1604176354204-9268737828e4', 'photo-1542272604-787c3835535d'],
  trouser: ['photo-1624378439575-d8705ad7ae80', 'photo-1473966968600-fa801b869a1a', 'photo-1506629082955-511b1aa562c8', 'photo-1598808503746-f34c53b9323e'],
  suit: ['photo-1507679799987-c73779587ccf', 'photo-1594938298603-c8148c4dae35', 'photo-1617137968427-85924c800a22', 'photo-1555069519-127aadedf1ee'],
  jacket: ['photo-1551028719-00167b16eac5', 'photo-1544441893-675973e31985', 'photo-1548883354-7622d03aca27', 'photo-1543076447-215ad9ba6923'],

  // Fashion Women
  dress: ['photo-1595777457583-95e059d581b8', 'photo-1572804013309-59a88b7e92f1', 'photo-1515886657613-9f3515b0c78f', 'photo-1566174053879-31528523f8ae'],
  skirt: ['photo-1583496661160-fb5886a0aaaa', 'photo-1572804013309-59a88b7e92f1'],
  kurta: ['photo-1610030469983-98e550d6193c', 'photo-1617627143750-d86bc21e42bb', 'https://i.pinimg.com/736x/90/c0/f8/90c0f82b8f61c346a172a424d4d0b10a.jpg'],
  saree: ['photo-1610030469983-98e550d6193c', 'photo-1617627143750-d86bc21e42bb'],
  handbag: ['photo-1584917865442-de89df76afd3', 'photo-1590874103328-eac38a683ce7', 'photo-1566150905458-1bf1fc113f0d'],

  // Shoes
  shoe: ['photo-1542291026-7eec264c27ff', 'photo-1525966222134-fcfa99b8ae77', 'photo-1614252235316-8c857d38b5f4', 'photo-1495555961986-6d4c1ecb7be3', 'photo-1638247025967-b4e38f787b76'],

  // Home & Kitchen
  sofa: ['photo-1555041469-a586c61ea9bc', 'photo-1586023492125-27b2c045efd7'],
  bed: ['photo-1505693416388-ac5ce068fe85'],
  cookware: ['photo-1556911220-e15b29be8c8f', 'photo-1584992236310-6edddc08acff'],

  // Sports & Fitness
  sports: ['photo-1579952363873-27f3bade9f55', 'photo-1574629810360-7efbbe195018', 'photo-1531415074968-036ba1b575da'],
  yoga: ['photo-1544367567-0f2fcb009e0b', 'photo-1506126613408-eca07ce68773', 'photo-1601925260368-ae2f83cf8b7f'],

  // Automotive
  helmet: ['photo-1558981806-ec527fa84c39', 'photo-1542282088-fe8426682b8f'],
       car: ['photo-1492144534655-ae79c964c9d7', 'photo-1503376780353-7e6692767b70'],

    // Watches (canonical verified gallery)

  // Accessories (verified)
  belt: ['photo-1624222247344-550fb60583dc'],
  socks: ['photo-1586350977771-b3b0abd50c82'],
  cap: ['photo-1588850561407-ed78c282e89b'],

  // Office & stationery (verified)
  notebook: ['photo-1544816155-12df9643f363'],
  pen: ['photo-1583485088034-697b5bc54ccd'],
  printer: ['photo-1612815154858-60aa4c59eaa6'],
  whiteboard: ['photo-1586953208448-b95a79798f07'],

  // Footwear (verified shoe gallery)
  running: ['photo-1542291026-7eec264c27ff', 'photo-1518002171953-a080ee817e1f', 'photo-1560769629-975ec94e6a86'],
  sneaker: ['photo-1525966222134-fcfa99b8ae77', 'photo-1595950653106-6c9ebd614d3a'],
  formal: ['photo-1614252369475-531eba835eb1', 'photo-1614252235316-8c857d38b5f4', 'photo-1638247025967-b4e38f787b76'],
  slipper: ['photo-1543163521-1bf539c55dd2'],

  // Apparel extras (verified)
  outerwear: ['photo-1556821840-3a63f95609a7', 'photo-1548883354-7622d03aca27'],
  chino: ['photo-1624378439575-d8705ad7ae80', 'photo-1517438476312-10d79c077509', 'photo-1598808503746-f34c53b9323e'],
  ethnic: ['photo-1583391733956-6c78276477e2', 'photo-1617627143750-d86bc21e42bb', 'photo-1610030469983-98e550d6193c', 'photo-1572804013309-59a88b7e92f1'],

  // Home furniture & decor (verified)
  furniture: ['photo-1555041469-a586c61ea9bc', 'photo-1586023492125-27b2c045efd7', 'photo-1617098900591-3f90928e8c54', 'photo-1580480055273-228ff5388ef8', 'photo-1594620302200-9a762244a156', 'photo-1505693416388-ac5ce068fe85'],
  decor: ['photo-1549490349-8643362247b5', 'photo-1584100936595-c0654b55a2e2', 'photo-1616486338812-3dadae4b4ace', 'photo-1600166898405-da9535204843', 'photo-1507473885765-e6ed057f782c'],

  // Groceries (verified)
  groceries: ['photo-1542838132-92c53300491e', 'photo-1550583724-b2692b85b150', 'photo-1586201375761-83865001e31c', 'photo-1560806887-1e4cd0b6cbd6'],
  grains: ['photo-1586201375761-83865001e31c', 'photo-1518977676601-b53f82aba655'],

  // Beauty (verified)
  beauty: ['photo-1586495777744-4413f21062fa', 'photo-1620916566398-39f1143ab7be', 'photo-1556229010-6c3f2c9ca5f8', 'photo-1541643600914-78b084683601'],

  // Sports & fitness (verified)
  fitness: ['photo-1517836357463-d25dfeac3438', 'photo-1583454110551-21f2fa2afe61', 'photo-1593095948071-474c5cc2989d', 'photo-1601925260368-ae2f83cf8b7f'],

  // Toys (verified)
  toys: ['photo-1515488042361-1e7ec8ecf176'],

  // Books (verified)
  books: ['photo-1497633762265-9d179a990aa6', 'photo-1512820790803-83ca734da794'],

  // Pets (verified)
  pets: ['photo-1583511655857-d19b40a7a54e'],

    // Automotive (verified)
  auto: ['photo-1492144534655-ae79c964c9d7', 'photo-1503376780353-7e6692767b70'],

  // Office & stationery (verified)
  office: ['photo-1456735190827-d1262f71b8a3', 'photo-1517842645767-c639042777db'],

  // Appliances (TVs, kitchen appliances, laundry)
  appliance: ['photo-1593359677879-a4bb92f829d1', 'photo-1522869635100-9f4c5e86aa37', 'photo-1584568694244-14fbdf83bd30', 'photo-1571175443880-49e1d25b2bc5', 'photo-1626806787461-102c1bfaaea1', 'photo-1546039907-7fa05f864c02'],

  // Groceries sub-types
  dairy: ['photo-1550583724-b2692b85b150', 'photo-1563636619-e9143da7973b', 'photo-1508852953112-4b7d25d69a8e'],
  fruits: ['photo-1560806887-1e4cd0b6cbd6', 'photo-1571771894821-ce9b6c11b08e', 'photo-1547514701-42782101795e'],
  vegetables: ['photo-1518977676601-b53f82aba655', 'photo-1618512496248-a07fe83aa8cf', 'photo-1592924357228-91a4daadcfea', 'photo-1597362925123-77861d3fbac7'],
  spices: ['photo-1596040033229-a9821ebd058d', 'photo-1556911220-bff31c812dba'],
  beverages: ['photo-1550966871-3ed3cdb5ed0c', 'photo-1495474472287-4d71bcdd2085', 'photo-1509042239860-f550ce710b93'],
  snacks: ['photo-1558961363-fa8fdf82db35', 'photo-1621996346565-e3dbc646d9a9', 'photo-1599490659213-e2b9527bd087'],
};

// Keyword aliases mapping model names, subcategories, and search terms to PHOTO_POOLS keys
const KEYWORD_ALIASES: Record<string, string> = {
  // Headphone & Earbud models
  'wh-1000xm5': 'headphone',
  'quietcomfort': 'headphone',
  'momentum': 'headphone',
  'tour one': 'headphone',
  'studio pro': 'headphone',
  'crown anc': 'headphone',
  'h9i': 'headphone',

  'airpods': 'earbud',
  'buds': 'earbud',
  'wf-1000xm6': 'earbud',
  'tour pro': 'earbud',
  'earphone': 'earbud',

  // Gaming models
  'playstation': 'gaming',
  'xbox': 'gaming',
  'nintendo': 'gaming',
  'dualsense': 'gaming',
  'ps vr': 'gaming',
  'game': 'gaming',

  // Speaker models
  'homepod': 'speaker',
  'sonos': 'speaker',
  'jbl': 'speaker',
  'marshall': 'speaker',
  'echo': 'speaker',

  // Cameras
  'sony a1': 'camera',
  'eos': 'camera',
  'nikon': 'camera',
  'fujifilm': 'camera',
  'osmo': 'camera',
  'gopro': 'camera',
  'lumix': 'camera',

  // Routers
  'deco': 'router',
  'tp-link': 'router',
  'archer': 'router',
  'nighthawk': 'router',
  'mesh': 'router',

  // SSD
  '990 pro': 'ssd',
  'sn850': 'ssd',
  'sabrent': 'ssd',

  // Chargers & Power
  'ganprime': 'charger',
  'anker': 'charger',
  'power bank': 'charger',

  // Phones & Tablets & Laptops & Monitors
  'iphone': 'phone',
  'galaxy s': 'phone',
  'pixel': 'phone',
  'oneplus': 'phone',
  'xiaomi': 'phone',
  'smartphone': 'phone',

  'macbook': 'laptop',
  'xps': 'laptop',
  'thinkpad': 'laptop',
  'spectre': 'laptop',
  'zenbook': 'laptop',
  'predator': 'laptop',
  'surface laptop': 'laptop',

  'ipad': 'tablet',
  'galaxy tab': 'tablet',
  'surface pro': 'tablet',

  'ultrasharp': 'monitor',
  'rog swift': 'monitor',
  'pro display': 'monitor',


  // Clothing & Footwear
  'boot': 'shoe',
  'sandal': 'shoe',

  // Home & Sports & Auto & Office
  'cricket': 'sports',
  'football': 'sports',
  'stapler': 'office',
  'notes': 'notebook',
  'journal': 'notebook',
  'diary': 'notebook',
  'pencils': 'pen',
  'stationery': 'office',

  // --- Footwear ---
  'ultraboost': 'running',
  'pegasus': 'running',
  'air zoom': 'running',
  'gel-kayano': 'running',
  'fresh foam': 'running',
  'govrn': 'running',
  'floatride': 'running',
  'wave rider': 'running',
  'go run': 'running',
  'clifton': 'running',
  'stan smith': 'sneaker',
  'superstar': 'sneaker',
  'chuck taylor': 'sneaker',
  'old skool': 'sneaker',
  'samba': 'sneaker',
  'air max': 'sneaker',
  'air force': 'sneaker',
  'nike': 'sneaker',
  'adidas': 'sneaker',
  'asics': 'sneaker',
  'puma': 'sneaker',
  'reebok': 'sneaker',
  'skechers': 'sneaker',
  'new balance': 'sneaker',
  'hoka': 'sneaker',
  'brooks': 'running',
  'saucony': 'running',
  'mizuno': 'running',
  'under armour': 'running',
  'oxford': 'formal',
  'chelsea': 'formal',
  'loafer': 'formal',
  'heel': 'slipper',

  // --- Apparel extras ---
  'sweater': 'outerwear',
  'hoodie': 'outerwear',
  'knit': 'outerwear',
  'cardigan': 'outerwear',
  'full zip': 'outerwear',
  'cargo': 'chino',
  'denim': 'jean',
  'blazer': 'suit',
  'kurti': 'ethnic',
  'lehenga': 'ethnic',
  'anarkali': 'ethnic',
  'salwar': 'ethnic',
  'kurtas': 'ethnic',
    'tie': 'suit',

  // --- Home, furniture, decor, cookware ---
  'sectional': 'furniture',
  'dining': 'furniture',
  'table': 'furniture',
  'office chair': 'furniture',
  'chair': 'furniture',
  'shelf': 'furniture',
  'wardrobe': 'furniture',
  'dresser': 'furniture',
  'desk': 'furniture',
  'curtain': 'decor',
  'cushion': 'decor',
  'pillow': 'decor',
  'rug': 'decor',
  'carpet': 'decor',
  'lamp': 'decor',
  'vase': 'decor',
  'mirror': 'decor',
  'photo frame': 'decor',
  'clock': 'decor',
  'kadai': 'cookware',
  'tawa': 'cookware',
  'fry pan': 'cookware',
  'knife': 'cookware',
  'cutlery': 'cookware',
  'utensil': 'cookware',

  // --- Appliances ---
  'smart tv': 'appliance',
  'television': 'appliance',
  'oled': 'appliance',
  'qled': 'appliance',
  'led tv': 'appliance',
  'fridge': 'appliance',
  'refrigerator': 'appliance',
  'washing': 'appliance',
  'washer': 'appliance',
  'microwave': 'appliance',
  'oven': 'appliance',
  'toaster': 'appliance',
  'kettle': 'appliance',
  'induction': 'appliance',
  'vacuum': 'appliance',
  'air conditioner': 'appliance',

  // --- Groceries ---
  'milk': 'dairy',
  'curd': 'dairy',
  'yogurt': 'dairy',
  'cheese': 'dairy',
  'rice': 'grains',
  'basmati': 'grains',
  'atta': 'grains',
  'flour': 'grains',
  'dal': 'grains',
  'pulses': 'grains',
  'lentil': 'grains',
  'oil': 'grains',
  'wheat': 'grains',
  'apple': 'fruits',
  'banana': 'fruits',
  'orange': 'fruits',
  'mango': 'fruits',
  'grape': 'fruits',
  'fruit': 'fruits',
  'cabbage': 'vegetables',
  'pepper': 'vegetables',
  'vegetable': 'vegetables',
  'spice': 'spices',
  'masala': 'spices',
  'turmeric': 'spices',
  'cumin': 'spices',
  'coriander': 'spices',
  'chilli': 'spices',
  'tea': 'beverages',
  'juice': 'beverages',
  'snack': 'snacks',
  'biscuit': 'snacks',
  'chips': 'snacks',
  'noodle': 'snacks',
  'cereal': 'snacks',
  'ice cream': 'snacks',

  // --- Beauty ---
  'lipstick': 'beauty',
  'serum': 'beauty',
  'shampoo': 'beauty',
  'perfume': 'beauty',
  'moisturizer': 'beauty',
  'sunscreen': 'beauty',
  'toner': 'beauty',
  'mask': 'beauty',
  'makeup': 'beauty',
  'foundation': 'beauty',
  'cream': 'beauty',
  'lotion': 'beauty',
  'hair oil': 'beauty',
  'body wash': 'beauty',
  'soap': 'beauty',
  'toothpaste': 'beauty',

  // --- Sports & fitness ---
  'bat': 'sports',
  'soccer': 'sports',
  'basketball': 'sports',
  'badminton': 'sports',
  'tennis': 'sports',
  'hockey': 'sports',
  'dumbbell': 'fitness',
  'gym': 'fitness',
  'whey': 'fitness',
  'protein': 'fitness',
  'treadmill': 'fitness',
  'cycling': 'fitness',

  // --- Toys ---
  'building block': 'toys',
  'blocks': 'toys',
  'puzzle': 'toys',
  'doll': 'toys',
  'rc car': 'toys',
  'remote control': 'toys',
  'lego': 'toys',
  'plush': 'toys',
  'board game': 'toys',
  'toy': 'toys',

  // --- Books & pets ---
  'novel': 'books',
  'textbook': 'books',
  'comic': 'books',
  'book': 'books',
  'dog': 'pets',
  'cat': 'pets',
  'bird': 'pets',
  'aquarium': 'pets',
  'pet': 'pets',
  'collar': 'pets',
  'litter': 'pets',

  // --- Automotive ---
  'motorcycle': 'auto',
  'riding jacket': 'auto',
  'riding gloves': 'auto',
  'riding boots': 'auto',
  'engine oil': 'auto',
  'car polish': 'auto',
  'pressure washer': 'auto',
  'car cover': 'auto',
  'glove': 'auto',
  'car care': 'auto',
};

const CATEGORY_DEFAULT_IMAGE: Record<string, string> = {
  electronics: 'https://images.unsplash.com/photo-1498049860654-af1a5c566876?auto=format&fit=crop&w=800&q=80',
  'fashion-men': 'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=800&q=80',
  'fashion-women': 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80',
  'shoes-footwear': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
  shoes: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
  'home-kitchen-furniture': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
  'home-decor': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
  kitchen: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
  'sports-fitness-beauty': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80',
  'office-toys-groceries-automotive': 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
  kids: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=800&q=80',
  'pet-supplies': 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80',
  automotive: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
  'office-supplies': 'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?auto=format&fit=crop&w=800&q=80',
};

export function getCategoryImage(categorySlug: string): string {
  const catKey = (categorySlug || '').toLowerCase();

  // Prefer the first product image of the matching catalog category, but never
  // propagate a blocked host (pin-pad) or an empty value.
  const catalogCat = USER_CATALOG.find((c) => c.slug === catKey);
  if (catalogCat && catalogCat.products.length > 0) {
    const url = toUnsplashUrl(catalogCat.products[0].image);
    if (url) return url;
  }

  const photoId = CATEGORY_DEFAULT_IMAGE[catKey] || 'photo-1498049860654-af1a5c566876';
  return toUnsplashUrl(photoId) || 'https://images.unsplash.com/photo-1498049860654-af1a5c566876?auto=format&fit=crop&w=800&q=80';
}

/** Most-specific (longest alias) non-blocked PHOTO_POOLS pool for a product. */
function resolveTypePool(nameLower: string, subLower: string): string[] {
  let best: string[] = [];
  let bestLen = -1;
  for (const [alias, poolKey] of Object.entries(KEYWORD_ALIASES)) {
    if ((nameLower.includes(alias) || subLower.includes(alias)) && alias.length > bestLen) {
      const photos = (PHOTO_POOLS[poolKey] || []).filter((p) => toUnsplashUrl(p));
      if (photos.length > 0) {
        best = photos;
        bestLen = alias.length;
      }
    }
  }
  if (best.length > 0) return best;
  if (subLower.length > 0) {
    for (const [poolKey, photosRaw] of Object.entries(PHOTO_POOLS)) {
      if (subLower.includes(poolKey) || poolKey.includes(subLower)) {
        const photos = photosRaw.filter((p) => toUnsplashUrl(p));
        if (photos.length > 0) return photos;
      }
    }
  }
  return [];
}

/** Build a gallery of DISTINCT images, primary first, from a resolved pool.
 *
 * When `forcedPrimary` is supplied (the curated-catalog / user-override path),
 * that single image is pinned as the primary and the remaining slots are
 * filled with deterministic, hash-driven alternatives from `pool` — so the
 * curated image is always the hero but the rest of the gallery still varies
 * per product.
 *
 * When `forcedPrimary` is omitted (type/alias/category/fallback pools), EVERY
 * slot — including the primary — is hash-driven by product identity. This is
 * what prevents the category-wide "every product shows the same primary image"
 * bug: different products resolve to different starting offsets in the same pool.
 */
function buildImageList(
  pool: string[],
  name: string,
  productIndex: number,
  forcedPrimary?: string,
): { url: string; alt: string; order: number }[] {
  const poolClean = pool.filter((p) => toUnsplashUrl(p));
  const identity = name.toLowerCase();
  const seen = new Set<string>();
  const urls: string[] = [];

  if (forcedPrimary) {
    const primary = toUnsplashUrl(forcedPrimary);
    if (primary) {
      seen.add(primary);
      urls.push(primary);
    }
  }

  const remaining = poolClean.filter((p) => {
    const u = toUnsplashUrl(p);
    return u && !seen.has(u);
  });
  const count = forcedPrimary ? 3 : 4;
  for (const url of pickUniqueImages(remaining, identity, productIndex, count)) {
    if (url && !seen.has(url)) {
      seen.add(url);
      urls.push(url);
    }
  }

  return urls.map((url, order) => ({
    url,
    alt: `${name} — view ${order + 1}`,
    order,
  }));
}

export function getProductImages(product: ProductInfo, productIndex: number = 0) {
  const nameLower = (product.name || '').toLowerCase();
  const subLower = (product.subcategory || '').toLowerCase();
  const catKey = (product.categorySlug || '').toLowerCase();
  const typePool = resolveTypePool(nameLower, subLower);

     // 0. EXACT catalog match (user-provided names + image links). The catalog's
   //    curated image is an authoritative primary; blocked-host (pin-pad) links
   //    are skipped via toUnsplashUrl so they can never win over the verified
   //    type pools. The remaining gallery slots come from the type pool so the
   //    primary stays curated but the other views vary per product.
   const catalogMatch = findCatalogProduct(product.name || '');
   if (catalogMatch) {
     const curated = toUnsplashUrl(catalogMatch.product.image) || undefined;
     if (curated) {
       return buildImageList(typePool, product.name, productIndex, catalogMatch.product.image);
     }
     if (typePool.length > 0) return buildImageList(typePool, product.name, productIndex);
   }

  // 1. Exact-name match inside the user catalog (case/whitespace tolerant).
  const exactCatalog = USER_CATALOG.flatMap((c) => c.products).find(
    (p) => p.name.trim().toLowerCase() === nameLower
  );
    if (exactCatalog) {
    const curated = toUnsplashUrl(exactCatalog.image) || undefined;
    if (curated) {
      return buildImageList(typePool, product.name, productIndex, exactCatalog.image);
    }
    if (typePool.length > 0) return buildImageList(typePool, product.name, productIndex);
  }

  // 2. Explicit user-provided image overrides (matched by product name).
  //    Blocked (pin-pad) overrides are skipped so they can never win over the
  //    verified type pools.
  for (const [customKey, photoId] of Object.entries(USER_CUSTOM_PRODUCT_IMAGES)) {
        if (nameLower.includes(customKey)) {
      const curated = toUnsplashUrl(photoId) || undefined;
      if (curated) {
        return buildImageList(typePool, product.name, productIndex, photoId);
      }
      if (typePool.length > 0) return buildImageList(typePool, product.name, productIndex);
    }
  }

  // 3. Subcategory/alias pool matched from the product name.
  if (typePool.length > 0) {
    return buildImageList(typePool, product.name, productIndex);
  }

  // 4. Main category pool from image-pools.ts (verified Unsplash photos).
  if (imagePools[catKey] && imagePools[catKey].length > 0) {
    const categoryPhotos = imagePools[catKey].filter((p) => toUnsplashUrl(p));
    if (categoryPhotos.length > 0) {
      return buildImageList(categoryPhotos, product.name, productIndex);
    }
  }

  // 5. Ultimate category-aware fallback pool.
  const fallbackPool: string[] = [];
  if (catKey.includes('shoes')) {
    fallbackPool.push('https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80');
    fallbackPool.push('https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80');
  } else if (catKey.includes('fashion') || catKey.includes('apparel')) {
    fallbackPool.push('https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=800&q=80');
    fallbackPool.push('https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80');
  } else if (catKey.includes('home') || catKey.includes('furniture')) {
    fallbackPool.push('https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80');
    fallbackPool.push('https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80');
  } else if (catKey.includes('groceries') || catKey.includes('food')) {
    fallbackPool.push('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80');
  } else if (catKey.includes('sports') || catKey.includes('fitness')) {
    fallbackPool.push('https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80');
  } else if (catKey.includes('kids') || catKey.includes('toy')) {
    fallbackPool.push('https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=800&q=80');
        } else if (catKey.includes('auto') || catKey.includes('automotive')) {
    fallbackPool.push('https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80');
  } else if (catKey.includes('beauty') || catKey.includes('cosmetic')) {
    fallbackPool.push('https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80');
  } else if (catKey.includes('book')) {
    fallbackPool.push('https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80');
  } else if (catKey.includes('pet') || catKey.includes('animal')) {
    fallbackPool.push('https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80');
  } else if (catKey.includes('kitchen') || catKey.includes('cook')) {
    fallbackPool.push('https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80');
  } else {
    fallbackPool.push('https://images.unsplash.com/photo-1498049860654-af1a5c566876?auto=format&fit=crop&w=800&q=80');
  }

  return buildImageList(fallbackPool, product.name, productIndex);
}
