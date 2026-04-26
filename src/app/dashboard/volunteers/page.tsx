import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, Star, MapPin } from "lucide-react";

export default async function VolunteersPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: volunteers } = await supabase
        .from("volunteer_profiles")
        .select("*, users!inner(full_name, email, avatar_url)")
        .order("reliability_score", { ascending: false });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Volunteers</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {volunteers?.length ?? 0} registered volunteers
                    </p>
                </div>
                <Link href="/dashboard/volunteers/profile">
                    <Button className="cursor-pointer">
                        <UserPlus className="h-4 w-4 mr-2" /> My Profile
                    </Button>
                </Link>
            </div>

            {!volunteers || volunteers.length === 0 ? (
                <Card className="border-border/50 bg-card/50">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <Users className="h-12 w-12 text-muted-foreground/30 mb-4" />
                        <h3 className="text-lg font-semibold mb-1">No volunteers yet</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Be the first to create a volunteer profile.
                        </p>
                        <Link href="/dashboard/volunteers/profile">
                            <Button className="cursor-pointer">
                                <UserPlus className="h-4 w-4 mr-2" /> Create Profile
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {volunteers.map((vol) => {
                        const userData = vol.users as unknown as { full_name: string; email: string };
                        return (
                            <Card key={vol.id} className="border-border/50 bg-card/50 hover:bg-card/70 transition-colors">
                                <CardContent className="p-5">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h3 className="font-semibold text-sm">{userData.full_name || "Anonymous"}</h3>
                                            <p className="text-xs text-muted-foreground">{userData.email}</p>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-yellow-400">
                                            <Star className="h-3.5 w-3.5 fill-yellow-400" />
                                            {(vol.reliability_score * 5).toFixed(1)}
                                        </div>
                                    </div>

                                    <div className="space-y-2.5">
                                        {vol.skills.length > 0 && (
                                            <div className="flex flex-wrap gap-1">
                                                {vol.skills.slice(0, 4).map((skill: string) => (
                                                    <Badge key={skill} variant="outline" className="text-xs">
                                                        {skill}
                                                    </Badge>
                                                ))}
                                                {vol.skills.length > 4 && (
                                                    <Badge variant="outline" className="text-xs text-muted-foreground">
                                                        +{vol.skills.length - 4}
                                                    </Badge>
                                                )}
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <span className="capitalize">{vol.experience_level}</span>
                                            {vol.latitude && vol.longitude && (
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    {vol.radius_km}km radius
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-muted-foreground">
                                                Tasks: {vol.active_task_count}/{vol.max_concurrent_tasks}
                                            </span>
                                            <Badge
                                                variant="outline"
                                                className={
                                                    vol.active_task_count < vol.max_concurrent_tasks
                                                        ? "bg-green-500/10 text-green-400 border-green-500/20"
                                                        : "bg-red-500/10 text-red-400 border-red-500/20"
                                                }
                                            >
                                                {vol.active_task_count < vol.max_concurrent_tasks ? "Available" : "Busy"}
                                            </Badge>
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
