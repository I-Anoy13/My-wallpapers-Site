import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Heart, Download, Clock, User as UserIcon, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user, token } = useAuth();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const res = await axios.get('/api/user/favorites', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFavorites(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Profile Header */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-12 flex flex-col md:flex-row items-center gap-8">
          <div className="w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-indigo-100">
            {user?.name[0].toUpperCase()}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-1">{user?.name}</h1>
            <p className="text-gray-500 font-medium mb-4">{user?.email}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <span className="px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-bold flex items-center gap-2">
                <Clock size={14} />
                Member since {new Date().getFullYear()}
              </span>
              <span className="px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm font-bold flex items-center gap-2">
                <UserIcon size={14} />
                {user?.role} Account
              </span>
            </div>
          </div>
          <button className="p-4 bg-gray-50 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all">
            <Settings size={24} />
          </button>
        </div>

        {/* Favorites Grid */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-3">
              <Heart className="text-red-500" fill="currentColor" />
              My Favorites
            </h2>
            <Link to="/" className="text-indigo-600 font-bold hover:underline">Explore More</Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-gray-200 rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : favorites.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {favorites.map((wp) => (
                <motion.div
                  key={wp.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="group relative"
                >
                  <Link to={`/wallpaper/${wp.id}`} className="block aspect-[3/4] overflow-hidden rounded-3xl bg-gray-100 shadow-lg group-hover:shadow-2xl transition-all duration-500">
                    <img 
                      src={wp.url.replace('/upload/', '/upload/c_fill,w_600,h_800,q_auto,f_auto/')} 
                      alt={wp.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                      <h3 className="text-white font-bold text-lg mb-1">{wp.title}</h3>
                      <div className="flex items-center justify-between text-white/80 text-xs">
                        <div className="flex items-center gap-1">
                          <Download size={12} />
                          <span>{wp.download_count}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-20 rounded-3xl border border-dashed border-gray-200 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto mb-4">
                <Heart size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-400 mb-2">No favorites yet</h3>
              <p className="text-gray-500 mb-8">Start exploring and save your favorite 4K wallpapers!</p>
              <Link to="/" className="inline-block px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all">
                Start Exploring
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
