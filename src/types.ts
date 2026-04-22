export type FamilyRole = '아빠' | '엄마' | '할머니' | '할아버지' | '아들' | '딸' | '기타';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role: FamilyRole;
  createdAt: any;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: any;
  isNotice: boolean;
}

export interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  createdAt: any;
}

export interface SharedFile {
  id: string;
  name: string;
  url: string;
  type: string;
  sharedBy: string;
  sharedByName: string;
  createdAt: any;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'chat' | 'announcement' | 'file';
  message: string;
  isRead: boolean;
  createdAt: any;
}
