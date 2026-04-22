import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, addDoc, serverTimestamp, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { Message } from '../types';
import { Send, Image as ImageIcon, Smile, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export function ChatView() {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'messages'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      setMessages(msgs.reverse());
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !profile) return;

    try {
      await addDoc(collection(db, 'messages'), {
        text: inputText,
        senderId: profile.uid,
        senderName: `${profile.role} ${profile.displayName}`,
        senderPhoto: profile.photoURL || null,
        createdAt: serverTimestamp(),
      });
      setInputText('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (window.confirm('이 메시지를 삭제할까요?')) {
      try {
        await deleteDoc(doc(db, 'messages', id));
      } catch (error) {
        console.error('Error deleting message:', error);
      }
    }
  };

  return (
    <div className="flex h-[calc(100vh-140px)] flex-col rounded-[32px] bg-white shadow-sm border border-brand-100 overflow-hidden">
      <div className="bg-brand-600 p-4 text-white">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <MessageCircle className="h-6 w-6" />
          가족 수다방
        </h2>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50"
      >
        {messages.map((msg) => {
          const isMe = msg.senderId === profile?.uid;
          return (
            <div 
              key={msg.id} 
              className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end gap-2 group`}
            >
              {!isMe && (
                <div className="h-10 w-10 shrink-0 rounded-full bg-brand-200 overflow-hidden">
                  {msg.senderPhoto ? (
                    <img src={msg.senderPhoto} alt={msg.senderName} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center font-bold text-brand-600">
                      {msg.senderName[0]}
                    </div>
                  )}
                </div>
              )}
              <div className={`max-w-[70%] space-y-1`}>
                {!isMe && <p className="text-xs font-bold text-slate-500 ml-1">{msg.senderName}</p>}
                <div className="flex items-center gap-2">
                  {isMe && (
                    <button 
                      onClick={() => handleDeleteMessage(msg.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-500 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                  <div className={`relative rounded-2xl px-4 py-2 text-lg shadow-sm ${
                    isMe ? 'bg-brand-500 text-white rounded-br-none' : 'bg-white text-slate-800 rounded-bl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
                <p className={`text-[10px] text-slate-400 ${isMe ? 'text-right' : 'text-left'}`}>
                  {msg.createdAt?.toDate ? format(msg.createdAt.toDate(), 'p', { locale: ko }) : '전송 중'}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSendMessage} className="border-t border-brand-100 p-4 flex items-center gap-2 bg-white">
        <button type="button" className="p-2 text-slate-400 hover:text-brand-500 transition-colors">
          <ImageIcon className="h-6 w-6" />
        </button>
        <input 
          type="text" 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="가족에게 메시지 보내기..."
          className="flex-1 rounded-2xl bg-slate-100 px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        />
        <button 
          type="submit"
          disabled={!inputText.trim()}
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500 text-white shadow-lg shadow-brand-100 transition-transform active:scale-90 disabled:opacity-50 disabled:scale-100"
        >
          <Send className="h-6 w-6" />
        </button>
      </form>
    </div>
  );
}

function MessageCircle({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
    </svg>
  );
}
