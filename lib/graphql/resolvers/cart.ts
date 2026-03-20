import { GraphQLContext } from '../context';
import { getDatabase } from '@/lib/db';

const db = getDatabase();

export const cartResolvers = {
  Query: {
    cart: async (_: any, { }: any, context: GraphQLContext) => {
      // Allow unauthenticated users - return empty cart
      if (!context.user) {
        return {
          id: 'cart-guest',
          items: [],
          subtotal: 0,
          total: 0,
          itemCount: 0
        };
      }

      const cart = await db.carts.get(context.user.id);

      // Map cart items to include product data
      const itemsWithProducts = await Promise.all(cart.items.map(async (item: any) => ({
        ...item,
        product: await db.products.getById(item.productId)
      })));

      // Calculate totals
      const subtotal = itemsWithProducts.reduce((sum: number, item: any) => {
        const product = item.product;
        if (!product) return sum;
        const price = product.price * (1 - (product.discount || 0) / 100);
        return sum + (price * item.quantity);
      }, 0);

      return {
        id: `cart-${context.user.id}`,
        items: itemsWithProducts,
        subtotal,
        total: subtotal,
        itemCount: itemsWithProducts.reduce((sum: number, item: any) => sum + item.quantity, 0)
      };
    },
  },

  Mutation: {
    addToCart: async (
      _: any,
      { input }: { input: { productId: string; variantId?: string; quantity?: number } },
      context: GraphQLContext
    ) => {
      // Allow unauthenticated users - return empty cart (client will handle with localStorage)
      if (!context.user) {
        return {
          id: 'cart-guest',
          items: [],
          subtotal: 0,
          total: 0,
          itemCount: 0
        };
      }

      const cart = await db.carts.get(context.user.id);
      const productId = parseInt(input.productId);
      const quantity = input.quantity || 1;

      const existingItemIdx = cart.items.findIndex((item: any) => item.productId === productId);

      if (existingItemIdx > -1) {
        cart.items[existingItemIdx].quantity += quantity;
      } else {
        cart.items.push({
          id: `ci-${Date.now()}`,
          productId,
          quantity,
          price: 0,
        });
      }

      await db.carts.update(context.user.id, cart.items);
      return await cartResolvers.Query.cart(_, {}, context);
    },

    updateCartItem: async (
      _: any,
      { itemId, quantity }: { itemId: string; quantity: number },
      context: GraphQLContext
    ) => {
      if (!context.user) {
        return {
          id: 'cart-guest',
          items: [],
          subtotal: 0,
          total: 0,
          itemCount: 0
        };
      }

      const cart = await db.carts.get(context.user.id);
      const itemIdx = cart.items.findIndex((item: any) => item.id === itemId);

      if (itemIdx === -1) throw new Error('Cart item not found');

      if (quantity <= 0) {
        cart.items.splice(itemIdx, 1);
      } else {
        cart.items[itemIdx].quantity = quantity;
      }

      await db.carts.update(context.user.id, cart.items);
      return await cartResolvers.Query.cart(_, {}, context);
    },

    removeCartItem: async (
      _: any,
      { itemId }: { itemId: string },
      context: GraphQLContext
    ) => {
      if (!context.user) {
        return {
          id: 'cart-guest',
          items: [],
          subtotal: 0,
          total: 0,
          itemCount: 0
        };
      }

      const cart = await db.carts.get(context.user.id);
      cart.items = cart.items.filter((item: any) => item.id !== itemId);

      await db.carts.update(context.user.id, cart.items);
      return await cartResolvers.Query.cart(_, {}, context);
    },

    clearCart: async (_: any, { }: any, context: GraphQLContext) => {
      if (!context.user) {
        return true;
      }

      await db.carts.clear(context.user.id);
      return true;
    },
  },
};
