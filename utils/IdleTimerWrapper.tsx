'use client';
import React, { useEffect } from 'react';
import { useIdleTimer } from 'react-idle-timer';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

interface IdleTimerWrapperProps {
  children: React.ReactNode;
  timeout: number;
}

const IdleTimerWrapper: React.FC<IdleTimerWrapperProps> = ({
  children,
  timeout,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const token = Cookies.get('token');

  const isLoginPage = pathname === '/login';

  const onIdle = async () => {
    if (!isLoginPage) {
      try {
        await fetch('/api/admin/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        console.error('Logout API error during idle timeout:', error);
      }

      toast.error('Your session has expired. Redirecting to login', {
        description: 'Session Expired',
      });

      setTimeout(() => {
        router.push('/login');
      }, 1500);

      Cookies.remove('token');
    }
  };

  const { reset } = useIdleTimer({
    timeout,
    onIdle,
    disabled: isLoginPage,
  });

  useEffect(() => {
    if (!isLoginPage) {
      reset();
    }
  }, [pathname, reset, isLoginPage]);

  useEffect(() => {
    const checkTokenExpiration = async () => {
      if (token) {
        const decodedToken: { exp: number } = jwtDecode(token);
        const currentTime = Math.floor(Date.now() / 1000);
        if (decodedToken.exp < currentTime) {
          try {
            await fetch('/api/admin/logout', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
            });
          } catch (error) {
            console.error('Logout API error during token expiration:', error);
          }

          toast.error(
            'Your authentication token has expired. Redirecting to login',
            {
              description: 'Token Expired',
            }
          );

          setTimeout(() => {
            router.push('/login');
          }, 1500);

          Cookies.remove('token');
        }
      }
    };

    const intervalId = setInterval(checkTokenExpiration, 5000);

    return () => clearInterval(intervalId);
  }, [token, router, toast]);

  return <>{children}</>;
};

export default IdleTimerWrapper;
