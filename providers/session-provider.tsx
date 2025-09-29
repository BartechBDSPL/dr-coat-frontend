'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

interface User {
  Web_MenuAccess: string[];
  // Add other user properties
}

interface SessionContextType {
  user: User | null;
  loading: boolean;
  refreshSession: () => void;
}

const SessionContext = createContext<SessionContextType>({
  user: null,
  loading: true,
  refreshSession: () => {},
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = async () => {
    const token = Cookies.get('token');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        setUser({
          ...decoded.user,
          Web_MenuAccess: decoded.user.web_menu_access
            ? decoded.user.web_menu_access.split(',')
            : [],
        });
      } catch (error) {
        console.error('Session decode error:', error);

        try {
          // Call logout API on decode error
          await fetch('/api/admin/logout', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });
        } catch (logoutError) {
          console.error(
            'Logout API error during session decode error:',
            logoutError
          );
        }

        setUser(null);
        Cookies.remove('token');
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshSession();
  }, []);

  return (
    <SessionContext.Provider value={{ user, loading, refreshSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => useContext(SessionContext);
