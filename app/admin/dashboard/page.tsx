'use client'

import { useQuery } from '@apollo/client'
import { gql } from 'graphql-tag'
import {
    Package,
    ShoppingCart,
    Users,
    IndianRupee,
    Clock,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    TrendingUp,
    ExternalLink
} from 'lucide-react'
import Link from 'next/link'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts'

const GET_ADMIN_DASHBOARD_STATS = gql`
  query GetAdminDashboardStats {
    adminDashboardStats {
      totalProducts
      totalOrders
      totalUsers
      totalRevenue
      pendingOrders
      deliveredOrders
      cancelledOrders
      outOfStockProducts
      monthlyRevenue {
        month
        revenue
      }
      recentOrders {
        id
        orderNumber
        status
        total
        createdAt
      }
    }
  }
`

interface StatCardProps {
    title: string
    value: string | number
    icon: React.ReactNode
    color: string
    href?: string
}

function StatCard({ title, value, icon, color, href }: StatCardProps) {
    const CardContent = (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group cursor-pointer">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${color} bg-opacity-10 group-hover:scale-110 transition-transform duration-300`}>
                    {icon}
                </div>
                <div className="text-gray-400">
                    <ExternalLink size={16} />
                </div>
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
            </div>
        </div>
    )

    if (href) {
        return <Link href={href}>{CardContent}</Link>
    }

    return CardContent
}

function SkeletonCard() {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-pulse">
            <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
        </div>
    )
}

export default function AdminDashboard() {
    const { data, loading, error } = useQuery(GET_ADMIN_DASHBOARD_STATS, {
        pollInterval: 30000 // Refresh every 30 seconds
    })

    if (error) {
        return (
            <div className="p-8 text-center">
                <div className="bg-red-50 text-red-600 p-4 rounded-lg inline-block">
                    <p className="font-semibold">Error loading dashboard stats</p>
                    <p className="text-sm">{error.message}</p>
                </div>
            </div>
        )
    }

    const stats = data?.adminDashboardStats

    return (
        <div className="p-1 sm:p-4 lg:p-6 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">System Intelligence</h1>
                    <p className="text-xs sm:text-sm font-bold text-slate-400 mt-1.5 uppercase tracking-widest">Global storefront oversight & reconciliation</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {loading ? (
                    Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)
                ) : (
                    <>
                        <StatCard
                            title="Total Products"
                            value={stats?.totalProducts || 0}
                            icon={<Package className="text-blue-600" />}
                            color="bg-blue-600"
                            href="/admin/products"
                        />
                        <StatCard
                            title="Total Orders"
                            value={stats?.totalOrders || 0}
                            icon={<ShoppingCart className="text-purple-600" />}
                            color="bg-purple-600"
                            href="/admin/orders"
                        />
                        <StatCard
                            title="Total Users"
                            value={stats?.totalUsers || 0}
                            icon={<Users className="text-indigo-600" />}
                            color="bg-indigo-600"
                            href="/admin/users"
                        />
                        <StatCard
                            title="Total Revenue"
                            value={`₹${stats?.totalRevenue?.toLocaleString() || 0}`}
                            icon={<IndianRupee className="text-emerald-600" />}
                            color="bg-emerald-600"
                        />
                        <StatCard
                            title="Pending Orders"
                            value={stats?.pendingOrders || 0}
                            icon={<Clock className="text-amber-600" />}
                            color="bg-amber-600"
                            href="/admin/orders"
                        />
                        <StatCard
                            title="Delivered Orders"
                            value={stats?.deliveredOrders || 0}
                            icon={<CheckCircle2 className="text-green-600" />}
                            color="bg-green-600"
                            href="/admin/orders"
                        />
                        <StatCard
                            title="Cancelled Orders"
                            value={stats?.cancelledOrders || 0}
                            icon={<XCircle className="text-rose-600" />}
                            color="bg-rose-600"
                            href="/admin/orders"
                        />
                        <StatCard
                            title="Out of Stock"
                            value={stats?.outOfStockProducts || 0}
                            icon={<AlertTriangle className="text-orange-600" />}
                            color="bg-orange-600"
                            href="/admin/products?stock=out"
                        />
                    </>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                            <TrendingUp className="text-emerald-600" size={20} />
                            Monthly Revenue
                        </h3>
                    </div>
                    
                    {loading ? (
                        <div className="w-full h-80 bg-gray-50 animate-pulse rounded-lg"></div>
                    ) : stats?.monthlyRevenue && stats.monthlyRevenue.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={350}>
                                <AreaChart
                                    data={stats.monthlyRevenue.map((item: any) => ({
                                        month: item.month?.substring(0, 3),
                                        revenue: item.revenue,
                                        fullMonth: item.month
                                    }))}
                                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                >
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                    <XAxis 
                                        dataKey="month" 
                                        stroke="#6b7280"
                                        style={{ fontSize: '12px', fontWeight: '500' }}
                                    />
                                    <YAxis 
                                        stroke="#6b7280"
                                        style={{ fontSize: '12px' }}
                                        tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1f2937',
                                            border: '1px solid #374151',
                                            borderRadius: '8px',
                                            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
                                        }}
                                        labelStyle={{ color: '#f3f4f6' }}
                                        formatter={(value: any) => [
                                            `₹${(value || 0).toLocaleString('en-IN')}`,
                                            'Revenue'
                                        ]}
                                        labelFormatter={(label) => `${label}`}
                                        cursor={{ stroke: '#10b981', strokeWidth: 2 }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#059669"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorRevenue)"
                                        dot={{ fill: '#10b981', r: 5, strokeWidth: 2, stroke: '#fff' }}
                                        activeDot={{ r: 7, stroke: '#059669', strokeWidth: 2 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>

                            {/* Stats Summary */}
                            <div className="mt-8 pt-6 border-t border-gray-200">
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-3 sm:p-4 rounded-lg border border-emerald-200">
                                        <p className="text-[10px] sm:text-xs text-emerald-600 font-semibold mb-1 uppercase tracking-wide">Total Revenue</p>
                                        <p className="text-lg sm:text-2xl font-bold text-emerald-700">₹{(stats.monthlyRevenue.reduce((sum: number, m: any) => sum + (m.revenue || 0), 0)).toLocaleString('en-IN')}</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 sm:p-4 rounded-lg border border-blue-200">
                                        <p className="text-[10px] sm:text-xs text-blue-600 font-semibold mb-1 uppercase tracking-wide">Months</p>
                                        <p className="text-lg sm:text-2xl font-bold text-blue-700">{stats.monthlyRevenue.length}</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 sm:p-4 rounded-lg border border-purple-200">
                                        <p className="text-[10px] sm:text-xs text-purple-600 font-semibold mb-1 uppercase tracking-wide">Avg/Month</p>
                                        <p className="text-lg sm:text-2xl font-bold text-purple-700">₹{(stats.monthlyRevenue.reduce((sum: number, m: any) => sum + (m.revenue || 0), 0) / stats.monthlyRevenue.length).toLocaleString('en-IN', {maximumFractionDigits: 0})}</p>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="w-full h-64 sm:h-80 flex items-center justify-center text-gray-400">
                            <div className="text-center">
                                <TrendingUp className="w-10 sm:w-12 h-10 sm:h-12 mx-auto mb-2 opacity-30" />
                                <p className="text-sm font-medium">No revenue data yet</p>
                                <p className="text-xs mt-1">Complete some orders to see revenue trends</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Recent Orders */}
                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 sm:mb-6">Recent Orders</h3>
                    <div className="space-y-2 sm:space-y-4">
                        {loading ? (
                            Array(5).fill(0).map((_, i) => (
                                <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-lg"></div>
                            ))
                        ) : (
                            stats?.recentOrders?.map((order: any) => (
                                <div key={order.id} className="flex items-center justify-between p-2 sm:p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                                    <div className="flex flex-col min-w-0 flex-1">
                                        <span className="text-xs sm:text-sm font-bold text-gray-900 truncate">{order.orderNumber}</span>
                                        <span className="text-[10px] sm:text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex flex-col items-end ml-2">
                                        <span className="text-xs sm:text-sm font-bold text-gray-900">₹{(order.total || 0).toLocaleString()}</span>
                                        <span className={`text-[8px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                            order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                                'bg-blue-100 text-blue-700'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                        {!loading && stats?.recentOrders?.length === 0 && (
                            <p className="text-center text-gray-500 py-8 sm:py-10 text-sm">No recent orders</p>
                        )}
                    </div>
                    <Link
                        href="/admin/orders"
                        className="block text-center text-xs sm:text-sm font-medium text-blue-600 mt-4 sm:mt-6 hover:text-blue-700 hover:underline"
                    >
                        View All Orders
                    </Link>
                </div>
            </div>
        </div>
    )
}
