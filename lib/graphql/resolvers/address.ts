import { GraphQLContext, requireAuth } from '../context';
import { getDatabase } from '@/lib/db';

const db = getDatabase();

export const addressResolvers = {
  Query: {
    addresses: async (_: any, __: any, context: GraphQLContext) => {
      // Allow unauthenticated users - return empty array
      if (!context.user) {
        return [];
      }

      return await db.addresses.getAll(context.user.id);
    },

    address: async (_: any, { id }: { id: string }, context: GraphQLContext) => {
      // Require auth for viewing specific address
      const user = requireAuth(context);
      const address = await db.addresses.getById(id);

      if (!address || address.userId !== user.id) {
        throw new Error('Address not found or unauthorized access');
      }

      return address;
    },
  },

  Mutation: {
    createAddress: async (_: any, { input }: any, context: GraphQLContext) => {
      const user = requireAuth(context);
      return await db.addresses.create(user.id, input);
    },

    updateAddress: async (_: any, { addressId, input }: any, context: GraphQLContext) => {
      const user = requireAuth(context);
      const updated = await db.addresses.update(user.id, addressId, input);

      if (!updated) {
        throw new Error('Address not found or unauthorized access');
      }

      return updated;
    },

    deleteAddress: async (_: any, { addressId }: { addressId: string }, context: GraphQLContext) => {
      const user = requireAuth(context);
      return await db.addresses.delete(user.id, addressId);
    },

    setDefaultAddress: async (_: any, { addressId }: { addressId: string }, context: GraphQLContext) => {
      const user = requireAuth(context);
      const updated = await db.addresses.setDefault(user.id, addressId);

      if (!updated) {
        throw new Error('Address not found or unauthorized access');
      }

      return updated;
    },
  },

  Address: {
    name: (a: any) => a.name || 'No Name',
    phone: (a: any) => a.phone || '',
    street: (a: any) => a.street || '',
    city: (a: any) => a.city || '',
    state: (a: any) => a.state || '',
    postalCode: (a: any) => a.postalCode || a.zip || '',
    country: (a: any) => a.country || '',
    type: (a: any) => a.type || 'Home',
    isDefault: (a: any) => !!a.isDefault,
  }
};
