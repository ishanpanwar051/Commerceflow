import { getProductImages } from './backend/prisma/product-images';

const sampleProducts = [
  { name: 'Sony WH-1000XM6', categorySlug: 'electronics', subcategory: 'Headphones' },
  { name: 'AirPods Pro 3', categorySlug: 'electronics', subcategory: 'Earbuds' },
  { name: 'Watches Deluxe Edition 1', categorySlug: 'fashion-men', subcategory: 'Watches' },
  { name: 'Sunglasses Elite Edition 1', categorySlug: 'fashion-men', subcategory: 'Sunglasses' },
  { name: 'Watches Essential Edition 1', categorySlug: 'fashion-men', subcategory: 'Watches' },
  { name: 'Sunglasses Classic Edition 1', categorySlug: 'fashion-men', subcategory: 'Sunglasses' },
  { name: 'Wallets Elite Edition 1', categorySlug: 'fashion-men', subcategory: 'Wallets' },
];

console.log('Testing image resolution for sample products:\n');
sampleProducts.forEach((p, idx) => {
  const imgs = getProductImages(p, idx);
  console.log(`[${p.name}] -> ${imgs[0].url}`);
});
