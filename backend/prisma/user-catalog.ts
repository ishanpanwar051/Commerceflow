// Catalog: 4 parent groups -> 15 subcategories, 10 products each.
// Fill in each product's name (required) and image URL (optional).
// Format:
//   S('Laptops', 'laptops', 'desc', [
//     { name: 'MacBook Pro', image: 'https://.../macbook.jpg' },
//     { name: 'Dell XPS', image: 'https://.../xps.jpg' },
//     { name: 'Plain Name Without Image', },  // falls back to category image
//     ...
//   ])

export interface UserCatalogProduct {
  name: string;
  image?: string;
}

export type UserCatalogProductInput = string | { name: string; image?: string };

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

function toProduct(input: UserCatalogProductInput): UserCatalogProduct {
  if (typeof input === 'string') return { name: input };
  return { name: input.name, ...(input.image ? { image: input.image } : {}) };
}

function sub(name: string, slug: string, description: string, names: UserCatalogProductInput[]): UserCatalogSubcategory {
  return { name, slug, description, products: names.map(toProduct) };
}

const S = (
  name: string,
  slug: string,
  description: string,
  ...names: UserCatalogProductInput[][]
): UserCatalogSubcategory => sub(name, slug, description, names.flat());

export const USER_CATALOG: UserCatalogCategory[] = [
  {
    name: 'Electronics',
    slug: 'electronics',
    description: 'Phones, laptops, headphones and smartwatches from top brands',
    subcategories: [
      S('Smartphones', 'smartphones', 'Latest smartphones with powerful cameras', [
        { name: 'Apple iPhone 15 Pro', image: 'https://i.pinimg.com/736x/d5/6d/b7/d56db7f2c42a63ebf33019cdb39f8b56.jpg' },
        { name: 'Samsung Galaxy S24 Ultra', image: 'https://i.pinimg.com/1200x/b1/c8/a0/b1c8a02685c6f0a7f539c8dcf30a6441.jpg' },
        { name: 'Google Pixel 8 Pro', image: 'https://i.pinimg.com/1200x/7f/94/6a/7f946ad8484f77e08529409b430a9afb.jpg' },
        { name: 'OnePlus 12', image: 'https://i.pinimg.com/1200x/75/ac/02/75ac02a349e386250895450a6b68e54b.jpg' },
        { name: 'Xiaomi Redmi Note 13 Pro', image: 'https://i.pinimg.com/736x/05/22/75/052275b3ddbfab7d6cf03e401812ade5.jpg' },
        { name: 'Nothing Phone 2', image: 'https://i.pinimg.com/1200x/89/ed/ec/89edec17b00e33e4bd399e7fc686a54c.jpg' },
        { name: 'Realme GT 5 Pro', image: 'https://i.pinimg.com/736x/40/77/15/407715e4372b4fd10fedacb85594de67.jpg' },
        { name: 'Vivo X100 Pro', image: 'https://i.pinimg.com/736x/84/31/b6/8431b616128e8917324777fad147ca98.jpg' },
        { name: 'Motorola Edge 50 Pro', image: 'https://i.pinimg.com/1200x/63/64/cd/6364cda2e96c1c6e16a5b4d5c823166d.jpg' },
        { name: 'iQOO 12', image: 'https://i.pinimg.com/736x/cc/e9/92/cce9929eb9afe71cfe6c4377ffcb1b52.jpg' },
      ]),
      S('Laptops', 'laptops', 'Premium laptops for work, study and gaming', [
        { name: 'Apple MacBook Pro 14', image: 'https://i.pinimg.com/736x/35/bb/85/35bb853bc438f8f020ffb9887be6ddb2.jpg' },
        { name: 'Dell XPS 15', image: 'https://i.pinimg.com/736x/6e/df/c5/6edfc50d1122f0af11169d36b7608889.jpg' },
        { name: 'HP Spectre x360', image: 'https://i.pinimg.com/1200x/d2/8e/af/d28eafab4fc41f71c6684fbdbce02994.jpg' },
        { name: 'Lenovo ThinkPad X1 Carbon', image: 'https://i.pinimg.com/1200x/bd/4d/11/bd4d1111c0050b86db9934daeb0d74bc.jpg' },
        { name: 'Asus ROG Zephyrus G14', image: 'https://i.pinimg.com/736x/c6/c5/ca/c6c5cadc67d8f640d223f0644d2cc006.jpg' },
        { name: 'Acer Swift Go 14', image: 'https://i.pinimg.com/736x/45/f7/ae/45f7ae2c9c7af142d55902f5bd4e4bbb.jpg' },
        { name: 'MSI Stealth 16', image: 'https://i.pinimg.com/736x/6f/d0/83/6fd083a4af33bba1c4edec61afdedcec.jpg' },
        { name: 'Microsoft Surface Laptop 5', image: 'https://i.pinimg.com/1200x/e8/2e/b2/e82eb26a09d43e83e34bde540b72f39f.jpg' },
        { name: 'Razer Blade 15', image: 'https://i.pinimg.com/736x/21/bc/69/21bc69e5d24256dbaa4d6b9b70ea0284.jpg' },
        { name: 'Samsung Galaxy Book4 Pro', image: 'https://i.pinimg.com/736x/80/48/82/8048826a11b03ac42ff47bc292970da3.jpg' },
      ]),
      S('Headphones', 'headphones', 'Over-ear headphones with immersive sound', [
        { name: 'Sony WH-1000XM5', image: 'https://i.pinimg.com/736x/78/be/f2/78bef2a176e7394bf7a27f241339dfbe.jpg' },
        { name: 'Bose QuietComfort Ultra', image: 'https://i.pinimg.com/736x/ac/bb/ce/acbbcef56e26c321d46c9662f3d22dcd.jpg' },
        { name: 'Apple AirPods Max', image: 'https://i.pinimg.com/736x/17/3b/13/173b133db259444bca491d5034fa9ea3.jpg' },
        { name: 'Sennheiser Momentum 4', image: 'https://i.pinimg.com/736x/db/39/08/db3908415bb8391dec59a51c67487b9e.jpg' },
        { name: 'JBL Tour One M2', image: 'https://i.pinimg.com/736x/18/80/01/188001a55d452214c382236bca1374c5.jpg' },
        { name: 'Audio-Technica ATH-M50x', image: 'https://i.pinimg.com/736x/9c/df/30/9cdf3046e602ef1367d9ccb93ce7dae8.jpg' },
        { name: 'Beats Studio Pro', image: 'https://i.pinimg.com/1200x/6e/55/ef/6e55eff08c3b3d348c490a0bc251424b.jpg' },
        { name: 'Marshall Major IV', image: 'https://i.pinimg.com/1200x/cc/92/2a/cc922af61c33c9fd8ab150bfe03fe117.jpg' },
        { name: 'Skullcandy Crusher EVO', image: 'https://i.pinimg.com/736x/73/21/80/732180eec1165debc90ee8ff07641966.jpg' },
        { name: 'Sony WH-CH720N', image: 'https://i.pinimg.com/736x/e1/7c/7a/e17c7a7d08e29e01e424c311d0b5804f.jpg' },
      ]),
      S('Smartwatches', 'smartwatches', 'Fitness tracking smartwatches for every wrist', [
        { name: 'Apple Watch Ultra 2', image: 'https://i.pinimg.com/736x/db/79/ae/db79ae0811b51d566e7bdc6051697473.jpg' },
        { name: 'Samsung Galaxy Watch 6', image: 'https://i.pinimg.com/736x/78/d7/0b/78d70b59013c49593d797bb350e74ede.jpg' },
        { name: 'Google Pixel Watch 2', image: 'https://i.pinimg.com/736x/88/d0/82/88d08292a51f6fd85965584b1a77716d.jpg' },
        { name: 'Garmin Forerunner 265', image: 'https://i.pinimg.com/736x/8a/20/27/8a2027d6de6eb0c8e1711066e6213838.jpg' },
        { name: 'Fitbit Sense 2', image: 'https://i.pinimg.com/736x/b1/a3/11/b1a31157bbd1235351219b475114fc39.jpg' },
        { name: 'Amazfit GTR 4', image: 'https://i.pinimg.com/736x/38/88/fd/3888fd9762b18cbb74e2f0dcf6ee74b9.jpg' },
        { name: 'OnePlus Watch 2', image: 'https://i.pinimg.com/736x/8a/b1/26/8ab126e14e6d7631c2a189a7e78c36cd.jpg' },
        { name: 'Huawei Watch GT 4', image: 'https://i.pinimg.com/736x/85/1f/5d/851f5d5192e6af0831ddbd097e47701c.jpg' },
        { name: 'Fossil Gen 6', image: 'https://i.pinimg.com/736x/83/3d/e5/833de5f87e1012917ab203ef4dc82f48.jpg' },
        { name: 'TicWatch Pro 5', image: 'https://i.pinimg.com/236x/3b/a7/d0/3ba7d0545cfd0adca2ec30f8e8fd7987.jpg' },
      ]),
    ],
  },
  {
    name: 'Fashion',
    slug: 'fashion',
    description: 'Men and women fashion, plus running shoes',
    subcategories: [
      S('Men Apparel', 'men-apparel', 'T-shirts, shirts and denim for men', [
        { name: 'Levis Classic Denim Jacket', image: 'https://i.pinimg.com/236x/8e/c8/ee/8ec8ee36dfe1e8edacdb3f13dc3bc62f.jpg' },
        { name: 'Nike Dri-FIT Crew T-Shirt', image: 'https://i.pinimg.com/736x/a5/39/fd/a539fd75e92d2ca772521974dae6eb65.jpg' },
        { name: 'Puma Everyday Cotton T-Shirt', image: 'https://i.pinimg.com/1200x/4e/c7/25/4ec725569e73edbfc218c00b61613db5.jpg' },
        { name: 'Wrangler Slim Fit Jeans', image: 'https://i.pinimg.com/1200x/99/22/69/992269205dec5b37e9dc7cd6930f91e0.jpg' },
        { name: 'Adidas Essentials Hoodie', image: 'https://i.pinimg.com/1200x/08/b7/43/08b74332916bf22a34db74844ce431a4.jpg' },
        { name: 'Ralph Lauren Oxford Shirt', image: 'https://i.pinimg.com/1200x/3c/22/81/3c22818492306ef2d0037520f065cec6.jpg' },
        { name: 'H&M Chino Pants', image: 'https://i.pinimg.com/1200x/43/2b/72/432b720a49fed5bcb7851ea8f61d2b8c.jpg' },
        { name: 'Under Armour Performance Polo', image: 'https://i.pinimg.com/736x/ce/35/25/ce3525bc7a51ae2a6606075fa9f2a2c9.jpg' },
        { name: 'Levis 501 Original Jeans', image: 'https://i.pinimg.com/1200x/63/0b/7a/630b7aee8d19ffe185e18ca9c72e68b3.jpg' },
        { name: 'Tommy Hilfiger Casual Shirt', image: 'https://i.pinimg.com/736x/bc/b0/db/bcb0dbc57c219e8c94d4032654302df6.jpg' },
      ]),
      S('Women Collection', 'women-collection', 'Dresses, ethnic wear and accessories for women', [
        { name: 'Zara Floral Maxi Dress', image: 'https://i.pinimg.com/1200x/1a/15/02/1a15029ab19ce28c9924787e9483e270.jpg' },
        { name: 'H&M A-Line Midi Skirt', image: 'https://i.pinimg.com/1200x/34/31/36/3431369e767186f09e547d75adb2c00c.jpg' },
        { name: 'Forever 21 Boho Top', image: 'https://i.pinimg.com/736x/d9/5d/6c/d95d6c8f34967639e9210a5d302b1f12.jpg' },
        { name: 'Biba Printed Anarkali', image: 'https://i.pinimg.com/736x/c6/4e/4c/c64e4c367b7cce3d1a31976540738a0d.jpg' },
        { name: 'H&M Denim Shirt Dress', image: 'https://i.pinimg.com/1200x/8a/fb/b5/8afbb581e5fbf5dbe6d850b4d974b1a4.jpg' },
        { name: 'Zara Pleated Evening Gown', image: 'https://i.pinimg.com/736x/44/16/b2/4416b2f48c8051c801ea5bd4fb73b5a3.jpg' },
        { name: 'Fable Street Co-ord Set', image: 'https://i.pinimg.com/736x/c9/de/a6/c9dea64c2766dd340d5b30e031fdd831.jpg' },
        { name: 'Global Desi Kurta Set', image: 'https://i.pinimg.com/736x/a2/2d/2f/a22d2fe3854d328ae59ae125ce996caa.jpg' },
        { name: 'Mango Summer Wrap Dress', image: 'https://i.pinimg.com/1200x/44/be/bc/44bebc9d1d184c479732ea3de80d6249.jpg' },
        { name: 'H&M Knit Cardigan', image: 'https://i.pinimg.com/1200x/8b/4f/4f/8b4f4f41b029e3dbae6fe2586090a35e.jpg' },
      ]),
      S('Running Shoes', 'running-shoes', 'Cushioned running and lifestyle sneakers', [
        { name: 'Nike Air Zoom Pegasus 40', image: 'https://i.pinimg.com/1200x/83/90/d5/8390d55b5055cc445fc2eeaace2306d7.jpg' },
        { name: 'Adidas Ultraboost Light', image: 'https://i.pinimg.com/1200x/e2/7e/5c/e27e5c69e04e657f1b0843b9ebcfd392.jpg' },
        { name: 'Asics Gel-Kayano 29', image: 'https://i.pinimg.com/1200x/9a/2d/8a/9a2d8ac0ac314a2e3c12a2361bdb482c.jpg' },
        { name: 'New Balance Fresh Foam 1080', image: 'https://i.pinimg.com/1200x/65/a6/8a/65a68a57fa5e463e99910e954461b7e4.jpg' },
        { name: 'Puma Velocity Nitro 2', image: 'https://i.pinimg.com/1200x/0c/92/47/0c9247bb418a8fc0c00fc8154dd98970.jpg' },
        { name: 'Brooks Ghost 15', image: 'https://i.pinimg.com/1200x/c5/cd/c2/c5cdc20c7ab7176401bb93d0971207d3.jpg' },
        { name: 'Skechers Go Run 7', image: 'https://i.pinimg.com/1200x/0f/ea/e8/0feae83830a8dae61583b60244818acf.jpg' },
        { name: 'Under Armour Charged Assert 9', image: 'https://i.pinimg.com/1200x/02/f5/0d/02f50d89c02b279cd36d90750e6a36ab.jpg' },
        { name: 'Reebok Floatride Energy 4', image: 'https://i.pinimg.com/736x/2d/2b/97/2d2b97ad5d8fbaed8941ec4dab35f29a.jpg' },
        { name: 'Saucony Kinvara 14', image: 'https://i.pinimg.com/1200x/bb/81/18/bb811837d6946dfac8834372713a671e.jpg' },
      ]),
    ],
  },
  {
    name: 'Home & Living',
    slug: 'home-living',
    description: 'Decor, cookware, furniture and lighting for your home',
    subcategories: [
      S('Home Decor', 'home-decor', 'Vases, art, rugs and accents to style your space', [
        { name: 'Crate & Barrel Ceramic Vase Set', image: 'https://i.pinimg.com/1200x/44/d9/5d/44d95d68fce25c5d6d4c923e6b149f26.jpg' },
        { name: 'IKEA Abstract Wall Art', image: 'https://i.pinimg.com/1200x/e9/d3/83/e9d383f365e111f9d38b0cf366c412f9.jpg' },
        { name: 'West Elm Area Rug', image: 'https://i.pinimg.com/236x/14/46/a1/1446a1a54c4c0c1d058eff49cc7d7ab9.jpg' },
        { name: 'Wayfair Sculptural Table Lamp', image: 'https://i.pinimg.com/736x/10/ea/70/10ea70323de23a9f587a1d306ec9af60.jpg' },
        { name: 'Target Decorative Throw Pillows', image: 'https://i.pinimg.com/736x/b8/a2/36/b8a236c6c1b4f971c1ae70b7a8c8ad1e.jpg' },
        { name: 'Crate & Barrel Wall Mirror', image: 'https://i.pinimg.com/1200x/21/40/a0/2140a0c103d1e2a03964224bf77513cd.jpg' },
        { name: 'Anthropologie Candle Holders', image: 'https://i.pinimg.com/1200x/4c/7d/a7/4c7da713e70f4ecc35488e86bac5a271.jpg' },
        { name: 'IKEA Potted Plant Stand', image: 'https://i.pinimg.com/1200x/a4/d6/39/a4d639ab0355f1b5851569a493e02825.jpg' },
        { name: 'West Elm Accent Tray', image: 'https://i.pinimg.com/1200x/3d/a2/f2/3da2f21cfb24004bcc4cd7e1b431c86a.jpg' },
        { name: 'Pottery Barn Photo Frames', image: 'https://i.pinimg.com/736x/ef/e0/4b/efe04b72995ddafebfd210f5ccdcd119.jpg' },
      ]),
      S('Cookware', 'cookware', 'Pans, pots and kitchen essentials', [
        { name: 'Tefal Non-Stick Fry Pan', image: 'https://i.pinimg.com/1200x/a5/9a/29/a59a29c34da846309d275e132175c632.jpg' },
        { name: 'Prestige Pressure Cooker', image: 'https://i.pinimg.com/736x/91/5d/02/915d02568ddaa1b39f3eafd3bd328398.jpg' },
        { name: 'Hawkins Stainless Cookware Set', image: 'https://i.pinimg.com/1200x/03/84/a2/0384a2f363a8b00ceb0ede7cd797e158.jpg' },
        { name: 'Borosil Glass Storage Jars', image: 'https://i.pinimg.com/736x/a7/19/90/a71990e6596f5d94bdcfdbd370ba409e.jpg' },
        { name: 'Pigeon Induction Base Kadai', image: 'https://i.pinimg.com/736x/ff/87/de/ff87de263f9d5a32ccbe8e61f8e71dd2.jpg' },
        { name: 'Tupperware Kitchen Containers', image: 'https://i.pinimg.com/1200x/c2/9a/20/c29a20bc1676381f157d91dd26ca9e91.jpg' },
        { name: 'Meyer Ceramic Bakeware', image: 'https://i.pinimg.com/1200x/c4/e4/12/c4e41205d63e56788874146a26956f31.jpg' },
        { name: 'Wonderchef Chef Knife Set', image: 'https://i.pinimg.com/1200x/61/c3/1f/61c31f837103a9a822c5d409c5566f43.jpg' },
        { name: 'Le Creuset Cast Iron Casserole', image: 'https://i.pinimg.com/1200x/f1/16/33/f116338d05c88e44af52c32bb32106ab.jpg' },
        { name: 'Philips Air Fryer Basket', image: 'https://i.pinimg.com/1200x/35/eb/83/35eb83c5b3732efd65e53ee9ec87c140.jpg' },
      ]),
      S('Sofas & Beds', 'sofas-beds', 'Sofas, sectionals and comfortable beds', [
        { name: 'IKEA KIVIK Sofa', image: 'https://i.pinimg.com/1200x/f5/5f/50/f55f50cb5862c852cc382c2ce8f64bf7.jpg' },
        { name: 'West Elm Sectional Sofa', image: 'https://i.pinimg.com/1200x/e9/83/7b/e9837b8d9380ba466fb74a3618b8537b.jpg' },
        { name: 'Urban Ladder Recliner', image: 'https://i.pinimg.com/736x/3a/26/b6/3a26b6e3ef139e7806890737ea87e731.jpg' },
        { name: 'Nilkamal Storage Bed', image: 'https://i.pinimg.com/1200x/90/fb/39/90fb3928bd40a8537c8380c7352fd36d.jpg' },
        { name: 'Godrej Interio King Bed', image: 'https://i.pinimg.com/736x/75/80/5d/75805d68b72bcec76506a1ed0f5398fc.jpg' },
        { name: 'Durian Mattress Queen', image: 'https://i.pinimg.com/1200x/6d/7c/a1/6d7ca10ff7af82de2c1e1a44dfa9eb56.jpg' },
        { name: 'Wakefit Memory Foam Mattress', image: 'https://i.pinimg.com/736x/bb/de/3c/bbde3c41b176976f803b74f070c5f044.jpg' },
        { name: 'Home Centre 3-Seater Sofa', image: 'https://i.pinimg.com/736x/72/e1/0f/72e10ff10174698fa4e50dd1260ab3f1.jpg' },
        { name: 'Royal Oak TV Unit', image: 'https://i.pinimg.com/1200x/11/f0/e0/11f0e053888b1e4d86d6915598a2b5b1.jpg' },
        { name: 'Cushion My Feet Bed Frame', image: 'https://i.pinimg.com/736x/96/29/a1/9629a1d9e47d5c4a698c50c9432b42da.jpg' },
      ]),
      S('Lighting & Lamps', 'lighting-lamps', 'Lamps, pendants and ambient lighting', [
        { name: 'Philips LED Ceiling Light', image: 'https://i.pinimg.com/1200x/7f/7a/65/7f7a655e3d2d9091b50523837a9f240e.jpg' },
        { name: 'Wipro LED Table Lamp', image: 'https://i.pinimg.com/1200x/f1/bd/c3/f1bdc349a7d837c5866c022641111d19.jpg' },
        { name: 'Havells Smart Bulb', image: 'https://i.pinimg.com/736x/6c/88/a0/6c88a0a8e378df2172e024c47edc4f36.jpg' },
        { name: 'IKEA Floor Lamp', image: 'https://i.pinimg.com/1200x/9f/c9/04/9fc904da9fe3fdd57c3c03c83e8ee878.jpg' },
        { name: 'Syska Pendant Light', image: 'https://i.pinimg.com/736x/3c/1b/39/3c1b39f0e7300445519eb06a27606fe6.jpg' },
        { name: 'Jaipur Craft Brass Lamp', image: 'https://i.pinimg.com/1200x/fd/61/a0/fd61a0221d5a5294181ecb6839b8c9c0.jpg' },
        { name: 'GoodEarth Chandelier', image: 'https://i.pinimg.com/736x/5b/d1/36/5bd1365bc98759e6d08b2fec5a93beec.jpg' },
        { name: 'Faber Desk Lamp', image: 'https://i.pinimg.com/1200x/08/c2/34/08c23443b389666454087e537202d755.jpg' },
        { name: 'Panasonic Night Light', image: 'https://i.pinimg.com/736x/af/ce/98/afce988fe568935d5565368d57b62851.jpg' },
        { name: 'Wipro Wall Sconce', image: 'https://i.pinimg.com/736x/54/d9/fe/54d9fe399da5d75134320a2e7f528146.jpg' },
      ]),
    ],
  },
  {
    name: 'Essentials',
    slug: 'essentials',
    description: 'Beauty, fitness, toys and pet essentials',
    subcategories: [
      S('Beauty & Skincare', 'beauty-skincare', 'Skincare, makeup and hair care products', [
        { name: 'Nykaa Vitamin C Serum', image: 'https://i.pinimg.com/736x/f5/0d/c2/f50dc2782bbd466b0796610a8743d215.jpg' },
        { name: "L'Oréal Paris Face Wash", image: 'https://i.pinimg.com/736x/eb/48/37/eb483776e0aae7e3571a79686a745bdf.jpg' },
        { name: 'Neutrogena Moisturizer', image: 'https://i.pinimg.com/736x/2a/18/d7/2a18d778dc96d1bf1bf370f170463897.jpg' },
        { name: 'Mamaearth Aloe Gel', image: 'https://i.pinimg.com/1200x/48/82/2d/48822d9f12e86dd39c5b57a635d944d8.jpg' },
        { name: 'Cetaphil Cleanser', image: 'https://i.pinimg.com/736x/2d/9a/16/2d9a164193efc81a853c6cf5d9080828.jpg' },
        { name: 'Plum Green Tea Cream', image: 'https://i.pinimg.com/736x/89/96/0b/89960bac4763a15bb82084741a6e272a.jpg' },
        { name: 'Lakmé Compact Powder', image: 'https://i.pinimg.com/736x/0f/46/4d/0f464dc67edecd6d321589c8310ec131.jpg' },
        { name: 'Maybelline Foundation', image: 'https://i.pinimg.com/736x/7e/09/0f/7e090f89a3c18537d9f4a304480a68f5.jpg' },
        { name: 'Himalaya Face Pack', image: 'https://i.pinimg.com/736x/4b/ef/1f/4bef1fa5d4ea97c9cf2b11965bf2414f.jpg' },
        { name: 'The Ordinary Niacinamide', image: 'https://i.pinimg.com/736x/e4/fe/28/e4fe28b8110fa464a6f2fb3776fbcb75.jpg' },
      ]),
      S('Fitness & Gym', 'fitness-gym', 'Gym equipment, protein and activewear', [
        { name: 'AmazonBasics Dumbbell Set', image: 'https://i.pinimg.com/1200x/5a/e8/d6/5ae8d6f157fe91f066e6dd058090cc65.jpg' },
        { name: 'Probody Push-Up Board', image: 'https://i.pinimg.com/736x/10/8e/05/108e0518f17e055ec446dc76fca09f2d.jpg' },
        { name: '4D Master Yoga Mat', image: 'https://i.pinimg.com/1200x/a4/ad/9f/a4ad9fb2cda097ffe0a1c8c10a3f6130.jpg' },
        { name: 'Kookaburra Resistance Bands', image: 'https://i.pinimg.com/1200x/80/5a/42/805a420db1e00964176e76ebff21c6ab.jpg' },
        { name: 'Reebok Home Treadmill', image: 'https://i.pinimg.com/1200x/e8/68/89/e8688964e25b1a090c6e3b3b52c49a6f.jpg' },
        { name: 'Straps Compression Wear', image: 'https://i.pinimg.com/1200x/9f/ae/92/9fae929df1204f525f954ba64065d4ca.jpg' },
        { name: 'MuscleBlaze Whey Protein', image: 'https://i.pinimg.com/736x/6c/d9/28/6cd92835bc12233864e5a8c52019ab8c.jpg' },
        { name: 'Kobo Steel Kettlebell', image: 'https://i.pinimg.com/736x/07/d0/e5/07d0e5dd463d8237a1f0818af7988b3f.jpg' },
        { name: 'Decathlon Skipping Rope', image: 'https://i.pinimg.com/736x/30/71/5c/30715c525c71514484ae1d439e13b547.jpg' },
        { name: 'Bolt Fitness Battle Rope', image: 'https://i.pinimg.com/736x/08/f9/83/08f983402993d4ad016c9ff520940178.jpg' },
      ]),
      S('Toys & Games', 'toys-games', 'Building blocks, puzzles and kids toys', [
        { name: 'LEGO Classic Building Blocks', image: 'https://i.pinimg.com/736x/77/df/9c/77df9c5e84cc823ebbc845553cab0c90.jpg' },
        { name: 'Hot Wheels Race Track Set', image: 'https://i.pinimg.com/736x/88/f3/28/88f3281b89f314ed0b6603752f947865.jpg' },
        { name: 'Barbie Dreamhouse', image: 'https://i.pinimg.com/1200x/93/34/cf/9334cf3e3c38b9b526b6bffd79f38791.jpg' },
        { name: 'Hasbro Monopoly Board Game', image: 'https://i.pinimg.com/1200x/27/55/d0/2755d00cf8513fd8bb52cc235c2b41cb.jpg' },
        { name: 'Funskool Jigsaw Puzzle', image: 'https://i.pinimg.com/736x/7e/42/12/7e42124b0494426723c7ebe80ef7f6d5.jpg' },
        { name: 'Mattel UNO Cards', image: 'https://i.pinimg.com/736x/3d/0a/56/3d0a5689157c2c15afba27ee320e44e9.jpg' },
        { name: 'Nerf N-Strike Blaster', image: 'https://i.pinimg.com/736x/73/ca/ab/73caabfb0bc254b62f03daa3ca2119cd.jpg' },
        { name: 'Fisher-Price Piano Mat', image: 'https://i.pinimg.com/1200x/69/c5/72/69c572034ac858c3df6863d663bdd539.jpg' },
        { name: "Rubik's Cube 3x3", image: 'https://i.pinimg.com/736x/d4/35/ac/d435ac5e9a66d215b295aa54b365ae06.jpg' },
        { name: 'Goli Remote Control Car', image: 'https://i.pinimg.com/736x/5e/b3/1a/5eb31a4a1e8bdf47591a19729dde9946.jpg' },
      ]),
      S('Pet Supplies', 'pet-supplies', 'Food, beds and accessories for your pets', [
        { name: 'Pedigree Dog Food Bag', image: 'https://i.pinimg.com/736x/6d/41/f3/6d41f3201f148d0b672273a5221add2e.jpg' },
        { name: 'Whiskas Cat Food Pouches', image: 'https://i.pinimg.com/1200x/b2/6e/f9/b26ef9a4260c6a133a274a4102149356.jpg' },
        { name: 'PetZone Dog Collar', image: 'https://i.pinimg.com/736x/a7/c0/3e/a7c03ef9fbdf0ff80785be909957196a.jpg' },
        { name: 'Richelle Pet Grooming Kit', image: 'https://i.pinimg.com/736x/3b/aa/d7/3baad7cdda9ac647cf3588cf521929f9.jpg' },
        { name: 'SmartDog Kennel', image: 'https://i.pinimg.com/736x/09/03/9e/09039e9fb60d96a8ee1596753459ea90.jpg' },
        { name: 'Feline Cat Litter', image: 'https://i.pinimg.com/736x/12/0a/9c/120a9c692a3c7df67430d415bf8541b7.jpg' },
        { name: 'PetStock Chew Toy', image: 'https://i.pinimg.com/1200x/52/54/4f/52544f3213fb141a56e73ef38c8d7435.jpg' },
        { name: 'Happy Paws Pet Bed', image: 'https://i.pinimg.com/736x/c4/ba/d6/c4bad6b72fd1d27bd74a48b8f5875731.jpg' },
        { name: 'Zoozee Fish Tank', image: 'https://i.pinimg.com/736x/92/18/c9/9218c985c167a74a00921c6f2cd6645a.jpg' },
        { name: 'PawRise Bird Cage', image: 'https://i.pinimg.com/1200x/3b/3a/b6/3b3ab6f1205f6b8e8fdca9161d0657f5.jpg' },
      ]),
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