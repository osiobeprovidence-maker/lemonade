import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db, storage, handleFirestoreError } from '../lib/firebase';
import { motion } from 'framer-motion';
import { User, Bookmark, History, BookPlus, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export function Profile() {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState<'library' | 'history' | 'series'>('library');
  const [userSeries, setUserSeries] = React.useState<any[]>([]);
  const [userProfile, setUserProfile] = React.useState<any>(null);
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!user) return;

    const profileRef = doc(db, 'users', user.uid);
    const unsubscribeProfile = onSnapshot(profileRef, (docSnap) => {
      if (docSnap.exists()) setUserProfile(docSnap.data());
    }, (error) => handleFirestoreError(error, 'GET', `users/${user.uid}`));

    const q = query(collection(db, 'series'), where('creatorId', '==', user.uid));
    const unsubscribeSeries = onSnapshot(q, (snapshot) => {
      setUserSeries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, 'LIST', 'series'));

    return () => { unsubscribeProfile(); unsubscribeSeries(); };
  }, [user]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `avatars/${user.uid}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await updateDoc(doc(db, 'users', user.uid), { photoURL: url });
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    return (
      <div className="w-full min-h-screen bg-white flex flex-col items-center justify-center px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-300 mb-6 mx-auto">
            <User size={40} />
          </div>
          <h2 className="text-2xl font-black tracking-tight mb-2 text-zinc-800">Your Profile</h2>
          <p className="text-zinc-400 text-sm mb-8">Please sign in to view your profile and reading history.</p>
          <motion.button
            onClick={() => navigate('/login')}
            whileTap={{ scale: 0.98 }}
            className="w-full max-w-xs py-3.5 text-white rounded-xl font-black text-sm tracking-widest transition-all hover:opacity-90"
            style={{ backgroundColor: '#4ade80' }}
          >
            SIGN IN
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white flex flex-col">
      <main className="flex-grow pb-12">
        {/* Profile Header */}
        <section className="px-4 md:px-8 py-8 text-center">
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 rounded-full overflow-hidden mx-auto border-2 border-zinc-100">
              <img
                src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`}
                className="w-full h-full object-cover"
              />
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 w-8 h-8 bg-white border border-zinc-200 rounded-full flex items-center justify-center text-zinc-500 hover:text-zinc-700 hover:border-zinc-300 transition-all shadow-sm"
              title="Change photo"
            >
              <Camera size={14} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>

          <h2 className="text-xl font-bold text-zinc-800 mb-2">{user.displayName}</h2>
          <span className="inline-block text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-green-50 text-green-600">
            {userProfile?.role || 'fan'}
          </span>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mt-8 max-w-sm mx-auto">
            <div className="p-4 bg-zinc-50 rounded-xl">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Coins</p>
              <p className="text-xl font-bold text-zinc-800">{userProfile?.coins || 0}</p>
            </div>
            <div className="p-4 bg-zinc-50 rounded-xl">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Series</p>
              <p className="text-xl font-bold text-zinc-800">{userSeries.length}</p>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <section className="px-4 md:px-8 mt-2">
          <div className="flex gap-6 border-b border-zinc-100 mb-8 overflow-x-auto no-scrollbar">
            {(['library', 'history', 'series'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all relative whitespace-nowrap ${
                  activeTab === tab ? 'text-green-600' : 'text-zinc-400 hover:text-zinc-600'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div layoutId="profileTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500" />
                )}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {activeTab === 'library' && (
              <div className="col-span-full py-16 text-center bg-zinc-50 rounded-2xl">
                <Bookmark size={32} className="mx-auto mb-4 text-zinc-300" />
                <h3 className="text-sm font-bold text-zinc-600 mb-1">Library is empty</h3>
                <p className="text-xs text-zinc-400 mb-6">Save series to find them easily.</p>
                <motion.button
                  onClick={() => navigate('/')}
                  whileTap={{ scale: 0.98 }}
                  className="text-xs font-bold uppercase tracking-wider px-6 py-2 rounded-full transition-all hover:opacity-80 bg-green-50 text-green-600"
                >
                  Browse Stories
                </motion.button>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="col-span-full py-16 text-center bg-zinc-50 rounded-2xl">
                <History size={32} className="mx-auto mb-4 text-zinc-300" />
                <h3 className="text-sm font-bold text-zinc-600 mb-1">No history</h3>
                <p className="text-xs text-zinc-400 mb-6">Start reading to see history here.</p>
                <motion.button
                  onClick={() => navigate('/')}
                  whileTap={{ scale: 0.98 }}
                  className="text-xs font-bold uppercase tracking-wider px-6 py-2 rounded-full transition-all hover:opacity-80 bg-green-50 text-green-600"
                >
                  Start Reading
                </motion.button>
              </div>
            )}

            {activeTab === 'series' && (
              <>
                {userSeries.length > 0 ? (
                  userSeries.map(s => (
                    <motion.div
                      key={s.id}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => navigate(`/read/${s.id}/1`)}
                      className="flex flex-col gap-2 cursor-pointer"
                    >
                      <div className="aspect-[3/4] rounded-xl overflow-hidden bg-zinc-100 relative">
                        <img src={s.coverImage} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <div className="absolute top-2 left-2 text-[8px] font-bold text-white px-1.5 py-0.5 rounded bg-green-500">
                          {s.status}
                        </div>
                      </div>
                      <h4 className="font-bold text-xs truncate text-zinc-800">{s.title}</h4>
                      <p className="text-[10px] text-zinc-400">{s.viewCount || 0} views</p>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full py-16 text-center bg-zinc-50 rounded-2xl">
                    <BookPlus size={32} className="mx-auto mb-4 text-zinc-300" />
                    <h3 className="text-sm font-bold text-zinc-600 mb-1">No series published</h3>
                    <p className="text-xs text-zinc-400 mb-6">Share your stories with the world.</p>
                    <motion.button
                      onClick={() => navigate('/studio')}
                      whileTap={{ scale: 0.98 }}
                      className="text-xs font-bold uppercase tracking-wider px-6 py-2 rounded-full transition-all hover:opacity-80 bg-green-50 text-green-600"
                    >
                      Go to Studio
                    </motion.button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
