import { createClient } from "@/utils/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Calendar, Users, AlertTriangle, Shield } from "lucide-react";
import { CATEGORY_LABELS, SEVERITY_LABELS, URGENCY_LABELS } from "@/lib/types/database";

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

export default async function ReportDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: report } = await supabase
        .from("reports")
        .select("*")
        .eq("id", id)
        .single();

    if (!report) notFound();

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-start gap-3">
                <Link href="/dashboard/reports">
                    <Button variant="ghost" size="icon" className="cursor-pointer mt-0.5">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                            {report.title}
                        </h1>
                        <Badge variant="outline" className={statusColors[report.status]}>
                            {report.status.replace("_", " ")}
                        </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                        Submitted {new Date(report.created_at).toLocaleDateString()} at{" "}
                        {new Date(report.created_at).toLocaleTimeString()}
                    </p>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Card className="border-border/50 bg-card/50">
                    <CardContent className="p-4 text-center">
                        <p className="text-xs text-muted-foreground mb-1">Severity</p>
                        <Badge variant="outline" className={severityColors[report.severity]}>
                            {SEVERITY_LABELS[report.severity]}
                        </Badge>
                    </CardContent>
                </Card>
                <Card className="border-border/50 bg-card/50">
                    <CardContent className="p-4 text-center">
                        <p className="text-xs text-muted-foreground mb-1">Urgency</p>
                        <Badge variant="outline" className={severityColors[report.urgency]}>
                            {URGENCY_LABELS[report.urgency]}
                        </Badge>
                    </CardContent>
                </Card>
                <Card className="border-border/50 bg-card/50">
                    <CardContent className="p-4 text-center">
                        <p className="text-xs text-muted-foreground mb-1">Affected</p>
                        <div className="flex items-center justify-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-lg font-bold">{report.affected_count}</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border/50 bg-card/50">
                    <CardContent className="p-4 text-center">
                        <p className="text-xs text-muted-foreground mb-1">Priority</p>
                        <span className="text-lg font-bold text-primary">
                            {report.priority_score?.toFixed(2) || "N/A"}
                        </span>
                    </CardContent>
                </Card>
            </div>

            {/* Details */}
            <Card className="border-border/50 bg-card/50">
                <CardHeader>
                    <CardTitle className="text-base">Report Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label className="text-xs text-muted-foreground">Category</Label>
                        <p className="text-sm font-medium">
                            {CATEGORY_LABELS[report.category as keyof typeof CATEGORY_LABELS] || report.category}
                        </p>
                    </div>

                    <div>
                        <Label className="text-xs text-muted-foreground">Description</Label>
                        <p className="text-sm whitespace-pre-wrap">
                            {report.description || "No description provided"}
                        </p>
                    </div>

                    {report.raw_text && (
                        <div>
                            <Label className="text-xs text-muted-foreground">Raw Field Notes</Label>
                            <div className="bg-muted/30 rounded-lg p-3 text-sm font-mono whitespace-pre-wrap">
                                {report.raw_text}
                            </div>
                        </div>
                    )}

                    {report.ai_summary && (
                        <div>
                            <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                <Shield className="h-3 w-3" /> AI Summary
                                {report.ai_confidence && (
                                    <span className="text-xs text-muted-foreground ml-1">
                                        ({(report.ai_confidence * 100).toFixed(0)}% confidence)
                                    </span>
                                )}
                            </Label>
                            <div className="bg-primary/5 border border-primary/10 rounded-lg p-3 text-sm">
                                {report.ai_summary}
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 border-t border-border/50">
                        {report.address && (
                            <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" /> {report.address}
                            </span>
                        )}
                        {report.latitude && report.longitude && (
                            <span className="text-xs">
                                GPS: {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
                            </span>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
    return <p className={`text-xs font-medium uppercase tracking-wider mb-1 ${className || ""}`}>{children}</p>;
}
