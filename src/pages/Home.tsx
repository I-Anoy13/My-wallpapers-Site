import { useState, useEffect } from 'react';
import { Search, ArrowRight, Filter, ChevronDown, Download } from 'lucide-react';
import { motion } from 'motion/react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function Home() {
  const [wallpapers, setWallpapers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [wpRes, catRes] = await Promise.all([
        axios.get(`/api/wallpapers?category=${selectedCategory}`),
        axios.get('/api/categories')
      ]);
      setWallpapers(wpRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.get(`/api/wallpapers?search=${search}`);
      setWallpapers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden bg-gray-900">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1477346611705-65d1883cee1e?auto=format&fit=crop&q=80&w=2070" 
            className="w-full h-full object-cover opacity-40"
            alt="Hero Background"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/50 to-gray-900" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight"
          >
            Discover Stunning <span className="text-indigo-400">4K</span> Wallpapers
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto"
          >
            The ultimate vault for high-resolution backgrounds. Ad-supported downloads for premium quality.
          </motion.p>

          <motion.form 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleSearch}
            className="relative max-w-2xl mx-auto"
          >
            <input 
              type="text" 
              placeholder="Search for nature, space, minimalist..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-8 py-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg shadow-2xl"
            />
            <button type="submit" className="absolute right-3 top-3 bottom-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all flex items-center gap-2 font-bold">
              <Search size={20} />
              <span className="hidden sm:inline">Search</span>
            </button>
          </motion.form>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12 -mt-20 relative z-20">
        {/* Categories Bar */}
        <div className="flex items-center gap-4 mb-12 overflow-x-auto pb-4 no-scrollbar">
          <button 
            onClick={() => setSelectedCategory('')}
            className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all shadow-sm ${
              selectedCategory === '' ? 'bg-indigo-600 text-white shadow-indigo-200' : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            All Wallpapers
          </button>
          {categories.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all shadow-sm ${
                selectedCategory === cat.slug ? 'bg-indigo-600 text-white shadow-indigo-200' : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-gray-200 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {wallpapers.map((wp, i) => (
              <motion.div
                key={wp.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group relative"
              >
                <Link to={`/wallpaper/${wp.id}`} className="block aspect-[3/4] overflow-hidden rounded-3xl bg-gray-100 shadow-lg group-hover:shadow-2xl transition-all duration-500">
                  <img 
                    src={wp.url.replace('/upload/', '/upload/c_fill,w_600,h_800,q_auto,f_auto/')} 
                    alt={wp.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                    <h3 className="text-white font-bold text-xl mb-1">{wp.title}</h3>
                    <div className="flex items-center justify-between text-white/80 text-sm">
                      <span>{wp.category_name}</span>
                      <div className="flex items-center gap-1">
                        <Download size={14} />
                        <span>{wp.download_count}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {!isLoading && wallpapers.length === 0 && (
          <div className="text-center py-20">
            <h3 className="text-2xl font-bold text-gray-400">No wallpapers found</h3>
            <p className="text-gray-500">Try adjusting your search or category filters.</p>
          </div>
        )}
      </main>
    </div>
  );
}
