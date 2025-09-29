'use client';
import React, { FormEvent, useRef, useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { UserCircle, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import { useRouter, useSearchParams } from 'next/navigation';
import { BACKEND_URL } from '@/lib/constants';
import { jwtDecode } from 'jwt-decode';

const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userIdRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  // Use state to manage form inputs
  const [userId, setUserId] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [returnUrl, setReturnUrl] = useState<string>('');

  // Password change dialog states
  const [showPasswordChangeDialog, setShowPasswordChangeDialog] =
    useState<boolean>(false);
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>('');
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] =
    useState<boolean>(false);
  const [isChangingPassword, setIsChangingPassword] = useState<boolean>(false);

  useEffect(() => {
    const returnUrlParam = searchParams?.get('r');
    if (returnUrlParam) {
      setReturnUrl(returnUrlParam);
    }
  }, [searchParams]);

  const getUserID = () => {
    const token = Cookies.get('token');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        return decodedToken.user.User_ID;
      } catch (e) {
        console.error('Failed to decode token:', e);
      }
    }
    return '';
  };

  const handlePasswordChange = async () => {
    // Validation
    if (!newPassword || !confirmNewPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    // Password complexity validation
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasSpecialChar) {
      toast.error(
        'Password must contain at least one uppercase letter, one lowercase letter, and one special character'
      );
      return;
    }

    setIsChangingPassword(true);

    try {
      const token = Cookies.get('token');
      const decodedToken: any = jwtDecode(token!);

      const response = await fetch(`${BACKEND_URL}/api/admin/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: decodedToken.user.user_id,
          old_user_password: password, // Use the login password as old password
          new_user_password: newPassword,
          is_first_change: true,
        }),
      });

      const responseData = await response.json();

      if (responseData.Status === 'T') {
        toast.success(
          'Password changed successfully! Redirecting to dashboard...'
        );
        setShowPasswordChangeDialog(false);

        // Redirect to dashboard after successful password change
        setTimeout(() => {
          const redirectUrl = returnUrl || '/dashboard';
          router.push(redirectUrl);
        }, 1000);
      } else {
        toast.error(responseData.Message || 'Failed to change password');
      }
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast.error('An error occurred while changing password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const resetPasswordDialog = () => {
    setNewPassword('');
    setConfirmNewPassword('');
    setShowNewPassword(false);
    setShowConfirmNewPassword(false);
    setIsChangingPassword(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Check for empty fields
    if (userId === '') {
      userIdRef.current?.focus();
      return;
    }
    if (password === '') {
      passwordRef.current?.focus();
      return;
    }

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/auth/check-credentials`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            User_ID: userId.trim(),
            User_Password: password,
            ApplicationType: 'WEB',
          }),
        }
      );

      const data = await response.json();

      if (data.Status === 'T') {
        // Success case
        const decodedToken: any = jwtDecode(data.token);
        console.log(decodedToken);
        console.log(decodedToken.user);
        console.log(decodedToken.user.User_ID);

        if (decodedToken && decodedToken.user && decodedToken.user.user_id) {
          Cookies.set('token', data.token, { expires: 1 });

          // Check if password change is required
          if (data.is_change_password === true) {
            setShowPasswordChangeDialog(true);
            toast.success(
              'Login successful! Please change your password to continue.',
              {
                description: 'Password change required for first login',
              }
            );
            return; // Don't redirect yet
          }

          // Normal login flow - redirect immediately
          const redirectUrl = returnUrl || '/dashboard';
          router.push(redirectUrl);
          toast.success('Logged in ✅', {
            description: data.Message || 'Logged in successfully',
          });
        } else {
          toast.error('Invalid token received.', {
            description: 'Error ❌',
          });
          return;
        }
      } else if (data.Status === 'F') {
        // Failure case
        toast.error('Login Failed ❌', {
          description: data.Message || 'Invalid credentials. Please try again.',
        });
      } else {
        // Unexpected response format
        toast.error('Unexpected response format.', {
          description: 'Error ❌',
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An unexpected error occurred.', {
        description: 'Error ❌',
      });
    }
  };

  return (
    <>
      {/* Production Testing Note */}
      <Card className="mx-auto mt-5 w-full max-w-md border-red-200/50 bg-red-50/30 backdrop-blur-sm">
        <CardContent className="pb-3 pt-3">
          <div className="flex items-center justify-center space-x-2">
            <div className="h-1.5 w-1.5 rounded-full bg-red-400/60"></div>
            <p className="text-xs font-medium text-red-600/80">
              Testing Environment
            </p>
            <div className="h-1.5 w-1.5 rounded-full bg-red-400/60"></div>
          </div>
        </CardContent>
      </Card>

      <Card className="mx-auto mt-3 w-full max-w-md">
        <CardHeader className="text-center">
          <UserCircle className="mx-auto hidden h-12 w-12 text-blue-400 sm:block" />
          <CardTitle className="mt-4 text-2xl font-bold">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="userId"
                className="block text-sm font-medium text-muted-foreground"
              >
                User Id
              </label>
              <Input
                type="text"
                id="userId"
                name="userId"
                placeholder="Enter your user id"
                className="mt-1 w-full"
                ref={userIdRef}
                value={userId}
                onChange={e => setUserId(e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-muted-foreground"
              >
                Password
              </label>
              <div className="relative mt-1">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  className="w-full pr-10"
                  ref={passwordRef}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full">
              Log in
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Password Change Dialog */}
      <Dialog open={showPasswordChangeDialog} onOpenChange={() => {}}>
        <DialogContent
          className="sm:max-w-md"
          onInteractOutside={e => e.preventDefault()}
        >
          <DialogHeader className="pb-4 text-center">
            <DialogTitle className="text-xl font-bold text-primary">
              🔐 Password Change Required
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              For security reasons, you must change your password on first
              login.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-sm font-medium">
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="confirmNewPassword"
                className="text-sm font-medium"
              >
                Confirm New Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmNewPassword"
                  type={showConfirmNewPassword ? 'text' : 'password'}
                  value={confirmNewPassword}
                  onChange={e => setConfirmNewPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                  onClick={() =>
                    setShowConfirmNewPassword(!showConfirmNewPassword)
                  }
                >
                  {showConfirmNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Password Requirements:
              </p>
              <div className="space-y-1 text-xs">
                <div
                  className={`flex items-center gap-2 ${newPassword.length >= 6 ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}
                >
                  <span className="flex h-3 w-3 items-center justify-center rounded-full border border-current">
                    {newPassword.length >= 6 && (
                      <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
                    )}
                  </span>
                  At least 6 characters
                </div>
                <div
                  className={`flex items-center gap-2 ${/[A-Z]/.test(newPassword) ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}
                >
                  <span className="flex h-3 w-3 items-center justify-center rounded-full border border-current">
                    {/[A-Z]/.test(newPassword) && (
                      <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
                    )}
                  </span>
                  One uppercase letter
                </div>
                <div
                  className={`flex items-center gap-2 ${/[a-z]/.test(newPassword) ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}
                >
                  <span className="flex h-3 w-3 items-center justify-center rounded-full border border-current">
                    {/[a-z]/.test(newPassword) && (
                      <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
                    )}
                  </span>
                  One lowercase letter
                </div>
                <div
                  className={`flex items-center gap-2 ${/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}
                >
                  <span className="flex h-3 w-3 items-center justify-center rounded-full border border-current">
                    {/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) && (
                      <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
                    )}
                  </span>
                  One special character
                </div>
                {newPassword && confirmNewPassword && (
                  <div
                    className={`flex items-center gap-2 ${newPassword === confirmNewPassword ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}
                  >
                    <span className="flex h-3 w-3 items-center justify-center rounded-full border border-current">
                      {newPassword === confirmNewPassword && (
                        <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
                      )}
                    </span>
                    Passwords match
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handlePasswordChange}
                disabled={
                  isChangingPassword ||
                  !newPassword ||
                  !confirmNewPassword ||
                  newPassword !== confirmNewPassword
                }
                className="flex-1"
              >
                {isChangingPassword ? 'Changing...' : 'Change Password'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

const Page = () => {
  return (
    <section>
      <div className="lg:grid lg:min-h-screen lg:grid-cols-12">
        <section className="relative flex h-32 items-end bg-gray-900 lg:col-span-5 lg:h-full xl:col-span-6">
          <Image
            alt=""
            src="/images/gerr.png"
            className="absolute inset-0 h-full w-full object-cover opacity-80"
            fill
          />

          <div className="hidden lg:relative lg:block lg:p-12">
            <h2 className="mt-6 text-xl font-bold text-white sm:text-2xl md:text-3xl">
              Warehouse Management System (WMS)
            </h2>

            <p className="mt-4 leading-relaxed text-white">Login page</p>
          </div>
        </section>

        <main className="flex flex-col items-center justify-center px-8 py-8 sm:px-12 lg:col-span-7 lg:px-16 lg:py-12 xl:col-span-6">
          <div className="w-full max-w-xl lg:max-w-3xl">
            <div className="relative -mt-16 block text-center lg:hidden">
              <UserCircle className="mx-auto h-12 w-12 text-blue-400" />
              <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl">
                Warehouse Management System (WMS)
              </h1>
            </div>

            <Suspense fallback={<div>Loading...</div>}>
              <LoginForm />
            </Suspense>
          </div>
          <Link target="blank" href={'https://bartechdata.net/'}>
            <div className="mt-4 flex flex-col space-y-3">
              <p className="text-gray-500">Built and maintained by</p>
              <Image
                src="/images/bartech.png"
                alt="bartech-logo"
                width={100}
                height={25}
                className="mx-auto inline-block"
              />
            </div>
          </Link>
        </main>
      </div>
    </section>
  );
};

export default Page;
