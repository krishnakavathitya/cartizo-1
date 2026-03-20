'use client';

import { useRouter } from 'next/navigation';

export function DealsBanner() {
  const router = useRouter();

  return (
    <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 text-white shadow-md">
      <h2 className="text-3xl font-bold mb-2">Exclusive Deals for You!</h2>
      <p className="mb-6">Flash sale starts in 2 hours. Grab your favorites before they're gone.</p>
      <button
        onClick={() => router.push('/products')}
        className="bg-white text-orange-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition"
      >
        EXPLORE NOW
      </button>
    </div>
  );
}
