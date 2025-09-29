'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Ellipsis, LogOut, LucideIcon } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { getMenuList } from '@/lib/menu-list';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CollapseMenuButton } from '@/components/admin-panel/collapse-menu-button';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

interface Submenu {
  href: string;
  label: string;
  active: boolean;
  value: string;
}

interface Menu {
  href: string;
  label: string;
  active: boolean;
  icon: LucideIcon;
  submenus: Submenu[];
  value: string;
}

interface MenuGroup {
  groupLabel: string;
  menus: Menu[];
}

interface MenuProps {
  isOpen: boolean | undefined;
}

export function Menu({ isOpen }: MenuProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [filteredMenuList, setFilteredMenuList] = useState<MenuGroup[]>([]);

  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      const decodedToken: any = jwtDecode(token);
      const userPermissions = decodedToken.user.web_menu_access
        ? decodedToken.user.web_menu_access.split(',')
        : [];
      const fullMenuList = getMenuList(pathname || '/');

      const filteredMenus = fullMenuList
        .map(group => ({
          ...group,
          menus: group.menus
            .filter(menu => {
              if (userPermissions.includes(menu.value)) {
                return true;
              }
              return menu.submenus.some(submenu =>
                userPermissions.includes(submenu.value)
              );
            })
            .map(menu => ({
              ...menu,
              submenus: menu.submenus.filter(submenu =>
                userPermissions.includes(submenu.value)
              ),
            })),
        }))
        .filter(group => group.menus.length > 0);

      setFilteredMenuList(filteredMenus);
    }
  }, [pathname]);

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
        toast.success(data.Message || 'You have been logged out.');
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

  return (
    <ScrollArea className="[&>div>div[style]]:!block">
      <nav className="mt-8 h-full w-full">
        <ul className="flex min-h-[calc(100vh-48px-36px-16px-32px)] flex-col items-start space-y-1 px-2 lg:min-h-[calc(100vh-32px-40px-32px)]">
          {filteredMenuList.map(({ groupLabel, menus }, groupIndex) => (
            <li
              className={cn('w-full', groupLabel ? 'pt-5' : '')}
              key={groupIndex}
            >
              {(isOpen && groupLabel) || isOpen === undefined ? (
                <p className="max-w-[248px] truncate px-4 pb-2 text-sm font-medium text-muted-foreground">
                  {groupLabel}
                </p>
              ) : !isOpen && isOpen !== undefined && groupLabel ? (
                <TooltipProvider>
                  <Tooltip delayDuration={100}>
                    <TooltipTrigger className="w-full">
                      <div className="flex w-full items-center justify-center">
                        <Ellipsis className="h-5 w-5" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{groupLabel}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <p className="pb-2"></p>
              )}
              {menus.map(
                ({ href, label, icon: Icon, active, submenus }, menuIndex) =>
                  submenus.length === 0 ? (
                    <div className="w-full" key={menuIndex}>
                      <TooltipProvider disableHoverableContent>
                        <Tooltip delayDuration={100}>
                          <TooltipTrigger asChild>
                            <Button
                              variant={active ? 'secondary' : 'ghost'}
                              className="mb-1 h-10 w-full justify-start"
                              asChild
                            >
                              <Link href={href}>
                                <span
                                  className={cn(isOpen === false ? '' : 'mr-4')}
                                >
                                  <Icon size={18} />
                                </span>

                                <p
                                  className={cn(
                                    'max-w-[200px] truncate', // Keeping the original truncate behavior
                                    isOpen === false
                                      ? '-translate-x-96 opacity-0'
                                      : 'translate-x-0 opacity-100'
                                  )}
                                >
                                  {label}
                                </p>
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          {label.length > 21 && (
                            <TooltipContent side="right">
                              {label}
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  ) : (
                    <div className="w-full" key={menuIndex}>
                      <CollapseMenuButton
                        icon={Icon}
                        label={label}
                        active={active}
                        submenus={submenus}
                        isOpen={isOpen}
                      />
                    </div>
                  )
              )}
            </li>
          ))}
          <li className="flex w-full grow items-end">
            <TooltipProvider disableHoverableContent>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="mt-5 h-10 w-full justify-center"
                  >
                    <span className={cn(isOpen === false ? '' : 'mr-4')}>
                      <LogOut size={18} />
                    </span>
                    <p
                      className={cn(
                        'whitespace-nowrap',
                        isOpen === false ? 'hidden opacity-0' : 'opacity-100'
                      )}
                    >
                      Log out
                    </p>
                  </Button>
                </TooltipTrigger>
                {isOpen === false && (
                  <TooltipContent side="right">Log out</TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </li>
        </ul>
      </nav>
    </ScrollArea>
  );
}

export function getFilteredMenuList() {
  const token = Cookies.get('token');
  if (!token) return [];

  const decodedToken: any = jwtDecode(token);
  const userPermissions = decodedToken.user.web_menu_access.split(',');
  const fullMenuList = getMenuList('/');

  return fullMenuList
    .map(group => ({
      ...group,
      menus: group.menus
        .filter(menu => {
          if (userPermissions.includes(menu.value)) {
            return true;
          }
          return menu.submenus.some(submenu =>
            userPermissions.includes(submenu.value)
          );
        })
        .map(menu => ({
          ...menu,
          submenus: menu.submenus.filter(submenu =>
            userPermissions.includes(submenu.value)
          ),
        })),
    }))
    .filter(group => group.menus.length > 0);
}
