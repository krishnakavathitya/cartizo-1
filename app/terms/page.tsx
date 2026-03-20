export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-xl p-8 shadow-sm">
          <h1 className="text-3xl font-bold mb-6">Terms of Use</h1>
          
          <div className="space-y-6 text-gray-600">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Acceptance of Terms</h2>
              <p>
                By accessing and using Cartizo, you accept and agree to be bound by these Terms of Use. 
                If you do not agree, please do not use our services.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">User Accounts</h2>
              <p>
                You are responsible for maintaining the confidentiality of your account credentials and 
                for all activities that occur under your account.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Product Information</h2>
              <p>
                We strive to provide accurate product information. However, we do not warrant that product 
                descriptions, pricing, or other content is accurate, complete, or error-free.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Prohibited Activities</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Using the site for any illegal purpose</li>
                <li>Attempting to interfere with site functionality</li>
                <li>Impersonating another person or entity</li>
                <li>Collecting user information without consent</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Limitation of Liability</h2>
              <p>
                Cartizo shall not be liable for any indirect, incidental, special, or consequential damages 
                arising out of your use of our services.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
