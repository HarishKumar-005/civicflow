"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState, useMemo } from "react";
import {
    Activity,
    BarChart3,
    FileText,
    LayoutDashboard,
    LogOut,
    Map,
    Settings,
    Users,
    ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const baseNavItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/reports", label: "Reports", icon: FileText },
    { href: "/dashboard/tasks", label: "Tasks", icon: ClipboardList },
    { href: "/dashboard/volunteers", label: "Volunteers", icon: Users },
    { href: "/dashboard/map", label: "Map View", icon: Map },
    { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        async function fetchRole() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase.from('users').select('role').eq('id', user.id).single();
                if (data?.role) {
                    setRole(data.role);
                } else if (user.user_metadata?.role) {
                    setRole(user.user_metadata.role);
                } else {
                    setRole("reporter");
                }
            }
        }
        fetchRole();
    }, [supabase]);

    const filteredNavItems = useMemo(() => {
        if (!role) return [];
        if (role === "organizer" || role === "admin") return baseNavItems;
        if (role === "volunteer") {
            return [
                { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
                { href: "/dashboard/tasks", label: "My Tasks", icon: ClipboardList },
                { href: "/dashboard/volunteers/profile", label: "My Profile", icon: Users },
                { href: "/dashboard/map", label: "Map View", icon: Map },
            ];
        }
        if (role === "reporter") {
            return [
                { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
                { href: "/dashboard/reports", label: "My Reports", icon: FileText },
            ];
        }
        return [];
    }, [role]);

    async function handleSignOut() {
        await supabase.auth.signOut();
        toast.success("Signed out");
        router.push("/");
        router.refresh();
    }

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            {/* Sidebar */}
            <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card">
                {/* Logo */}
                <div className="p-4 border-b border-border">
                    <Link href="/dashboard" className="flex items-center gap-2.5 group">
                        <div className="p-1.5 rounded-lg bg-primary/5 text-primary group-hover:bg-primary/10 transition-colors">
                            <Activity className="h-5 w-5" />
                        </div>
                        <span className="text-xl font-heading font-extrabold tracking-tight text-foreground">CivicFlow</span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                    {!role ? (
                        <div className="space-y-2 p-2">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    ) : (
                        filteredNavItems.map((item) => {
                            const isActive = pathname === item.href ||
                                (item.href !== "/dashboard" && pathname.startsWith(item.href) && item.href !== "/dashboard/volunteers/profile");
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors cursor-pointer",
                                        isActive
                                            ? "bg-primary/5 text-primary border border-border/50 font-bold shadow-sm"
                                            : "text-muted-foreground font-medium hover:text-foreground hover:bg-muted"
                                    )}
                                >
                                    <item.icon className="h-4.5 w-4.5" />
                                    {item.label}
                                </Link>
                            );
                        })
                    )}
                </nav>

                {/* Bottom actions */}
                <div className="p-3 border-t border-border space-y-1 bg-card">
                    <Link
                        href="/dashboard/settings"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                    >
                        <Settings className="h-4.5 w-4.5" />
                        Settings
                    </Link>
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors w-full cursor-pointer"
                    >
                        <LogOut className="h-4.5 w-4.5" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 border-b border-border bg-card/90 backdrop-blur-xl flex items-center justify-between px-4">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    <span className="font-heading font-extrabold text-foreground">CivicFlow</span>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleSignOut} className="cursor-pointer">
                    <LogOut className="h-4 w-4" />
                </Button>
            </div>

            {/* Mobile Bottom Nav */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/90 backdrop-blur-xl">
                <div className="grid grid-cols-5 gap-1 p-1">
                    {filteredNavItems.slice(0, 5).map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== "/dashboard" && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex flex-col items-center gap-0.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer",
                                    isActive ? "text-primary font-bold" : "text-muted-foreground"
                                )}
                            >
                                <item.icon className="h-4.5 w-4.5" />
                                <span className="truncate">{item.label.split(" ")[0]}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto md:pt-0 pt-14 pb-20 md:pb-0 relative z-0">
                <div className="p-4 sm:p-6 lg:p-8">{children}</div>
            </main>
        </div>
    );
}
