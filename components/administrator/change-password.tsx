'use client';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import axios from '@/lib/axios-config';

const formSchema = z
  .object({
    userName: z.string(),
    userId: z.string(),
    oldPassword: z.string().min(1, 'Old password is required'),
    newPassword: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        'Password must contain at least one special character'
      ),
    confirmPassword: z.string(),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

const ChangePassword = () => {
  const token = Cookies.get('token');
  const [passwordMatch, setPasswordMatch] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    special: false,
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userName: '',
      userId: '',
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const watchNewPassword = form.watch('newPassword');
  const watchConfirmPassword = form.watch('confirmPassword');

  useEffect(() => {
    const newPassword = watchNewPassword || '';
    setPasswordValidation({
      length: newPassword.length >= 6,
      uppercase: /[A-Z]/.test(newPassword),
      lowercase: /[a-z]/.test(newPassword),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
    });

    setPasswordMatch(
      watchNewPassword === watchConfirmPassword &&
        watchNewPassword !== '' &&
        watchConfirmPassword !== '' &&
        passwordValidation.length &&
        passwordValidation.uppercase &&
        passwordValidation.lowercase &&
        passwordValidation.special
    );
  }, [watchNewPassword, watchConfirmPassword]);

  const getUserID = () => {
    const token = Cookies.get('token');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        return decodedToken.user.user_id;
      } catch (e) {
        console.error('Failed to decode token:', e);
      }
    }
    return '';
  };
  const getUsername = () => {
    const token = Cookies.get('token');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        return decodedToken.user.user_name;
      } catch (e) {
        console.error('Failed to decode token:', e);
      }
    }
    return '';
  };

  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        form.setValue('userName', decodedToken.user.user_name);
        form.setValue('userId', decodedToken.user.user_id);
      } catch (error) {
        console.error('Failed to decode token:', error);
      }
    }
  }, []);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await axios.post('/api/admin/change-password', {
        user_id: values.userId,
        old_user_password: values.oldPassword,
        new_user_password: values.newPassword,
        is_first_change: false,
      });

      const responseData = response.data;
      if (responseData.Status === 'T') {
        toast.success(responseData.Message);
        form.reset({
          userName: getUsername(),
          userId: getUserID(),
          oldPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        toast.error(responseData.Message);
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.Message ||
        error.message ||
        'An error occurred while changing password';
      toast.error(errorMessage);
    }
  };

  const handleClear = () => {
    form.reset({
      userName: getUsername() || '',
      userId: getUserID() || '',
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  return (
    <Card className="mx-auto mt-5 w-full">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">
          Change Password{' '}
          <span className="text-sm font-normal text-muted-foreground">
            (* Fields Are Mandatory)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <div className="space-y-2">
              <Label htmlFor="userName">User Name *</Label>
              <Input {...form.register('userName')} disabled required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="userId">User ID *</Label>
              <Input {...form.register('userId')} disabled required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="oldPassword">Old Password *</Label>
              <Input
                type="password"
                {...form.register('oldPassword')}
                required
              />
              {form.formState.errors.oldPassword && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.oldPassword.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password *</Label>
              <Input
                type="password"
                {...form.register('newPassword')}
                className={
                  watchNewPassword &&
                  (passwordMatch
                    ? 'border-green-500 dark:border-green-400'
                    : 'border-destructive')
                }
                required
              />
              {watchNewPassword && (
                <div className="mt-2 space-y-1 text-sm">
                  <p
                    className={`flex items-center gap-1 ${passwordValidation.length ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}
                  >
                    <span className="h-4 w-4">✓</span> Minimum 6 characters
                  </p>
                  <p
                    className={`flex items-center gap-1 ${passwordValidation.uppercase ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}
                  >
                    <span className="h-4 w-4">✓</span> One uppercase letter
                  </p>
                  <p
                    className={`flex items-center gap-1 ${passwordValidation.lowercase ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}
                  >
                    <span className="h-4 w-4">✓</span> One lowercase letter
                  </p>
                  <p
                    className={`flex items-center gap-1 ${passwordValidation.special ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}
                  >
                    <span className="h-4 w-4">✓</span> One special character
                  </p>
                </div>
              )}
              {form.formState.errors.newPassword && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.newPassword.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                type="password"
                {...form.register('confirmPassword')}
                className={
                  watchConfirmPassword &&
                  (passwordMatch
                    ? 'border-green-500 dark:border-green-400'
                    : 'border-destructive')
                }
                required
              />
              {watchConfirmPassword && watchNewPassword && (
                <p
                  className={`mt-1 text-sm ${passwordMatch ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}
                >
                  {passwordMatch
                    ? '✓ Passwords match'
                    : '✗ Passwords do not match'}
                </p>
              )}
              {form.formState.errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col justify-end gap-2 pt-4 sm:flex-row">
            <Button
              type="submit"
              disabled={!passwordMatch}
              className="w-full sm:w-auto"
            >
              Change Password
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClear}
              className="w-full sm:w-auto"
            >
              Clear
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ChangePassword;
