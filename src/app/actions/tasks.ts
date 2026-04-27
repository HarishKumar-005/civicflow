"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { matchVolunteers } from "@/lib/engine/matching";
import type { Task, VolunteerWithUser } from "@/lib/types/database";

export async function createTaskAction(
    reportId: string,
    title: string,
    description: string,
    requiredSkills: string[],
    estimatedDuration: number,
    priorityScore: number,
    latitude: number | null,
    longitude: number | null
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    const { data, error } = await supabase.from("tasks").insert({
        report_id: reportId,
        title,
        description,
        required_skills: requiredSkills,
        estimated_duration_hours: estimatedDuration,
        priority_score: priorityScore,
        latitude,
        longitude,
        status: "open",
        created_by: user.id
    }).select().single();

    if (error) {
        throw new Error("Failed to create task: " + error.message);
    }

    revalidatePath("/dashboard/reports/[id]", "page");
    revalidatePath("/dashboard/tasks");

    return data;
}

export async function assignVolunteerAction(taskId: string, volunteerId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    const { data, error } = await supabase
        .from("tasks")
        .update({
            assigned_volunteer_id: volunteerId,
            status: "assigned"
        })
        .eq("id", taskId)
        .select()
        .single();

    if (error) {
        throw new Error("Failed to assign volunteer: " + error.message);
    }

    revalidatePath("/dashboard/tasks");

    return data;
}

export async function getMatchRecommendationsAction(taskId: string, limit: number = 3) {
    const supabase = await createClient();

    // 1. Get the Task
    const { data: task, error: taskError } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", taskId)
        .single();

    if (taskError || !task) {
        throw new Error("Failed to fetch task for matching");
    }

    // 2. Get all volunteers with their user info
    const { data: volunteersData, error: volError } = await supabase
        .from("volunteer_profiles")
        .select("*, user:users(*)");

    if (volError || !volunteersData) {
        return [];
    }

    // 3. Run the math engine
    const matches = matchVolunteers(
        volunteersData as any,
        task as any,
        limit
    );

    return matches;
}
