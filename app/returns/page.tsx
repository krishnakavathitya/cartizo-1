export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-xl p-8 shadow-sm">
          <h1 className="text-3xl font-bold mb-6">Returns & Refunds</h1>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-3">Return Policy</h2>
              <p className="text-gray-600 mb-4">
                We offer a 7-day return policy for most items. Products must be unused and in original packaging.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">How to Return</h2>
              <ol className="list-decimal list-inside space-y-2 text-gray-600">
                <li>Go to My Orders in your account</li>
                <li>Select the item you want to return</li>
                <li>Choose return reason and submit request</li>
                <li>Pack the item securely</li>
                <li>Schedule pickup or drop at nearest center</li>
              </ol>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">Refund Process</h2>
              <p className="text-gray-600">
                Refunds are processed within 5-7 business days after we receive the returned item. 
                The amount will be credited to your original payment method.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
