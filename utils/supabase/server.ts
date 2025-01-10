
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export const createClient = (
    cookieStore: ReturnType<typeof cookies>,
    apiKey: string|null|undefined = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
) => {
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        apiKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
            ...(apiKey !== process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            } : {})
        }
    );
};

export const createServiceRoleClient = (cookieStore: ReturnType<typeof cookies>) => {
    return createClient(
        cookieStore,
        process.env.SUPABASE_SECRET_ROLE_KEY!
    );
};
