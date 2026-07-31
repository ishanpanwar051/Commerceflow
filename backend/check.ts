import { ProductRepository } from './src/repositories/productRepository';
async function main() {
  const repo = new ProductRepository();
  const products = await repo.findAll({ skip: 0, take: 10, sort: 'createdAt', order: 'desc' });
  console.log('FINDALL', products.length);
  const total = await repo.count({});
  console.log('COUNT', total);
}
main().catch((e) => { console.error('ERR', e.message, e.stack); process.exit(1); });
