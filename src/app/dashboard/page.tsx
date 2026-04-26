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
    1: "bg-green-500/10 text-green-400 border-green-500/20",
    2: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    3: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    4: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    5: "bg-red-500/10 text-red-400 border-red-500/20",
};

const statusColors: Record<string, string> = {
    new: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    verified: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    in_progress: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    resolved: "bg-green-500/10 text-green-400 border-green-500/20",
    closed: "bg-muted text-muted-foreground border-border",
};

export default async function DashboardPage() {
    const { profile, stats, urgentReports, recentReports } = await getDashboardData();

    const kpiCards = [
        {
            title: "Total Reports",
            value: stats.totalReports,
            icon: FileText,
            description: `${stats.newReports} new`,
            color: "text-blue-400",
        },
        {
            title: "Urgent Needs",
            value: urgentReports.length,
            icon: AlertTriangle,
            description: "Severity 4-5",
            color: "text-orange-400",
        },
        {
            title: "Open Tasks",
            value: stats.openTasks,
            icon: ClipboardList,
            description: `${stats.completedTasks} completed`,
            color: "text-yellow-400",
        },
        {
            title: "Volunteers",
            value: stats.totalVolunteers,
            icon: Users,
            description: "Registered",
            color: "text-primary",
        },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                    Welcome back{profile?.full_name ? `, ${profile.full_name}` : ""}
                </h1>
                <p className="text-muted-foreground mt-1">
                    Here&apos;s what&apos;s happening in your operations today.
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpiCards.map((card, i) => (
                    <Card key={i} className="border-border/50 bg-card/50">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                                <card.icon className={`h-5 w-5 ${card.color}`} />
                            </div>
                            <div className="text-3xl font-bold">{card.value}</div>
                            <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Urgent Needs */}
                <Card className="border-border/50 bg-card/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-orange-400" />
                            Urgent Needs
                        </CardTitle>
                        <Link href="/dashboard/reports?severity=4">
                            <Button variant="ghost" size="sm" className="cursor-pointer text-xs">
                                View All
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {urgentReports.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-primary/50" />
                                <p className="text-sm">No urgent reports right now</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {urgentReports.map((report) => (
                                    <Link
                                        key={report.id}
                                        href={`/dashboard/reports/${report.id}`}
                                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/30 transition-colors cursor-pointer group"
                                    >
                                        <div className="mt-0.5">
                                            <MapPin className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{report.title}</p>
                                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                                                {report.address || "No address"} · {report.category}
                                            </p>
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className={`text-xs shrink-0 ${severityColors[report.severity]}`}
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
                <Card className="border-border/50 bg-card/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <Clock className="h-5 w-5 text-blue-400" />
                            Recent Reports
                        </CardTitle>
                        <Link href="/dashboard/reports">
                            <Button variant="ghost" size="sm" className="cursor-pointer text-xs">
                                View All
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {recentReports.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                                <p className="text-sm">No reports yet</p>
                                <Link href="/dashboard/reports/new">
                                    <Button size="sm" className="mt-3 cursor-pointer">
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
                                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/30 transition-colors cursor-pointer group"
                                    >
                                        <div className="mt-0.5">
                                            <TrendingUp className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{report.title}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {new Date(report.created_at).toLocaleDateString()} · {report.category}
                                            </p>
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className={`text-xs shrink-0 ${statusColors[report.status]}`}
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
