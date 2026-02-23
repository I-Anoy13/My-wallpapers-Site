import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, Heart, Share2, Eye, Calendar, Maximize2, Tag, X, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function WallpaperDetail() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [wallpaper, setWallpaper] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAdModal, setShowAdModal] = useState(false);
  const [adTimer, setAdTimer] = useState(5);
  const [isAdFinished, setIsAdFinished] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [settings, setSettings] = useState({ adEnabled: true, adTimer: 5 });

  useEffect(() => {
    fetchWallpaper();
    fetchSettings();
  }, [id]);

  const fetchSettings = async () => {
    try {
      const res = await axios.get('/api/settings');
      setSettings(res.data);
      setAdTimer(res.data.adTimer);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchWallpaper = async () => {
    try {
      const res = await axios.get(`/api/wallpapers/${id}`);
      setWallpaper(res.data);
      if (user) {
        const favRes = await axios.get('/api/user/favorites', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsFavorited(favRes.data.some((f: any) => f.id === Number(id)));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFavorite = async () => {
    if (!user) return navigate('/login');
    try {
      const res = await axios.post(`/api/wallpapers/${id}/favorite`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsFavorited(res.data.favorite);
    } catch (err) {
      console.error(err);
    }
  };

  const startDownload = () => {
    if (!user) return navigate('/login');
    
    if (!settings.adEnabled) {
      handleFinalDownload();
      return;
    }

    setShowAdModal(true);
    setAdTimer(settings.adTimer);
    setIsAdFinished(false);
    
    const interval = setInterval(() => {
      setAdTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsAdFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleFinalDownload = async () => {
    try {
      await axios.post(`/api/wallpapers/${id}/download`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Trigger actual file download
      const link = document.createElement('a');
      link.href = wallpaper.url;
      link.download = `${wallpaper.title}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setShowAdModal(false);
      fetchWallpaper(); // Refresh stats
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!wallpaper) return <div className="min-h-screen flex items-center justify-center">Not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Preview Image */}
          <div className="lg:col-span-2">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative group rounded-3xl overflow-hidden shadow-2xl bg-white"
            >
              <img 
                src={wallpaper.url.replace('/upload/', '/upload/q_auto,f_auto,w_1200/')} 
                alt={wallpaper.title}
                className="w-full h-auto"
              />
              <div className="absolute top-4 right-4 flex gap-2">
                <button onClick={handleFavorite} className={`p-3 rounded-2xl backdrop-blur-md transition-all ${isFavorited ? 'bg-red-500 text-white' : 'bg-black/20 text-white hover:bg-black/40'}`}>
                  <Heart size={24} fill={isFavorited ? 'currentColor' : 'none'} />
                </button>
                <button className="p-3 bg-black/20 backdrop-blur-md text-white rounded-2xl hover:bg-black/40 transition-all">
                  <Share2 size={24} />
                </button>
              </div>
            </motion.div>
          </div>

          {/* Details */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{wallpaper.title}</h1>
              <p className="text-gray-500 text-lg">{wallpaper.description || 'No description provided.'}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <Eye size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">Views</span>
                </div>
                <span className="text-xl font-bold text-gray-900">{wallpaper.views}</span>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <Download size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">Downloads</span>
                </div>
                <span className="text-xl font-bold text-gray-900">{wallpaper.download_count}</span>
              </div>
            </div>

            <button 
              onClick={startDownload}
              className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-xl shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3 group"
            >
              <Download className="group-hover:translate-y-1 transition-transform" />
              Download 4K (Watch Ad)
            </button>

            <div className="space-y-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-500">
                  <Maximize2 size={18} />
                  <span>Resolution</span>
                </div>
                <span className="font-semibold text-gray-900">{wallpaper.width} x {wallpaper.height}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-500">
                  <Calendar size={18} />
                  <span>Uploaded</span>
                </div>
                <span className="font-semibold text-gray-900">{new Date(wallpaper.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-500">
                  <Tag size={18} />
                  <span>Category</span>
                </div>
                <span className="font-semibold text-indigo-600">{wallpaper.category_name}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {wallpaper.tags?.split(',').map((tag: string) => (
                <span key={tag} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-sm font-medium hover:bg-gray-200 cursor-pointer transition-colors">
                  #{tag.trim()}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Ad Modal */}
      <AnimatePresence>
        {showAdModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="aspect-video bg-gray-900 flex items-center justify-center relative">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center text-white mx-auto animate-pulse">
                    <Play size={40} fill="currentColor" />
                  </div>
                  <p className="text-white font-medium text-lg">Your download is ready after this short ad</p>
                </div>
                
                <div className="absolute bottom-6 right-6 flex items-center gap-4">
                  {!isAdFinished ? (
                    <div className="bg-black/60 backdrop-blur-md text-white px-6 py-3 rounded-xl font-bold border border-white/20">
                      Skip in {adTimer}s
                    </div>
                  ) : (
                    <button 
                      onClick={handleFinalDownload}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2"
                    >
                      Continue to Download
                      <ArrowRight size={20} />
                    </button>
                  )}
                </div>
              </div>
              <div className="p-6 bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                    <Download size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">4K High Quality File</p>
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Ready to save</p>
                  </div>
                </div>
                <button onClick={() => setShowAdModal(false)} className="p-2 text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ArrowRight({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  );
}
