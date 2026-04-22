/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useState } from 'react';
import { 
  Home, 
  MessageCircle, 
  ClipboardList, 
  FileText, 
  Bell, 
  User, 
  LogOut,
  Plus,
  Send,
  MoreVertical,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { Dashboard } from './components/Dashboard';
import { ChatView } from './components/ChatView';
import { BoardView } from './components/BoardView';
import { FilesView } from './components/FilesView';
import { ProfileView } from './components/ProfileView';

function AppContent() {
  const { user, profile, loading, login, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'home' | 'chat' | 'board' | 'files' | 'profile'>('home');

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-brand-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-brand-50 p-6 text-center">
        <div className="mb-8 h-24 w-24 rounded-3xl bg-brand-500 p-4 shadow-lg shadow-brand-200">
          <Home className="h-full w-full text-white" />
        </div>
        <h1 className="mb-2 text-3xl font-bold text-slate-900">우리 가족 홈</h1>
        <p className="mb-8 text-lg text-slate-600">따뜻한 소통이 시작되는 소중한 공간입니다.</p>
        <button 
          onClick={login}
          className="flex items-center gap-3 rounded-2xl bg-white px-8 py-4 text-lg font-semibold text-slate-700 shadow-xl shadow-brand-100 transition-all hover:scale-105 active:scale-95"
          id="login-button"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="h-6 w-6" />
          구글로 시작하기
        </button>
      </div>
    );
  }

  if (profile && profile.role === '기타') {
    return (
      <ProfileView initialSetup />
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <Dashboard />;
      case 'chat': return <ChatView />;
      case 'board': return <BoardView />;
      case 'files': return <FilesView />;
      case 'profile': return <ProfileView />;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-brand-50 pb-[80px] md:pb-0 md:pl-[80px]">
      {/* Sidebar for Desktop */}
      <nav className="fixed bottom-0 left-0 z-50 flex w-full border-t border-brand-100 bg-white md:bottom-auto md:left-0 md:top-0 md:h-full md:w-[80px] md:flex-col md:border-r md:border-t-0 p-2 md:py-8 shadow-lg">
        <div className="hidden md:mb-12 md:flex md:justify-center">
          <div className="h-12 w-12 rounded-xl bg-brand-500 p-2 text-white shadow-md shadow-brand-100">
            <Home className="h-full w-full" />
          </div>
        </div>
        <div className="flex w-full justify-between px-4 md:flex-col md:items-center md:gap-8 md:px-0">
          <NavButton icon={Home} label="홈" active={activeTab === 'home'} onClick={() => setActiveTab('home')} id="nav-home" />
          <NavButton icon={MessageCircle} label="채팅" active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} id="nav-chat" />
          <NavButton icon={ClipboardList} label="공지" active={activeTab === 'board'} onClick={() => setActiveTab('board')} id="nav-board" />
          <NavButton icon={FileText} label="파일" active={activeTab === 'files'} onClick={() => setActiveTab('files')} id="nav-files" />
          <NavButton icon={User} label="설정" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} id="nav-profile" />
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="mx-auto max-w-4xl"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Action Button (Mobile) - Context aware maybe? */}
    </div>
  );
}

function NavButton({ icon: Icon, label, active, onClick, id }: { icon: any, label: string, active: boolean, onClick: () => void, id: string }) {
  return (
    <button 
      id={id}
      onClick={onClick}
      className={cn(
        "group relative flex flex-col items-center justify-center gap-1 p-2 md:h-14 md:w-14 md:rounded-2xl md:transition-all",
        active ? "text-brand-600 md:bg-brand-50" : "text-slate-400 hover:text-slate-600 md:hover:bg-slate-50"
      )}
    >
      <Icon className={cn("h-7 w-7", active && "scale-110")} />
      <span className="text-[10px] font-bold md:hidden">{label}</span>
      {active && (
        <motion.div 
          layoutId="active-indicator"
          className="absolute -top-1 h-1 w-8 rounded-full bg-brand-500 md:left-0 md:top-auto md:h-8 md:w-1"
        />
      )}
    </button>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
