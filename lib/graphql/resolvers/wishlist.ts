import { GraphQLContext } from '../context';
import { getDatabase } from '@/lib/db';

const db = getDatabase();

export const wishlistResolvers = {
  Query: {
    wishlist: async (_: any, __: any, context: GraphQLContext) => {
      // Allow unauthenticated users - return empty wishlist
      if (!context.user) {
        return [];
      }

      const items = await db.wishlist.getAll(context.user.id);

      return await Promise.all(items.map(async (item: any) => ({
        ...item,
        product: await db.products.getById(item.productId)
      })));
    },
  },

  Mutation: {
    addToWishlist: async (
      _: any,
      { productId }: { productId: string },
      context: GraphQLContext
    ) => {
      // Allow unauthenticated users - return mock item (client will handle with localStorage)
      if (!context.user) {
        const product = await db.products.getById(parseInt(productId));
        return {
          id: 'wishlist-guest',
          productId: parseInt(productId),
          product
        };
      }

      const product = await db.products.getById(parseInt(productId));

      if (!product) {
        throw new Error('Product not found');
      }

      const newItem = await db.wishlist.add(context.user.id, product.id);

      return {
        ...newItem,
        product
      };
    },

    removeFromWishlist: async (
      _: any,
      { productId }: { productId: string },
      context: GraphQLContext
    ) => {
      // Allow unauthenticated users - return true (client will handle with localStorage)
      if (!context.user) {
        return true;
      }

      return await db.wishlist.remove(context.user.id, parseInt(productId));
    },
  },
};
