"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, MapPin, X, Plus } from "lucide-react";
import { toast } from "sonner";
import { CATEGORY_LABELS } from "@/lib/types/database";

const SKILL_OPTIONS = [
    "First Aid", "Counseling", "Teaching", "Construction", "Driving",
    "Cooking", "Translation", "Medical", "Legal Aid", "IT Support",
    "Social Work", "Logistics", "Photography", "Data Entry", "Childcare",
];

const LANGUAGE_OPTIONS = [
    "English", "Hindi", "Tamil", "Telugu", "Bengali",
    "Marathi", "Gujarati", "Kannada", "Malayalam", "Urdu",
    "Punjabi", "Spanish", "French", "Arabic",
];

export default function VolunteerProfilePage() {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [skills, setSkills] = useState<string[]>([]);
    const [languages, setLanguages] = useState<string[]>(["English"]);
    const [preferredCategories, setPreferredCategories] = useState<string[]>([]);
    const [radiusKm, setRadiusKm] = useState(10);
    const [experienceLevel, setExperienceLevel] = useState("beginner");
    const [latitude, setLatitude] = useState<number | undefined>();
    const [longitude, setLongitude] = useState<number | undefined>();
    const [hasProfile, setHasProfile] = useState(false);
    const [availability, setAvailability] = useState({
        weekdays: true,
        weekends: true,
        mornings: true,
        afternoons: true,
        evenings: false,
    });

    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        loadProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function loadProfile() {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
            .from("volunteer_profiles")
            .select("*")
            .eq("user_id", user.id)
            .single();

        if (profile) {
            setHasProfile(true);
            setSkills(profile.skills || []);
            setLanguages(profile.languages || ["English"]);
            setPreferredCategories(profile.preferred_categories || []);
            setRadiusKm(profile.radius_km || 10);
            setExperienceLevel(profile.experience_level || "beginner");
            setLatitude(profile.latitude ?? undefined);
            setLongitude(profile.longitude ?? undefined);
            if (profile.availability) setAvailability(profile.availability);
        }
        setLoading(false);
    }

    function toggleItem(arr: string[], item: string, setter: (v: string[]) => void) {
        setter(arr.includes(item) ? arr.filter((s) => s !== item) : [...arr, item]);
    }

    async function handleGetLocation() {
        if (!navigator.geolocation) {
            toast.error("Geolocation not supported");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLatitude(pos.coords.latitude);
                setLongitude(pos.coords.longitude);
                toast.success("Location captured");
            },
            () => toast.error("Unable to get location")
        );
    }

    async function handleSave() {
        setSaving(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            toast.error("Please sign in");
            setSaving(false);
            return;
        }

        const profileData = {
            user_id: user.id,
            skills,
            languages,
            preferred_categories: preferredCategories,
            radius_km: radiusKm,
            experience_level: experienceLevel,
            latitude: latitude || null,
            longitude: longitude || null,
            availability,
        };

        let error;
        if (hasProfile) {
            ({ error } = await supabase
                .from("volunteer_profiles")
                .update(profileData)
                .eq("user_id", user.id));
        } else {
            ({ error } = await supabase.from("volunteer_profiles").insert(profileData));
        }

        // Also update user role to volunteer
        await supabase.from("users").update({ role: "volunteer" }).eq("id", user.id);

        if (error) {
            toast.error(error.message);
        } else {
            toast.success("Profile saved!");
            setHasProfile(true);
        }
        setSaving(false);
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Volunteer Profile</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Set up your volunteer profile to get matched with community tasks.
                </p>
            </div>

            <Card className="border-border/50 bg-card/50">
                <CardHeader>
                    <CardTitle>Skills & Expertise</CardTitle>
                    <CardDescription>Select the skills you can offer</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {SKILL_OPTIONS.map((skill) => (
                            <Badge
                                key={skill}
                                variant={skills.includes(skill) ? "default" : "outline"}
                                className="cursor-pointer transition-colors"
                                onClick={() => toggleItem(skills, skill, setSkills)}
                            >
                                {skills.includes(skill) ? (
                                    <X className="h-3 w-3 mr-1" />
                                ) : (
                                    <Plus className="h-3 w-3 mr-1" />
                                )}
                                {skill}
                            </Badge>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50">
                <CardHeader>
                    <CardTitle>Languages</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {LANGUAGE_OPTIONS.map((lang) => (
                            <Badge
                                key={lang}
                                variant={languages.includes(lang) ? "default" : "outline"}
                                className="cursor-pointer transition-colors"
                                onClick={() => toggleItem(languages, lang, setLanguages)}
                            >
                                {lang}
                            </Badge>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50">
                <CardHeader>
                    <CardTitle>Preferred Categories</CardTitle>
                    <CardDescription>What kinds of issues do you prefer to help with?</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                            <Badge
                                key={key}
                                variant={preferredCategories.includes(key) ? "default" : "outline"}
                                className="cursor-pointer transition-colors"
                                onClick={() => toggleItem(preferredCategories, key, setPreferredCategories)}
                            >
                                {label}
                            </Badge>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50">
                <CardHeader>
                    <CardTitle>Availability & Experience</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {([
                            ["weekdays", "Weekdays"],
                            ["weekends", "Weekends"],
                            ["mornings", "Mornings"],
                            ["afternoons", "Afternoons"],
                            ["evenings", "Evenings"],
                        ] as const).map(([key, label]) => (
                            <Badge
                                key={key}
                                variant={availability[key] ? "default" : "outline"}
                                className="cursor-pointer transition-colors justify-center py-2"
                                onClick={() =>
                                    setAvailability((prev) => ({ ...prev, [key]: !prev[key] }))
                                }
                            >
                                {label}
                            </Badge>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Experience Level</Label>
                            <Select value={experienceLevel} onValueChange={(v) => v && setExperienceLevel(v)}>
                                <SelectTrigger className="cursor-pointer"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="beginner" className="cursor-pointer">Beginner</SelectItem>
                                    <SelectItem value="intermediate" className="cursor-pointer">Intermediate</SelectItem>
                                    <SelectItem value="experienced" className="cursor-pointer">Experienced</SelectItem>
                                    <SelectItem value="expert" className="cursor-pointer">Expert</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Radius (km)</Label>
                            <Input
                                type="number"
                                min={1}
                                max={100}
                                value={radiusKm}
                                onChange={(e) => setRadiusKm(parseInt(e.target.value) || 10)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Location</Label>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleGetLocation}
                                className="cursor-pointer"
                            >
                                <MapPin className="h-4 w-4 mr-2" /> Capture GPS
                            </Button>
                            {latitude && longitude && (
                                <span className="text-xs text-muted-foreground self-center">
                                    {latitude.toFixed(4)}, {longitude.toFixed(4)}
                                </span>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving} className="cursor-pointer">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                        <><Save className="h-4 w-4 mr-2" /> Save Profile</>
                    )}
                </Button>
            </div>
        </div>
    );
}
