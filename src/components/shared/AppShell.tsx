'use client';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { Megaphone, LayoutDashboard, FilePlus2, ListChecks } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserNav } from './UserNav';

const studentNavItems = [
    { href: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/student/complaints/new', label: 'New Complaint', icon: FilePlus2 },
];

const adminNavItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/complaints', label: 'All Complaints', icon: ListChecks },
];

export function AppShell({ children, role }: { children: React.ReactNode; role: 'student' | 'admin' }) {
    const pathname = usePathname();
    const navItems = role === 'admin' ? adminNavItems : studentNavItems;
    
    const getPageTitle = () => {
        const currentPath = pathname.split('?')[0];
        const item = [...studentNavItems, ...adminNavItems].find(item => item.href === currentPath);
        if (item) return item.label;

        if (currentPath.includes('/complaints/')) {
            return "Complaint Details";
        }

        return "CampusHelp";
    };

    return (
        <ProtectedRoute allowedRoles={[role]}>
            <SidebarProvider>
                <Sidebar>
                    <SidebarHeader>
                        <Link href={role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} className="flex items-center gap-3 p-4">
                             <div className="bg-primary p-2 rounded-lg">
                                <Megaphone className="h-6 w-6 text-primary-foreground" />
                            </div>
                            <span className="text-xl font-headline font-semibold text-foreground">CampusHelp</span>
                        </Link>
                    </SidebarHeader>
                    <SidebarContent>
                        <SidebarMenu>
                            {navItems.map((item) => (
                                <SidebarMenuItem key={item.href}>
                                    <Link href={item.href} legacyBehavior passHref>
                                        <SidebarMenuButton asChild isActive={pathname === item.href}>
                                            <a>
                                                <item.icon />
                                                <span>{item.label}</span>
                                            </a>
                                        </SidebarMenuButton>
                                    </Link>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarContent>
                </Sidebar>
                <SidebarInset>
                    <header className="flex h-16 items-center justify-between border-b bg-background px-4 sm:px-6 sticky top-0 z-30">
                        <div className="flex items-center gap-4">
                            <SidebarTrigger className="md:hidden"/>
                            <h1 className="text-lg font-semibold md:text-xl font-headline">{getPageTitle()}</h1>
                        </div>
                        <UserNav />
                    </header>
                    <main className="flex-1 p-4 sm:p-6 bg-background">
                        {children}
                    </main>
                </SidebarInset>
            </SidebarProvider>
        </ProtectedRoute>
    );
}
