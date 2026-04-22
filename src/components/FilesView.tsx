import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, orderBy, addDoc, serverTimestamp, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { SharedFile } from '../types';
import { FileText, Link, Plus, Trash2, X, Download } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export function FilesView() {
  const { profile } = useAuth();
  const [files, setFiles] = useState<SharedFile[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'files'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setFiles(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SharedFile)));
    });
    return () => unsubscribe();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newUrl.trim() || !profile) return;

    try {
      await addDoc(collection(db, 'files'), {
        name: newName,
        url: newUrl,
        type: 'link', // For now we use links as storage is limited
        sharedBy: profile.uid,
        sharedByName: `${profile.role} ${profile.displayName}`,
        createdAt: serverTimestamp(),
      });
      setNewName('');
      setNewUrl('');
      setIsAdding(false);
    } catch (error) {
      console.error('Error adding file:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('이 파일을 목록에서 제거할까요?')) {
      await deleteDoc(doc(db, 'files', id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold flex items-center gap-3">
          <FileText className="h-8 w-8 text-brand-500" />
          가족 보관함
        </h2>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 rounded-2xl bg-brand-500 px-6 py-3 font-bold text-white shadow-lg shadow-brand-100 transition-transform active:scale-95"
        >
          <Plus className="h-6 w-6" /> 공유하기
        </button>
      </div>

      <div className="bg-brand-50 p-6 rounded-[32px] border-2 border-dashed border-brand-200 text-center">
        <p className="text-lg font-medium text-brand-600">가족에게 공유하고 싶은 사진이나 링크를 올려주세요!</p>
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[32px] bg-white p-8 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold">파일/링크 공유</h3>
              <button onClick={() => setIsAdding(false)} className="rounded-full p-2 hover:bg-slate-100">
                <X className="h-8 w-8" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-6">
              <div>
                <label className="mb-2 block text-lg font-bold text-slate-700">이름</label>
                <input 
                  type="text" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full rounded-2xl bg-slate-100 px-6 py-4 text-xl focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all font-medium"
                  placeholder="예: 가족 제주도 여행 사진 폴더"
                  autoFocus
                />
              </div>
              <div>
                <label className="mb-2 block text-lg font-bold text-slate-700">링크(URL)</label>
                <input 
                  type="url" 
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full rounded-2xl bg-slate-100 px-6 py-4 text-xl focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all font-medium"
                  placeholder="http://..."
                />
              </div>
              <button 
                type="submit"
                className="w-full rounded-2xl bg-brand-500 py-4 text-xl font-bold text-white shadow-lg shadow-brand-100 hover:bg-brand-600"
              >
                공유하기
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {files.map(file => (
          <div key={file.id} className="card-shadow p-6 flex items-center justify-between hover:bg-brand-50/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-brand-500">
                <Link className="h-7 w-7" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-slate-900">{file.name}</h4>
                <p className="text-sm text-slate-400">
                  {file.sharedByName} • {file.createdAt?.toDate ? format(file.createdAt.toDate(), 'PPP', { locale: ko }) : '방금 전'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a 
                href={file.url} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center justify-center h-12 w-12 rounded-xl bg-brand-100 text-brand-600 hover:bg-brand-200 transition-colors"
                title="열기"
              >
                <Download className="h-6 w-6" />
              </a>
              {profile?.uid === file.sharedBy && (
                <button 
                  onClick={() => handleDelete(file.id)}
                  className="flex items-center justify-center h-12 w-12 rounded-xl text-slate-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-6 w-6" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
