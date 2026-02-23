import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, Image as ImageIcon, BarChart3, Plus, Trash2, Shield, Upload, Loader2, Settings } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function AdminPanel() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [wallpapers, setWallpapers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'stats' | 'wallpapers' | 'users' | 'categories' | 'settings'>('stats');
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [settings, setSettings] = useState({
    adEnabled: true,
    adTimer: 5,
    siteName: "4K Wallpaper Vault"
  });

  const [newCatName, setNewCatName] = useState('');

  // Form state for new wallpaper
  const [newWp, setNewWp] = useState({
    title: '',
    url: '',
    cloudinary_id: '',
    category_id: 1,
    tags: '',
    width: 3840,
    height: 2160,
    description: ''
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigate('/');
      return;
    }
    fetchAdminData();
  }, [activeTab]);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      if (activeTab === 'stats') {
        const res = await axios.get('/api/admin/stats', { headers });
        setStats(res.data);
      } else if (activeTab === 'wallpapers') {
        const [wpRes, catRes] = await Promise.all([
          axios.get('/api/wallpapers', { headers }),
          axios.get('/api/categories')
        ]);
        setWallpapers(wpRes.data);
        setCategories(catRes.data);
      } else if (activeTab === 'categories') {
        const res = await axios.get('/api/categories');
        setCategories(res.data);
      } else if (activeTab === 'settings') {
        const res = await axios.get('/api/settings');
        setSettings(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddWallpaper = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      let uploadData = { ...newWp };

      // If a file is selected, upload it first
      if (selectedFile) {
        const formData = new FormData();
        formData.append('image', selectedFile);
        const uploadRes = await axios.post('/api/admin/upload', formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        uploadData.url = uploadRes.data.url;
        uploadData.cloudinary_id = uploadRes.data.cloudinary_id;
        uploadData.width = uploadRes.data.width;
        uploadData.height = uploadRes.data.height;
      }

      if (!uploadData.url) {
        alert('Please select a file or provide a URL');
        setIsUploading(false);
        return;
      }

      await axios.post('/api/admin/wallpapers', {
        ...uploadData,
        dominant_colors: []
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('Wallpaper added successfully!');
      setNewWp({
        title: '',
        url: '',
        cloudinary_id: '',
        category_id: 1,
        tags: '',
        width: 3840,
        height: 2160,
        description: ''
      });
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setActiveTab('wallpapers');
    } catch (err) {
      console.error(err);
      alert('Failed to add wallpaper');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteWallpaper = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    try {
      await axios.delete(`/api/admin/wallpapers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWallpapers(wallpapers.filter(w => w.id !== id));
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/categories', { name: newCatName }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewCatName('');
      fetchAdminData();
    } catch (err) {
      alert('Failed to add category');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    try {
      await axios.delete(`/api/admin/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAdminData();
    } catch (err) {
      alert('Failed to delete category');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/settings', settings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Settings saved!');
    } catch (err) {
      alert('Failed to save settings');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-64 space-y-2">
            <button 
              onClick={() => setActiveTab('stats')}
              className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === 'stats' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
            >
              <BarChart3 size={20} />
              Overview
            </button>
            <button 
              onClick={() => setActiveTab('wallpapers')}
              className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === 'wallpapers' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
            >
              <ImageIcon size={20} />
              Wallpapers
            </button>
            <button 
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === 'users' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
            >
              <Users size={20} />
              Users
            </button>
            <button 
              onClick={() => setActiveTab('categories')}
              className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === 'categories' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
            >
              <Plus size={20} />
              Categories
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === 'settings' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
            >
              <Settings size={20} />
              Settings
            </button>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {activeTab === 'stats' && stats && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-2">Total Wallpapers</p>
                    <h3 className="text-4xl font-black text-gray-900">{stats.totalWallpapers}</h3>
                  </div>
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-2">Total Users</p>
                    <h3 className="text-4xl font-black text-gray-900">{stats.totalUsers}</h3>
                  </div>
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-2">Total Downloads</p>
                    <h3 className="text-4xl font-black text-gray-900">{stats.totalDownloads}</h3>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                  <h4 className="text-xl font-bold mb-6">Top Downloaded Wallpapers</h4>
                  <div className="space-y-4">
                    {stats.topWallpapers.map((wp: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                        <span className="font-bold text-gray-700">{wp.title}</span>
                        <span className="bg-indigo-100 text-indigo-700 px-4 py-1 rounded-full text-sm font-bold">{wp.download_count} DLs</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'categories' && (
              <div className="space-y-8">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                  <h4 className="text-xl font-bold mb-6">Add New Category</h4>
                  <form onSubmit={handleAddCategory} className="flex gap-4">
                    <input 
                      type="text" placeholder="Category Name" required
                      className="flex-1 p-4 bg-gray-50 border border-gray-200 rounded-xl"
                      value={newCatName} onChange={e => setNewCatName(e.target.value)}
                    />
                    <button type="submit" className="bg-indigo-600 text-white font-bold px-8 rounded-xl hover:bg-indigo-700 transition-all">
                      Add
                    </button>
                  </form>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4 font-bold text-gray-600">Name</th>
                        <th className="px-6 py-4 font-bold text-gray-600">Slug</th>
                        <th className="px-6 py-4 font-bold text-gray-600 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {categories.map(cat => (
                        <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-bold text-gray-900">{cat.name}</td>
                          <td className="px-6 py-4 text-gray-500">{cat.slug}</td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => handleDeleteCategory(cat.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all">
                              <Trash2 size={20} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h4 className="text-xl font-bold mb-6">Site & Ad Settings</h4>
                <form onSubmit={handleSaveSettings} className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                    <div>
                      <p className="font-bold text-gray-900">Enable Ad Wall</p>
                      <p className="text-sm text-gray-500">Require users to watch a mock ad before downloading</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setSettings({...settings, adEnabled: !settings.adEnabled})}
                      className={`w-14 h-8 rounded-full transition-all relative ${settings.adEnabled ? 'bg-indigo-600' : 'bg-gray-300'}`}
                    >
                      <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${settings.adEnabled ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Ad Timer (Seconds)</label>
                    <input 
                      type="number" 
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl"
                      value={settings.adTimer}
                      onChange={e => setSettings({...settings, adTimer: Number(e.target.value)})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Site Name</label>
                    <input 
                      type="text" 
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl"
                      value={settings.siteName}
                      onChange={e => setSettings({...settings, siteName: e.target.value})}
                    />
                  </div>

                  <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-all">
                    Save Site Settings
                  </button>
                </form>
              </div>
            )}
            {activeTab === 'wallpapers' && (
              <div className="space-y-8">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                  <h4 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Plus className="text-indigo-600" />
                    Add New Wallpaper
                  </h4>
                  <form onSubmit={handleAddWallpaper} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Direct Upload (JPG/PNG)</label>
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-indigo-400 hover:bg-indigo-50 transition-all cursor-pointer group"
                      >
                        <input 
                          type="file" 
                          ref={fileInputRef}
                          className="hidden" 
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setSelectedFile(file);
                              if (!newWp.title) setNewWp({ ...newWp, title: file.name.split('.')[0] });
                            }
                          }}
                        />
                        <div className="flex flex-col items-center gap-2">
                          <Upload className={`text-gray-400 group-hover:text-indigo-500 transition-colors ${selectedFile ? 'text-indigo-500' : ''}`} size={32} />
                          <p className="text-gray-500 font-medium">
                            {selectedFile ? selectedFile.name : 'Click to select or drag and drop image'}
                          </p>
                          <p className="text-xs text-gray-400">Supports JPG, PNG, WEBP (Max 10MB)</p>
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-2 flex items-center gap-4 py-2">
                      <div className="h-px bg-gray-100 flex-1" />
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">OR PROVIDE URL</span>
                      <div className="h-px bg-gray-100 flex-1" />
                    </div>

                    <input 
                      type="text" placeholder="Title" required
                      className="p-4 bg-gray-50 border border-gray-200 rounded-xl"
                      value={newWp.title} onChange={e => setNewWp({...newWp, title: e.target.value})}
                    />
                    <input 
                      type="text" placeholder="Cloudinary URL (Optional if uploading)"
                      className="p-4 bg-gray-50 border border-gray-200 rounded-xl"
                      value={newWp.url} onChange={e => setNewWp({...newWp, url: e.target.value})}
                    />
                    <input 
                      type="text" placeholder="Cloudinary Public ID (Optional if uploading)"
                      className="p-4 bg-gray-50 border border-gray-200 rounded-xl"
                      value={newWp.cloudinary_id} onChange={e => setNewWp({...newWp, cloudinary_id: e.target.value})}
                    />
                    <input 
                      type="text" placeholder="Tags (comma separated)"
                      className="p-4 bg-gray-50 border border-gray-200 rounded-xl"
                      value={newWp.tags} onChange={e => setNewWp({...newWp, tags: e.target.value})}
                    />
                    <select 
                      className="p-4 bg-gray-50 border border-gray-200 rounded-xl"
                      value={newWp.category_id} onChange={e => setNewWp({...newWp, category_id: Number(e.target.value)})}
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                    <button 
                      type="submit" 
                      disabled={isUploading}
                      className="bg-indigo-600 text-white font-bold rounded-xl py-4 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="animate-spin" size={20} />
                          Uploading...
                        </>
                      ) : (
                        'Upload Wallpaper'
                      )}
                    </button>
                  </form>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4 font-bold text-gray-600">Preview</th>
                        <th className="px-6 py-4 font-bold text-gray-600">Title</th>
                        <th className="px-6 py-4 font-bold text-gray-600">Stats</th>
                        <th className="px-6 py-4 font-bold text-gray-600 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {wallpapers.map(wp => (
                        <tr key={wp.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <img src={wp.url} className="w-16 h-12 object-cover rounded-lg" />
                          </td>
                          <td className="px-6 py-4 font-bold text-gray-900">{wp.title}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {wp.download_count} DLs • {wp.views} Views
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => handleDeleteWallpaper(wp.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all">
                              <Trash2 size={20} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
