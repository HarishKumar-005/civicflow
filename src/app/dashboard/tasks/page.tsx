import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClipboardList, Plus, CheckCircle2, Clock, User } from "lucide-react";

const statusColors: Record<string, string> = {
    open: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    assigned: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    in_progress: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    completed: "bg-green-500/10 text-green-400 border-green-500/20",
    cancelled: "bg-muted text-muted-foreground border-border",
};

export default async function TasksPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: tasks } = await supabase
        .from("tasks")
        .select("*, reports(title, category)")
        .order("priority_score", { ascending: false });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {tasks?.length ?? 0} tasks created from reports
                    </p>
                </div>
            </div>

            {!tasks || tasks.length === 0 ? (
                <Card className="border-border/50 bg-card/50">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <ClipboardList className="h-12 w-12 text-muted-foreground/30 mb-4" />
                        <h3 className="text-lg font-semibold mb-1">No tasks yet</h3>
                        <p className="text-sm text-muted-foreground text-center max-w-md">
                            Tasks are created from verified reports. Submit reports first, then create tasks from them.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {tasks.map((task) => {
                        const report = task.reports as unknown as { title: string; category: string } | null;
                        return (
                            <Card key={task.id} className="border-border/50 bg-card/50 hover:bg-card/70 transition-colors">
                                <CardContent className="p-4 sm:p-5">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                                <h3 className="text-sm font-semibold truncate">{task.title}</h3>
                                                <Badge variant="outline" className={`text-xs shrink-0 ${statusColors[task.status]}`}>
                                                    {task.status.replace("_", " ")}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                                {task.description || "No description"}
                                            </p>
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                                                {report && (
                                                    <span>From: {report.title}</span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {task.estimated_duration_hours}h
                                                </span>
                                                {task.required_skills?.length > 0 && (
                                                    <span>{task.required_skills.join(", ")}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                                            <span className="text-xs font-medium">Score: {task.priority_score?.toFixed(2)}</span>
                                            {task.assigned_volunteer_id && (
                                                <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                                                    <User className="h-3 w-3 mr-1" /> Assigned
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
