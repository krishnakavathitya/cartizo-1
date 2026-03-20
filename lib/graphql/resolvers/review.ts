import { GraphQLContext, requireAuth } from '../context';
import { getDatabase } from '@/lib/db';

const db = getDatabase();

export const reviewResolvers = {
  Query: {
    productReviews: async (
      _: any,
      { productId }: { productId: string }
    ) => {
      const pId = parseInt(productId);
      const reviews = await db.reviews.getAll(pId);

      // Enrich with user and product data
      return await Promise.all(reviews.map(async (r: any) => ({
        ...r,
        user: await db.users.getById(r.userId),
        product: await db.products.getById(r.productId)
      })));
    },

    myReviews: async (_: any, __: any, context: GraphQLContext) => {
      const user = requireAuth(context);
      const reviews = await db.reviews.getByUser(user.id);

      return await Promise.all(reviews.map(async (r: any) => ({
        ...r,
        user,
        product: await db.products.getById(r.productId)
      })));
    },

    allReviews: async (_: any, __: any, context: GraphQLContext) => {
      const user = requireAuth(context);
      // Only admins can see all reviews
      if (user.role?.toLowerCase() !== 'admin') {
        throw new Error('Unauthorized: Admin access required');
      }

      // Get all reviews from database
      const allReviewsList = await db.reviews.getAllReviews();

      return await Promise.all(allReviewsList.map(async (r: any) => ({
        ...r,
        user: await db.users.getById(r.userId),
        product: await db.products.getById(r.productId)
      })));
    },
  },

  Mutation: {
    createReview: async (
      _: any,
      {
        input,
      }: {
        input: {
          productId: string;
          rating: number;
          comment?: string;
        }
      },
      context: GraphQLContext
    ) => {
      const user = requireAuth(context);
      const productId = parseInt(input.productId);

      // Validate rating
      if (input.rating < 1 || input.rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }

      // Check if product exists
      const product = await db.products.getById(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      const newReview = await db.reviews.create(user.id, {
        productId,
        rating: input.rating,
        comment: input.comment,
      });

      return {
        ...newReview,
        user,
        product
      };
    },

    deleteReview: async (_: any, { reviewId }: { reviewId: string }, context: GraphQLContext) => {
      requireAuth(context);
      return await db.reviews.delete(reviewId);
    },
  },

  Review: {
    // Ensure nested fields are resolved correctly
    user: async (r: any) => r.user || (await db.users.getById(r.userId)),
    product: async (r: any) => r.product || (await db.products.getById(r.productId)),
  }
};
