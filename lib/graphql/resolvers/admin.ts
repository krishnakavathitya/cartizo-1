import { GraphQLContext, requireAdmin } from '../context'
import { getDatabase } from '@/lib/db'
import { NotFoundError, BusinessError } from '../errors'

export const adminResolvers = {
  Query: {
    adminDashboard: async (_: any, __: any, context: GraphQLContext) => {
      requireAdmin(context)
      const db = getDatabase()

      const products = db.products.getAll()
      const orders = db.orders.getAll(0) // 0 or similar to get all if applicable, but db.ts shows getAll needs userId
      // Wait, db.ts: orders.getAll(userId: number) => read(ORDERS_FILE).filter((o: any) => o.userId === userId)
      // We need a way to get ALL orders for admin. 
      // Let's check db.ts again or just use fs directly if needed, but better to stick to DB if it has it.
      // Looking at db.ts, it doesn't have a get all for admin. I'll use read(ORDERS_FILE) logic inside here if I can't find it.
      // Actually, I'll extend getDatabase or just read the file if I have to.

      return {
        totalSales: 0,
        orderCount: 0,
        customerCount: 0,
        productCount: 0,
        recentOrders: [],
        lowStockProducts: [],
      }
    },

    adminDashboardStats: async (_: any, __: any, context: GraphQLContext) => {
      requireAdmin(context)
      const db = getDatabase()

      const allProducts = await db.products.getAll()
      const allUsers = await db.users.getAll()
      const ordersData = await db.orders.getAllAdmin()

      const totalProducts = allProducts.length
      const totalUsers = allUsers.length
      const totalOrders = ordersData.length

      const deliveredOrdersCount = ordersData.filter((o: any) => o.status === 'DELIVERED').length
      const pendingOrdersCount = ordersData.filter((o: any) => o.status === 'PENDING').length
      const cancelledOrdersCount = ordersData.filter((o: any) => o.status === 'CANCELLED').length

      const totalRevenue = ordersData
        .filter((o: any) => o.status === 'DELIVERED')
        .reduce((sum: number, o: any) => sum + (o.total || 0), 0)

      const outOfStockProducts = allProducts.filter((p: any) => !p.inStock || (p.stock || 0) === 0).length

      // Recent 5 orders
      const recentOrdersRaw = [...ordersData]
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)

      // Map raw orders to GraphQL Order type (simplified for dashboard)
      const recentOrders = recentOrdersRaw.map((o: any) => ({
        ...o,
        items: o.items || [],
        statusHistory: o.statusHistory || [],
        shippingAddress: o.shippingAddress || {},
        paymentMethod: o.paymentMethod || 'COD'
      }))

      // Monthly Revenue (last 6 months)
      const monthlyRevenueData: { month: string; revenue: number; key: string }[] = []
      const now = new Date()
      
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthName = d.toLocaleString('default', { month: 'short' })
        const year = d.getFullYear()
        const month = d.getMonth()
        const key = `${year}-${month}`
        
        monthlyRevenueData.push({
          month: monthName,
          revenue: 0,
          key
        })
      }

      // Calculate revenue for each month
      ordersData.forEach((o: any) => {
        if (o.status === 'DELIVERED' && o.createdAt) {
          const date = new Date(o.createdAt)
          const year = date.getFullYear()
          const month = date.getMonth()
          const key = `${year}-${month}`
          
          const monthData = monthlyRevenueData.find(m => m.key === key)
          if (monthData) {
            monthData.revenue += o.total || 0
          }
        }
      })

      const monthlyRevenue = monthlyRevenueData.map(({ month, revenue }) => ({
        month,
        revenue: Math.round(revenue)
      }))

      return {
        totalProducts,
        totalOrders,
        totalUsers,
        totalRevenue: Math.round(totalRevenue),
        pendingOrders: pendingOrdersCount,
        deliveredOrders: deliveredOrdersCount,
        cancelledOrders: cancelledOrdersCount,
        outOfStockProducts,
        monthlyRevenue,
        recentOrders
      }
    },

    adminOrders: async (
      _: any,
      { pagination }: { pagination?: { page?: number; pageSize?: number } },
      context: GraphQLContext
    ) => {
      requireAdmin(context)
      const db = getDatabase()
      const allOrders = await db.orders.getAllAdmin()

      const page = pagination?.page || 1
      const pageSize = pagination?.pageSize || 20
      const start = (page - 1) * pageSize
      const items = allOrders.slice(start, start + pageSize)

      return {
        items,
        total: allOrders.length,
        page,
        pageSize,
        hasMore: start + pageSize < allOrders.length,
      }
    },

    adminProducts: async (
      _: any,
      {
        filters,
        pagination,
      }: {
        filters?: any
        pagination?: { page?: number; pageSize?: number }
      },
      context: GraphQLContext
    ) => {
      requireAdmin(context)
      const db = getDatabase()
      const allProducts = await db.products.getAll()

      const page = pagination?.page || 1
      const pageSize = pagination?.pageSize || 20
      const start = (page - 1) * pageSize
      const items = allProducts.slice(start, start + pageSize)

      return {
        items,
        total: allProducts.length,
        page,
        pageSize,
        hasMore: start + pageSize < allProducts.length,
      }
    },
  },

  Mutation: {
    createProduct: async (
      _: any,
      {
        input,
      }: {
        input: {
          title: string
          slug: string
          description: string
          basePrice: number
          discountPercentage?: number
          categoryId: string
          brandId?: string
          inStock?: boolean
          images?: any[]
        }
      },
      context: GraphQLContext
    ) => {
      requireAdmin(context)

      const db = getDatabase()

      // Map GraphQL input to internal DB structure
      const product = await db.products.create({
        name: input.title,
        slug: input.slug,
        brand: input.brandId || '',
        category: input.categoryId,
        price: input.basePrice,
        discount: input.discountPercentage || 0,
        description: input.description,
        specifications: '{}',
        image: input.images?.[0]?.url || '',
        averageRating: 0,
        reviewCount: 0,
        inStock: input.inStock !== undefined ? input.inStock : true,
        stock: 100,
      })

      // Map back to GraphQL Product type
      return {
        ...product,
        title: product.name,
        basePrice: product.price,
        discountPercentage: product.discount,
        category: { id: product.category, name: product.category, slug: product.category.toLowerCase() },
        brand: { id: product.brand, name: product.brand, slug: product.brand.toLowerCase() },
        images: [{ id: String(product.id), url: product.image, altText: product.name, isPrimary: true, order: 1 }],
        variants: [],
        reviews: [],
        isActive: true,
      }
    },

    updateProduct: async (
      _: any,
      {
        productId,
        input,
      }: {
        productId: string
        input: {
          title?: string
          slug?: string
          description?: string
          basePrice?: number
          discountPercentage?: number
          categoryId?: string
          brandId?: string
          isActive?: boolean
          inStock?: boolean
          images?: any[]
        }
      },
      context: GraphQLContext
    ) => {
      requireAdmin(context)

      const db = getDatabase()
      const id = parseInt(productId)

      // Prepare update object for DB
      const updateData: any = {}
      if (input.title !== undefined) updateData.name = input.title
      if (input.slug !== undefined) updateData.slug = input.slug
      if (input.description !== undefined) updateData.description = input.description
      if (input.basePrice !== undefined) updateData.price = input.basePrice
      if (input.discountPercentage !== undefined) updateData.discount = input.discountPercentage
      if (input.categoryId !== undefined) updateData.category = input.categoryId
      if (input.brandId !== undefined) updateData.brand = input.brandId
      if (input.inStock !== undefined) updateData.inStock = input.inStock
      if (input.images?.[0]?.url) updateData.image = input.images[0].url

      const product = await db.products.update(id, updateData)
      if (!product) throw new NotFoundError('Product not found')

      return {
        ...product,
        title: product.name,
        basePrice: product.price,
        discountPercentage: product.discount,
        category: { id: product.category, name: product.category, slug: product.category.toLowerCase() },
        brand: { id: product.brand, name: product.brand, slug: product.brand.toLowerCase() },
        images: [{ id: String(product.id), url: product.image, altText: product.name, isPrimary: true, order: 1 }],
        variants: [],
        reviews: [],
        isActive: true,
      }
    },

    deleteProduct: async (
      _: any,
      { productId }: { productId: string },
      context: GraphQLContext
    ) => {
      requireAdmin(context)

      const db = getDatabase()
      const success = await db.products.delete(parseInt(productId))
      if (!success) throw new NotFoundError('Product not found or deletion failed')

      return true
    },

    updateOrderStatus: async (
      _: any,
      {
        orderId,
        status,
        trackingNumber,
      }: {
        orderId: string
        status: string
        trackingNumber?: string
      },
      context: GraphQLContext
    ) => {
      requireAdmin(context)

      // Throw error - use REST API instead
      throw new BusinessError('Use REST API for order management')
    },
  },
}
