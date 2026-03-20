import { Search, Heart, ShoppingCart, User, ChevronDown, LayoutDashboard, Menu, X } from 'lucide-react';
import { useCart } from '@/lib/context/cart-context';
import { useAuth } from '@/lib/context/auth-context';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, gql } from '@apollo/client';

const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      name
      slug
    }
  }
`;

export function Header() {
  const { totalItems } = useCart();
  const { user, loading: authLoading, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const router = useRouter();

  const { data: catData, loading: catLoading } = useQuery(GET_CATEGORIES);
  const categories = catData?.categories || [];

  const handleLogout = async () => {
    await logout();
    setShowDropdown(false);
    setMobileMenuOpen(false);
    router.push('/');
    router.refresh();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileSearchOpen(false);
    } else {
      router.push('/products');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('search-input')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 shadow-sm">
        {/* Main Header Row */}
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Left Section: Hamburger + Logo */}
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 text-slate-600 hover:bg-gray-50 rounded-xl transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>

              {/* Logo */}
              <a href="/" className="flex items-center gap-2 sm:gap-2.5 group">
                <div className="relative w-8 h-8 sm:w-10 sm:h-10 overflow-hidden rounded-lg sm:rounded-xl shadow-orange-100 shadow-lg group-hover:scale-105 transition-transform duration-300">
                  <img
                    src="/image.png"
                    alt="Cartizo Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-xl sm:text-2xl font-display font-extrabold tracking-tight flex items-center">
                  <span className="text-slate-900">Cart</span>
                  <span className="text-orange-600">izo</span>
                </div>
              </a>
            </div>

            {/* Middle Section: Desktop Search Bar (pushed to the right) */}
            <div className="hidden md:flex flex-1 max-w-xl justify-end">
              <form onSubmit={handleSearch} className="relative w-full group max-w-md">
                <input
                  id="search-input"
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-5 py-2.5 pl-12 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm text-slate-700 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-orange-50 focus:bg-white focus:border-orange-200 transition-all duration-300"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 group-focus-within:text-orange-500 transition-colors" strokeWidth={2.5} />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <span className="text-[10px] font-bold text-gray-400 border border-gray-200 rounded px-1.5 py-0.5 bg-white uppercase tracking-tighter">⌘K</span>
                </div>
              </form>
            </div>

            {/* Right Section: Actions */}
            <div className="flex items-center gap-1 sm:gap-4 flex-shrink-0">
              {/* Mobile Search Toggle */}
              <button
                onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                className="md:hidden max-[320px]:hidden p-2 text-slate-600 hover:bg-gray-50 rounded-xl transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Action Icons */}
              {user?.role !== 'admin' && (
                <div className="flex items-center gap-1 sm:gap-2">
                  <a href="/wishlist" className="p-2 text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all duration-300 relative group">
                    <Heart className="w-5 h-5 lg:w-6 lg:h-6 group-hover:scale-110 transition-transform" strokeWidth={2.2} />
                  </a>
                  <a href="/cart" className="p-2 text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all duration-300 relative group">
                    <div className="relative">
                      <ShoppingCart className="w-5 h-5 lg:w-6 lg:h-6 group-hover:scale-110 transition-transform" strokeWidth={2.2} />
                      <span className="absolute -top-2 -right-2 max-[425px]:-top-1.5 max-[425px]:-right-1.5 bg-orange-600 text-white text-[9px] max-[425px]:text-[8px] lg:text-[10px] font-black w-5 h-5 max-[425px]:w-4 max-[425px]:h-4 lg:w-5.5 lg:h-5.5 rounded-full flex items-center justify-center shadow-lg shadow-orange-100 ring-2 ring-white transition-all duration-300">
                        {totalItems}
                      </span>
                    </div>
                  </a>
                </div>
              )}

              {/* User Profile / Login */}
              {authLoading ? (
                <div className="hidden sm:block w-8 h-8 rounded-full bg-gray-100 animate-pulse"></div>
              ) : user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 p-1 bg-white border border-gray-100 rounded-full hover:border-orange-100 hover:bg-gray-50 transition-all duration-300 group"
                  >
                    <div className="w-8 h-8 max-[320px]:w-7 max-[320px]:h-7 rounded-full flex items-center justify-center shadow-orange-100 shadow-md group-hover:scale-105 transition-transform bg-orange-600">
                      <span className="text-white text-[10px] max-[320px]:text-[9px] font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <ChevronDown className={`hidden md:block w-4 h-4 text-gray-400 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {showDropdown && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)}></div>
                      <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 py-2.5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="px-4 py-2 mb-2 border-b border-gray-50">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Signed in as</p>
                          <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                        </div>
                        <a href={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-gray-50 font-semibold transition-colors">
                          <LayoutDashboard className="w-4 h-4" />
                          Dashboard
                        </a>
                        <hr className="my-2 border-gray-50" />
                        <button onClick={handleLogout} className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-bold transition-colors">
                          <LogOutIcon />
                          Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <a href="/auth/login" className="px-4 py-2 text-sm font-bold text-slate-700 hover:text-orange-600 transition-colors">Login</a>
                  <a href="/auth/signup" className="px-5 py-2.5 text-sm font-bold bg-slate-900 text-white rounded-xl hover:bg-orange-600 transition-all duration-300">Signup</a>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Search Bar Expandable */}
          {mobileSearchOpen && (
            <div className="md:hidden mt-4 pb-2 animate-in slide-in-from-top-2 duration-300">
              <form onSubmit={handleSearch} className="relative w-full group">
                <input
                  autoFocus
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-5 py-3 pl-12 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-slate-700 focus:outline-none focus:ring-4 focus:ring-orange-50 focus:bg-white focus:border-orange-200 transition-all"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-orange-500" strokeWidth={2.5} />
              </form>
            </div>
          )}
        </div>

        {/* Desktop Navigation Menu */}
        <div className="hidden lg:block border-t border-gray-50">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6">
            <nav className="flex items-center justify-center gap-10 py-3.5">
              <a href="/products" className="text-[13px] font-bold text-slate-500 hover:text-orange-600 uppercase tracking-widest transition-all duration-300 relative group">
                All Products
                <span className="absolute -bottom-3.5 left-0 w-0 h-0.5 bg-orange-600 transition-all duration-300 group-hover:w-full"></span>
              </a>
              {!catLoading && categories.map((cat: any) => (
                <a key={cat.id} href={`/category/${cat.slug}`} className="text-[13px] font-bold text-slate-500 hover:text-orange-600 uppercase tracking-widest transition-all duration-300 relative group">
                  {cat.name}
                  <span className="absolute -bottom-3.5 left-0 w-0 h-0.5 bg-orange-600 transition-all duration-300 group-hover:w-full"></span>
                </a>
              ))}
            </nav>
          </div>
        </div>

      </header>

      {/* Mobile Sidebar Menu */}
      {mobileMenuOpen && (
        <>
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="fixed inset-y-0 left-0 w-80 bg-white z-[101] shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 overflow-hidden rounded-lg shadow-sm">
                  <img src="/image.png" alt="Cartizo Logo" className="w-full h-full object-contain" />
                </div>
                <span className="text-xl font-black tracking-tight text-slate-900">Cartizo</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col bg-white">
              {/* Profile/Auth Section at Top */}
              <div className="p-6 border-b border-gray-50 bg-slate-50/50">
                {user ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 px-2">
                      <div className="w-12 h-12 rounded-full bg-orange-600 flex items-center justify-center text-white text-lg font-bold shadow-lg ring-4 ring-white">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-black text-slate-900 truncate">{user.name}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">{user.role}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      <a href={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-white hover:text-orange-600 rounded-xl transition-all border border-transparent hover:border-gray-100 shadow-sm hover:shadow-md" onClick={() => setMobileMenuOpen(false)}>
                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                      </a>
                      <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-red-100 shadow-sm hover:shadow-md text-left">
                        <LogOutIcon /> Sign Out
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <a href="/auth/login" className="flex items-center justify-center py-3 rounded-xl bg-white border border-gray-200 text-xs font-bold text-slate-900 shadow-sm active:scale-95 transition-all" onClick={() => setMobileMenuOpen(false)}>Login</a>
                    <a href="/auth/signup" className="flex items-center justify-center py-3 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-lg active:scale-95 transition-all" onClick={() => setMobileMenuOpen(false)}>Signup</a>
                  </div>
                )}
              </div>

              <div className="p-6 space-y-8">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-4">Navigation</p>
                  <div className="space-y-1">
                    <a href="/products" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-900 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-all" onClick={() => setMobileMenuOpen(false)}>
                      Browse All Products
                    </a>
                    <a href="/wishlist" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-900 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-all sm:hidden" onClick={() => setMobileMenuOpen(false)}>
                      My Wishlist
                    </a>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-4">Categories</p>
                  <div className="space-y-1">
                    {!catLoading && categories.map((cat: any) => (
                      <a
                        key={cat.id}
                        href={`/category/${cat.slug}`}
                        className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-all"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {cat.name}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )
      }
    </>
  );
}

function LogOutIcon() {
  return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
}
