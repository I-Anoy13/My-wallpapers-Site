import { useState, useEffect } from 'react';
import { Search, ArrowRight, Filter, ChevronDown, Download, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { wallpaperService, Wallpaper, Category } from '../services/firebaseService';
import { Link } from 'react-router-dom';

export default function Home() {
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [trendingWallpapers, setTrendingWallpapers] = useState<Wallpaper[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [wpData, catData, trendingData] = await Promise.all([
        wallpaperService.getWallpapers({ category: selectedCategory }),
        wallpaperService.getCategories(),
        wallpaperService.getTrendingWallpapers(8)
      ]);
      
      console.log("Fetched Data:", { wpData, catData, trendingData });
      
      setWallpapers(Array.isArray(wpData) ? wpData : []);
      setCategories(Array.isArray(catData) ? catData : []);
      setTrendingWallpapers(Array.isArray(trendingData) ? trendingData : []);
    } catch (err) {
      console.error("Fetch Error:", err);
      setWallpapers([]);
      setCategories([]);
      setTrendingWallpapers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const wpData = await wallpaperService.getWallpapers({ search });
      setWallpapers(wpData);
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
      <main className="max-w-7xl mx-auto px-4 py-12 -mt-10 sm:-mt-20 relative z-20">
        {/* Trending Section */}
        {!selectedCategory && !search && Array.isArray(trendingWallpapers) && trendingWallpapers.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white sm:text-gray-900 flex items-center gap-2">
                <TrendingUp className="text-indigo-400 sm:text-indigo-600" size={24} />
                Trending Now
              </h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar snap-x scroll-smooth">
              {(Array.isArray(trendingWallpapers) ? trendingWallpapers : []).map((wp) => {
                if (!wp || !wp.id) return null;
                return (
                  <motion.div
                    key={`trending-${wp.id}`}
                    whileHover={{ y: -5 }}
                    className="min-w-[140px] sm:min-w-[240px] snap-start"
                  >
                    <Link to={`/wallpaper/${wp.id}`} className="block aspect-[3/4] rounded-2xl overflow-hidden shadow-lg relative group border border-white/10 sm:border-transparent">
                      <img 
                        src={(wp.url && typeof wp.url === 'string') ? wp.url.replace('/upload/', '/upload/c_fill,w_400,h_533,q_auto,f_auto/') : ''} 
                        alt={wp.title || 'Trending Wallpaper'}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 sm:p-4">
                        <p className="text-white font-bold text-[10px] sm:text-xs truncate">{wp.title || 'Untitled'}</p>
                        <div className="flex items-center gap-1 text-white/60 text-[8px] sm:text-[10px]">
                          <Download size={8} />
                          <span>{wp.download_count || 0}</span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        {/* Categories Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Categories</h3>
          </div>
          <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar snap-x">
            <button 
              onClick={() => setSelectedCategory('')}
              className={`px-5 py-2.5 rounded-full font-bold whitespace-nowrap transition-all snap-start text-sm ${
                selectedCategory === '' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'
              }`}
            >
              All
            </button>
            {(Array.isArray(categories) ? categories : []).map(cat => {
              if (!cat || !cat.id) return null;
              return (
                <button 
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug || '')}
                  className={`px-5 py-2.5 rounded-full font-bold whitespace-nowrap transition-all snap-start text-sm ${
                    selectedCategory === cat.slug ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'
                  }`}
                >
                  {cat.name || 'Unnamed'}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-gray-200 rounded-2xl sm:rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-8">
            {(Array.isArray(wallpapers) ? wallpapers : []).map((wp, i) => {
              if (!wp || !wp.id) return null;
              return (
                <motion.div
                  key={wp.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative"
                >
                  <Link to={`/wallpaper/${wp.id}`} className="block aspect-[3/4] overflow-hidden rounded-2xl sm:rounded-3xl bg-gray-100 shadow-sm sm:shadow-lg group-hover:shadow-md sm:group-hover:shadow-2xl transition-all duration-500">
                    {(wp.url && typeof wp.url === 'string') ? (
                      <img 
                        src={wp.url.replace('/upload/', '/upload/c_fill,w_600,h_800,q_auto,f_auto/')} 
                        alt={wp.title || 'Wallpaper'}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                        No Image
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 sm:p-6">
                      <h3 className="text-white font-bold text-[10px] sm:text-xl mb-0.5 sm:mb-1 truncate">{wp.title || 'Untitled'}</h3>
                      <div className="flex items-center justify-between text-white/70 text-[8px] sm:text-sm">
                        <span className="truncate">{wp.category_name || 'Uncategorized'}</span>
                        <div className="flex items-center gap-1">
                          <Download size={10} />
                          <span>{wp.download_count || 0}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

        {!isLoading && Array.isArray(wallpapers) && wallpapers.length === 0 && (
          <div className="text-center py-20">
            <h3 className="text-2xl font-bold text-gray-400">No wallpapers found</h3>
            <p className="text-gray-500">Try adjusting your search or category filters.</p>
          </div>
        )}
      </main>
    </div>
  );
}