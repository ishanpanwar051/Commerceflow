// Catalog: 4 parent groups -> 15 subcategories.
// Product names removed. Add your own products in the S() arrays below.

export interface UserCatalogProduct {
  name: string;
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

function sub(name: string, slug: string, description: string, names: string[]): UserCatalogSubcategory {
  return { name, slug, description, products: names.map((productName) => ({ name: productName })) };
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
      S('Smartphones', 'smartphones', 'Latest smartphones with powerful cameras'),
      S('Laptops', 'laptops', 'Premium laptops for work, study and gaming'),
      S('Headphones', 'headphones', 'Over-ear headphones with immersive sound'),
      S('Smartwatches', 'smartwatches', 'Fitness tracking smartwatches for every wrist'),
    ],
  },
  {
    name: 'Fashion',
    slug: 'fashion',
    description: 'Men and women fashion, plus running shoes',
    subcategories: [
      S('Men Apparel', 'men-apparel', 'T-shirts, shirts and denim for men'),
      S('Women Collection', 'women-collection', 'Dresses, ethnic wear and accessories for women'),
      S('Running Shoes', 'running-shoes', 'Cushioned running and lifestyle sneakers'),
    ],
  },
  {
    name: 'Home & Living',
    slug: 'home-living',
    description: 'Decor, cookware, furniture and lighting for your home',
    subcategories: [
      S('Home Decor', 'home-decor', 'Vases, art, rugs and accents to style your space'),
      S('Cookware', 'cookware', 'Pans, pots and kitchen essentials'),
      S('Sofas & Beds', 'sofas-beds', 'Sofas, sectionals and comfortable beds'),
      S('Lighting & Lamps', 'lighting-lamps', 'Lamps, pendants and ambient lighting'),
    ],
  },
  {
    name: 'Essentials',
    slug: 'essentials',
    description: 'Beauty, fitness, toys and pet essentials',
    subcategories: [
      S('Beauty & Skincare', 'beauty-skincare', 'Skincare, makeup and hair care products'),
      S('Fitness & Gym', 'fitness-gym', 'Gym equipment, protein and activewear'),
      S('Toys & Games', 'toys-games', 'Building blocks, puzzles and kids toys'),
      S('Pet Supplies', 'pet-supplies', 'Food, beds and accessories for your pets'),
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