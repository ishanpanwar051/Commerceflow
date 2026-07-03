import { CartRepository, CouponRepository } from '../repositories';
import { ProductRepository } from '../repositories';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { calculateTax, calculateShipping } from '../utils/helpers';

export class CartService {
  private cartRepo: CartRepository;
  private productRepo: ProductRepository;
  private couponRepo: CouponRepository;

  constructor() {
    this.cartRepo = new CartRepository();
    this.productRepo = new ProductRepository();
    this.couponRepo = new CouponRepository();
  }

  async getCart(userId: string) {
    const cart = await this.cartRepo.findByUser(userId);
    if (!cart) {
      return await this.cartRepo.upsert(userId);
    }
    return this.enrichCart(cart);
  }

  async addItem(userId: string, productId: string, quantity: number) {
    const product = await this.productRepo.findById(productId);
    if (!product) throw new NotFoundError('Product');
    if (!product.isActive || product.deletedAt) throw new BadRequestError('Product is not available');

    const inventory = product.inventory;
    if (inventory && inventory.stock - inventory.reservedStock < quantity) {
      throw new BadRequestError('Insufficient stock');
    }

    const cart = await this.cartRepo.upsert(userId);
    await this.cartRepo.addItem(cart.id, productId, quantity);

    return this.getCart(userId);
  }

  async updateItemQuantity(userId: string, productId: string, quantity: number) {
    const cart = await this.cartRepo.findByUser(userId);
    if (!cart) throw new NotFoundError('Cart');

    const product = await this.productRepo.findById(productId);
    if (!product) throw new NotFoundError('Product');

    const inventory = product.inventory;
    if (inventory && inventory.stock - inventory.reservedStock < quantity) {
      throw new BadRequestError('Insufficient stock');
    }

    const item = await this.cartRepo.updateItemQuantity(cart.id, productId, quantity);
    if (!item) throw new NotFoundError('Cart item');

    return this.getCart(userId);
  }

  async removeItem(userId: string, productId: string) {
    const cart = await this.cartRepo.findByUser(userId);
    if (!cart) throw new NotFoundError('Cart');

    const result = await this.cartRepo.removeItem(cart.id, productId);
    if (!result) throw new NotFoundError('Cart item');

    return this.getCart(userId);
  }

  async clearCart(userId: string) {
    const cart = await this.cartRepo.findByUser(userId);
    if (!cart) return null;

    await this.cartRepo.clearCart(cart.id);
    return this.cartRepo.upsert(userId);
  }

  async applyCoupon(userId: string, code: string) {
    const coupon = await this.couponRepo.findByCode(code);
    if (!coupon) throw new NotFoundError('Coupon');
    if (!coupon.isActive || coupon.deletedAt) throw new BadRequestError('Coupon is expired');
    if (coupon.expiresAt && coupon.expiresAt < new Date()) throw new BadRequestError('Coupon has expired');
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) throw new BadRequestError('Coupon usage limit reached');

    const cart = await this.getCart(userId);
    const subtotal = (cart as any).subtotal || 0;

    if (coupon.minOrderAmount && subtotal < Number(coupon.minOrderAmount)) {
      throw new BadRequestError(`Minimum order amount of $${coupon.minOrderAmount} required`);
    }

    let discount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discount = subtotal * (Number(coupon.discountValue) / 100);
      if (coupon.maxDiscount) {
        discount = Math.min(discount, Number(coupon.maxDiscount));
      }
    } else {
      discount = Number(coupon.discountValue);
    }

    return { ...cart, coupon: coupon, discount };
  }

  private enrichCart(cart: any) {
    if (!cart || !cart.items) return cart;

    const subtotal = cart.items.reduce((sum: number, item: any) => {
      return sum + Number(item.product.basePrice) * item.quantity;
    }, 0);

    return {
      ...cart,
      subtotal: Math.round(subtotal * 100) / 100,
      itemCount: cart.items.reduce((sum: number, item: any) => sum + item.quantity, 0),
    };
  }
}
