"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, Send, MapPin } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import type { ReportCategory, SourceType } from "@/lib/types/database";
import { CATEGORY_LABELS, SEVERITY_LABELS, URGENCY_LABELS } from "@/lib/types/database";

export default function NewReportPage() {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        title: "",
        description: "",
        raw_text: "",
        source_type: "form" as SourceType,
        category: "general" as ReportCategory,
        severity: 3,
        urgency: 3,
        affected_count: 1,
        latitude: undefined as number | undefined,
        longitude: undefined as number | undefined,
        address: "",
    });

    const router = useRouter();
    const supabase = createClient();

    function updateField(field: string, value: string | number) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    async function handleGetLocation() {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setForm((prev) => ({
                    ...prev,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                }));
                toast.success("Location captured");
            },
            () => {
                toast.error("Unable to retrieve your location");
            }
        );
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            toast.error("Please sign in to submit a report");
            setLoading(false);
            return;
        }

        // Calculate basic priority score
        const priorityScore =
            form.severity * 0.25 +
            form.urgency * 0.25 +
            Math.min(form.affected_count / 100, 1) * 0.15 +
            1.0 * 0.10 + // recency = max for new report
            0.5 * 0.10 + // default confidence
            0.0 * 0.10 + // no recurrence yet
            0.5 * 0.05;  // default location vulnerability

        const { error } = await supabase.from("reports").insert({
            title: form.title,
            description: form.description,
            raw_text: form.raw_text || null,
            source_type: form.source_type,
            category: form.category,
            severity: form.severity,
            urgency: form.urgency,
            affected_count: form.affected_count,
            latitude: form.latitude || null,
            longitude: form.longitude || null,
            address: form.address || null,
            submitted_by: user.id,
            priority_score: Math.round(priorityScore * 100) / 100,
        });

        if (error) {
            toast.error(error.message);
            setLoading(false);
            return;
        }

        toast.success("Report submitted successfully");
        router.push("/dashboard/reports");
        router.refresh();
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
                <Link href="/dashboard/reports">
                    <Button variant="ghost" size="icon" className="cursor-pointer">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Submit Report</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Report a community need or issue
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card className="border-border/50 bg-card/50">
                    <CardHeader>
                        <CardTitle>Report Details</CardTitle>
                        <CardDescription>
                            Provide as much detail as possible to help prioritize this issue.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        {/* Title */}
                        <div className="space-y-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                placeholder="e.g., Broken water pipe on Main Street"
                                value={form.title}
                                onChange={(e) => updateField("title", e.target.value)}
                                required
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">Description *</Label>
                            <Textarea
                                id="description"
                                placeholder="Describe the issue in detail..."
                                value={form.description}
                                onChange={(e) => updateField("description", e.target.value)}
                                required
                                rows={4}
                            />
                        </div>

                        {/* Raw Text (optional) */}
                        <div className="space-y-2">
                            <Label htmlFor="raw_text">Raw Field Notes (optional)</Label>
                            <Textarea
                                id="raw_text"
                                placeholder="Paste raw notes, survey text, or field observations..."
                                value={form.raw_text}
                                onChange={(e) => updateField("raw_text", e.target.value)}
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Source Type */}
                            <div className="space-y-2">
                                <Label>Source</Label>
                                <Select
                                    value={form.source_type}
                                    onValueChange={(v) => v && updateField("source_type", v)}
                                >
                                    <SelectTrigger className="cursor-pointer">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="form" className="cursor-pointer">Form Entry</SelectItem>
                                        <SelectItem value="upload" className="cursor-pointer">File Upload</SelectItem>
                                        <SelectItem value="field_note" className="cursor-pointer">Field Note</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Category */}
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Select
                                    value={form.category}
                                    onValueChange={(v) => v && updateField("category", v)}
                                >
                                    <SelectTrigger className="cursor-pointer">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                                            <SelectItem key={value} value={value} className="cursor-pointer">
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {/* Severity */}
                            <div className="space-y-2">
                                <Label>Severity</Label>
                                <Select
                                    value={String(form.severity)}
                                    onValueChange={(v) => v && updateField("severity", parseInt(v))}
                                >
                                    <SelectTrigger className="cursor-pointer">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(SEVERITY_LABELS).map(([value, label]) => (
                                            <SelectItem key={value} value={value} className="cursor-pointer">
                                                {value} — {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Urgency */}
                            <div className="space-y-2">
                                <Label>Urgency</Label>
                                <Select
                                    value={String(form.urgency)}
                                    onValueChange={(v) => v && updateField("urgency", parseInt(v))}
                                >
                                    <SelectTrigger className="cursor-pointer">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(URGENCY_LABELS).map(([value, label]) => (
                                            <SelectItem key={value} value={value} className="cursor-pointer">
                                                {value} — {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Affected Count */}
                            <div className="space-y-2">
                                <Label htmlFor="affected">People Affected</Label>
                                <Input
                                    id="affected"
                                    type="number"
                                    min={1}
                                    value={form.affected_count}
                                    onChange={(e) => updateField("affected_count", parseInt(e.target.value) || 1)}
                                />
                            </div>
                        </div>

                        {/* Location */}
                        <div className="space-y-3">
                            <Label>Location</Label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Address or area description"
                                    value={form.address}
                                    onChange={(e) => updateField("address", e.target.value)}
                                    className="flex-1"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={handleGetLocation}
                                    className="cursor-pointer shrink-0"
                                    title="Use my location"
                                >
                                    <MapPin className="h-4 w-4" />
                                </Button>
                            </div>
                            {form.latitude && form.longitude && (
                                <p className="text-xs text-muted-foreground">
                                    GPS: {form.latitude.toFixed(6)}, {form.longitude.toFixed(6)}
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={loading} className="cursor-pointer">
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <>
                                <Send className="h-4 w-4 mr-2" /> Submit Report
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
