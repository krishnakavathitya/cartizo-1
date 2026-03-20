import { GraphQLContext, requireAuth } from '../context';
import { getDatabase } from '@/lib/db';

const db = getDatabase();

export const productResolvers = {
  Query: {
    products: async (_: any, { pagination, filters }: any) => {
      let allProducts = await db.products.getAll();

      // Filter by category
      if (filters?.categoryIds && filters.categoryIds.length > 0) {
        const lowerCategoryIds = filters.categoryIds.map((id: string) => id.toLowerCase());
        allProducts = allProducts.filter((p: any) => {
          const catName = typeof p.category === 'string' ? p.category : p.category?.name;
          return catName && lowerCategoryIds.includes(catName.toLowerCase());
        });
      }

      // Filter by brand
      if (filters?.brandIds && filters.brandIds.length > 0) {
        allProducts = allProducts.filter((p: any) =>
          filters.brandIds.includes(p.brand) ||
          filters.brandIds.includes(p.brand?.id)
        );
      }

      // Filter by price
      if (filters?.minPrice !== undefined) {
        allProducts = allProducts.filter((p: any) => (p.basePrice || p.price) >= filters.minPrice);
      }
      if (filters?.maxPrice !== undefined) {
        allProducts = allProducts.filter((p: any) => (p.basePrice || p.price) <= filters.maxPrice);
      }

      // Filter by search text
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        allProducts = allProducts.filter((p: any) => {
          const name = (p.title || p.name || '').toLowerCase();
          const description = (p.description || '').toLowerCase();
          return name.includes(searchLower) || description.includes(searchLower);
        });
      }

      // Filtering logic...
      // (Lines 11-33 handled filters)

      // Sorting
      const sortBy = pagination?.sortBy || 'new-arrivals';
      const sortOrder = pagination?.sortOrder || 'desc';

      allProducts.sort((a: any, b: any) => {
        let comparison = 0;
        switch (sortBy) {
          case 'price':
            comparison = (a.basePrice || a.price || 0) - (b.basePrice || b.price || 0);
            break;
          case 'rating':
            comparison = (a.averageRating || 0) - (b.averageRating || 0);
            break;
          case 'new-arrivals':
          default:
            comparison = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
            break;
        }
        return sortOrder === 'desc' ? -comparison : comparison;
      });

      // Pagination
      const page = pagination?.page || 1;
      const pageSize = pagination?.pageSize || 50;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedProducts = allProducts.slice(startIndex, endIndex);

      return {
        items: paginatedProducts,
        total: allProducts.length,
        page,
        pageSize,
        totalPages: Math.ceil(allProducts.length / pageSize),
        hasMore: endIndex < allProducts.length,
      };
    },

    product: async (_: any, { id, slug }: { id?: string; slug?: string }) => {
      if (id) return await db.products.getById(parseInt(id));
      if (slug) return await db.products.getBySlug(slug);
      return null;
    },

    categories: async () => {
      const dbCategories = await db.categories?.getAll() || [];
      const products = await db.products.getAll();

      // Get unique categories from products as well
      const productCats = [...new Set(products.map((p: any) =>
        typeof p.category === 'string' ? p.category : p.category?.name
      ).filter(Boolean))];

      // Merge and unique (Case Insensitive)
      const categoryMap = new Map<string, string>();

      // Add DB categories first (prefer their case)
      dbCategories.forEach(name => {
        categoryMap.set(name.toLowerCase(), name);
      });

      // Add product categories only if not already present
      productCats.forEach(name => {
        const lowerName = name.toLowerCase();
        if (!categoryMap.has(lowerName)) {
          // Capitalize first letter if it's from products and not in DB
          const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
          categoryMap.set(lowerName, formattedName);
        }
      });

      const allCategoryNames = Array.from(categoryMap.values()).sort();

      return allCategoryNames.map(name => ({
        id: name,
        name: name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        productCount: products.filter((p: any) => {
          const catName = typeof p.category === 'string' ? p.category : p.category?.name;
          return catName?.toLowerCase() === name.toLowerCase();
        }).length
      }));
    },

    category: async (_: any, { id, slug }: { id?: string; slug?: string }) => {
      const catName = id || slug?.replace(/-/g, ' ');
      if (!catName) return null;

      const products = await db.products.getAll();
      const catProducts = products.filter((p: any) => {
        const name = typeof p.category === 'string' ? p.category : p.category?.name;
        return name?.toLowerCase() === catName.toLowerCase();
      });

      return {
        id: catName,
        name: catName,
        slug: catName.toLowerCase().replace(/\s+/g, '-'),
        productCount: catProducts.length
      };
    },

    searchProducts: async (_: any, { query, filters }: any) => {
      let results = await db.products.getAll();
      const lowerQuery = query.toLowerCase();

      results = results.filter((p: any) =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.description?.toLowerCase().includes(lowerQuery) ||
        p.category?.toLowerCase?.().includes(lowerQuery)
      );

      // Apply price filters
      if (filters?.minPrice !== undefined) {
        results = results.filter((p: any) => (p.basePrice || p.price) >= filters.minPrice);
      }
      if (filters?.maxPrice !== undefined) {
        results = results.filter((p: any) => (p.basePrice || p.price) <= filters.maxPrice);
      }

      return results;
    },
  },

  Mutation: {
    createProduct: async (_: any, { input }: any, context: GraphQLContext) => {
      // requireAdmin(context); 
      const dbInput = {
        name: input.title,
        price: input.basePrice,
        discount: input.discountPercentage || 0,
        brand: input.brandId,
        category: input.categoryId,
        description: input.description,
        slug: input.slug || input.title.toLowerCase().replace(/\s+/g, '-'),
        image: input.images?.[0]?.url || '/placeholder.png',
        inStock: input.inStock !== false,
        stock: 10, // Default stock
        averageRating: 0,
        reviewCount: 0,
        isActive: true,
        specifications: ''
      };
      return await db.products.create(dbInput as any);
    },
    updateProduct: async (_: any, { productId, input }: any, context: GraphQLContext) => {
      // requireAdmin(context);
      const dbUpdates: any = {};
      if (input.title) {
        dbUpdates.name = input.title;
        dbUpdates.slug = input.title.toLowerCase().replace(/\s+/g, '-');
      }
      if (input.basePrice !== undefined) dbUpdates.price = input.basePrice;
      if (input.discountPercentage !== undefined) dbUpdates.discount = input.discountPercentage;
      if (input.categoryId) dbUpdates.category = input.categoryId;
      if (input.brandId) dbUpdates.brand = input.brandId;
      if (input.description) dbUpdates.description = input.description;
      if (input.isActive !== undefined) dbUpdates.isActive = input.isActive;
      if (input.inStock !== undefined) dbUpdates.inStock = input.inStock;

      return await db.products.update(parseInt(productId), dbUpdates);
    },
    deleteProduct: async (_: any, { productId }: { productId: string }, context: GraphQLContext) => {
      // requireAdmin(context);
      return await db.products.delete(parseInt(productId));
    },
  },

  Product: {
    // Critical mapper to solve Apollo "Product.title" null field error
    title: (p: any) => p.title || p.name || 'Untitled Product',
    basePrice: (p: any) => p.basePrice || p.price || 0,
    discountPercentage: (p: any) => p.discountPercentage || p.discount || 0,
    description: (p: any) => p.description || '',
    inStock: (p: any) => p.inStock !== false,
    isActive: (p: any) => p.isActive !== false,
    category: (p: any) => {
      if (typeof p.category === 'string') {
        return {
          id: p.category,
          name: p.category,
          slug: p.category.toLowerCase().replace(/\s+/g, '-'),
        };
      }
      return p.category;
    },
    brand: (p: any) => {
      if (typeof p.brand === 'string') {
        return {
          id: p.brand,
          name: p.brand,
          slug: p.brand.toLowerCase().replace(/\s+/g, '-'),
        };
      }
      return p.brand;
    },
    images: (p: any) => {
      const productId = p.id || 'unknown';
      if (p.images && p.images.length > 0) {
        return p.images.map((img: any, index: number) => {
          if (typeof img === 'string') {
            return {
              id: `img-${productId}-${index}`,
              url: img,
              altText: p.name || p.title || 'Product Image',
              isPrimary: index === 0,
              order: index + 1,
            };
          }
          return {
            ...img,
            id: img.id || `img-${productId}-${index}`,
            url: img.url || p.image || '/placeholder.png',
            altText: img.altText || p.name || p.title || 'Product Image',
            isPrimary: img.isPrimary !== undefined ? img.isPrimary : index === 0,
            order: img.order || index + 1,
          };
        });
      }
      // Fallback to p.image if p.images is empty
      return [
        {
          id: `img-${productId}-default`,
          url: p.image || '/placeholder.png',
          altText: p.name || p.title || 'Product Image',
          isPrimary: true,
          order: 1,
        }
      ];
    },
    variants: (p: any) => p.variants || [],
    reviews: (p: any) => p.reviews || [],
    reviewCount: (p: any) => p.reviewCount || 0,
    averageRating: (p: any) => p.averageRating || 0,
    createdAt: (p: any) => p.createdAt || new Date().toISOString(),
  },

  Category: {
    parent: (c: any) => c.parent || null,
    children: (c: any) => c.children || [],
    description: (c: any) => c.description || '',
    productCount: (c: any) => c.productCount || 0,
  }
};
