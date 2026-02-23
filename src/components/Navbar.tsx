import { useState, useEffect } from 'react';
import { Search, Menu, X, User, Heart, Download, LayoutDashboard, LogOut, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
            <Download size={24} />
          </div>
          <span className={`text-xl font-bold tracking-tight ${isScrolled ? 'text-gray-900' : 'text-white'}`}>
            Vault<span className="text-indigo-600">4K</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className={`font-medium hover:text-indigo-600 transition-colors ${isScrolled ? 'text-gray-600' : 'text-white/90'}`}>Explore</Link>
          <Link to="/categories" className={`font-medium hover:text-indigo-600 transition-colors ${isScrolled ? 'text-gray-600' : 'text-white/90'}`}>Categories</Link>
          
          <div className="flex items-center gap-4 ml-4">
            {user ? (
              <div className="flex items-center gap-4">
                {user.role === 'ADMIN' && (
                  <Link to="/admin" className="p-2 text-gray-500 hover:text-indigo-600 transition-colors" title="Admin Panel">
                    <ShieldCheck size={22} />
                  </Link>
                )}
                <Link to="/dashboard" className="p-2 text-gray-500 hover:text-indigo-600 transition-colors" title="Dashboard">
                  <LayoutDashboard size={22} />
                </Link>
                <button onClick={logout} className="p-2 text-gray-500 hover:text-red-600 transition-colors" title="Logout">
                  <LogOut size={22} />
                </button>
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                  {user.name[0].toUpperCase()}
                </div>
              </div>
            ) : (
              <Link to="/login" className={`px-6 py-2 rounded-full font-semibold transition-all ${
                isScrolled ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-white text-indigo-600 hover:bg-indigo-50'
              }`}>
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden p-2 text-gray-600" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} className={isScrolled ? 'text-gray-900' : 'text-white'} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-white border-t p-4 shadow-xl md:hidden flex flex-col gap-4"
          >
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium p-2">Explore</Link>
            <Link to="/categories" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium p-2">Categories</Link>
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium p-2">Dashboard</Link>
                {user.role === 'ADMIN' && <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium p-2">Admin Panel</Link>}
                <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="text-lg font-medium p-2 text-left text-red-600">Logout</button>
              </>
            ) : (
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="bg-indigo-600 text-white p-3 rounded-xl text-center font-bold">Sign In</Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
