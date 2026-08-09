// User-provided exact catalog: category -> items (name + exact image link).
// Order and links are preserved EXACTLY as provided. No auto-generated names/images.

export interface UserCatalogProduct {
  name: string;
  image: string;
}

export interface UserCatalogCategory {
  name: string;
  slug: string;
  description: string;
  products: UserCatalogProduct[];
}

export const USER_CATALOG: UserCatalogCategory[] = [
  {
    "name": "Electronics",
    "slug": "electronics",
    "description": "Electronic devices and accessories",
    "products": [
      {
        "name": "iPhone 17 Pro Max",
        "image": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80"
      },
      {
        "name": "iPhone 17 Pro",
        "image": "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=800&q=80"
      },
      {
        "name": "Samsung Galaxy S26 Ultra",
        "image": "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80"
      },
      {
        "name": "Samsung Galaxy S26+",
        "image": "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=80"
      },
      {
        "name": "Google Pixel 10 Pro XL",
        "image": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80"
      },
      {
        "name": "Google Pixel 10 Pro",
        "image": "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=800&q=80"
      },
      {
        "name": "OnePlus 13",
        "image": "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?auto=format&fit=crop&w=800&q=80"
      },
      {
        "name": "Xiaomi 16 Pro",
        "image": "https://images.unsplash.com/photo-1546054454-aa26e2b734c7?auto=format&fit=crop&w=800&q=80"
      },
      {
        "name": "Nothing Phone 3",
        "image": "https://images.unsplash.com/photo-1567581935884-3349723552ca?auto=format&fit=crop&w=800&q=80"
      },
      {
        "name": "Realme GT 7 Pro",
        "image": "https://images.unsplash.com/photo-1533228876829-65c94e7b5025?auto=format&fit=crop&w=800&q=80"
      },
      {
        "name": "Vivo X200 Pro",
        "image": "https://images.unsplash.com/photo-1556656793-08538906a9f8?auto=format&fit=crop&w=800&q=80"
      },
      {
        "name": "OPPO Find N5",
        "image": "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=800&q=80"
      },
      {
        "name": "MacBook Pro 16-inch",
        "image": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80"
      },
      {
        "name": "MacBook Air 15-inch",
        "image": "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80"
      },
      {
        "name": "Dell XPS 16",
        "image": "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80"
      },
      {
        "name": "Dell XPS 14",
        "image": "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80"
      }
    ]
  },
  {
    "name": "Fashion Men",
    "slug": "fashion-men",
    "description": "Men's clothing and accessories",
    "products": [
      {
        "name": "Classic White T-Shirt",
        "image": "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=800&q=80"
      },
      {
        "name": "Oversized Black T-Shirt",
        "image": "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80"
      },
      {
        "name": "Polo T-Shirt",
        "image": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80"
      },
      {
        "name": "Graphic Print T-Shirt",
        "image": "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=800&q=80"
      },
      {
        "name": "Plain Cotton T-Shirt",
        "image": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80"
      },
      {
        "name": "Striped T-Shirt",
        "image": "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80"
      },
      {
        "name": "Henley T-Shirt",
        "image": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80"
      },
      {
        "name": "Slim Fit T-Shirt",
        "image": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80"
      },
      {
        "name": "Oversized Graphic T-Shirt",
        "image": "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=800&q=80"
      },
      {
        "name": "Full Sleeve T-Shirt",
        "image": "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80"
      },
      {
        "name": "Premium Pique Polo",
        "image": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80"
      },
      {
        "name": "Basic Round Neck T-Shirt",
        "image": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80"
      },
      {
        "name": "Oxford Cotton Shirt",
        "image": "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=800&q=80"
      },
      {
        "name": "White Formal Shirt",
        "image": "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80"
      },
      {
        "name": "Black Casual Shirt",
        "image": "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80"
      },
      {
        "name": "Denim Shirt",
        "image": "https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?auto=format&fit=crop&w=800&q=80"
      }
    ]
  },
  {
    "name": "Fashion Women",
    "slug": "fashion-women",
    "description": "Women's clothing and accessories",
    "products": [
      {
        "name": "Floral Summer Maxi Dress",
        "image": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80"
      },
      {
        "name": "Cocktail Evening Dress",
        "image": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80"
      },
      {
        "name": "Silk Blouse Top",
        "image": "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80"
      },
      {
        "name": "Designer Banarasi Saree",
        "image": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80"
      },
      {
        "name": "Embroidered Cotton Kurta",
        "image": "https://i.pinimg.com/736x/91/c3/82/91c382be2031c07666296ed9e5db4eeb.jpg"
      },
      {
        "name": "Anarkali Suit Set",
        "image": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80"
      },
      {
        "name": "High-Waisted Denim Jeans",
        "image": "https://images.unsplash.com/photo-1582552938357-32b906df40cb?auto=format&fit=crop&w=800&q=80"
      },
      {
        "name": "Pleated A-Line Skirt",
        "image": "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=800&q=80"
      },
      {
        "name": "Ankle-Length Leggings",
        "image": "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&w=800&q=80"
      },
      {
        "name": "Trench Coat",
        "image": "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80"
      },
      {
        "name": "Fitted Denim Jacket",
        "image": "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80"
      },
      {
        "name": "Oversized Blazer",
        "image": "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80"
      },
      {
        "name": "Structured Leather Handbag",
        "image": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80"
      },
      {
        "name": "Evening Clutch",
        "image": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80"
      },
      {
        "name": "Gold Plated Necklace Set",
        "image": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80"
      },
      {
        "name": "Crystal Earrings",
        "image": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80"
      }
    ]
  },
  {
    "name": "Shoes & Footwear",
    "slug": "shoes-footwear",
    "description": "Footwear for everyone",
    "products": [
      {
        "name": "Nike Air Zoom Pegasus",
        "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80"
      },
      {
        "name": "Adidas Ultraboost",
        "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80"
      },
      {
        "name": "ASICS Gel-Kayano",
        "image": "https://i.pinimg.com/736x/7d/d2/15/7dd21547d9a806eb7405ae816879cd4a.jpg"
      },
      {
        "name": "New Balance Fresh Foam",
        "image": "https://i.pinimg.com/1200x/73/5c/48/735c48ac1c83075d9f4ff585685e6986.jpg"
      },
      {
        "name": "Brooks Ghost",
        "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80"
      },
      {
        "name": "Hoka Clifton",
        "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80"
      },
      {
        "name": "Puma Velocity Nitro",
        "image": "https://i.pinimg.com/1200x/74/3e/e9/743ee97edc537591513633ea243a68bc.jpg"
      },
      {
        "name": "Saucony Ride",
        "image": "https://i.pinimg.com/736x/44/63/10/446310856511784dd1cddb8793216302.jpg"
      },
      {
        "name": "Under Armour HOVR",
        "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80"
      },
      {
        "name": "Reebok Floatride",
        "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80"
      },
      {
        "name": "Mizuno Wave Rider",
        "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80"
      },
      {
        "name": "Skechers Go Run",
        "image": "https://i.pinimg.com/1200x/9c/09/4d/9c094d4dd0217085ee081cb07494a2c1.jpg"
      },
      {
        "name": "Nike Air Force 1",
        "image": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80"
      },
      {
        "name": "Adidas Stan Smith",
        "image": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80"
      },
      {
        "name": "Adidas Superstar",
        "image": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80"
      },
      {
        "name": "Converse Chuck Taylor",
        "image": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80"
      }
    ]
  },
  {
    "name": "Home, Kitchen & Furniture",
    "slug": "home-kitchen-furniture",
    "description": "Home decoration, kitchen and furniture products",
    "products": [
      {
        "name": "Modern 3-Seater Sofa",
        "image": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80"
      },
      {
        "name": "L-Shaped Sectional Sofa",
        "image": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80"
      },
      {
        "name": "Velvet Sofa",
        "image": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80"
      },
      {
        "name": "Leather Sofa",
        "image": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80"
      },
      {
        "name": "Recliner Sofa",
        "image": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80"
      },
      {
        "name": "Chesterfield Sofa",
        "image": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80"
      },
      {
        "name": "Modular Sofa",
        "image": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80"
      },
      {
        "name": "Loveseat Sofa",
        "image": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80"
      },
      {
        "name": "Sleeper Sofa",
        "image": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80"
      },
      {
        "name": "Minimalist Sofa",
        "image": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80"
      },
      {
        "name": "U-Shaped Sectional Sofa",
        "image": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80"
      },
      {
        "name": "Boucle Sofa",
        "image": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80"
      },
      {
        "name": "King Size Platform Bed",
        "image": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80"
      },
      {
        "name": "Queen Size Upholstered Bed",
        "image": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80"
      },
      {
        "name": "Wooden King Bed",
        "image": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80"
      },
      {
        "name": "Storage Bed",
        "image": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80"
      }
    ]
  },
  {
    "name": "Sports, Fitness & Beauty",
    "slug": "sports-fitness-beauty",
    "description": "Sports equipment, fitness and beauty products",
    "products": [
      {
        "name": "English Willow Cricket Bat",
        "image": "https://i.pinimg.com/736x/8f/ae/29/8fae29b50269b647015941d2b0c5da70.jpg"
      },
      {
        "name": "Official Size 5 Football",
        "image": "https://i.pinimg.com/736x/3c/eb/83/3ceb8345436ddfeed76b421e669a0bc5.jpg"
      },
      {
        "name": "Anti-Burst Yoga Mat",
        "image": "https://i.pinimg.com/736x/18/26/16/182616c7c012a82a569cd25d49ac2f9f.jpg"
      },
      {
        "name": "Adjustable Dumbbell Set",
        "image": "https://i.pinimg.com/736x/fd/8a/0f/fd8a0f1777dc88efa38e8ad81f8a14c0.jpg"
      },
      {
        "name": "Whey Protein Isolate",
        "image": "https://i.pinimg.com/736x/2b/11/42/2b1142d9a0be3e3fcba05ed73184702a.jpg"
      },
      {
        "name": "Matte Liquid Lipstick",
        "image": "https://i.pinimg.com/736x/6e/fd/ad/6efdadbcf8b9a972a37517574b743f29.jpg"
      },
      {
        "name": "Vitamin C Serum 30ml",
        "image": "https://i.pinimg.com/736x/72/6f/b0/726fb07219ee1bc015dbca0b5ceee99c.jpg"
      },
      {
        "name": "Hydrating Shampoo 500ml",
        "image": "https://i.pinimg.com/1200x/e7/73/3c/e7733c16f0f787c2493fa061e46b3efc.jpg"
      },
      {
        "name": "Eau de Parfum 100ml Spray",
        "image": "https://i.pinimg.com/736x/79/13/c6/7913c6429723d5ab11904e8a5e8e96c8.jpg"
      },
      {
        "name": "Skipping Rope",
        "image": "https://i.pinimg.com/736x/30/71/5c/30715c525c71514484ae1d439e13b547.jpg"
      },
      {
        "name": "Protein Shaker Bottle",
        "image": "https://i.pinimg.com/736x/45/6f/30/456f304ad449ca559f24ac1db4d21630.jpg"
      },
      {
        "name": "Resistance Bands Set",
        "image": "https://i.pinimg.com/1200x/52/81/28/528128616a0aab11c6f6e08e8216c7a0.jpg"
      },
      {
        "name": "Sports Water Bottle",
        "image": "https://i.pinimg.com/1200x/39/a7/41/39a741abd3192dcbb7dd0e7ef98e44ce.jpg"
      },
      {
        "name": "Aloe Vera Face Wash",
        "image": "https://i.pinimg.com/736x/d7/2d/eb/d72deb53c947f5490f50e979bbd0fa00.jpg"
      },
      {
        "name": "Broad Spectrum Sunscreen SPF50",
        "image": "https://i.pinimg.com/736x/7b/ea/52/7bea52faf7c5fb40e281d8504c0b1311.jpg"
      },
      {
        "name": "Hair Dryer 2000W",
        "image": "https://i.pinimg.com/1200x/11/a6/ec/11a6ecbacdc5ea97375e7264362b981e.jpg"
      }
    ]
  },
  {
    "name": "Office, Toys, Groceries & Automotive",
    "slug": "office-toys-groceries-automotive",
    "description": "Office supplies, toys, groceries and automotive products",
    "products": [
      {
        "name": "Executive Leather Notebook",
        "image": "https://i.pinimg.com/736x/90/c0/f8/90c0f82b8f61c346a172a424d4d0b10a.jpg"
      },
      {
        "name": "Premium Leather Journal",
        "image": "https://i.pinimg.com/736x/04/fa/33/04fa332e1b25caeb2d3f41e6081cc036.jpg"
      },
      {
        "name": "Gel Ink Pen Pack",
        "image": "https://i.pinimg.com/1200x/56/90/6b/56906b484cbff51bab870f71be30d76a.jpg"
      },
      {
        "name": "Luxury Ballpoint Pen Set",
        "image": "https://i.pinimg.com/736x/0d/18/3c/0d183c89e52f1da07091a03265d1c6cc.jpg"
      },
      {
        "name": "All-in-One Laser Printer",
        "image": "https://i.pinimg.com/736x/91/c3/82/91c382be2031c07666296ed9e5db4eeb.jpg"
      },
      {
        "name": "Wireless Laser Printer",
        "image": "https://i.pinimg.com/736x/6d/90/dd/6d90dd9d83f45259cb9972f948ed0528.jpg"
      },
      {
        "name": "Magnetic Dry-Erase Whiteboard",
        "image": "https://i.pinimg.com/1200x/df/d9/c7/dfd9c762d76443ff23d75ba6db7a8d52.jpg"
      },
      {
        "name": "Desk Organizer",
        "image": "https://i.pinimg.com/1200x/9c/27/2a/9c272a151e946a5f6e82b00f1d3d8208.jpg"
      },
      {
        "name": "Document File Organizer",
        "image": "https://i.pinimg.com/736x/17/67/c6/1767c6554d750bff3cd80b2334d49fbe.jpg"
      },
      {
        "name": "Sticky Notes Set",
        "image": "https://i.pinimg.com/736x/61/95/72/6195724cfcdca1c9970adbe2bef6d431.jpg"
      },
      {
        "name": "Educational Building Block Set",
        "image": "https://i.pinimg.com/1200x/9c/09/4d/9c094d4dd0217085ee081cb07494a2c1.jpg"
      },
      {
        "name": "Full Face Motorcycle Helmet",
        "image": "https://i.pinimg.com/1200x/f9/11/ad/f911ad7da3e9e200d1dfe15ec5c220c0.jpg"
      },
      {
        "name": "Sport Bike Racing Helmet",
        "image": "https://i.pinimg.com/736x/c1/27/06/c127061fad7834931f9b8a1bf0e19eaf.jpg"
      },
      {
        "name": "Modular Motorcycle Helmet",
        "image": "https://i.pinimg.com/1200x/35/7c/c9/357cc9de5083ac8ad3914e4c7d89cfd3.jpg"
      },
      {
        "name": "Leather Motorcycle Riding Jacket",
        "image": "https://i.pinimg.com/736x/0c/97/25/0c9725a2a235f40d57ff49e2be64dce7.jpg"
      },
      {
        "name": "Premium Biker Jacket",
        "image": "https://i.pinimg.com/1200x/a0/aa/04/a0aa04c014ea8684ce5344ccf9594289.jpg"
      }
    ]
  }
];

export function findCatalogProduct(name: string): { category: UserCatalogCategory; product: UserCatalogProduct } | null {
  const clean = (name || '').trim().toLowerCase();
  for (const cat of USER_CATALOG) {
    for (const p of cat.products) {
      if (p.name.trim().toLowerCase() === clean) {
        return { category: cat, product: p };
      }
    }
  }
  return null;
}
