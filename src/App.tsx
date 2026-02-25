import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import WallpaperDetail from './pages/WallpaperDetail';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 font-sans selection:bg-indigo-100 selection:text-indigo-700">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/wallpaper/:id" element={<WallpaperDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
          
          <footer className="bg-white border-t border-gray-100 py-12 mt-20">
            <div className="max-w-7xl mx-auto px-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                </div>
                <span className="text-lg font-bold text-gray-900">Wall<span className="text-indigo-600">nexa</span></span>
              </div>
              <p className="text-gray-500 text-sm mb-8">© 2026 Wallnexa. All rights reserved. High-quality wallpapers for your desktop and mobile.</p>
              <div className="flex justify-center gap-8 text-sm font-bold text-gray-400">
                <a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-indigo-600 transition-colors">Contact Us</a>
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}