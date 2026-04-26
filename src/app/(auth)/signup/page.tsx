"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function SignupPage() {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("reporter");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    async function handleSignup(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    role: role,
                },
            },
        });

        if (error) {
            toast.error(error.message);
            setLoading(false);
            return;
        }

        toast.success("Account created! Redirecting...");
        router.push("/dashboard");
        router.refresh();
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            {/* Background gradient */}
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />

            <div className="relative w-full max-w-md space-y-8">
                {/* Logo */}
                <div className="flex flex-col items-center gap-3">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors">
                            <Activity className="h-6 w-6 text-primary" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">CivicFlow</span>
                    </Link>
                </div>

                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
                        <CardDescription>Join CivicFlow and start making an impact</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSignup} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Full Name</Label>
                                <Input
                                    id="fullName"
                                    type="text"
                                    placeholder="Jane Doe"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                    autoComplete="name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoComplete="email"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete="new-password"
                                    minLength={6}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">I am a</Label>
                                <Select defaultValue="reporter" value={role} onValueChange={(v) => v && setRole(v)}>
                                    <SelectTrigger id="role" className="cursor-pointer">
                                        <SelectValue placeholder="Select your role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="reporter" className="cursor-pointer">Field Reporter</SelectItem>
                                        <SelectItem value="volunteer" className="cursor-pointer">Volunteer</SelectItem>
                                        <SelectItem value="organizer" className="cursor-pointer">Organizer / NGO Lead</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button type="submit" className="w-full cursor-pointer" disabled={loading}>
                                {loading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <>
                                        Create Account <ArrowRight className="h-4 w-4 ml-2" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link href="/login" className="text-primary hover:underline font-medium">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
