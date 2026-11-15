'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Drawer } from '@/components/ui/drawer';
import { Badge } from '@/components/ui/badge';
import {
  Menu,
  Search,
  BookOpen,
  GraduationCap,
  Users,
  LogOut,
  LayoutDashboard,
  Home,
  Info,
  HelpCircle,
  Mail,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Header() {
  const pathname = usePathname();
  const { user, isAuthenticated, isLoggingOut, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Courses', href: '/courses', icon: BookOpen },
    { label: 'Instructors', href: '/instructors', icon: Users },
    { label: 'About', href: '/about', icon: Info },
    { label: 'FAQ', href: '/faq', icon: HelpCircle },
    { label: 'Contact', href: '/contact', icon: Mail },
  ];

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'super_admin':
        return 'Super Admin';
      case 'counsellor':
        return 'Counsellor';
      case 'user':
      default:
        return 'Student';
    }
  };

  const getDashboardHref = () => {
    if (!user) return '/student/dashboard';
    if (user.role === 'admin' || user.role === 'super_admin') return '/admin/dashboard';
    if (user.role === 'counsellor') return '/counsellor/dashboard';
    return '/student/dashboard';
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 focus-ring rounded-lg">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Course<span className="text-blue-600">Platform</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map(link => {
            const isActive = link.href === '/' ? pathname === '/' : (pathname === link.href || pathname.startsWith(`${link.href}/`));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-semibold transition-colors focus-ring',
                  isActive
                    ? 'text-blue-600 bg-blue-50/80 dark:bg-blue-950/50 dark:text-blue-400'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Controls & Auth */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search Trigger */}
          <Link
            href="/search"
            aria-label="Search courses"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300 hover:text-slate-800 transition-colors dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 focus-ring text-xs sm:text-sm"
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Search...</span>
          </Link>

          {/* User Auth Controls */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <Link href={getDashboardHref()}>
                <Button size="sm" variant="outline" className="gap-1.5">
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Button>
              </Link>

              <div className="hidden sm:flex items-center gap-2 pl-1 border-l border-slate-200 dark:border-slate-800">
                {user.avatar_url ? (
                  <Image
                    src={user.avatar_url}
                    alt={user.name || 'User'}
                    width={28}
                    height={28}
                    className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                    unoptimized
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 max-w-[120px] truncate">
                  {user.name || user.email}
                </span>
                <Badge variant="default" className="text-[10px]">
                  {getRoleLabel(user.role)}
                </Badge>
              </div>

              <Button
                size="sm"
                variant="ghost"
                onClick={logout}
                disabled={isLoggingOut}
                aria-label="Log out"
                className="text-slate-500 hover:text-red-600 p-2"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Link href="/login">
              <Button size="sm" variant="primary">
                Sign In
              </Button>
            </Link>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open mobile navigation menu"
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 focus-ring"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <Drawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        title="Menu"
        position="left"
      >
        <div className="flex flex-col gap-4">
          <nav className="flex flex-col gap-1">
            {navLinks.map(link => {
              const Icon = link.icon;
              const isActive = link.href === '/' ? pathname === '/' : (pathname === link.href || pathname.startsWith(`${link.href}/`));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors',
                    isActive
                      ? 'text-blue-600 bg-blue-50/80 dark:bg-blue-950/50 dark:text-blue-400 font-bold'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  )}
                >
                  {Icon && <Icon className={cn('w-4 h-4', isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400')} />}
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            {isAuthenticated && user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-3 py-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                  {user.avatar_url ? (
                    <Image
                      src={user.avatar_url}
                      alt={user.name || 'User'}
                      width={36}
                      height={36}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                      unoptimized
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-sm">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <div className="min-w-0 flex-1 text-xs">
                    <p className="font-semibold text-slate-900 dark:text-white truncate">
                      {user.name || 'User'}
                    </p>
                    <p className="text-slate-500 truncate">{user.email}</p>
                    <Badge variant="default" className="mt-1 text-[9px] py-0 px-1.5">
                      {getRoleLabel(user.role)}
                    </Badge>
                  </div>
                </div>

                <Link
                  href={getDashboardHref()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full block"
                >
                  <Button variant="primary" className="w-full justify-center">
                    Go to Dashboard
                  </Button>
                </Link>

                <Button
                  variant="outline"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  disabled={isLoggingOut}
                  className="w-full justify-center text-red-600 hover:text-red-700"
                >
                  Log Out
                </Button>
              </div>
            ) : (
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" className="w-full justify-center">
                  Sign In with Google
                </Button>
              </Link>
            )}
          </div>
        </div>
      </Drawer>
    </header>
  );
}

export default Header;
