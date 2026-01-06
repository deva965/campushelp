'use client';
import { useAuth } from '@/context/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push(`/login?redirect=${pathname}`);
      return;
    }

    if (userProfile && !allowedRoles.includes(userProfile.role)) {
      if (userProfile.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/student/dashboard');
      }
    }
  }, [user, userProfile, loading, router, allowedRoles, pathname]);

  const showLoader = loading || !user || !userProfile || !allowedRoles.includes(userProfile?.role || '');

  if (showLoader) {
    return (
       <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-muted rounded-full">
              <Skeleton className="h-16 w-16 rounded-full" />
            </div>
            <div className="space-y-2 flex flex-col items-center">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
            </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
