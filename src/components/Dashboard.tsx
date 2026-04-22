import { useAuth } from '../contexts/AuthContext';
import { 
  Bell, 
  ChevronRight, 
  Megaphone, 
  MessageCircle, 
  PlusCircle,
  Heart
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Announcement } from '../types';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export function Dashboard() {
  const { profile } = useAuth();
  const [notices, setNotices] = useState<Announcement[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, 'announcements'),
      orderBy('createdAt', 'desc'),
      limit(3)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Announcement)));
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <header className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500 text-white shadow-lg shadow-brand-100">
              <Heart className="h-8 w-8 animate-pulse" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900">아빠 조아</h1>
              <p className="text-xl font-medium text-brand-600">아빵 조아</p>
            </div>
          </div>
          <button className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm transition-transform active:scale-95">
            <Bell className="h-6 w-6 text-slate-600" />
            <div className="absolute top-2 right-2 h-3 w-3 rounded-full border-2 border-white bg-red-500" />
          </button>
        </div>
        
        <div className="rounded-[32px] bg-brand-600 p-8 text-white shadow-xl shadow-brand-200">
          <h2 className="mb-2 text-2xl font-bold">반가워요, {profile?.displayName}님!</h2>
          <p className="text-lg opacity-90">오늘은 가족들에게 "사랑해"라고 한 마디 건네보는 건 어떨까요?</p>
        </div>
      </header>

      {/* Announcements Summary */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Megaphone className="h-6 w-6 text-brand-500" />
            최근 소식
          </h3>
          <button className="text-lg font-semibold text-brand-600 flex items-center">
            전체보기 <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        
        <div className="grid gap-4">
          {notices.length > 0 ? notices.map(notice => (
            <div key={notice.id} className="card-shadow p-6 flex items-start gap-4 hover:shadow-md transition-shadow">
              <div className="h-12 w-12 shrink-0 rounded-xl bg-orange-50 flex items-center justify-center">
                <Megaphone className="h-6 w-6 text-orange-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xl font-bold truncate">{notice.title}</h4>
                <p className="text-slate-600 line-clamp-1">{notice.content}</p>
                <div className="mt-2 text-sm text-slate-400 flex justify-between">
                  <span>{notice.authorName}</span>
                  <span>{notice.createdAt?.toDate ? format(notice.createdAt.toDate(), 'PPP p', { locale: ko }) : '방금 전'}</span>
                </div>
              </div>
            </div>
          )) : (
            <div className="card-shadow p-12 text-center text-slate-400">
              <PlusCircle className="mx-auto mb-4 h-12 w-12 opacity-20" />
              <p className="text-lg font-medium">아직 등록된 공지가 없어요.</p>
            </div>
          )}
        </div>
      </section>

      {/* Quick Actions for Grandma */}
      <section className="grid grid-cols-2 gap-4">
        <button className="flex flex-col items-center gap-3 rounded-[32px] bg-blue-50 p-6 transition-all hover:bg-blue-100 active:scale-95">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500 text-white">
            <MessageCircle className="h-8 w-8" />
          </div>
          <span className="text-xl font-bold text-blue-900">가족 채팅</span>
        </button>
        <button className="flex flex-col items-center gap-3 rounded-[32px] bg-indigo-50 p-6 transition-all hover:bg-indigo-100 active:scale-95">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500 text-white">
            <PlusCircle className="h-8 w-8" />
          </div>
          <span className="text-xl font-bold text-indigo-900">공지 쓰기</span>
        </button>
      </section>
    </div>
  );
}
