import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default async function SettingsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Manage your account and preferences
                </p>
            </div>

            <Card className="border-border/50 bg-card/50">
                <CardHeader>
                    <CardTitle className="text-base">Account Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-border/30">
                        <span className="text-sm text-muted-foreground">Email</span>
                        <span className="text-sm font-medium">{profile?.email || user.email}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/30">
                        <span className="text-sm text-muted-foreground">Name</span>
                        <span className="text-sm font-medium">{profile?.full_name || "Not set"}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/30">
                        <span className="text-sm text-muted-foreground">Role</span>
                        <span className="text-sm font-medium capitalize">{profile?.role || "reporter"}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-muted-foreground">Organization</span>
                        <span className="text-sm font-medium">{profile?.organization || "Not set"}</span>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50">
                <CardHeader>
                    <CardTitle className="text-base">About CivicFlow</CardTitle>
                    <CardDescription>Community Intelligence Platform</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        CivicFlow transforms fragmented community-needs data into prioritized intelligence
                        and matches volunteers to the highest-impact tasks.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
