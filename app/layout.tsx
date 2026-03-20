import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import { ApolloWrapper } from '@/lib/apollo/provider'
import { CartProvider } from '@/lib/context/cart-context'
import { WishlistProvider } from '@/lib/context/wishlist-context'
import { AuthProvider } from '@/lib/context/auth-context'
import { OrdersProvider } from '@/lib/context/orders-context'
import { AddressProvider } from '@/lib/context/address-context'
import { NextAuthProvider } from '@/lib/providers/session-provider'
import { LayoutShell } from '@/components/LayoutShell'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Cartizo - Your Online Shopping Destination',
  description: 'Shop the latest products at the best prices. Electronics, Fashion, Home & more.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable} scroll-smooth`}>
      <body className="font-sans antialiased text-slate-900 bg-gray-50 selection:bg-indigo-100 overflow-x-clip">
        <NextAuthProvider>
          <ApolloWrapper>
            <AuthProvider>
              <CartProvider>
                <WishlistProvider>
                  <OrdersProvider>
                    <AddressProvider>
                      <LayoutShell>{children}</LayoutShell>
                    </AddressProvider>
                  </OrdersProvider>
                </WishlistProvider>
              </CartProvider>
            </AuthProvider>
          </ApolloWrapper>
        </NextAuthProvider>
      </body>
    </html>
  )
}
