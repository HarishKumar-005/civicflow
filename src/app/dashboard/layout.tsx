"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
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

const navItems = [
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

    async function handleSignOut() {
        await supabase.auth.signOut();
        toast.success("Signed out");
        router.push("/");
        router.refresh();
    }

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            <aside className="hidden md:flex flex-col w-64 border-r border-border/50 bg-card/30 backdrop-blur-sm">
                {/* Logo */}
                <div className="p-4 border-b border-border/50">
                    <Link href="/dashboard" className="flex items-center gap-2.5 group">
                        <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors">
                            <Activity className="h-5 w-5 text-primary" />
                        </div>
                        <span className="text-lg font-bold tracking-tight">CivicFlow</span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== "/dashboard" && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                                    isActive
                                        ? "bg-primary/10 text-primary border border-primary/20"
                                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                                )}
                            >
                                <item.icon className="h-4.5 w-4.5" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom actions */}
                <div className="p-3 border-t border-border/50 space-y-1">
                    <Link
                        href="/dashboard/settings"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors cursor-pointer"
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
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 border-b border-border/50 bg-background/90 backdrop-blur-xl flex items-center justify-between px-4">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    <span className="font-bold">CivicFlow</span>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleSignOut} className="cursor-pointer">
                    <LogOut className="h-4 w-4" />
                </Button>
            </div>

            {/* Mobile Bottom Nav */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-background/90 backdrop-blur-xl">
                <div className="grid grid-cols-5 gap-1 p-1">
                    {navItems.slice(0, 5).map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== "/dashboard" && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex flex-col items-center gap-0.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer",
                                    isActive ? "text-primary" : "text-muted-foreground"
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
            <main className="flex-1 overflow-y-auto md:pt-0 pt-14 pb-20 md:pb-0">
                <div className="p-4 sm:p-6 lg:p-8">{children}</div>
            </main>
        </div>
    );
}
