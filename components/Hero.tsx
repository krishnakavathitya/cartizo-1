'use client';

export function Hero() {
  return (
    <section className="relative h-[80vh] min-h-[600px] flex items-center overflow-x-hidden">
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2000&auto=format&fit=crop"
          alt="Shopping Banner"
          className="w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/40 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 relative z-10 w-full">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/10 backdrop-blur-md border border-orange-500/20 rounded-full mb-6">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
            <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">Limited Time Offer</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-black text-white mb-2 leading-[0.9] tracking-tighter animate-in slide-in-from-left-4 duration-700">
            Big Billion <br />
            <span className="text-orange-400">Days.</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-md animate-in slide-in-from-left-6 duration-1000 delay-200">
            Elevate your lifestyle with up to <span className="text-white font-bold">80% off</span> on premium Smartphones, Laptops & Designer Tech.
          </p>

          <div className="flex flex-wrap gap-4 animate-in slide-in-from-left-8 duration-1000 delay-300">
            <a
              href="/products"
              className="bg-orange-600 hover:bg-orange-500 text-white font-bold px-10 py-4 rounded-2xl shadow-xl shadow-orange-600/20 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Shop Collection
            </a>
            <a
              href="/category/electronics"
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold px-10 py-4 rounded-2xl border border-white/10 transition-all duration-300"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>

      {/* Decorative Blur */}
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px]"></div>
    </section>
  );
}
