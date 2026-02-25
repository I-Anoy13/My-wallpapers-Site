import { 
  collection, getDocs, getDoc, doc, query, where, orderBy, limit, 
  addDoc, updateDoc, deleteDoc, increment, setDoc, serverTimestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';

export interface Wallpaper {
  id: string; title: string; url: string; cloudinary_id: string;
  category_id: string; category_slug?: string; category_name?: string;
  tags: string; width: number; height: number; download_count: number;
  views: number; createdAt: any; description?: string;
}

export interface Category {
  id: string; name: string; slug: string;
}

export const wallpaperService = {
  async getWallpapers(filters: { category?: string; search?: string; sort?: string } = {}) {
    try {
      let q = query(collection(db, 'wallpapers'));
      if (filters.category) q = query(q, where('category_slug', '==', filters.category));
      q = query(q, orderBy(filters.sort === 'popular' ? 'download_count' : 'createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return (snapshot.docs || []).map(doc => ({ id: doc.id, ...doc.data() } as Wallpaper));
    } catch (err) {
      console.error("Error:", err);
      return [];
    }
  },

  async getCategories() {
    try {
      const snapshot = await getDocs(collection(db, 'categories'));
      return (snapshot.docs || []).map(doc => ({ id: doc.id, ...doc.data() } as Category));
    } catch (err) {
      return [];
    }
  },

  async getTrendingWallpapers(count = 8) {
    try {
      const q = query(collection(db, 'wallpapers'), orderBy('download_count', 'desc'), limit(count));
      const snapshot = await getDocs(q);
      return (snapshot.docs || []).map(doc => ({ id: doc.id, ...doc.data() } as Wallpaper));
    } catch (err) {
      return [];
    }
  },

  async getWallpaperById(id: string) {
    try {
      const snapshot = await getDoc(doc(db, 'wallpapers', id));
      return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } as Wallpaper : null;
    } catch (err) {
      return null;
    }
  },

  async incrementDownload(id: string) {
    try {
      await updateDoc(doc(db, 'wallpapers', id), { download_count: increment(1) });
    } catch (err) {}
  },

  async getStats() {
    try {
      const wpSnap = await getDocs(collection(db, 'wallpapers'));
      const userSnap = await getDocs(collection(db, 'users'));
      let totalDownloads = 0;
      wpSnap.docs.forEach(doc => totalDownloads += (doc.data().download_count || 0));
      return {
        totalWallpapers: wpSnap.size,
        totalUsers: userSnap.size,
        totalDownloads,
        topWallpapers: wpSnap.docs.map(doc => ({ title: doc.data().title, download_count: doc.data().download_count || 0 }))
          .sort((a, b) => b.download_count - a.download_count).slice(0, 5)
      };
    } catch (err) {
      return { totalWallpapers: 0, totalUsers: 0, totalDownloads: 0, topWallpapers: [] };
    }
  },

  async uploadFile(file: File) {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    if (cloudName && uploadPreset) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: formData });
      const data = await res.json();
      return { url: data.secure_url, public_id: data.public_id };
    }
    const storageRef = ref(storage, `wallpapers/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    return { url: await getDownloadURL(snapshot.ref), public_id: snapshot.ref.fullPath };
  }
};