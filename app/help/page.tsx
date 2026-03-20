export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-xl p-8 shadow-sm">
          <h1 className="text-3xl font-bold mb-6">Help Center</h1>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-3">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h3 className="font-semibold mb-2">How do I place an order?</h3>
                  <p className="text-gray-600">Browse products, add items to cart, and proceed to checkout to complete your purchase.</p>
                </div>
                <div className="border-b pb-4">
                  <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
                  <p className="text-gray-600">We accept UPI, Credit/Debit Cards, and Cash on Delivery.</p>
                </div>
                <div className="border-b pb-4">
                  <h3 className="font-semibold mb-2">How can I track my order?</h3>
                  <p className="text-gray-600">Visit the Track Order page and enter your order ID to see real-time updates.</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">Contact Us</h2>
              <p className="text-gray-600 mb-2">Email: support@cartizo.com</p>
              <p className="text-gray-600 mb-2">Phone: +91 9016140333</p>
              <p className="text-gray-600">Hours: Mon-Sat, 9 AM - 6 PM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
