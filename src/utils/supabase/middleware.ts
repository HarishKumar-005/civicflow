import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(supabaseUrl!, supabaseKey!, {
        cookies: {
            getAll() {
                return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value }) =>
                    request.cookies.set(name, value)
                );
                supabaseResponse = NextResponse.next({
                    request,
                });
                cookiesToSet.forEach(({ name, value, options }) =>
                    supabaseResponse.cookies.set(name, value, options)
                );
            },
        },
    });

    // IMPORTANT: This call refreshes the session and must be here.
    // Do NOT remove this — without it, sessions expire silently.
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Public routes that don't require authentication
    const publicPaths = ["/", "/login", "/signup", "/auth/callback"];
    const isPublicPath = publicPaths.some(
        (path) =>
            request.nextUrl.pathname === path ||
            request.nextUrl.pathname.startsWith("/auth/")
    );

    // If user is not authenticated and trying to access protected route
    if (!user && !isPublicPath) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        return NextResponse.redirect(url);
    }

    // If user is authenticated and trying to access auth pages, redirect to dashboard
    if (user && (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/signup")) {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
    }

    // Role-Based Route Guards
    if (user && request.nextUrl.pathname.startsWith("/dashboard")) {
        // We must fetch the user role from 'users' table
        const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
        const role = profile?.role || "reporter";

        // Organizers have full access, so we only restrict others
        if (role !== "organizer" && role !== "admin") {
            const path = request.nextUrl.pathname;

            // Block from Analytics
            if (path.startsWith("/dashboard/analytics")) {
                const url = request.nextUrl.clone();
                url.pathname = "/dashboard";
                return NextResponse.redirect(url);
            }

            // Reporters shouldn't see tasks, volunteers, or the map
            if (role === "reporter" && (path.startsWith("/dashboard/tasks") || path.startsWith("/dashboard/volunteers") || path.startsWith("/dashboard/map"))) {
                const url = request.nextUrl.clone();
                url.pathname = "/dashboard/reports";
                return NextResponse.redirect(url);
            }

            // Volunteers shouldn't see global volunteers list or global reports list
            if (role === "volunteer" && (path === "/dashboard/volunteers" || path === "/dashboard/reports")) {
                // They can access /dashboard/volunteers/profile specifically, but not the root list
                if (path === "/dashboard/volunteers") {
                    const url = request.nextUrl.clone();
                    url.pathname = "/dashboard/volunteers/profile";
                    return NextResponse.redirect(url);
                }
            }
        }
    }

    return supabaseResponse;
}
