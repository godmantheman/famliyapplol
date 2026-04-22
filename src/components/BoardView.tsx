import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, orderBy, addDoc, serverTimestamp, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { Announcement } from '../types';
import { Megaphone, Plus, Trash2, X } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export function BoardView() {
  const { profile } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAnnouncements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Announcement)));
    });
    return () => unsubscribe();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim() || !profile) return;

    try {
      await addDoc(collection(db, 'announcements'), {
        title: newTitle,
        content: newContent,
        authorId: profile.uid,
        authorName: `${profile.role} ${profile.displayName}`,
        createdAt: serverTimestamp(),
        isNotice: true
      });
      setNewTitle('');
      setNewContent('');
      setIsAdding(false);
    } catch (error) {
      console.error('Error adding announcement:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('이 글을 삭제할까요?')) {
      await deleteDoc(doc(db, 'announcements', id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold flex items-center gap-3">
          <Megaphone className="h-8 w-8 text-brand-500" />
          가족 게시판
        </h2>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 rounded-2xl bg-brand-500 px-6 py-3 font-bold text-white shadow-lg shadow-brand-100 transition-transform active:scale-95"
        >
          <Plus className="h-6 w-6" /> 글쓰기
        </button>
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[32px] bg-white p-8 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold">새 소식 올리기</h3>
              <button onClick={() => setIsAdding(false)} className="rounded-full p-2 hover:bg-slate-100">
                <X className="h-8 w-8" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-6">
              <div>
                <label className="mb-2 block text-lg font-bold text-slate-700">제목</label>
                <input 
                  type="text" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-2xl bg-slate-100 px-6 py-4 text-xl focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all font-medium"
                  placeholder="제목을 적어주세요"
                  autoFocus
                />
              </div>
              <div>
                <label className="mb-2 block text-lg font-bold text-slate-700">내용</label>
                <textarea 
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={5}
                  className="w-full rounded-2xl bg-slate-100 px-6 py-4 text-xl focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all font-medium"
                  placeholder="가족에게 전할 말을 적어주세요"
                />
              </div>
              <button 
                type="submit"
                className="w-full rounded-2xl bg-brand-500 py-4 text-xl font-bold text-white shadow-lg shadow-brand-100 hover:bg-brand-600"
              >
                등록하기
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="grid gap-6">
        {announcements.map(item => (
          <div key={item.id} className="card-shadow p-8 flex flex-col gap-4 group relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold">
                  {item.authorName[0]}
                </div>
                <div>
                  <p className="font-bold text-slate-900">{item.authorName}</p>
                  <p className="text-sm text-slate-400">
                    {item.createdAt?.toDate ? format(item.createdAt.toDate(), 'yyyy년 MM월 dd일 p', { locale: ko }) : '방금 전'}
                  </p>
                </div>
              </div>
              {profile?.uid === item.authorId && (
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-6 w-6" />
                </button>
              )}
            </div>
            
            <h3 className="text-2xl font-bold text-slate-900">{item.title}</h3>
            <p className="text-xl text-slate-600 leading-relaxed whitespace-pre-wrap">{item.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
