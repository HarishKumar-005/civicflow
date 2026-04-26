import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, MapPin, Calendar, Filter } from "lucide-react";
import { CATEGORY_LABELS, SEVERITY_LABELS } from "@/lib/types/database";

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

export default async function ReportsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: reports } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {reports?.length ?? 0} community reports submitted
                    </p>
                </div>
                <Link href="/dashboard/reports/new">
                    <Button className="cursor-pointer">
                        <Plus className="h-4 w-4 mr-2" /> New Report
                    </Button>
                </Link>
            </div>

            {/* Reports List */}
            {!reports || reports.length === 0 ? (
                <Card className="border-border/50 bg-card/50">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <FileText className="h-12 w-12 text-muted-foreground/30 mb-4" />
                        <h3 className="text-lg font-semibold mb-1">No reports yet</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Submit your first community report to get started.
                        </p>
                        <Link href="/dashboard/reports/new">
                            <Button className="cursor-pointer">
                                <Plus className="h-4 w-4 mr-2" /> Submit Report
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {reports.map((report) => (
                        <Link
                            key={report.id}
                            href={`/dashboard/reports/${report.id}`}
                            className="block"
                        >
                            <Card className="border-border/50 bg-card/50 hover:bg-card/70 hover:border-primary/20 transition-all duration-200 cursor-pointer">
                                <CardContent className="p-4 sm:p-5">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                                <h3 className="text-sm font-semibold truncate">
                                                    {report.title}
                                                </h3>
                                                <Badge
                                                    variant="outline"
                                                    className={`text-xs shrink-0 ${statusColors[report.status]}`}
                                                >
                                                    {report.status.replace("_", " ")}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                                {report.description || "No description"}
                                            </p>
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                                                <span className="flex items-center gap-1">
                                                    <Filter className="h-3 w-3" />
                                                    {CATEGORY_LABELS[report.category as keyof typeof CATEGORY_LABELS] || report.category}
                                                </span>
                                                {report.address && (
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" />
                                                        {report.address}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(report.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                                            <Badge
                                                variant="outline"
                                                className={`text-xs ${severityColors[report.severity]}`}
                                            >
                                                Sev {report.severity}
                                            </Badge>
                                            {report.priority_score > 0 && (
                                                <span className="text-xs text-muted-foreground">
                                                    Score: {report.priority_score.toFixed(2)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
