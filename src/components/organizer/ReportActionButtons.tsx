"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Users } from "lucide-react";
import { createTaskAction } from "@/app/actions/tasks";
import { AssignmentModal } from "./AssignmentModal";
import type { Report } from "@/lib/types/database";

export function ReportActionButtons({ report }: { report: Report }) {
    const [isCreating, setIsCreating] = useState(false);
    const [taskId, setTaskId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleCreateTask = async () => {
        if (!report) return;
        setIsCreating(true);
        try {
            // Predict required skills based on category (a real app might use the AI engine for this too)
            let requiredSkills: string[] = [];
            if (report.category === "health") requiredSkills = ["First Aid", "Medical"];
            if (report.category === "water") requiredSkills = ["Plumbing", "Logistics"];
            if (report.category === "infrastructure") requiredSkills = ["Construction", "Engineering"];

            const newTask = await createTaskAction(
                report.id,
                `Response: ${report.title}`,
                report.description || report.ai_summary || "",
                requiredSkills,
                report.urgency > 3 ? 2 : 4, // Higher urgency = less time estimated initially
                report.priority_score,
                report.latitude,
                report.longitude
            );

            if (newTask) {
                setTaskId(newTask.id);
                setIsModalOpen(true);
            }
        } catch (error) {
            console.error("Error creating task:", error);
            // Fallback error toast could go here
        } finally {
            setIsCreating(false);
        }
    };

    // If report is not verified yet, or already resolved, hide dispatch controls
    if (report.status === "closed" || report.status === "resolved") {
        return null;
    }

    return (
        <>
            <div className="flex gap-2">
                <Button
                    onClick={handleCreateTask}
                    disabled={isCreating}
                    className="gap-2"
                >
                    {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    Create Task & Assign
                </Button>
            </div>

            <AssignmentModal
                taskId={taskId}
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}
