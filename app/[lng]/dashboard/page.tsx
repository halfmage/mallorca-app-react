import React from 'react';
import {createClient} from '@/utils/supabase/server'
import {cookies} from 'next/headers'
import ProviderDashboard from "@/components/ProviderDashboard";
import { redirect } from 'next/navigation'
import { ProviderService } from "@/app/api/utils/provider";

export default async function SavedPage({ params }) {
    const { lng } = await params

    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.id) {
        return redirect(`/${lng}/login`)
    }

    const { data } = await supabase
        .from('providers')
        .select('id')
        .eq('user_id', user.id)
        .single();

    if (!data) {
        return redirect(`/${lng}`)
    }

    const provider = await ProviderService.getProviderByUserId(supabase, user.id);

    // Get provider stats
    const stats = await ProviderService.getProviderStats(supabase, provider.id);

    // Get saved users
    const savedUsers = await ProviderService.getSavedUsersForProvider(supabase, provider.id);

    return (
        <ProviderDashboard provider={provider} savedUsers={savedUsers} stats={stats} />
    );
};
