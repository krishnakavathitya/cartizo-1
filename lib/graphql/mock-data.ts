// Mock data store for GraphQL (no Prisma required)

export const mockProducts = [
  {
    id: '1',
    title: 'Maggi 2-Minute Noodles Mega Pack',
    slug: 'maggi-noodles-mega-pack',
    description: 'Delicious instant noodles, ready in 2 minutes',
    basePrice: 250,
    discountPercentage: 20,
    images: [
      {
        id: '1',
        url: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&h=400&fit=crop',
        altText: 'Maggi Noodles',
        isPrimary: true
      }
    ],
    category: { id: '1', name: 'Groceries', slug: 'groceries' },
    brand: { id: '1', name: 'Maggi' },
    averageRating: 4.5,
    reviewCount: 1245,
    inStock: true,
    isActive: true,
  },
  {
    id: '2',
    title: 'Premium Chocolate Cookies Pack of 6',
    slug: 'chocolate-cookies',
    description: 'Crunchy chocolate chip cookies',
    basePrice: 180,
    discountPercentage: 40,
    images: [
      {
        id: '2',
        url: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=400&fit=crop',
        altText: 'Cookies',
        isPrimary: true
      }
    ],
    category: { id: '1', name: 'Groceries', slug: 'groceries' },
    brand: { id: '2', name: 'Britannia' },
    averageRating: 4.3,
    reviewCount: 856,
    inStock: true,
    isActive: true,
  },
  {
    id: '3',
    title: 'Fresh Butter Cubes - 500g',
    slug: 'butter-cubes',
    description: 'Fresh dairy butter',
    basePrice: 320,
    discountPercentage: 11,
    images: [
      {
        id: '3',
        url: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&h=400&fit=crop',
        altText: 'Butter',
        isPrimary: true
      }
    ],
    category: { id: '1', name: 'Groceries', slug: 'groceries' },
    brand: { id: '3', name: 'Amul' },
    averageRating: 4.7,
    reviewCount: 2341,
    inStock: true,
    isActive: true,
  },
  {
    id: '4',
    title: 'Tata Tea Premium India Assam',
    slug: 'tata-tea-premium',
    description: 'Premium Assam tea leaves',
    basePrice: 450,
    discountPercentage: 18,
    images: [
      {
        id: '4',
        url: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400&h=400&fit=crop',
        altText: 'Tea',
        isPrimary: true
      }
    ],
    category: { id: '1', name: 'Groceries', slug: 'groceries' },
    brand: { id: '4', name: 'Tata' },
    averageRating: 4.6,
    reviewCount: 3567,
    inStock: true,
    isActive: true,
  },
  {
    id: '5',
    title: 'Samsung Galaxy Smartphone 2024',
    slug: 'samsung-galaxy',
    description: 'Latest Samsung smartphone with advanced features',
    basePrice: 25000,
    discountPercentage: 15,
    images: [
      {
        id: '5',
        url: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=400&fit=crop',
        altText: 'Smartphone',
        isPrimary: true
      }
    ],
    category: { id: '2', name: 'Electronics', slug: 'electronics' },
    brand: { id: '5', name: 'Samsung' },
    averageRating: 4.4,
    reviewCount: 892,
    inStock: true,
    isActive: true,
  },
  {
    id: '6',
    title: 'Apple iPhone 15 Pro Max',
    slug: 'iphone-15-pro',
    description: 'Premium iPhone with Pro features',
    basePrice: 134900,
    discountPercentage: 5,
    images: [
      {
        id: '6',
        url: 'https://images.unsplash.com/photo-1592286927505-2fd0f3a1f3b8?w=400&h=400&fit=crop',
        altText: 'iPhone',
        isPrimary: true
      }
    ],
    category: { id: '2', name: 'Electronics', slug: 'electronics' },
    brand: { id: '6', name: 'Apple' },
    averageRating: 4.8,
    reviewCount: 5234,
    inStock: true,
    isActive: true,
  },
  {
    id: '7',
    title: 'Nike Air Max Running Shoes',
    slug: 'nike-air-max',
    description: 'Comfortable running shoes',
    basePrice: 8999,
    discountPercentage: 25,
    images: [
      {
        id: '7',
        url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
        altText: 'Shoes',
        isPrimary: true
      }
    ],
    category: { id: '3', name: 'Fashion', slug: 'fashion' },
    brand: { id: '7', name: 'Nike' },
    averageRating: 4.5,
    reviewCount: 1567,
    inStock: true,
    isActive: true,
  },
  {
    id: '8',
    title: 'Sony WH-1000XM5 Headphones',
    slug: 'sony-headphones',
    description: 'Noise cancelling wireless headphones',
    basePrice: 29990,
    discountPercentage: 12,
    images: [
      {
        id: '8',
        url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
        altText: 'Headphones',
        isPrimary: true
      }
    ],
    category: { id: '2', name: 'Electronics', slug: 'electronics' },
    brand: { id: '8', name: 'Sony' },
    averageRating: 4.7,
    reviewCount: 2890,
    inStock: true,
    isActive: true,
  },
  {
    id: '9',
    title: 'Levi\'s Denim Jacket - Blue',
    slug: 'levis-denim-jacket',
    description: 'Classic denim jacket',
    basePrice: 4999,
    discountPercentage: 30,
    images: [
      {
        id: '9',
        url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop',
        altText: 'Jacket',
        isPrimary: true
      }
    ],
    category: { id: '3', name: 'Fashion', slug: 'fashion' },
    brand: { id: '9', name: 'Levis' },
    averageRating: 4.4,
    reviewCount: 678,
    inStock: true,
    isActive: true,
  },
];

export const mockCategories = [
  { id: '1', name: 'Groceries', slug: 'groceries', description: 'Daily groceries and food items', productCount: 4 },
  { id: '2', name: 'Electronics', slug: 'electronics', description: 'Electronic devices and gadgets', productCount: 3 },
  { id: '3', name: 'Fashion', slug: 'fashion', description: 'Clothing and accessories', productCount: 2 },
  { id: '4', name: 'Home', slug: 'home', description: 'Home and kitchen items', productCount: 0 },
  { id: '5', name: 'Beauty', slug: 'beauty', description: 'Beauty and personal care', productCount: 0 },
  { id: '6', name: 'Toys', slug: 'toys', description: 'Toys and games for kids', productCount: 0 },
  { id: '7', name: 'Books', slug: 'books', description: 'Books and magazines', productCount: 0 },


];

// In-memory storage for wishlist and cart (per session)
export const mockWishlist: Map<string, any[]> = new Map();
export const mockCart: Map<string, any> = new Map();

// Helper functions
export function getUserWishlist(userId: string = 'guest') {
  if (!mockWishlist.has(userId)) {
    mockWishlist.set(userId, []);
  }
  return mockWishlist.get(userId) || [];
}

export function addToUserWishlist(userId: string = 'guest', productId: string) {
  const wishlist = getUserWishlist(userId);
  const product = mockProducts.find(p => p.id === productId);

  if (!product) return null;

  const exists = wishlist.find(item => item.product.id === productId);
  if (exists) return exists;

  const wishlistItem = {
    id: `wishlist-${Date.now()}`,
    product,
    createdAt: new Date().toISOString(),
  };

  wishlist.push(wishlistItem);
  mockWishlist.set(userId, wishlist);

  return wishlistItem;
}

export function removeFromUserWishlist(userId: string = 'guest', productId: string) {
  const wishlist = getUserWishlist(userId);
  const filtered = wishlist.filter(item => item.product.id !== productId);
  mockWishlist.set(userId, filtered);
  return true;
}

export function getUserCart(userId: string = 'guest') {
  if (!mockCart.has(userId)) {
    mockCart.set(userId, {
      id: `cart-${userId}`,
      items: [],
      totalItems: 0,
      totalPrice: 0,
    });
  }
  return mockCart.get(userId);
}

export function addToUserCart(userId: string = 'guest', productId: string, quantity: number = 1) {
  const cart = getUserCart(userId);
  const product = mockProducts.find(p => p.id === productId);

  if (!product) return null;

  const existingItem = cart.items.find((item: any) => item.product.id === productId);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({
      id: `cart-item-${Date.now()}`,
      product,
      quantity,
    });
  }

  // Recalculate totals
  cart.totalItems = cart.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
  cart.totalPrice = cart.items.reduce((sum: number, item: any) => {
    const price = item.product.basePrice * (1 - item.product.discountPercentage / 100);
    return sum + (price * item.quantity);
  }, 0);

  mockCart.set(userId, cart);
  return cart;
}

export function updateUserCartItem(userId: string = 'guest', productId: string, quantity: number) {
  const cart = getUserCart(userId);
  const item = cart.items.find((item: any) => item.product.id === productId);

  if (!item) return null;

  if (quantity <= 0) {
    cart.items = cart.items.filter((item: any) => item.product.id !== productId);
  } else {
    item.quantity = quantity;
  }

  // Recalculate totals
  cart.totalItems = cart.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
  cart.totalPrice = cart.items.reduce((sum: number, item: any) => {
    const price = item.product.basePrice * (1 - item.product.discountPercentage / 100);
    return sum + (price * item.quantity);
  }, 0);

  mockCart.set(userId, cart);
  return cart;
}

export function removeFromUserCart(userId: string = 'guest', productId: string) {
  return updateUserCartItem(userId, productId, 0);
}

export function clearUserCart(userId: string = 'guest') {
  mockCart.set(userId, {
    id: `cart-${userId}`,
    items: [],
    totalItems: 0,
    totalPrice: 0,
  });
  return true;
}
