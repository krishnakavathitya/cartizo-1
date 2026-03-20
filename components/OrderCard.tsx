interface OrderCardProps {
  order: {
    id: number;
    userId: number;
    productName: string;
    productImage: string;
    price: number;
    quantity: number;
    status: string;
    orderDate: string;
    deliveryDate: string | null;
    trackingId: string;
  };
}

export function OrderCard({ order }: OrderCardProps) {
  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'delivered') return 'bg-green-100 text-green-800';
    if (statusLower === 'in transit') return 'bg-purple-100 text-purple-800';
    if (statusLower === 'processing') return 'bg-blue-100 text-blue-800';
    if (statusLower === 'cancelled') return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  return (
    <div className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition border border-gray-200">
      <div className="flex items-center gap-4">
        <img
          src={order.productImage}
          alt={order.productName}
          className="w-20 h-20 object-cover rounded-lg"
        />
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1">{order.productName}</h3>
          <p className="text-gray-600 text-sm mb-2">Tracking ID: {order.trackingId}</p>
          <div className="flex items-center gap-4">
            <p className="font-bold text-orange-600">₹{order.price.toLocaleString()}</p>
            <p className="text-gray-500 text-sm">Qty: {order.quantity}</p>
            <p className="text-gray-500 text-sm">{new Date(order.orderDate).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="text-right">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
            {order.status}
          </span>
          {order.status.toLowerCase() !== 'cancelled' && order.status.toLowerCase() !== 'delivered' && (
            <button className="mt-3 block text-orange-600 font-semibold text-sm hover:underline">
              Track Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
