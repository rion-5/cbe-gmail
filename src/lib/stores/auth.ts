import { writable } from 'svelte/store';
import { browser } from '$app/environment';

interface AuthState {
  isLoggedIn: boolean;
  id_no: string | null;
  user_name: string | null;
}

const initialState: AuthState = {
  isLoggedIn: false,
  id_no: null,
  user_name: null
};

if (browser) {
  const stored = localStorage.getItem('auth');
  if (stored) {
    Object.assign(initialState, JSON.parse(stored));
  }
}

export const auth = writable<AuthState>(initialState);

auth.subscribe((value) => {
  if (browser) {
    localStorage.setItem('auth', JSON.stringify(value));
  }
});

export async function logout() {
  try {
    const response = await fetch('/api/auth/logout', { method: 'POST' });
    if (!response.ok) {
      throw new Error('로그아웃 실패');
    }
    auth.set({ isLoggedIn: false, id_no: null, user_name: null });
    if (browser) {
      localStorage.removeItem('auth');
    }
  } catch (err) {
    console.error('로그아웃 에러:', err);
  }
}