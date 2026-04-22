import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, ShieldCheck, Heart } from 'lucide-react';
import { FamilyRole } from '../types';
import { useState } from 'react';
import { cn } from '../lib/utils';

export function ProfileView({ initialSetup = false }: { initialSetup?: boolean }) {
  const { profile, logout, updateRole, user } = useAuth();
  const [updating, setUpdating] = useState(false);

  const roles: FamilyRole[] = ['아빠', '엄마', '할머니', '할아버지', '아들', '딸'];

  const handleRoleSelect = async (role: FamilyRole) => {
    setUpdating(true);
    await updateRole(role);
    setUpdating(false);
  };

  if (initialSetup) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-brand-50 p-6">
        <div className="w-full max-w-lg rounded-[48px] bg-white p-10 shadow-2xl">
          <div className="mb-10 text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-[32px] bg-brand-500 text-white shadow-xl shadow-brand-100">
              <User className="h-12 w-12" />
            </div>
            <h1 className="text-4xl font-black text-slate-900 mb-2">환영해요!</h1>
            <p className="text-xl font-medium text-slate-600">누구신가요? 가족 역할을 정해주세요.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {roles.map((role) => (
              <button
                key={role}
                onClick={() => handleRoleSelect(role)}
                disabled={updating}
                className="rounded-[32px] border-4 border-slate-50 bg-slate-50 px-6 py-6 text-2xl font-black text-slate-700 transition-all hover:border-brand-200 hover:bg-brand-50 hover:text-brand-600 active:scale-95 disabled:opacity-50"
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold flex items-center gap-3">
          <User className="h-8 w-8 text-brand-500" />
          가족 프로필
        </h2>
        <button 
          onClick={logout}
          className="flex items-center gap-2 rounded-2xl bg-white px-6 py-3 font-bold text-red-500 shadow-sm border border-red-50 border-white transition-all hover:bg-red-50 active:scale-95"
        >
          <LogOut className="h-6 w-6" /> 로그아웃
        </button>
      </div>

      <div className="card-shadow p-10 flex flex-col items-center text-center gap-6">
        <div className="relative">
          <div className="h-32 w-32 rounded-[40px] bg-brand-100 p-1">
            {user?.photoURL ? (
              <img src={user.photoURL} alt={profile?.displayName} className="h-full w-full rounded-[38px] object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-5xl rounded-[38px] bg-brand-500 text-white font-black">
                {profile?.displayName?.[0]}
              </div>
            )}
          </div>
          <div className="absolute -bottom-2 -right-2 h-10 w-10 flex items-center justify-center rounded-2xl bg-white shadow-md border border-brand-50 text-brand-500">
            <Heart className="h-6 w-6 fill-brand-500" />
          </div>
        </div>

        <div>
          <h3 className="text-3xl font-black text-slate-900">{profile?.displayName}</h3>
          <p className="text-xl font-bold text-brand-600 flex items-center justify-center gap-2 mt-1">
            <ShieldCheck className="h-6 w-6" />
            {profile?.role} 멤버
          </p>
          <p className="text-slate-400 mt-2">{profile?.email}</p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-2xl font-bold px-2">나의 역할 변경</h3>
        <div className="grid grid-cols-3 gap-3">
          {roles.map((role) => (
            <button
              key={role}
              onClick={() => handleRoleSelect(role)}
              disabled={updating || profile?.role === role}
              className={cn(
                "rounded-2xl border-2 px-4 py-4 text-xl font-bold transition-all active:scale-95 disabled:opacity-80 disabled:scale-100",
                profile?.role === role 
                  ? "bg-brand-500 border-brand-500 text-white shadow-lg shadow-brand-100" 
                  : "bg-white border-brand-100 text-slate-600 hover:border-brand-300"
              )}
            >
              {role}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
