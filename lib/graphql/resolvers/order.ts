import { GraphQLContext, requireAuth } from '../context';
import { getDatabase } from '@/lib/db';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const db = getDatabase();

export const orderResolvers = {
  Query: {
    orders: async (_: any, __: any, context: GraphQLContext) => {
      // Allow unauthenticated users - return empty array
      if (!context.user) {
        return [];
      }

      return await db.orders.getAll(context.user.id);
    },

    order: async (_: any, { id }: { id: string }, context: GraphQLContext) => {
      // Require auth for viewing specific orders
      const user = requireAuth(context);
      const order = await db.orders.getById(user.id, id);

      if (!order) {
        throw new Error('Order not found or unauthorized access');
      }

      return order;
    },

    trackOrder: async (_: any, { orderNumber }: { orderNumber: string }) => {
      const order = await db.orders.getByOrderNumber(orderNumber);

      if (!order) {
        throw new Error('Order not found');
      }

      return order;
    },
  },

  Mutation: {
    createOrder: async (
      _: any,
      { input }: { input: { addressId: string; paymentMethod: string } },
      context: GraphQLContext
    ) => {
      const user = requireAuth(context);

      // Fetch the isolated cart for this user
      const cart = await db.carts.get(user.id);

      if (!cart || cart.items.length === 0) {
        throw new Error('Cart is empty');
      }

      // Verify address belongs to user
      const address = await db.addresses.getById(input.addressId);
      if (!address || address.userId !== user.id) {
        throw new Error('Invalid or unauthorized shipping address');
      }

      // Calculate totals using fresh product data
      const itemsWithProducts = await Promise.all(cart.items.map(async (item: any) => ({
        ...item,
        product: await db.products.getById(item.productId)
      })));

      const subtotal = itemsWithProducts.reduce((sum: number, item: any) => {
        const product = item.product;
        if (!product) return sum;
        const price = product.price * (1 - (product.discount || 0) / 100);
        return sum + (price * item.quantity);
      }, 0);

      const tax = subtotal * 0.1;
      const shipping = subtotal > 1000 ? 0 : 50;
      const total = subtotal + tax + shipping;

      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      // Create order in persistent storage
      const newOrder = await db.orders.create(user.id, {
        orderNumber,
        items: itemsWithProducts.map((item: any) => ({
          id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          productId: item.productId,
          quantity: item.quantity,
          price: (item.product.price || 0) * (1 - (item.product.discount || 0) / 100),
          title: item.product.name,
          image: item.product.image || ''
        })),
        subtotal,
        tax,
        shipping,
        total,
        status: 'PENDING',
        paymentMethod: input.paymentMethod,
        shippingAddressId: input.addressId,
      });

      // Clear the user's cart
      await db.carts.clear(user.id);

      return newOrder;
    },

    initiateRazorpayPayment: async (
      _: any,
      { addressId }: { addressId: string },
      context: GraphQLContext
    ) => {
      const user = requireAuth(context);

      const cart = await db.carts.get(user.id);
      if (!cart || cart.items.length === 0) {
        throw new Error('Cart is empty');
      }

      const address = await db.addresses.getById(addressId);
      if (!address || address.userId !== user.id) {
        throw new Error('Invalid or unauthorized shipping address');
      }

      const itemsWithProducts = await Promise.all(cart.items.map(async (item: any) => ({
        ...item,
        product: await db.products.getById(item.productId)
      })));

      const subtotal = itemsWithProducts.reduce((sum: number, item: any) => {
        const product = item.product;
        if (!product) return sum;
        const price = product.price * (1 - (product.discount || 0) / 100);
        return sum + (price * item.quantity);
      }, 0);

      const tax = subtotal * 0.1;
      const shipping = subtotal > 1000 ? 0 : 50;
      const total = subtotal + tax + shipping;
      const amountInPaise = Math.round(total * 100);

      const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;

      if (!keyId || !keySecret || keyId.includes('YOUR_KEY') || keySecret.includes('YOUR_KEY')) {
        console.warn('[Razorpay Simulation] Creating mock order because keys are not configured.');
        return {
          id: `order_mock_${Math.random().toString(36).substr(2, 9)}`,
          amount: total,
          currency: 'INR'
        };
      }

      try {
        const razorpay = new Razorpay({
          key_id: keyId,
          key_secret: keySecret,
        });

        const rzpOrder = await razorpay.orders.create({
          amount: amountInPaise,
          currency: 'INR',
          receipt: `receipt_${Date.now()}`,
          notes: {
            userId: user.id.toString(),
            addressId: addressId
          }
        });

        return {
          id: rzpOrder.id,
          amount: Number(rzpOrder.amount) / 100,
          currency: rzpOrder.currency
        };
      } catch (error: any) {
        console.error('Razorpay Order Creation Error:', error);
        throw new Error(error.message || 'Failed to initiate Razorpay payment');
      }
    },

    verifyAndCreateOrder: async (
      _: any,
      args: {
        addressId: string;
        paymentMethod: string;
        razorpayOrderId: string;
        razorpayPaymentId: string;
        razorpaySignature: string;
      },
      context: GraphQLContext
    ) => {
      const user = requireAuth(context);

      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      const isMockPayment = args.razorpayOrderId.startsWith('order_mock_');

      if (!isMockPayment) {
        if (!keySecret || keySecret.includes('YOUR_KEY')) {
          throw new Error('Payment verification failed: Razorpay Key Secret is not configured');
        }
        
        const hmac = crypto.createHmac('sha256', keySecret);
        hmac.update(`${args.razorpayOrderId}|${args.razorpayPaymentId}`);
        const generatedSignature = hmac.digest('hex');

        if (generatedSignature !== args.razorpaySignature) {
          throw new Error('Payment verification failed: Signature mismatch');
        }
      } else {
        console.log('[Razorpay Simulation] Verifying mock payment: signature check bypassed');
      }

      const cart = await db.carts.get(user.id);
      if (!cart || cart.items.length === 0) {
        throw new Error('Cart is empty');
      }

      const address = await db.addresses.getById(args.addressId);
      if (!address || address.userId !== user.id) {
        throw new Error('Invalid or unauthorized shipping address');
      }

      const itemsWithProducts = await Promise.all(cart.items.map(async (item: any) => ({
        ...item,
        product: await db.products.getById(item.productId)
      })));

      const subtotal = itemsWithProducts.reduce((sum: number, item: any) => {
        const product = item.product;
        if (!product) return sum;
        const price = product.price * (1 - (product.discount || 0) / 100);
        return sum + (price * item.quantity);
      }, 0);

      const tax = subtotal * 0.1;
      const shipping = subtotal > 1000 ? 0 : 50;
      const total = subtotal + tax + shipping;

      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      const newOrder = await db.orders.create(user.id, {
        orderNumber,
        items: itemsWithProducts.map((item: any) => ({
          id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          productId: item.productId,
          quantity: item.quantity,
          price: (item.product.price || 0) * (1 - (item.product.discount || 0) / 100),
          title: item.product.name,
          image: item.product.image || ''
        })),
        subtotal,
        tax,
        shipping,
        total,
        status: 'PROCESSING',
        paymentMethod: args.paymentMethod,
        shippingAddressId: args.addressId,
      });

      // Clear the user's cart
      await db.carts.clear(user.id);

      return newOrder;
    },

    cancelOrder: async (_: any, { orderId }: { orderId: string }, context: GraphQLContext) => {
      const user = requireAuth(context);
      const order = await db.orders.getById(user.id, orderId);

      if (!order) {
        throw new Error('Order not found or unauthorized access');
      }

      if (order.status !== 'PENDING' && order.status !== 'PROCESSING') {
        throw new Error('Order cannot be cancelled at this stage');
      }

      return await db.orders.updateStatus(user.id, orderId, 'CANCELLED');
    },
  },

  Order: {
    shippingAddress: async (order: any) => {
      const address = await db.addresses.getById(order.shippingAddressId);
      if (!address) {
        // Fallback for demo data if address is missing
        return {
          id: order.shippingAddressId || 'guest-addr',
          name: 'Guest Customer',
          phone: order.phone || '9999999999',
          street: 'Main Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400001',
          country: 'India',
          isDefault: true
        };
      }
      return address;
    },
    items: (order: any) => order.items || [],
  },

  OrderItem: {
    product: async (item: any) => {
      const product = await db.products.getById(item.productId);
      if (!product) {
        // Fallback Product if missing
        return {
          id: item.productId,
          name: item.title || 'Unknown Product',
          slug: 'unknown',
          brand: 'Unknown',
          category: 'Default',
          price: item.price,
          discount: 0,
          description: '',
          image: item.image || '/placeholder.png',
          averageRating: 0,
          reviewCount: 0,
          inStock: true,
          stock: 0,
          createdAt: new Date().toISOString()
        };
      }
      return product;
    },
  },
};
