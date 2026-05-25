import { gql } from 'graphql-tag'

export const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    name: String!
    role: Role!
    avatar: String
    phone: String
    createdAt: String!
  }

  enum Role {
    CUSTOMER
    ADMIN
  }

  type Product {
    id: ID!
    title: String!
    slug: String!
    description: String!
    basePrice: Float!
    category: Category!
    brand: Brand
    images: [ProductImage!]!
    variants: [ProductVariant!]!
    reviews: [Review!]!
    averageRating: Float
    reviewCount: Int!
    discountPercentage: Float!
    inStock: Boolean!
    isActive: Boolean!
    createdAt: String!
  }

  type ProductImage {
    id: ID!
    url: String!
    altText: String
    isPrimary: Boolean!
    order: Int!
  }

  type ProductVariant {
    id: ID!
    sku: String!
    variantType: String!
    variantValue: String!
    priceAdjustment: Float!
    inventory: Int!
    isActive: Boolean!
  }

  type Category {
    id: ID!
    name: String!
    slug: String!
    description: String
    parent: Category
    children: [Category!]!
    productCount: Int!
  }

  type Brand {
    id: ID!
    name: String!
    slug: String!
    logo: String
  }

  type Cart {
    id: ID!
    items: [CartItem!]!
    subtotal: Float!
    total: Float!
    itemCount: Int!
  }

  type CartItem {
    id: ID!
    product: Product!
    variant: ProductVariant
    quantity: Int!
    price: Float!
  }

  type Order {
    id: ID!
    orderNumber: String!
    status: OrderStatus!
    items: [OrderItem!]!
    subtotal: Float!
    tax: Float!
    shipping: Float!
    total: Float!
    shippingAddress: Address!
    paymentMethod: PaymentMethod!
    trackingNumber: String
    statusHistory: [OrderStatusChange!]!
    createdAt: String!
  }

  type RazorpayOrder {
    id: String!
    amount: Float!
    currency: String!
  }

  enum OrderStatus {
    PENDING
    PROCESSING
    SHIPPED
    DELIVERED
    CANCELLED
    RETURNED
  }

  enum PaymentMethod {
    CREDIT_CARD
    DEBIT_CARD
    UPI
    COD
  }

  enum AddressType {
    Home
    Work
  }

  type OrderItem {
    id: ID!
    product: Product!
    variant: ProductVariant
    quantity: Int!
    price: Float!
  }

  type OrderStatusChange {
    id: ID!
    status: OrderStatus!
    note: String
    changedBy: String
    createdAt: String!
  }

  type Address {
    id: ID!
    name: String!
    phone: String!
    street: String!
    city: String!
    state: String!
    postalCode: String!
    country: String!
    type: AddressType!
    isDefault: Boolean!
  }

  type Review {
    id: ID!
    product: Product!
    user: User!
    rating: Int!
    comment: String
    createdAt: String!
  }

  type WishlistItem {
    id: ID!
    product: Product!
    createdAt: String!
  }

  type ProductPage {
    items: [Product!]!
    total: Int!
    page: Int!
    pageSize: Int!
    hasMore: Boolean!
  }

  type OrderPage {
    items: [Order!]!
    total: Int!
    page: Int!
    pageSize: Int!
    hasMore: Boolean!
  }

  type DashboardStats {
    totalSales: Float!
    orderCount: Int!
    customerCount: Int!
    productCount: Int!
    recentOrders: [Order!]!
    lowStockProducts: [Product!]!
  }

  type AdminDashboardStats {
    totalProducts: Int!
    totalOrders: Int!
    totalUsers: Int!
    totalRevenue: Float!
    pendingOrders: Int!
    deliveredOrders: Int!
    cancelledOrders: Int!
    outOfStockProducts: Int!
    monthlyRevenue: [MonthlyRevenue!]!
    recentOrders: [Order!]!
  }

  type MonthlyRevenue {
    month: String!
    revenue: Float!
  }

  input ProductFilters {
    categoryIds: [ID!]
    brandIds: [ID!]
    minPrice: Float
    maxPrice: Float
    minRating: Float
    inStock: Boolean
    search: String
  }

  input PaginationInput {
    page: Int
    pageSize: Int
    sortBy: String
    sortOrder: String
  }

  input AddToCartInput {
    productId: ID!
    variantId: ID
    quantity: Int
  }

  input CreateOrderInput {
    addressId: ID!
    paymentMethod: PaymentMethod!
  }

  input AddressInput {
    name: String!
    phone: String!
    street: String!
    city: String!
    state: String!
    postalCode: String!
    country: String
    type: AddressType!
  }

  input CreateReviewInput {
    productId: ID!
    rating: Int!
    comment: String
  }

  input SignupInput {
    email: String!
    name: String!
    password: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  type AuthPayload {
    user: User!
    token: String!
  }

  input CreateProductInput {
    title: String!
    slug: String!
    description: String!
    basePrice: Float!
    discountPercentage: Float
    categoryId: ID!
    brandId: ID
    inStock: Boolean
    images: [ProductImageInput!]
  }

  input UpdateProductInput {
    title: String
    slug: String
    description: String
    basePrice: Float
    discountPercentage: Float
    categoryId: ID
    brandId: ID
    isActive: Boolean
    inStock: Boolean
    images: [ProductImageInput!]
  }

  input ProductImageInput {
    url: String!
    altText: String
    isPrimary: Boolean
    order: Int
  }

  type Query {
    # Products
    products(filters: ProductFilters, pagination: PaginationInput): ProductPage!
    product(slug: String!): Product
    searchProducts(query: String!, filters: ProductFilters): [Product!]!
    
    # Categories
    categories: [Category!]!
    category(slug: String!): Category
    
    # Cart
    cart: Cart
    
    # Orders
    orders: [Order!]!
    order(id: ID!): Order
    
    # Wishlist
    wishlist: [WishlistItem!]!
    
    # Reviews
    productReviews(productId: ID!): [Review!]!
    myReviews: [Review!]!
    allReviews: [Review!]!
    
    # User
    me: User

    # Addresses
    addresses: [Address!]!
    address(id: ID!): Address
    
    # Admin
    adminDashboard: DashboardStats!
    adminDashboardStats: AdminDashboardStats!
    adminOrders(pagination: PaginationInput): OrderPage!
    adminProducts(filters: ProductFilters, pagination: PaginationInput): ProductPage!
    
    # Public tracking
    trackOrder(orderNumber: String!): Order
  }

  type Mutation {
    # Auth
    signup(input: SignupInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    updatePassword(currentPassword: String!, newPassword: String!): Boolean!
    updateProfile(name: String, phone: String): User!
    uploadAvatar(avatar: String!): User!
    removeAvatar: User!
    
    # Cart
    addToCart(input: AddToCartInput!): Cart!
    updateCartItem(itemId: ID!, quantity: Int!): Cart!
    removeCartItem(itemId: ID!): Cart!
    clearCart: Boolean!
    
    # Checkout
    createOrder(input: CreateOrderInput!): Order!
    initiateRazorpayPayment(addressId: ID!): RazorpayOrder!
    verifyAndCreateOrder(
      addressId: ID!
      paymentMethod: PaymentMethod!
      razorpayOrderId: String!
      razorpayPaymentId: String!
      razorpaySignature: String!
    ): Order!
    
    # Orders
    cancelOrder(orderId: ID!): Order!
    
    # Wishlist
    addToWishlist(productId: ID!): WishlistItem!
    removeFromWishlist(productId: ID!): Boolean!
    
    # Reviews
    createReview(input: CreateReviewInput!): Review!
    updateReview(reviewId: ID!, rating: Int!, comment: String): Review!
    deleteReview(reviewId: ID!): Boolean!
    
    # Address
    createAddress(input: AddressInput!): Address!
    updateAddress(addressId: ID!, input: AddressInput!): Address!
    deleteAddress(addressId: ID!): Boolean!
    setDefaultAddress(addressId: ID!): Address!
    
    # Admin - Products
    createProduct(input: CreateProductInput!): Product!
    updateProduct(productId: ID!, input: UpdateProductInput!): Product!
    deleteProduct(productId: ID!): Boolean!
    
    # Admin - Orders
    updateOrderStatus(orderId: ID!, status: OrderStatus!, trackingNumber: String): Order!
  }
`
