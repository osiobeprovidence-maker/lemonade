import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db, handleFirestoreError } from '../lib/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, where } from 'firebase/firestore';
import { MessageSquare, Send, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CommentsProps {
  targetId: string; // seriesId or chapterId
  type: 'series' | 'chapter';
}

export function Comments({ targetId, type }: CommentsProps) {
  const [user] = useAuthState(auth);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'comments'),
      where('targetId', '==', targetId),
      where('type', '==', type),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, 'LIST', 'comments');
    });

    return () => unsubscribe();
  }, [targetId, type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    try {
      await addDoc(collection(db, 'comments'), {
        targetId,
        type,
        text: newComment,
        userId: user.uid,
        userName: user.displayName,
        userPhoto: user.photoURL,
        createdAt: serverTimestamp()
      });
      setNewComment('');
    } catch (error) {
      handleFirestoreError(error, 'CREATE', 'comments');
    }
  };

  return (
    <div className="mt-12">
      <h3 className="text-2xl font-serif font-bold mb-8 flex items-center gap-3">
        <MessageSquare className="text-brand-yellow" />
        Comments ({comments.length})
      </h3>

      {user ? (
        <form onSubmit={handleSubmit} className="mb-12 flex gap-4">
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
            <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} className="w-full h-full object-cover" />
          </div>
          <div className="flex-grow relative">
            <input 
              type="text" 
              placeholder="Add a comment..."
              className="w-full bg-brand-dark/5 border-none rounded-2xl p-4 pr-12 focus:ring-2 focus:ring-brand-yellow outline-none"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button 
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-brand-yellow hover:bg-brand-yellow/10 rounded-full transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
        </form>
      ) : (
        <div className="p-6 bg-brand-dark/5 rounded-3xl text-center mb-12">
          <p className="text-sm text-brand-dark/60">Please sign in to join the conversation.</p>
        </div>
      )}

      <div className="space-y-8">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-4">
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-brand-dark/5">
              <img src={comment.userPhoto || `https://ui-avatars.com/api/?name=${comment.userName}`} className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-sm">{comment.userName}</span>
                <span className="text-[10px] text-brand-dark/40 uppercase font-black">
                  {comment.createdAt ? formatDistanceToNow(comment.createdAt.toDate()) + ' ago' : 'Just now'}
                </span>
              </div>
              <p className="text-brand-dark/80 text-sm leading-relaxed">
                {comment.text}
              </p>
            </div>
          </div>
        ))}
        
        {comments.length === 0 && !loading && (
          <div className="text-center py-12 text-brand-dark/20">
            No comments yet. Be the first to say something!
          </div>
        )}
      </div>
    </div>
  );
}
