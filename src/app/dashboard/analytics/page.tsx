"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, BarChart3, PieChart, TrendingUp, Clock } from "lucide-react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    PieChart as RechartsPie, Pie, Cell,
    AreaChart, Area, ResponsiveContainer, Legend,
} from "recharts";

const CATEGORY_COLORS: Record<string, string> = {
    water: "#3b82f6",
    sanitation: "#8b5cf6",
    health: "#ef4444",
    food: "#f97316",
    shelter: "#eab308",
    education: "#22c55e",
    transport: "#06b6d4",
    safety: "#ec4899",
    infrastructure: "#64748b",
    environment: "#10b981",
    general: "#94a3b8",
};

export default function AnalyticsPage() {
    const [loading, setLoading] = useState(true);
    const [categoryData, setCategoryData] = useState<{ name: string; count: number; color: string }[]>([]);
    const [statusData, setStatusData] = useState<{ name: string; count: number }[]>([]);
    const [severityData, setSeverityData] = useState<{ name: string; count: number }[]>([]);
    const [summaryStats, setSummaryStats] = useState({
        totalReports: 0,
        resolvedReports: 0,
        totalTasks: 0,
        completedTasks: 0,
    });

    useEffect(() => {
        loadAnalytics();
    }, []);

    async function loadAnalytics() {
        const supabase = createClient();

        // Fetch all reports
        const { data: reports } = await supabase.from("reports").select("category, status, severity, created_at");
        const { data: tasks } = await supabase.from("tasks").select("status");

        if (reports) {
            // Category distribution
            const cats: Record<string, number> = {};
            reports.forEach((r) => {
                cats[r.category] = (cats[r.category] || 0) + 1;
            });
            setCategoryData(
                Object.entries(cats)
                    .map(([name, count]) => ({ name, count, color: CATEGORY_COLORS[name] || "#94a3b8" }))
                    .sort((a, b) => b.count - a.count)
            );

            // Status distribution
            const statuses: Record<string, number> = {};
            reports.forEach((r) => {
                statuses[r.status] = (statuses[r.status] || 0) + 1;
            });
            setStatusData(
                Object.entries(statuses).map(([name, count]) => ({ name: name.replace("_", " "), count }))
            );

            // Severity distribution
            const sevs: Record<string, number> = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };
            reports.forEach((r) => {
                sevs[String(r.severity)] = (sevs[String(r.severity)] || 0) + 1;
            });
            setSeverityData(
                Object.entries(sevs).map(([name, count]) => ({ name: `Sev ${name}`, count }))
            );

            setSummaryStats({
                totalReports: reports.length,
                resolvedReports: reports.filter((r) => r.status === "resolved").length,
                totalTasks: tasks?.length ?? 0,
                completedTasks: tasks?.filter((t) => t.status === "completed").length ?? 0,
            });
        }

        setLoading(false);
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const resolutionRate = summaryStats.totalReports > 0
        ? ((summaryStats.resolvedReports / summaryStats.totalReports) * 100).toFixed(1)
        : "0";

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Insights and metrics across all operations
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total Reports", value: summaryStats.totalReports, icon: BarChart3, color: "text-blue-400" },
                    { label: "Resolution Rate", value: `${resolutionRate}%`, icon: TrendingUp, color: "text-primary" },
                    { label: "Total Tasks", value: summaryStats.totalTasks, icon: Clock, color: "text-yellow-400" },
                    { label: "Completed", value: summaryStats.completedTasks, icon: PieChart, color: "text-green-400" },
                ].map((item, i) => (
                    <Card key={i} className="border-border/50 bg-card/50">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
                                <item.icon className={`h-4 w-4 ${item.color}`} />
                            </div>
                            <p className="text-2xl font-bold">{item.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category Distribution */}
                <Card className="border-border/50 bg-card/50">
                    <CardHeader>
                        <CardTitle className="text-base">Reports by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {categoryData.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={categoryData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis type="number" stroke="#64748b" fontSize={12} />
                                    <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={12} width={100} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#1e293b",
                                            border: "1px solid rgba(255,255,255,0.1)",
                                            borderRadius: "8px",
                                            color: "#f8fafc",
                                        }}
                                    />
                                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                                        {categoryData.map((entry, i) => (
                                            <Cell key={i} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                {/* Severity Distribution */}
                <Card className="border-border/50 bg-card/50">
                    <CardHeader>
                        <CardTitle className="text-base">Reports by Severity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {severityData.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={severityData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                                    <YAxis stroke="#64748b" fontSize={12} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#1e293b",
                                            border: "1px solid rgba(255,255,255,0.1)",
                                            borderRadius: "8px",
                                            color: "#f8fafc",
                                        }}
                                    />
                                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                        {severityData.map((_, i) => (
                                            <Cell
                                                key={i}
                                                fill={["#22c55e", "#3b82f6", "#eab308", "#f97316", "#ef4444"][i]}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                {/* Status Breakdown */}
                <Card className="border-border/50 bg-card/50 lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base">Reports by Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {statusData.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
                        ) : (
                            <ResponsiveContainer width="100%" height={250}>
                                <RechartsPie>
                                    <Pie
                                        data={statusData}
                                        dataKey="count"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        innerRadius={40}
                                        paddingAngle={4}
                                        label={({ name, count }: any) => `${name}: ${count}`}
                                        labelLine={false}
                                    >
                                        {statusData.map((_, i) => (
                                            <Cell
                                                key={i}
                                                fill={["#3b82f6", "#8b5cf6", "#eab308", "#22c55e", "#64748b"][i % 5]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#1e293b",
                                            border: "1px solid rgba(255,255,255,0.1)",
                                            borderRadius: "8px",
                                            color: "#f8fafc",
                                        }}
                                    />
                                    <Legend />
                                </RechartsPie>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
