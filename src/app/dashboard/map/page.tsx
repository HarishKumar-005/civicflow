"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin } from "lucide-react";
import type { Report } from "@/lib/types/database";

// Dynamic import for Leaflet (SSR incompatible)
const MapContainer = dynamic(
    () => import("react-leaflet").then((mod) => mod.MapContainer),
    { ssr: false }
);
const TileLayer = dynamic(
    () => import("react-leaflet").then((mod) => mod.TileLayer),
    { ssr: false }
);
const CircleMarker = dynamic(
    () => import("react-leaflet").then((mod) => mod.CircleMarker),
    { ssr: false }
);
const Popup = dynamic(
    () => import("react-leaflet").then((mod) => mod.Popup),
    { ssr: false }
);

const severityColors: Record<number, string> = {
    1: "#22c55e",
    2: "#3b82f6",
    3: "#eab308",
    4: "#f97316",
    5: "#ef4444",
};

export default function MapPage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        loadReports();
    }, []);

    async function loadReports() {
        const supabase = createClient();
        const { data } = await supabase
            .from("reports")
            .select("*")
            .not("latitude", "is", null)
            .not("longitude", "is", null);

        setReports((data as Report[]) ?? []);
        setLoading(false);
    }

    if (loading || !mounted) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Map View</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Community needs heatmap
                    </p>
                </div>
                <div className="flex items-center justify-center h-[60vh]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </div>
        );
    }

    const geoReports = reports.filter((r) => r.latitude && r.longitude);
    const center: [number, number] = geoReports.length > 0
        ? [geoReports[0].latitude!, geoReports[0].longitude!]
        : [20.5937, 78.9629]; // Default: center of India

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Map View</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {geoReports.length} geolocated reports
                    </p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                    {[
                        { severity: 1, label: "Low" },
                        { severity: 3, label: "Med" },
                        { severity: 5, label: "Critical" },
                    ].map((item) => (
                        <div key={item.severity} className="flex items-center gap-1.5">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: severityColors[item.severity] }}
                            />
                            <span className="text-muted-foreground">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            <Card className="overflow-hidden">
                <CardContent className="p-0">
                    <div className="h-[65vh] w-full">
                        <link
                            rel="stylesheet"
                            href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
                            crossOrigin=""
                        />
                        <MapContainer
                            center={center}
                            zoom={geoReports.length > 0 ? 12 : 5}
                            className="h-full w-full bg-slate-50"
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                            />
                            {geoReports.map((report) => (
                                <CircleMarker
                                    key={report.id}
                                    center={[report.latitude!, report.longitude!]}
                                    radius={6 + report.severity * 2}
                                    pathOptions={{
                                        color: severityColors[report.severity],
                                        fillColor: severityColors[report.severity],
                                        fillOpacity: 0.6,
                                        weight: 2,
                                    }}
                                >
                                    <Popup>
                                        <div className="text-xs space-y-1 min-w-[200px]">
                                            <p className="font-heading font-bold text-sm text-foreground">{report.title}</p>
                                            <p className="font-medium text-muted-foreground">{report.category} · Severity {report.severity}</p>
                                            <p className="font-medium text-muted-foreground/70">{report.address || "No address"}</p>
                                            <p className="font-bold text-primary">Status: {report.status}</p>
                                        </div>
                                    </Popup>
                                </CircleMarker>
                            ))}
                        </MapContainer>
                    </div>
                </CardContent>
            </Card>

            {geoReports.length === 0 && (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <MapPin className="h-10 w-10 text-muted-foreground/30 mb-3" />
                        <h3 className="text-lg font-semibold mb-1">No geolocated reports</h3>
                        <p className="text-sm text-muted-foreground">
                            Submit reports with GPS coordinates to see them on the map.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
