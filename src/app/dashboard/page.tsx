import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import {
    FileText,
    AlertTriangle,
    Users,
    CheckCircle2,
    ClipboardList,
    TrendingUp,
    Clock,
    MapPin,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";

async function getDashboardData() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    // Fetch user profile
    const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

    // Fetch report counts
    const { count: totalReports } = await supabase
        .from("reports")
        .select("*", { count: "exact", head: true });

    const { count: newReports } = await supabase
        .from("reports")
        .select("*", { count: "exact", head: true })
        .eq("status", "new");

    const { count: inProgressReports } = await supabase
        .from("reports")
        .select("*", { count: "exact", head: true })
        .eq("status", "in_progress");

    const { count: resolvedReports } = await supabase
        .from("reports")
        .select("*", { count: "exact", head: true })
        .eq("status", "resolved");

    // Fetch task counts
    const { count: openTasks } = await supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .eq("status", "open");

    const { count: completedTasks } = await supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .eq("status", "completed");

    // Fetch volunteer count
    const { count: totalVolunteers } = await supabase
        .from("volunteer_profiles")
        .select("*", { count: "exact", head: true });

    // Fetch urgent reports (severity >= 4 and status is new or verified)
    const { data: urgentReports } = await supabase
        .from("reports")
        .select("*")
        .gte("severity", 4)
        .in("status", ["new", "verified"])
        .order("priority_score", { ascending: false })
        .limit(5);

    // Fetch recent reports
    const { data: recentReports } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

    return {
        profile,
        role: profile?.role || "reporter",
        stats: {
            totalReports: totalReports ?? 0,
            newReports: newReports ?? 0,
            inProgressReports: inProgressReports ?? 0,
            resolvedReports: resolvedReports ?? 0,
            openTasks: openTasks ?? 0,
            completedTasks: completedTasks ?? 0,
            totalVolunteers: totalVolunteers ?? 0,
        },
        urgentReports: urgentReports ?? [],
        recentReports: recentReports ?? [],
    };
}

const severityColors: Record<number, string> = {
    1: "bg-green-500/10 text-green-600 border-green-500/20",
    2: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    3: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    4: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    5: "bg-red-500/10 text-red-600 border-red-500/20",
};

const statusColors: Record<string, string> = {
    new: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    verified: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    in_progress: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    resolved: "bg-green-500/10 text-green-600 border-green-500/20",
    closed: "bg-muted text-muted-foreground border-border",
};

export default async function DashboardPage() {
    const { profile, role, stats, urgentReports, recentReports } = await getDashboardData();

    if (role === "reporter") {
        return (
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-heading font-extrabold tracking-tight text-primary">
                        Welcome back{profile?.full_name ? `, ${profile.full_name}` : ""}
                    </h1>
                    <p className="text-muted-foreground text-lg mt-2 font-medium">
                        Thank you for keeping your community safe.
                    </p>
                </div>
                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle className="text-xl font-heading font-bold text-foreground">Your Reports</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground text-sm font-medium">
                            You can view the status of reports you have submitted or create a new one.
                        </p>
                        <div className="flex gap-4">
                            <Link href="/dashboard/reports">
                                <Button variant="outline" className="cursor-pointer shadow-sm">View My Reports</Button>
                            </Link>
                            <Link href="/dashboard/reports/new">
                                <Button className="cursor-pointer shadow-sm">Submit New Report</Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (role === "volunteer") {
        return (
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-heading font-extrabold tracking-tight text-primary">
                        Welcome back{profile?.full_name ? `, ${profile.full_name}` : ""}
                    </h1>
                    <p className="text-muted-foreground text-lg mt-2 font-medium">
                        Here are your task assignments.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-heading font-bold text-foreground">My Assignments</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground text-sm mb-4 font-medium">
                                View tasks assigned to you by the organizers.
                            </p>
                            <Link href="/dashboard/tasks">
                                <Button className="w-full cursor-pointer shadow-sm">Go to Tasks</Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-heading font-bold text-foreground">My Profile</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground text-sm mb-4 font-medium">
                                Update your skills and location so we can match you perfectly.
                            </p>
                            <Link href="/dashboard/volunteers/profile">
                                <Button variant="outline" className="w-full cursor-pointer shadow-sm">Edit Profile</Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // Default: Organizer & Admin View
    const kpiCards = [
        {
            title: "Total Reports",
            value: stats.totalReports,
            icon: FileText,
            description: `${stats.newReports} new`,
            color: "text-blue-600",
            bg: "bg-blue-500/10",
        },
        {
            title: "Urgent Needs",
            value: urgentReports.length,
            icon: AlertTriangle,
            description: "Severity 4-5",
            color: "text-orange-600",
            bg: "bg-orange-500/10",
        },
        {
            title: "Open Tasks",
            value: stats.openTasks,
            icon: ClipboardList,
            description: `${stats.completedTasks} completed`,
            color: "text-yellow-600",
            bg: "bg-yellow-500/10",
        },
        {
            title: "Volunteers",
            value: stats.totalVolunteers,
            icon: Users,
            description: "Registered",
            color: "text-primary",
            bg: "bg-primary/10",
        },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl sm:text-4xl font-heading font-extrabold tracking-tight text-primary">
                    Welcome back{profile?.full_name ? `, ${profile.full_name}` : ""}
                </h1>
                <p className="text-muted-foreground text-lg mt-2 font-medium">
                    Here&apos;s what&apos;s happening in your operations today.
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpiCards.map((card, i) => (
                    <Card key={i} className="relative overflow-hidden">
                        <div className={`absolute top-0 right-0 p-6 ${card.color} opacity-10 blur-xl pointer-events-none`}>
                            <card.icon className="h-16 w-16" />
                        </div>
                        <CardContent className="p-6 relative">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-sm font-bold text-muted-foreground">{card.title}</p>
                                <div className={`p-2 rounded-lg ${card.bg} ${card.color}`}>
                                    <card.icon className="h-5 w-5" />
                                </div>
                            </div>
                            <div className="text-4xl font-heading font-extrabold text-foreground">{card.value}</div>
                            <p className="text-xs font-semibold text-muted-foreground mt-2">{card.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Urgent Needs */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/50">
                        <CardTitle className="text-lg font-heading font-bold flex items-center gap-2 text-foreground">
                            <AlertTriangle className="h-5 w-5 text-orange-500" />
                            Urgent Needs
                        </CardTitle>
                        <Link href="/dashboard/reports?severity=4">
                            <Button variant="ghost" size="sm" className="cursor-pointer text-xs font-bold text-primary">
                                View All
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent className="pt-4">
                        {urgentReports.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-primary/30" />
                                <p className="text-sm font-medium">No urgent reports right now</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {urgentReports.map((report) => (
                                    <Link
                                        key={report.id}
                                        href={`/dashboard/reports/${report.id}`}
                                        className="flex items-start gap-4 p-3 rounded-2xl border border-transparent hover:shadow-md hover:bg-primary/5 transition-all cursor-pointer group"
                                    >
                                        <div className="mt-0.5 p-2 bg-primary/5 rounded-lg text-primary group-hover:bg-primary/10 transition-colors">
                                            <MapPin className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 min-w-0 pt-0.5">
                                            <p className="text-sm font-bold text-foreground truncate">{report.title}</p>
                                            <p className="text-xs font-medium text-muted-foreground truncate mt-0.5">
                                                {report.address || "No address"} · {report.category}
                                            </p>
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className={`text-xs shrink-0 font-bold ${severityColors[report.severity]}`}
                                        >
                                            Sev {report.severity}
                                        </Badge>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Reports */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/50">
                        <CardTitle className="text-lg font-heading font-bold flex items-center gap-2 text-foreground">
                            <Clock className="h-5 w-5 text-blue-500" />
                            Recent Reports
                        </CardTitle>
                        <Link href="/dashboard/reports">
                            <Button variant="ghost" size="sm" className="cursor-pointer text-xs font-bold text-primary">
                                View All
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent className="pt-4">
                        {recentReports.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
                                <p className="text-sm font-medium">No reports yet</p>
                                <Link href="/dashboard/reports/new">
                                    <Button size="sm" className="mt-3 cursor-pointer shadow-sm">
                                        Submit First Report
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentReports.map((report) => (
                                    <Link
                                        key={report.id}
                                        href={`/dashboard/reports/${report.id}`}
                                        className="flex items-start gap-4 p-3 rounded-2xl border border-transparent hover:shadow-md hover:bg-primary/5 transition-all cursor-pointer group"
                                    >
                                        <div className="mt-0.5 p-2 bg-primary/5 rounded-lg text-primary group-hover:bg-primary/10 transition-colors">
                                            <TrendingUp className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 min-w-0 pt-0.5">
                                            <p className="text-sm font-bold text-foreground truncate">{report.title}</p>
                                            <p className="text-xs font-medium text-muted-foreground mt-0.5">
                                                {new Date(report.created_at).toLocaleDateString()} · {report.category}
                                            </p>
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className={`text-xs shrink-0 font-bold ${statusColors[report.status]}`}
                                        >
                                            {report.status.replace("_", " ")}
                                        </Badge>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
