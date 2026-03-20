import { authResolvers } from './auth'
import { productResolvers } from './product'
import { cartResolvers } from './cart'
import { orderResolvers } from './order'
import { wishlistResolvers } from './wishlist'
import { reviewResolvers } from './review'
import { addressResolvers } from './address'
import { adminResolvers } from './admin'

export const resolvers = {
  Query: {
    ...productResolvers.Query,
    ...cartResolvers.Query,
    ...orderResolvers.Query,
    ...wishlistResolvers.Query,
    ...reviewResolvers.Query,
    ...authResolvers.Query,
    ...adminResolvers.Query,
    ...addressResolvers.Query,
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...cartResolvers.Mutation,
    ...orderResolvers.Mutation,
    ...wishlistResolvers.Mutation,
    ...reviewResolvers.Mutation,
    ...addressResolvers.Mutation,
    ...adminResolvers.Mutation,
  },
  // Include all field resolvers from all modules
  ...(productResolvers.Product && { Product: productResolvers.Product }),
  ...(productResolvers.Category && { Category: productResolvers.Category }),
  ...(orderResolvers.Order && { Order: orderResolvers.Order }),
  ...(orderResolvers.OrderItem && { OrderItem: orderResolvers.OrderItem }),
  ...(addressResolvers.Address && { Address: addressResolvers.Address }),
  ...(reviewResolvers.Review && { Review: reviewResolvers.Review }),
  ...(authResolvers.User && { User: authResolvers.User }),
}
