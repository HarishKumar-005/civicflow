"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getMatchRecommendationsAction, assignVolunteerAction } from "@/app/actions/tasks";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, User, MapPin, CheckCircle, Percent } from "lucide-react";
import type { MatchResult } from "@/lib/engine/matching";

interface AssignmentModalProps {
    taskId: string | null;
    open: boolean;
    onClose: () => void;
}

export function AssignmentModal({ taskId, open, onClose }: AssignmentModalProps) {
    const router = useRouter();
    const [matches, setMatches] = useState<MatchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [assigningId, setAssigningId] = useState<string | null>(null);

    useEffect(() => {
        if (!taskId || !open) return;

        let active = true;
        setLoading(true);

        getMatchRecommendationsAction(taskId, 3)
            .then(res => {
                if (active) {
                    setMatches(res);
                    setLoading(false);
                }
            })
            .catch(err => {
                console.error(err);
                if (active) setLoading(false);
            });

        return () => { active = false; };
    }, [taskId, open]);

    const handleAssign = async (volunteerId: string) => {
        if (!taskId) return;
        setAssigningId(volunteerId);
        try {
            await assignVolunteerAction(taskId, volunteerId);
            onClose();
            router.push("/dashboard/tasks");
        } catch (error) {
            console.error("Failed to assign:", error);
            setAssigningId(null);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Assign Volunteer</DialogTitle>
                    <DialogDescription>
                        The matching engine has ranked the best volunteers for this task based on skill fit, proximity, and availability.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                            <Loader2 className="h-8 w-8 animate-spin mb-4" />
                            <p className="text-sm">Running deterministic matching engine...</p>
                        </div>
                    ) : matches.length === 0 ? (
                        <div className="text-center py-6">
                            <p className="text-sm text-muted-foreground">No available volunteers found.</p>
                        </div>
                    ) : (
                        matches.map((match, i) => (
                            <Card key={match.volunteer_id} className={`border-border/50 ${i === 0 ? 'bg-primary/5 border-primary/20' : 'bg-card/50'}`}>
                                <CardContent className="p-4 flex items-center justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-semibold text-sm truncate flex items-center gap-1.5">
                                                <User className="h-4 w-4" />
                                                Rank #{i + 1} Match
                                            </h4>
                                            {i === 0 && (
                                                <Badge variant="default" className="text-[10px] h-5 px-1.5 bg-primary/20 text-primary hover:bg-primary/30">
                                                    Best Fit
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Percent className="h-3 w-3" />
                                                {(match.score * 100).toFixed(0)}% Score
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <CheckCircle className="h-3 w-3" />
                                                Skill Fit {(match.breakdown.skill_fit * 100).toFixed(0)}%
                                            </span>
                                        </div>
                                    </div>

                                    <Button
                                        size="sm"
                                        disabled={assigningId !== null}
                                        onClick={() => handleAssign(match.volunteer_id)}
                                        className={i === 0 ? '' : 'variant-outline'}
                                    >
                                        {assigningId === match.volunteer_id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Assign"}
                                    </Button>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
