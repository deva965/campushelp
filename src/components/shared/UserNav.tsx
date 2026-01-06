'use client';
import { useAuth } from '@/context/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LogOut } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';

export function UserNav() {
    const { user, userProfile, loading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
            router.push('/login');
        } catch (error) {
            toast({ variant: 'destructive', title: 'Logout Failed', description: 'An error occurred during logout.' });
        }
    };

    const getInitials = (name: string | undefined) => {
        if (!name) return 'U';
        const names = name.split(' ');
        const initials = names.map(n => n[0]).join('');
        return initials.length > 2 ? initials.substring(0, 2).toUpperCase() : initials.toUpperCase();
    };

    if (loading) {
        return <Skeleton className="h-9 w-9 rounded-full" />;
    }

    if (!user || !userProfile) {
        return null;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={user.photoURL || userProfile.photoURL || ''} alt={userProfile.displayName || 'User'} />
                        <AvatarFallback>{getInitials(userProfile.displayName)}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{userProfile.displayName}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
