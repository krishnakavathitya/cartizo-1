export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-xl p-8 shadow-sm">
          <h1 className="text-3xl font-bold mb-6">Shipping Information</h1>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-3">Delivery Time</h2>
              <ul className="space-y-2 text-gray-600">
                <li>• Standard Delivery: 5-7 business days</li>
                <li>• Express Delivery: 2-3 business days</li>
                <li>• Same Day Delivery: Available in select cities</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">Shipping Charges</h2>
              <p className="text-gray-600 mb-2">
                Free shipping on orders above ₹500
              </p>
              <p className="text-gray-600">
                Standard shipping: ₹40 | Express shipping: ₹100
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">Delivery Areas</h2>
              <p className="text-gray-600">
                We deliver across India. Some remote areas may have extended delivery times.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
