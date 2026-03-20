export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-xl p-8 shadow-sm">
          <h1 className="text-3xl font-bold mb-6">Security</h1>
          
          <div className="space-y-6 text-gray-600">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Our Commitment to Security</h2>
              <p>
                At Cartizo, we take the security of your personal information seriously. We implement 
                industry-standard security measures to protect your data.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Secure Transactions</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>SSL encryption for all data transmission</li>
                <li>PCI DSS compliant payment processing</li>
                <li>Secure payment gateways</li>
                <li>No storage of complete card details</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Account Security Tips</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Use a strong, unique password</li>
                <li>Never share your password with anyone</li>
                <li>Log out after each session on shared devices</li>
                <li>Enable two-factor authentication when available</li>
                <li>Monitor your account for suspicious activity</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Report Security Issues</h2>
              <p>
                If you notice any suspicious activity or security concerns, please contact us immediately 
                at security@cartizo.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
