'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LayoutGrid,
  LogOut,
  User2,
  Briefcase,
  Building,
  Calendar,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { jwtDecode } from 'jwt-decode';
import { ModeToggle } from '../MoodToggle';

// Define the structure of your user information
interface UserInfo {
  user_id: string;
  user_name: string;
  user_status: string | null;
  user_role: string;
  name: string;
  web_menu_access: string;
  hht_menu_access?: string;
  plant_code: string;
  company_code: string | null;
  line_code: string | null;
  avatarUrl?: string;
}

// Define the structure of your JWT payload
interface JwtPayload {
  user: UserInfo;
  // Add other properties that might be in your JWT payload
}

export function UserNav() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token) as JwtPayload;
        setUserInfo(decodedToken.user);
      } catch (e) {
        console.error('Failed to decode token:', e);
      }
    }
  }, []);

  const handleLogout = async () => {
    try {
      // Call logout API
      const response = await fetch('/api/admin/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.Status === 'T') {
        toast.success(data.Message || 'Logged out successfully.');
      } else {
        toast.info(data.Message || 'Session already expired.');
      }
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error('Logout request failed, but you will be logged out locally.');
    } finally {
      // Always remove token and redirect regardless of API response
      Cookies.remove('token');
      router.push('/login');
    }
  };

  if (!userInfo) return null;

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="flex items-center gap-2">
      <ModeToggle />
      <DropdownMenu>
        <TooltipProvider disableHoverableContent>
          <Tooltip delayDuration={100}>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={userInfo.avatarUrl || '#'} alt="Avatar" />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(userInfo.user_name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom">Profile</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {userInfo.user_name}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {userInfo.user_id}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href="/dashboard" className="flex items-center">
                <LayoutGrid className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/docs" target="_blank" className="flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                Docs
              </Link>
            </DropdownMenuItem>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <DropdownMenuItem onSelect={e => e.preventDefault()}>
                  <User2 className="mr-2 h-4 w-4" />
                  View Profile
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                  <DialogTitle>User Profile</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage
                        src={userInfo.avatarUrl || '#'}
                        alt="Profile picture"
                      />
                      <AvatarFallback className="bg-primary text-2xl text-primary-foreground">
                        {getInitials(userInfo.user_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-2xl font-bold">
                        {userInfo.user_name}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {userInfo.user_role}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          User ID
                        </CardTitle>
                        <User2 className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {userInfo.user_id}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Company Code
                        </CardTitle>
                        <Building className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {userInfo.company_code}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Plant Code
                        </CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {userInfo.plant_code}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Status
                        </CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {userInfo.user_status}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Web Menu Access</CardTitle>
                      <CardDescription>
                        Your current menu access level
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Progress
                        max={30}
                        value={
                          userInfo.web_menu_access
                            ? userInfo.web_menu_access.split(',').length
                            : 0
                        }
                        className="w-full"
                      />
                    </CardContent>
                  </Card>
                </div>
              </DialogContent>
            </Dialog>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
